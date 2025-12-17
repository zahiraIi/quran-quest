/**
 * Quranic Universal Library (QUL) API Service.
 *
 * Fetches Quran data from the QUL API (qul.tarteel.ai).
 * Reference: https://github.com/TarteelAI/quranic-universal-library
 *
 * This provides authentic Quran text, translations, and audio.
 */

import type { Ayah, Surah, Word } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const QUL_API_BASE = 'https://api.quran.com/api/v4';
const QURAN_CDN = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

// Default reciter for audio
const DEFAULT_RECITER = 7; // Mishary Rashid Alafasy

// ============================================================================
// Types
// ============================================================================

interface QulVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_imlaei?: string;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  sajdah_type: string | null;
  sajdah_number: number | null;
}

interface QulWord {
  id: number;
  position: number;
  text_uthmani: string;
  text_imlaei?: string;
  transliteration?: {
    text: string;
  };
  translation?: {
    text: string;
  };
  audio?: {
    url: string;
  };
  char_type_name: string;
}

interface QulTranslation {
  resource_id: number;
  text: string;
}

interface QulChapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

interface QulVerseResponse {
  verses: Array<QulVerse & {
    words?: QulWord[];
    translations?: QulTranslation[];
  }>;
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

interface QulChaptersResponse {
  chapters: QulChapter[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all surahs (chapters) from the Quran.
 */
export async function fetchAllSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${QUL_API_BASE}/chapters?language=en`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.status}`);
    }

    const data: QulChaptersResponse = await response.json();

    return data.chapters.map((chapter) => ({
      id: chapter.id,
      name: chapter.name_arabic,
      nameTransliteration: chapter.name_simple,
      nameTranslation: chapter.translated_name.name,
      versesCount: chapter.verses_count,
      revelationType: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
      order: chapter.revelation_order,
    }));
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

/**
 * Fetch a specific surah by ID.
 */
export async function fetchSurah(surahId: number): Promise<Surah | null> {
  try {
    const response = await fetch(`${QUL_API_BASE}/chapters/${surahId}?language=en`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahId}: ${response.status}`);
    }

    const data: { chapter: QulChapter } = await response.json();
    const chapter = data.chapter;

    return {
      id: chapter.id,
      name: chapter.name_arabic,
      nameTransliteration: chapter.name_simple,
      nameTranslation: chapter.translated_name.name,
      versesCount: chapter.verses_count,
      revelationType: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
      order: chapter.revelation_order,
    };
  } catch (error) {
    console.error(`Error fetching surah ${surahId}:`, error);
    return null;
  }
}

/**
 * Fetch ayahs (verses) for a surah with optional translation and word-by-word.
 */
export async function fetchAyahs(
  surahId: number,
  options: {
    startAyah?: number;
    endAyah?: number;
    includeTranslation?: boolean;
    includeWords?: boolean;
    translationId?: number; // Default: 131 (Sahih International)
  } = {}
): Promise<Ayah[]> {
  const {
    startAyah = 1,
    endAyah,
    includeTranslation = true,
    includeWords = true,
    translationId = 131,
  } = options;

  try {
    // Build query parameters
    const params = new URLSearchParams({
      language: 'en',
      fields: 'text_uthmani,text_imlaei,verse_key', // Explicitly request text fields
      words: includeWords.toString(),
      word_fields: 'text_uthmani,text_imlaei',
      word_translation_language: 'en',
    });

    if (includeTranslation) {
      params.append('translations', translationId.toString());
    }

    // Calculate verse range
    // QUL API uses verse_key format: "1:1" for Surah 1, Ayah 1
    let url = `${QUL_API_BASE}/verses/by_chapter/${surahId}?${params.toString()}`;
    
    // Fetch with pagination handling
    const allVerses: Ayah[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageUrl = `${url}&page=${page}&per_page=50`;
      const response = await fetch(pageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch ayahs: ${response.status}`);
      }

      const data: QulVerseResponse = await response.json();

      // Transform verses
      const ayahs = data.verses
        .filter((verse) => {
          const ayahNum = verse.verse_number;
          const afterStart = ayahNum >= startAyah;
          const beforeEnd = endAyah ? ayahNum <= endAyah : true;
          return afterStart && beforeEnd;
        })
        .map((verse) => transformVerse(verse, surahId));

      allVerses.push(...ayahs);

      // Check if we need to continue
      hasMore = data.pagination.next_page !== null;
      
      // Stop early if we've passed the end ayah
      if (endAyah && data.verses.some((v) => v.verse_number >= endAyah)) {
        hasMore = false;
      }

