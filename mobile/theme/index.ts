/**
 * Theme configuration for Quran Quest.
 *
 * Duolingo-inspired friendly, vibrant design with Islamic elegance.
 * Features bright colors, playful UI, and encouraging feedback.
 */

export const colors = {
  // Background - Clean, light, friendly
  background: '#131F24',
  backgroundElevated: '#1B2B33',
  backgroundCard: '#233640',
  backgroundMuted: '#2D424D',
  backgroundGlass: 'rgba(35, 54, 64, 0.95)',
  backgroundLight: '#58CC02', // Duolingo green tint

  // Primary - Duolingo-style vibrant green
  primary: '#58CC02',
  primaryLight: '#89E219',
  primaryDark: '#45A302',
  primaryMuted: 'rgba(88, 204, 2, 0.15)',
  primaryGlow: 'rgba(88, 204, 2, 0.4)',
  primarySoft: '#E5F7D3',

  // Secondary - Warm Orange for streaks/XP
  secondary: '#FF9600',
  secondaryLight: '#FFB020',
  secondaryDark: '#E68600',
  secondaryMuted: 'rgba(255, 150, 0, 0.15)',
  secondaryGlow: 'rgba(255, 150, 0, 0.4)',

  // Accent - Electric Blue for learning
  accent: '#1CB0F6',
  accentLight: '#49C7FF',
  accentDark: '#0095DC',
  accentMuted: 'rgba(28, 176, 246, 0.15)',
  accentGlow: 'rgba(28, 176, 246, 0.4)',

  // Purple - For premium/special elements
  purple: '#A560E8',
  purpleLight: '#C084FC',
  purpleDark: '#8B43D6',
  purpleMuted: 'rgba(165, 96, 232, 0.15)',

  // Surface colors
  surface: '#233640',
  surfaceLight: '#2D424D',
  surfaceHover: '#374D59',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A8BDC8',
  textMuted: '#6B8494',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#131F24',

  // Arabic text - warm, golden tint for readability
  textArabic: '#FFF8E7',
  textArabicMuted: '#D4C4A8',

  // Semantic colors - Duolingo style
  success: '#58CC02',
  successLight: '#89E219',
  successMuted: 'rgba(88, 204, 2, 0.2)',
  successGlow: 'rgba(88, 204, 2, 0.4)',

  warning: '#FF9600',
  warningLight: '#FFB020',
  warningMuted: 'rgba(255, 150, 0, 0.2)',

  error: '#FF4B4B',
  errorLight: '#FF7070',
  errorMuted: 'rgba(255, 75, 75, 0.2)',
  errorGlow: 'rgba(255, 75, 75, 0.4)',

  info: '#1CB0F6',
  infoLight: '#49C7FF',
  infoMuted: 'rgba(28, 176, 246, 0.2)',

  // Gamification colors - Duolingo palette
  xp: '#FF9600',
  xpGlow: 'rgba(255, 150, 0, 0.5)',
  streak: '#FF9600',
  streakGlow: 'rgba(255, 150, 0, 0.5)',
  heart: '#FF4B4B',
  heartGlow: 'rgba(255, 75, 75, 0.5)',
  diamond: '#1CB0F6',
  diamondGlow: 'rgba(28, 176, 246, 0.5)',
  gem: '#A560E8',
  crown: '#FFD700',

  // League colors
  leagueBronze: '#CD7F32',
  leagueSilver: '#C0C0C0',
  leagueGold: '#FFD700',
  leagueSapphire: '#1CB0F6',
  leagueRuby: '#FF4B4B',
  leagueEmerald: '#58CC02',
  leagueAmethyst: '#A560E8',
  leaguePearl: '#F0E6D3',
  leagueObsidian: '#374D59',
  leagueDiamond: '#B9F2FF',

  // Reading levels - Playful
  levelEgg: '#FFE4B5',
  levelSprout: '#89E219',
  levelFlame: '#FF9600',
  levelBeast: '#A560E8',

  // Borders - Softer
  border: '#374D59',
  borderLight: '#4A6575',
  borderFocus: '#58CC02',
  borderGlow: 'rgba(88, 204, 2, 0.3)',

  // Overlay
  overlay: 'rgba(19, 31, 36, 0.9)',
  overlayLight: 'rgba(19, 31, 36, 0.6)',

  // Transparent
  transparent: 'transparent',

  // Button specific (Duolingo-style 3D buttons)
  buttonShadow: '#45A302',
  buttonShadowSecondary: '#E68600',
  buttonShadowAccent: '#0095DC',
  buttonShadowError: '#CC3D3D',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
  // Duolingo uses very rounded elements
  button: 16,
  card: 20,
  pill: 50,
} as const;

