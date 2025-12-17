/**
 * Theme configuration for Quran Quest.
 *
 * Premium dark theme inspired by Quranly and Tarteel AI.
 * Features vibrant neon accents with glow effects.
 */

export const colors = {
  // Background - Pure black to charcoal gradient
  background: '#0A0A0A',
  backgroundElevated: '#121212',
  backgroundCard: '#1A1A1A',
  backgroundMuted: '#242424',
  backgroundGlass: 'rgba(26, 26, 26, 0.85)',

  // Primary - Vibrant Teal with glow
  primary: '#00D9A5',
  primaryLight: '#33E3B8',
  primaryDark: '#00B88A',
  primaryMuted: 'rgba(0, 217, 165, 0.15)',
  primaryGlow: 'rgba(0, 217, 165, 0.4)',

  // Secondary - Warm Gold for XP/rewards
  secondary: '#FFD700',
  secondaryLight: '#FFE033',
  secondaryDark: '#E6C200',
  secondaryMuted: 'rgba(255, 215, 0, 0.15)',
  secondaryGlow: 'rgba(255, 215, 0, 0.4)',

  // Accent - Electric Purple for special elements
  accent: '#A855F7',
  accentLight: '#C084FC',
  accentDark: '#9333EA',
  accentMuted: 'rgba(168, 85, 247, 0.15)',
  accentGlow: 'rgba(168, 85, 247, 0.4)',

  // Surface colors
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  surfaceHover: '#333333',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textOnPrimary: '#0A0A0A',
  textOnSecondary: '#0A0A0A',

  // Arabic text - warm tint for readability
  textArabic: '#FFFAF0',
  textArabicMuted: '#D4C4A8',

  // Semantic colors
  success: '#22C55E',
  successLight: '#4ADE80',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  successGlow: 'rgba(34, 197, 94, 0.4)',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningMuted: 'rgba(245, 158, 11, 0.15)',

  error: '#EF4444',
  errorLight: '#F87171',
  errorMuted: 'rgba(239, 68, 68, 0.15)',
  errorGlow: 'rgba(239, 68, 68, 0.4)',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoMuted: 'rgba(59, 130, 246, 0.15)',

  // Gamification colors
  xp: '#FFD700',
  xpGlow: 'rgba(255, 215, 0, 0.5)',
  streak: '#FF6B35',
  streakGlow: 'rgba(255, 107, 53, 0.5)',
  heart: '#FF3B5C',
  heartGlow: 'rgba(255, 59, 92, 0.5)',
  diamond: '#00D4FF',
  diamondGlow: 'rgba(0, 212, 255, 0.5)',

  // League colors
  leagueBronze: '#CD7F32',
  leagueSilver: '#C0C0C0',
  leagueGold: '#FFD700',
  leagueSapphire: '#0F52BA',
  leagueRuby: '#E0115F',
  leagueEmerald: '#50C878',
  leagueAmethyst: '#9966CC',
  leaguePearl: '#EAE0C8',
  leagueObsidian: '#3D3D3D',
  leagueDiamond: '#B9F2FF',

  // Reading levels
  levelEgg: '#FFE4B5',
  levelSprout: '#90EE90',
  levelFlame: '#FF6B35',
  levelBeast: '#A855F7',

  // Borders
  border: '#2A2A2A',
  borderLight: '#3A3A3A',
  borderFocus: '#00D9A5',
  borderGlow: 'rgba(0, 217, 165, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.85)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Transparent
  transparent: 'transparent',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
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
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
    display: 42,

    // Arabic text sizes (larger for readability)
    arabicSm: 20,
    arabicMd: 28,
    arabicLg: 36,
    arabicXl: 44,
    arabicXxl: 52,
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
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  // Glow effects for neon aesthetic
  glowPrimary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowSecondary: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowSuccess: {
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowError: {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowStreak: {
    shadowColor: colors.streak,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  glowXp: {
    shadowColor: colors.xp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  // Subtle inner glow for cards
  innerGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0,
  },
} as const;

export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  },
  bounce: {
    damping: 6,
    stiffness: 280,
    mass: 0.6,
  },
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },
} as const;

// Reading level definitions
export const readingLevels = [
  { id: 1, name: 'Break The Egg', emoji: '🥚', minutes: 2, color: colors.levelEgg },
  { id: 2, name: 'Sprout', emoji: '🌱', minutes: 5, color: colors.levelSprout },
  { id: 3, name: 'On Fire', emoji: '🔥', minutes: 15, color: colors.levelFlame },
  { id: 4, name: 'Beast Mode', emoji: '💪', minutes: 30, color: colors.levelBeast },
  { id: 5, name: 'Champion', emoji: '🏆', minutes: 60, color: colors.secondary },
] as const;

// Light theme override (optional)
export const lightColors = {
  ...colors,
  background: '#FAFAFA',
  backgroundElevated: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundMuted: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#FAFAFA',
  text: '#0A0A0A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textArabic: '#1A1A1A',
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