      page++;
    }

    return allVerses;
  } catch (error) {
    console.error(`Error fetching ayahs for surah ${surahId}:`, error);
    
    // Try fallback data
    const fallback = getFallbackAyahs(surahId);
    if (fallback) {
      console.log(`Using fallback data for surah ${surahId}`);
      return fallback.filter((a) => {
        const afterStart = a.numberInSurah >= startAyah;
        const beforeEnd = endAyah ? a.numberInSurah <= endAyah : true;
        return afterStart && beforeEnd;
      });
    }
    
    throw error;
  }
}

/**
 * Fetch a single ayah by surah and ayah number.
 */
export async function fetchAyah(
  surahId: number,
  ayahNumber: number,
  options: {
    includeTranslation?: boolean;
    includeWords?: boolean;
  } = {}
): Promise<Ayah | null> {
  const { includeTranslation = true, includeWords = true } = options;

  try {
    const params = new URLSearchParams({
      language: 'en',
      words: includeWords.toString(),
      word_fields: 'text_uthmani,text_imlaei',
      word_translation_language: 'en',
    });

    if (includeTranslation) {
      params.append('translations', '131');
    }

    const verseKey = `${surahId}:${ayahNumber}`;
    const url = `${QUL_API_BASE}/verses/by_key/${verseKey}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ayah ${verseKey}: ${response.status}`);
    }

    const data: { verse: QulVerse & { words?: QulWord[]; translations?: QulTranslation[] } } =
      await response.json();

    return transformVerse(data.verse, surahId);
  } catch (error) {
    console.error(`Error fetching ayah ${surahId}:${ayahNumber}:`, error);
    return null;
  }
}

/**
 * Get audio URL for an ayah.
 */
export function getAyahAudioUrl(surahId: number, ayahNumber: number): string {
  // Format: surah_ayah (e.g., 001001 for 1:1)
  const surahStr = surahId.toString().padStart(3, '0');
  const ayahStr = ayahNumber.toString().padStart(3, '0');
  return `${QURAN_CDN}/${surahStr}${ayahStr}.mp3`;
}

/**
 * Fetch audio segments (word timings) for an ayah.
 * This is useful for word-by-word highlighting during playback.
 */