export const typography = {
  fonts: {
    // System fonts for UI
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',

    // Arabic fonts - will be loaded via expo-font
    arabic: 'System',
    arabicBold: 'System',
    uthmani: 'System',
  },

  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    display: 48,

    // Arabic text sizes (larger for readability)
    arabicSm: 22,
    arabicMd: 30,
    arabicLg: 38,
    arabicXl: 46,
    arabicXxl: 54,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    arabic: 2.2,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    arabic: 0,
  },

  // Duolingo uses bold, friendly text
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  // Duolingo-style 3D button shadow (bottom border effect)
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Glow effects for celebrations
  glowPrimary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowSecondary: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowSuccess: {
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowError: {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowStreak: {
    shadowColor: colors.streak,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowXp: {
    shadowColor: colors.xp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  // Card hover/press effect
  cardPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;

export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
  // Duolingo uses bouncy, playful animations
  spring: {
    damping: 10,
    stiffness: 150,
    mass: 0.8,
  },
  bounce: {
    damping: 5,
    stiffness: 300,
    mass: 0.5,
  },
  gentle: {
    damping: 15,
    stiffness: 100,
    mass: 1,
  },
  // Celebration bounce
  celebration: {
    damping: 4,
    stiffness: 400,
    mass: 0.3,
  },
} as const;

// Reading level definitions - Friendly and encouraging
export const readingLevels = [
  { id: 1, name: 'Getting Started', emoji: '🌟', minutes: 2, color: colors.accent },
  { id: 2, name: 'Building Momentum', emoji: '🌱', minutes: 5, color: colors.levelSprout },
  { id: 3, name: 'On Fire!', emoji: '🔥', minutes: 15, color: colors.levelFlame },
  { id: 4, name: 'Super Reader', emoji: '💪', minutes: 30, color: colors.purple },
  { id: 5, name: 'Champion', emoji: '🏆', minutes: 60, color: colors.crown },
] as const;

// Encouragement messages (Duolingo-style)
export const encouragements = {
  correct: [
    "Amazing! 🎉",
    "You're on fire! 🔥",
    "Perfect! ✨",
    "Masha'Allah! 🌟",
    "Excellent work! 💪",
    "Keep it up! 🚀",
  ],
  streak: [
    "day streak! Don't break it!",
    "days strong! 💪",
    "days in a row! Amazing!",
  ],
  levelUp: "You've reached a new level! 🎊",
  mastered: "Ayah mastered! You know this! 🧠",
  firstTry: "First try! Incredible! ⭐",
} as const;

// Light theme (optional, Duolingo-style)
export const lightColors = {
  ...colors,
  background: '#FFFFFF',
  backgroundElevated: '#F7F7F7',
  backgroundCard: '#FFFFFF',
  backgroundMuted: '#E5E5E5',
  backgroundGlass: 'rgba(255, 255, 255, 0.95)',
  surface: '#FFFFFF',
  surfaceLight: '#F7F7F7',
  surfaceHover: '#F0F0F0',
  text: '#3C3C3C',
  textSecondary: '#777777',
  textMuted: '#AFAFAF',
  textArabic: '#2D2D2D',
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
