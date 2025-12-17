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
 * Get Juz (part) information.
 */
export const JUZ_INFO = [
  { id: 1, name: 'Juz 1', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { id: 30, name: 'Juz Amma', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
  // Add more as needed...
];