export async function fetchAudioSegments(
  surahId: number,
  ayahNumber: number,
  reciterId: number = DEFAULT_RECITER
): Promise<{ start: number; end: number; wordIndex: number }[]> {
  try {
    const verseKey = `${surahId}:${ayahNumber}`;
    const url = `${QUL_API_BASE}/recitations/${reciterId}/by_ayah/${verseKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      // Segments not available for all ayahs/reciters
      return [];
    }

    const data = await response.json();

    if (!data.audio_file?.segments) {
      return [];
    }

    return data.audio_file.segments.map((seg: [number, number, number]) => ({
      wordIndex: seg[0],
      start: seg[1],
      end: seg[2],
    }));
  } catch (error) {
    console.error(`Error fetching audio segments:`, error);
    return [];
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform QUL verse response to our Ayah type.
 */
function transformVerse(
  verse: QulVerse & { words?: QulWord[]; translations?: QulTranslation[] },
  surahId: number
): Ayah {
  const words: Word[] = (verse.words || [])
    .filter((w) => w.char_type_name === 'word') // Exclude pause marks
    .map((word, idx) => ({
      id: word.id,
      ayahId: verse.id,
      position: idx + 1,
      text: word.text_uthmani,
      transliteration: word.transliteration?.text || '',
      translation: word.translation?.text || '',
      audioUrl: word.audio?.url,
    }));

  // Get translation text
  const translation = verse.translations?.[0]?.text || '';

  // Generate transliteration from words if available
  const transliteration = words.map((w) => w.transliteration).filter(Boolean).join(' ');

  return {
    id: verse.id,
    surahId,
    numberInSurah: verse.verse_number,
    text: verse.text_uthmani,
    textUthmani: verse.text_uthmani,
    translation: cleanTranslationText(translation),
    transliteration,
    audioUrl: getAyahAudioUrl(surahId, verse.verse_number),
    words,
  };
}

/**
 * Clean translation text (remove footnote markers, etc.)
 */
function cleanTranslationText(text: string): string {
  return text
    .replace(/<sup.*?<\/sup>/g, '') // Remove superscript footnotes
    .replace(/<[^>]*>/g, '') // Remove any HTML tags
    .trim();
}

// ============================================================================
// Prefetched Data (for offline/fast access)
// ============================================================================

/**
 * Common surahs that are frequently memorized.
 * Can be used for quick access without API calls.
 */
export const COMMON_SURAHS = [
  { id: 1, name: 'الفاتحة', nameEn: 'Al-Fatiha', ayahCount: 7 },
  { id: 112, name: 'الإخلاص', nameEn: 'Al-Ikhlas', ayahCount: 4 },
  { id: 113, name: 'الفلق', nameEn: 'Al-Falaq', ayahCount: 5 },
  { id: 114, name: 'الناس', nameEn: 'An-Nas', ayahCount: 6 },
  { id: 110, name: 'النصر', nameEn: 'An-Nasr', ayahCount: 3 },
  { id: 111, name: 'المسد', nameEn: 'Al-Masad', ayahCount: 5 },
  { id: 108, name: 'الكوثر', nameEn: 'Al-Kawthar', ayahCount: 3 },
  { id: 109, name: 'الكافرون', nameEn: 'Al-Kafirun', ayahCount: 6 },
  { id: 107, name: 'الماعون', nameEn: 'Al-Ma\'un', ayahCount: 7 },
  { id: 36, name: 'يس', nameEn: 'Ya-Sin', ayahCount: 83 },
  { id: 67, name: 'الملك', nameEn: 'Al-Mulk', ayahCount: 30 },
  { id: 55, name: 'الرحمن', nameEn: 'Ar-Rahman', ayahCount: 78 },
  { id: 56, name: 'الواقعة', nameEn: 'Al-Waqi\'a', ayahCount: 96 },
  { id: 18, name: 'الكهف', nameEn: 'Al-Kahf', ayahCount: 110 },
];

/**
 * Fallback ayah data for offline use / when API fails.
 * Contains the most commonly memorized surahs.
 */
export const FALLBACK_AYAHS: Record<number, Ayah[]> = {
  // Surah Al-Fatiha
  1: [
    {
      id: 1,
      surahId: 1,
      numberInSurah: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      transliteration: 'Bismillahir Rahmanir Raheem',
      audioUrl: getAyahAudioUrl(1, 1),
      words: [],
    },
    {
      id: 2,
      surahId: 1,
      numberInSurah: 2,
      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
      translation: 'All praise is due to Allah, Lord of the worlds.',
      transliteration: 'Alhamdu lillahi Rabbil Aalameen',
      audioUrl: getAyahAudioUrl(1, 2),
      words: [],
    },
    {
      id: 3,
      surahId: 1,
      numberInSurah: 3,
      text: 'الرَّحْمَٰنِ الرَّحِيمِ',
      textUthmani: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful.',
      transliteration: 'Ar-Rahmanir Raheem',
      audioUrl: getAyahAudioUrl(1, 3),
      words: [],
    },
    {
      id: 4,
      surahId: 1,
      numberInSurah: 4,
      text: 'مَالِكِ يَوْمِ الدِّينِ',
      textUthmani: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
      translation: 'Sovereign of the Day of Recompense.',
      transliteration: 'Maliki Yawmid Deen',
      audioUrl: getAyahAudioUrl(1, 4),
      words: [],
    },
    {
      id: 5,
      surahId: 1,
      numberInSurah: 5,
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      textUthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'It is You we worship and You we ask for help.',
      transliteration: 'Iyyaka nabudu wa iyyaka nastaeen',
      audioUrl: getAyahAudioUrl(1, 5),
      words: [],
    },
    {
      id: 6,
      surahId: 1,
      numberInSurah: 6,
      text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      textUthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      translation: 'Guide us to the straight path.',
      transliteration: 'Ihdinas Siratal Mustaqeem',
      audioUrl: getAyahAudioUrl(1, 6),
      words: [],
    },
    {
      id: 7,
      surahId: 1,
      numberInSurah: 7,
      text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      textUthmani: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      translation: 'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.',
      transliteration: 'Siratal lazeena anamta alaihim ghairil maghdoobi alaihim wa lad daalleen',
      audioUrl: getAyahAudioUrl(1, 7),
      words: [],
    },
  ],
  // Surah Al-Ikhlas
  112: [
    {
      id: 6221,
      surahId: 112,
      numberInSurah: 1,
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      textUthmani: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      translation: 'Say, "He is Allah, [who is] One."',
      transliteration: 'Qul huwa Allahu ahad',
      audioUrl: getAyahAudioUrl(112, 1),
      words: [],
    },
    {
      id: 6222,
      surahId: 112,
      numberInSurah: 2,
      text: 'اللَّهُ الصَّمَدُ',
      textUthmani: 'ٱللَّهُ ٱلصَّمَدُ',
      translation: 'Allah, the Eternal Refuge.',
      transliteration: 'Allahus Samad',
      audioUrl: getAyahAudioUrl(112, 2),
      words: [],
    },
    {
      id: 6223,
      surahId: 112,
      numberInSurah: 3,
      text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      textUthmani: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      translation: 'He neither begets nor is born.',
      transliteration: 'Lam yalid wa lam yoolad',
      audioUrl: getAyahAudioUrl(112, 3),
      words: [],
    },
    {
      id: 6224,
      surahId: 112,
      numberInSurah: 4,
      text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      textUthmani: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      translation: 'Nor is there to Him any equivalent.',
      transliteration: 'Wa lam yakun lahu kufuwan ahad',
      audioUrl: getAyahAudioUrl(112, 4),
      words: [],
    },
  ],
  // Surah An-Nas
  114: [
    {
      id: 6231,
      surahId: 114,
      numberInSurah: 1,
      text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      textUthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
      translation: 'Say, "I seek refuge in the Lord of mankind."',
      transliteration: 'Qul aoodhu bi Rabbin naas',
      audioUrl: getAyahAudioUrl(114, 1),
      words: [],
    },
    {
      id: 6232,
      surahId: 114,
      numberInSurah: 2,
      text: 'مَلِكِ النَّاسِ',
      textUthmani: 'مَلِكِ ٱلنَّاسِ',
      translation: 'The Sovereign of mankind.',
      transliteration: 'Malikin naas',
      audioUrl: getAyahAudioUrl(114, 2),
      words: [],
    },
    {
      id: 6233,
      surahId: 114,
      numberInSurah: 3,
      text: 'إِلَٰهِ النَّاسِ',
      textUthmani: 'إِلَـٰهِ ٱلنَّاسِ',
      translation: 'The God of mankind.',
      transliteration: 'Ilaahin naas',
      audioUrl: getAyahAudioUrl(114, 3),
      words: [],
    },
    {
      id: 6234,
      surahId: 114,
      numberInSurah: 4,
      text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      textUthmani: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
      translation: 'From the evil of the retreating whisperer.',
      transliteration: 'Min sharril waswaasil khannaas',
      audioUrl: getAyahAudioUrl(114, 4),
      words: [],
    },
    {
      id: 6235,
      surahId: 114,
      numberInSurah: 5,
      text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      textUthmani: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ',
      translation: 'Who whispers [evil] into the breasts of mankind.',
      transliteration: 'Allazee yuwaswisu fee sudoorin naas',
      audioUrl: getAyahAudioUrl(114, 5),
      words: [],
    },
    {
      id: 6236,
      surahId: 114,
      numberInSurah: 6,
      text: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      textUthmani: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
      translation: 'From among the jinn and mankind.',
      transliteration: 'Minal jinnati wan naas',
      audioUrl: getAyahAudioUrl(114, 6),
      words: [],
    },
  ],
  // Surah Al-Falaq
  113: [
    {
      id: 6226,
      surahId: 113,
      numberInSurah: 1,
      text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      textUthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
      translation: 'Say, "I seek refuge in the Lord of daybreak."',
      transliteration: 'Qul aoodhu bi Rabbil falaq',
      audioUrl: getAyahAudioUrl(113, 1),
      words: [],
    },
    {
      id: 6227,
      surahId: 113,
      numberInSurah: 2,
      text: 'مِن شَرِّ مَا خَلَقَ',
      textUthmani: 'مِن شَرِّ مَا خَلَقَ',
      translation: 'From the evil of that which He created.',
      transliteration: 'Min sharri ma khalaq',
      audioUrl: getAyahAudioUrl(113, 2),
      words: [],
    },
    {
      id: 6228,
      surahId: 113,
      numberInSurah: 3,
      text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      textUthmani: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      translation: 'And from the evil of darkness when it settles.',
      transliteration: 'Wa min sharri ghaasiqin izaa waqab',
      audioUrl: getAyahAudioUrl(113, 3),
      words: [],
    },
    {
      id: 6229,
      surahId: 113,
      numberInSurah: 4,
      text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      textUthmani: 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ',
      translation: 'And from the evil of the blowers in knots.',
      transliteration: 'Wa min sharrin naffaathaati fil uqad',
      audioUrl: getAyahAudioUrl(113, 4),
      words: [],
    },
    {
      id: 6230,
      surahId: 113,
      numberInSurah: 5,
      text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      textUthmani: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      translation: 'And from the evil of an envier when he envies.',
      transliteration: 'Wa min sharri haasidin izaa hasad',
      audioUrl: getAyahAudioUrl(113, 5),
      words: [],
    },
  ],
};

/**
 * Get fallback ayahs for a surah if available.
 */
export function getFallbackAyahs(surahId: number): Ayah[] | null {
  return FALLBACK_AYAHS[surahId] || null;
}

/**
 * Get Juz (part) information.
 */
export const JUZ_INFO = [
  { id: 1, name: 'Juz 1', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { id: 30, name: 'Juz Amma', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
  // Add more as needed...
];

