/**
 * Core type definitions for Quran Quest app.
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  userId: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  hearts: number;
  maxHearts: number;
  heartsRegenAt?: string;
  lessonsCompleted: number;
  versesMemorized: number;
  totalRecitationTime: number; // in seconds
  league: League;
  leagueRank: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// Gamification
// ============================================================================

export type League =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'amethyst'
  | 'pearl'
  | 'obsidian'
  | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number; // 0-100
  requirement: number;
}

export interface DailyGoal {
  targetXp: number;
  currentXp: number;
  completed: boolean;
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  isCurrentUser: boolean;
}

export interface Challenge {
  id: string;
  type: 'recitation' | 'quiz' | 'streak';
  title: string;
  description: string;
  opponentId?: string;
  opponentName?: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  myScore?: number;
  opponentScore?: number;
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// Quran Content
// ============================================================================

export interface Surah {
  id: number;
  name: string; // Arabic name
  nameTransliteration: string;
  nameTranslation: string;
  versesCount: number;
  revelationType: 'meccan' | 'medinan';
  order: number;
}

export interface Ayah {
  id: number;
  surahId: number;
  numberInSurah: number;
  text: string; // Arabic text
  textUthmani: string; // Uthmani script
  translation?: string;
  transliteration?: string;
  audioUrl?: string;
  words: Word[];
}

export interface Word {
  id: number;
  ayahId: number;
  position: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
  startTime?: number; // milliseconds
  endTime?: number;
}

export interface Juz {
  id: number;
  name: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

// ============================================================================
// Lessons & Learning
// ============================================================================

export type LessonType =
  | 'alphabet'      // Arabic letters
  | 'pronunciation' // Makharij
  | 'reading'       // Word reading
  | 'recitation'    // Full verse recitation
  | 'memorization'  // Hifz
  | 'tajweed'       // Tajweed rules
  | 'review';       // Revision

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LessonModule {
  id: string;
  title: string;
  titleArabic?: string;
  description: string;
  iconName: string;
  color: string;
  lessonCount: number;
  completedCount: number;
  locked: boolean;
  type: LessonType;
  difficulty: LessonDifficulty;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: LessonType;
  xpReward: number;
  estimatedMinutes: number;
  exercises: Exercise[];
  completed: boolean;
  stars: 0 | 1 | 2 | 3; // Performance rating
  bestScore?: number;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question?: string;
  prompt?: string;
  options?: ExerciseOption[];
  correctAnswer?: string;
  ayah?: Ayah;
  word?: Word;
  audioUrl?: string;
  targetText?: string; // For recitation exercises
}

export type ExerciseType =
  | 'listen_select'      // Listen and select correct option
  | 'match_pairs'        // Match Arabic to translation
  | 'recite_word'        // Recite a single word
  | 'recite_ayah'        // Recite full verse
  | 'fill_blank'         // Fill in missing word
  | 'arrange_words'      // Arrange words in order
  | 'identify_letter'    // Identify Arabic letter
  | 'tajweed_identify';  // Identify tajweed rule

export interface ExerciseOption {
  id: string;
  text: string;
  textArabic?: string;
  isCorrect: boolean;
}

// ============================================================================
// Recitation & Audio
// ============================================================================

export interface RecitationResult {
  id: string;
  userId: string;
  ayahId?: number;
  wordId?: number;
  audioUrl: string;
  transcription: string;
  expectedText: string;
  accuracy: number; // 0-100
  wer: number; // Word Error Rate
  feedback: RecitationFeedback[];
  duration: number; // milliseconds
  createdAt: string;
}

export interface RecitationFeedback {
  wordIndex: number;
  word: string;
  expected: string;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
  suggestion?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri?: string;
}

// ============================================================================
// Social
// ============================================================================

export interface Friend {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: 'pending' | 'accepted' | 'blocked';
  currentStreak: number;
  level: number;
  lastActiveAt: string;
}

export interface StudyCircle {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  memberCount: number;
  isPrivate: boolean;
  createdBy: string;
  members: Friend[];
  weeklyXp: number;
}

export interface Notification {
  id: string;
  type: 'challenge' | 'friend_request' | 'streak_reminder' | 'achievement' | 'league_change';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ============================================================================
// API Responses
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// App State
// ============================================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reciterVoice: string;
  translationLanguage: string;
  showTransliteration: boolean;
  dailyGoalXp: number;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
}

