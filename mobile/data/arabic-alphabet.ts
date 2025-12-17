/**
 * Arabic Alphabet Data for Learning System.
 *
 * Contains all 28 Arabic letters with:
 * - Name (Arabic and transliteration)
 * - All forms (isolated, initial, medial, final)
 * - Pronunciation guide
 * - Example words
 */

export interface ArabicLetter {
  id: number;
  name: string;           // Arabic name
  nameEn: string;         // English name
  transliteration: string; // How it sounds
  isolated: string;       // Standalone form
  initial: string;        // Beginning of word
  medial: string;         // Middle of word
  final: string;          // End of word
  pronunciation: string;  // How to pronounce
  example: string;        // Example word
  exampleTranslation: string;
  audioUrl?: string;      // Letter pronunciation audio
}

export const ARABIC_ALPHABET: ArabicLetter[] = [
  {
    id: 1,
    name: 'أَلِف',
    nameEn: 'Alif',
    transliteration: 'a',
    isolated: 'ا',
    initial: 'ا',
    medial: 'ـا',
    final: 'ـا',
    pronunciation: 'Like "a" in "father"',
    example: 'أَسَد',
    exampleTranslation: 'Lion',
  },
  {
    id: 2,
    name: 'بَاء',
    nameEn: 'Ba',
    transliteration: 'b',
    isolated: 'ب',
    initial: 'بـ',
    medial: 'ـبـ',
    final: 'ـب',
    pronunciation: 'Like "b" in "book"',
    example: 'بَيْت',
    exampleTranslation: 'House',
  },
  {
    id: 3,
    name: 'تَاء',
    nameEn: 'Ta',
    transliteration: 't',
    isolated: 'ت',
    initial: 'تـ',
    medial: 'ـتـ',
    final: 'ـت',
    pronunciation: 'Like "t" in "table"',
    example: 'تُفَّاح',
    exampleTranslation: 'Apple',
  },
  {
    id: 4,
    name: 'ثَاء',
    nameEn: 'Tha',
    transliteration: 'th',
    isolated: 'ث',
    initial: 'ثـ',
    medial: 'ـثـ',
    final: 'ـث',
    pronunciation: 'Like "th" in "think"',
    example: 'ثَلْج',
    exampleTranslation: 'Snow',
  },
  {
    id: 5,
    name: 'جِيم',
    nameEn: 'Jeem',
    transliteration: 'j',
    isolated: 'ج',
    initial: 'جـ',
    medial: 'ـجـ',
    final: 'ـج',
    pronunciation: 'Like "j" in "jam"',
    example: 'جَمَل',
    exampleTranslation: 'Camel',
  },
  {
    id: 6,
    name: 'حَاء',
    nameEn: 'Ha',
    transliteration: 'ḥ',
    isolated: 'ح',
    initial: 'حـ',
    medial: 'ـحـ',
    final: 'ـح',
    pronunciation: 'Deep "h" from throat',
    example: 'حَليب',
    exampleTranslation: 'Milk',
  },
  {
    id: 7,
    name: 'خَاء',
    nameEn: 'Kha',
    transliteration: 'kh',
    isolated: 'خ',
    initial: 'خـ',
    medial: 'ـخـ',
    final: 'ـخ',
    pronunciation: 'Like "ch" in Scottish "loch"',
    example: 'خُبْز',
    exampleTranslation: 'Bread',
  },
  {
    id: 8,
    name: 'دَال',
    nameEn: 'Dal',
    transliteration: 'd',
    isolated: 'د',
    initial: 'د',
    medial: 'ـد',
    final: 'ـد',
    pronunciation: 'Like "d" in "door"',
    example: 'دَجَاج',
    exampleTranslation: 'Chicken',
  },
  {
    id: 9,
    name: 'ذَال',
    nameEn: 'Dhal',
    transliteration: 'dh',
    isolated: 'ذ',
    initial: 'ذ',
    medial: 'ـذ',
    final: 'ـذ',
    pronunciation: 'Like "th" in "this"',
    example: 'ذَهَب',
    exampleTranslation: 'Gold',
  },
  {
    id: 10,
    name: 'رَاء',
    nameEn: 'Ra',
    transliteration: 'r',
    isolated: 'ر',
    initial: 'ر',
    medial: 'ـر',
    final: 'ـر',
    pronunciation: 'Rolled "r" like in Spanish',
    example: 'رُمَّان',
    exampleTranslation: 'Pomegranate',
  },
  {
    id: 11,
    name: 'زَاي',
    nameEn: 'Zay',
    transliteration: 'z',
    isolated: 'ز',
    initial: 'ز',
    medial: 'ـز',
    final: 'ـز',
    pronunciation: 'Like "z" in "zoo"',
    example: 'زَهْرَة',
    exampleTranslation: 'Flower',
  },
  {
    id: 12,
    name: 'سِين',
    nameEn: 'Seen',
    transliteration: 's',
    isolated: 'س',
    initial: 'سـ',
    medial: 'ـسـ',
    final: 'ـس',
    pronunciation: 'Like "s" in "sun"',
    example: 'سَمَك',
    exampleTranslation: 'Fish',
  },
  {
    id: 13,
    name: 'شِين',
    nameEn: 'Sheen',
    transliteration: 'sh',
    isolated: 'ش',
    initial: 'شـ',
    medial: 'ـشـ',
    final: 'ـش',
    pronunciation: 'Like "sh" in "ship"',
    example: 'شَمْس',
    exampleTranslation: 'Sun',
  },
  {
    id: 14,
    name: 'صَاد',
    nameEn: 'Sad',
    transliteration: 'ṣ',
    isolated: 'ص',
    initial: 'صـ',
    medial: 'ـصـ',
    final: 'ـص',
    pronunciation: 'Emphatic "s" (deeper)',
    example: 'صَباح',
    exampleTranslation: 'Morning',
  },
  {
    id: 15,
    name: 'ضَاد',
    nameEn: 'Dad',
    transliteration: 'ḍ',
    isolated: 'ض',
    initial: 'ضـ',
    medial: 'ـضـ',
    final: 'ـض',
    pronunciation: 'Emphatic "d" (deeper)',
    example: 'ضَوْء',
    exampleTranslation: 'Light',
  },
  {
    id: 16,
    name: 'طَاء',
    nameEn: 'Ta (emphatic)',
    transliteration: 'ṭ',
    isolated: 'ط',
    initial: 'طـ',
    medial: 'ـطـ',
    final: 'ـط',
    pronunciation: 'Emphatic "t" (deeper)',
    example: 'طَائِر',
    exampleTranslation: 'Bird',
  },
  {
    id: 17,
    name: 'ظَاء',
    nameEn: 'Dha (emphatic)',
    transliteration: 'ẓ',
    isolated: 'ظ',
    initial: 'ظـ',
    medial: 'ـظـ',
    final: 'ـظ',
    pronunciation: 'Emphatic "th" (deeper)',
    example: 'ظِل',
    exampleTranslation: 'Shadow',
  },
  {
    id: 18,
    name: 'عَيْن',
    nameEn: 'Ayn',
    transliteration: 'ʿ',
    isolated: 'ع',
    initial: 'عـ',
    medial: 'ـعـ',
    final: 'ـع',
    pronunciation: 'Deep guttural sound (unique to Arabic)',
    example: 'عَيْن',
    exampleTranslation: 'Eye',
  },
  {
    id: 19,
    name: 'غَيْن',
    nameEn: 'Ghayn',
    transliteration: 'gh',
    isolated: 'غ',
    initial: 'غـ',
    medial: 'ـغـ',
    final: 'ـغ',
    pronunciation: 'Like French "r" or gargling',
    example: 'غُراب',
    exampleTranslation: 'Crow',
  },
  {
    id: 20,
    name: 'فَاء',
    nameEn: 'Fa',
    transliteration: 'f',
    isolated: 'ف',
    initial: 'فـ',
    medial: 'ـفـ',
    final: 'ـف',
    pronunciation: 'Like "f" in "fish"',
    example: 'فِيل',
    exampleTranslation: 'Elephant',
  },
  {
    id: 21,
    name: 'قَاف',
    nameEn: 'Qaf',
    transliteration: 'q',
    isolated: 'ق',
    initial: 'قـ',
    medial: 'ـقـ',
    final: 'ـق',
    pronunciation: 'Deep "k" from back of throat',
    example: 'قَمَر',
    exampleTranslation: 'Moon',
  },
  {
    id: 22,
    name: 'كَاف',
    nameEn: 'Kaf',
    transliteration: 'k',
    isolated: 'ك',
    initial: 'كـ',
    medial: 'ـكـ',
    final: 'ـك',
    pronunciation: 'Like "k" in "king"',
    example: 'كِتَاب',
    exampleTranslation: 'Book',
  },
  {
    id: 23,
    name: 'لَام',
    nameEn: 'Lam',
    transliteration: 'l',
    isolated: 'ل',
    initial: 'لـ',
    medial: 'ـلـ',
    final: 'ـل',
    pronunciation: 'Like "l" in "lamp"',
    example: 'لَيْمون',
    exampleTranslation: 'Lemon',
  },
  {
    id: 24,
    name: 'مِيم',
    nameEn: 'Meem',
    transliteration: 'm',
    isolated: 'م',
    initial: 'مـ',
    medial: 'ـمـ',
    final: 'ـم',
    pronunciation: 'Like "m" in "moon"',
    example: 'مَاء',
    exampleTranslation: 'Water',
  },
  {
    id: 25,
    name: 'نُون',
    nameEn: 'Noon',
    transliteration: 'n',
    isolated: 'ن',
    initial: 'نـ',
    medial: 'ـنـ',
    final: 'ـن',
    pronunciation: 'Like "n" in "noon"',
    example: 'نَجْم',
    exampleTranslation: 'Star',
  },
  {
    id: 26,
    name: 'هَاء',
    nameEn: 'Ha',
    transliteration: 'h',
    isolated: 'ه',
    initial: 'هـ',
    medial: 'ـهـ',
    final: 'ـه',
    pronunciation: 'Like "h" in "house"',
    example: 'هَدِيَّة',
    exampleTranslation: 'Gift',
  },
  {
    id: 27,
    name: 'وَاو',
    nameEn: 'Waw',
    transliteration: 'w / ū',
    isolated: 'و',
    initial: 'و',
    medial: 'ـو',
    final: 'ـو',
    pronunciation: 'Like "w" in "water" or "oo" in "moon"',
    example: 'وَرْدَة',
    exampleTranslation: 'Rose',
  },
  {
    id: 28,
    name: 'يَاء',
    nameEn: 'Ya',
    transliteration: 'y / ī',
    isolated: 'ي',
    initial: 'يـ',
    medial: 'ـيـ',
    final: 'ـي',
    pronunciation: 'Like "y" in "yes" or "ee" in "see"',
    example: 'يَد',
    exampleTranslation: 'Hand',
  },
];

// Challenge types for alphabet learning
export type AlphabetChallengeType = 
  | 'identify_letter'      // Show letter, pick correct name
  | 'identify_name'        // Show name, pick correct letter
  | 'identify_sound'       // Play audio, pick correct letter
  | 'match_forms'          // Match isolated to other forms
  | 'complete_word'        // Fill in missing letter in word
  | 'type_letter';         // Type the letter shown

export interface AlphabetChallenge {
  id: string;
  type: AlphabetChallengeType;
  letterId: number;
  question: string;
  questionArabic?: string;
  options: AlphabetOption[];
  correctOptionId: string;
  audioUrl?: string;
}

export interface AlphabetOption {
  id: string;
  text: string;
  textArabic?: string;
  isCorrect: boolean;
  audioUrl?: string;
}

/**
 * Generate challenges for a letter.
 */
export function generateLetterChallenges(
  letter: ArabicLetter,
  allLetters: ArabicLetter[]
): AlphabetChallenge[] {
  const challenges: AlphabetChallenge[] = [];
  
  // Get 3 random wrong options
  const getWrongOptions = (correctId: number, count: number = 3): ArabicLetter[] => {
    const others = allLetters.filter(l => l.id !== correctId);
    const shuffled = others.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Challenge 1: Identify the letter name
  const wrongLetters1 = getWrongOptions(letter.id);
  challenges.push({
    id: `${letter.id}_identify_letter`,
    type: 'identify_letter',
    letterId: letter.id,
    question: `What is this letter?`,
    questionArabic: letter.isolated,
    options: [
      { id: `${letter.id}_correct`, text: letter.nameEn, textArabic: letter.name, isCorrect: true },
      ...wrongLetters1.map((l, i) => ({
        id: `${l.id}_wrong_${i}`,
        text: l.nameEn,
        textArabic: l.name,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctOptionId: `${letter.id}_correct`,
  });

  // Challenge 2: Pick the correct letter for the name
  const wrongLetters2 = getWrongOptions(letter.id);
  challenges.push({
    id: `${letter.id}_identify_name`,
    type: 'identify_name',
    letterId: letter.id,
    question: `Select "${letter.nameEn}"`,
    options: [
      { id: `${letter.id}_correct`, text: letter.isolated, isCorrect: true },
      ...wrongLetters2.map((l, i) => ({
        id: `${l.id}_wrong_${i}`,
        text: l.isolated,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctOptionId: `${letter.id}_correct`,
  });

  // Challenge 3: Match the pronunciation
  challenges.push({
    id: `${letter.id}_match_sound`,
    type: 'identify_sound',
    letterId: letter.id,
    question: `Which letter makes the "${letter.transliteration}" sound?`,
    options: [
      { id: `${letter.id}_correct`, text: letter.isolated, textArabic: letter.name, isCorrect: true },
      ...getWrongOptions(letter.id).map((l, i) => ({
        id: `${l.id}_wrong_${i}`,
        text: l.isolated,
        textArabic: l.name,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctOptionId: `${letter.id}_correct`,
  });

  // Challenge 4: Identify the form
  challenges.push({
    id: `${letter.id}_match_forms`,
    type: 'match_forms',
    letterId: letter.id,
    question: `Which is the initial form of "${letter.isolated}"?`,
    options: [
      { id: `${letter.id}_correct`, text: letter.initial, isCorrect: true },
      { id: `${letter.id}_medial`, text: letter.medial, isCorrect: false },
      { id: `${letter.id}_final`, text: letter.final, isCorrect: false },
      ...getWrongOptions(letter.id, 1).map((l, i) => ({
        id: `${l.id}_wrong_${i}`,
        text: l.initial,
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5),
    correctOptionId: `${letter.id}_correct`,
  });

  return challenges;
}

/**
 * Generate a lesson for a set of letters.
 */
export interface AlphabetLesson {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  letterIds: number[];
  challenges: AlphabetChallenge[];
  completed: boolean;
  xpReward: number;
}

export function generateLesson(
  lessonId: string,
  title: string,
  titleArabic: string,
  letterIds: number[],
  allLetters: ArabicLetter[]
): AlphabetLesson {
  const letters = letterIds.map(id => allLetters.find(l => l.id === id)!);
  const challenges: AlphabetChallenge[] = [];
  
  letters.forEach(letter => {
    challenges.push(...generateLetterChallenges(letter, allLetters));
  });

  // Shuffle challenges
  const shuffledChallenges = challenges.sort(() => Math.random() - 0.5);

  return {
    id: lessonId,
    title,
    titleArabic,
    description: `Learn the letters: ${letters.map(l => l.isolated).join(' ')}`,
    letterIds,
    challenges: shuffledChallenges,
    completed: false,
    xpReward: letters.length * 10,
  };
}

/**
 * Predefined lessons for the Arabic alphabet.
 */
export const ALPHABET_LESSONS: { id: string; title: string; titleArabic: string; letterIds: number[]; description: string }[] = [
  {
    id: 'lesson_1',
    title: 'Lesson 1: Alif & Ba',
    titleArabic: 'الدرس ١',
    letterIds: [1, 2],
    description: 'Start with the basics - Alif and Ba',
  },
  {
    id: 'lesson_2',
    title: 'Lesson 2: Ta & Tha',
    titleArabic: 'الدرس ٢',
    letterIds: [3, 4],
    description: 'Learn Ta and Tha',
  },
  {
    id: 'lesson_3',
    title: 'Lesson 3: Jeem, Ha, Kha',
    titleArabic: 'الدرس ٣',
    letterIds: [5, 6, 7],
    description: 'Master the throat sounds',
  },
  {
    id: 'lesson_4',
    title: 'Lesson 4: Dal & Dhal',
    titleArabic: 'الدرس ٤',
    letterIds: [8, 9],
    description: 'The D sounds',
  },
  {
    id: 'lesson_5',
    title: 'Lesson 5: Ra & Zay',
    titleArabic: 'الدرس ٥',
    letterIds: [10, 11],
    description: 'Rolling R and Z',
  },
  {
    id: 'lesson_6',
    title: 'Lesson 6: Seen & Sheen',
    titleArabic: 'الدرس ٦',
    letterIds: [12, 13],
    description: 'S and Sh sounds',
  },
  {
    id: 'lesson_7',
    title: 'Lesson 7: Sad & Dad',
    titleArabic: 'الدرس ٧',
    letterIds: [14, 15],
    description: 'Emphatic S and D',
  },
  {
    id: 'lesson_8',
    title: 'Lesson 8: Ta & Dha (Emphatic)',
    titleArabic: 'الدرس ٨',
    letterIds: [16, 17],
    description: 'More emphatic sounds',
  },
  {
    id: 'lesson_9',
    title: 'Lesson 9: Ayn & Ghayn',
    titleArabic: 'الدرس ٩',
    letterIds: [18, 19],
    description: 'The unique Arabic sounds',
  },
  {
    id: 'lesson_10',
    title: 'Lesson 10: Fa & Qaf',
    titleArabic: 'الدرس ١٠',
    letterIds: [20, 21],
    description: 'F and deep Q',
  },
  {
    id: 'lesson_11',
    title: 'Lesson 11: Kaf & Lam',
    titleArabic: 'الدرس ١١',
    letterIds: [22, 23],
    description: 'K and L sounds',
  },
  {
    id: 'lesson_12',
    title: 'Lesson 12: Meem & Noon',
    titleArabic: 'الدرس ١٢',
    letterIds: [24, 25],
    description: 'M and N sounds',
  },
  {
    id: 'lesson_13',
    title: 'Lesson 13: Ha, Waw, Ya',
    titleArabic: 'الدرس ١٣',
    letterIds: [26, 27, 28],
    description: 'Complete the alphabet!',
  },
];

/**
 * Get letters for a specific lesson.
 */
export function getLettersForLesson(lessonId: string): ArabicLetter[] {
  const lesson = ALPHABET_LESSONS.find(l => l.id === lessonId);
  if (!lesson) return [];
  return lesson.letterIds.map(id => ARABIC_ALPHABET.find(l => l.id === id)!);
}

