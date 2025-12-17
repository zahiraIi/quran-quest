/**
 * Reading level badge component.
 * Shows current reading level with fun names like Quranly.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, typography, spacing, radii, readingLevels } from '@/theme';

interface ReadingLevelBadgeProps {
  /** Current level ID (1-5) */
  levelId: number;
  /** Minutes read today */
  minutesRead: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show progress to next level */
  showProgress?: boolean;
  /** Container style */
  style?: ViewStyle;
}

export function ReadingLevelBadge({
  levelId,
  minutesRead,
  size = 'md',
  showProgress = false,
  style,
}: ReadingLevelBadgeProps) {
  const currentLevel = readingLevels.find((l) => l.id === levelId) || readingLevels[0];
  const nextLevel = readingLevels.find((l) => l.id === levelId + 1);

  const progressToNext = nextLevel
    ? Math.min((minutesRead / nextLevel.minutes) * 100, 100)
    : 100;

  const sizeStyles = SIZE_STYLES[size];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, style]}
    >
      <View
        style={[
          styles.badge,
          sizeStyles.badge,
          { backgroundColor: `${currentLevel.color}20` },
        ]}
      >
        <Text style={[styles.emoji, sizeStyles.emoji]}>{currentLevel.emoji}</Text>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.levelName,
              sizeStyles.levelName,
              { color: currentLevel.color },
            ]}
          >
            {currentLevel.name}
          </Text>
          {showProgress && nextLevel && (
            <Text style={styles.progressText}>
              {minutesRead}m / {nextLevel.minutes}m
            </Text>
          )}
        </View>
      </View>

      {showProgress && nextLevel && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressToNext}%`,
                backgroundColor: currentLevel.color,
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}

interface LevelProgressCardProps {
  minutesRead: number;
  style?: ViewStyle;
}

export function LevelProgressCard({ minutesRead, style }: LevelProgressCardProps) {
  // Determine current level based on minutes
  let currentLevelIndex = 0;
  for (let i = readingLevels.length - 1; i >= 0; i--) {
    if (minutesRead >= readingLevels[i].minutes) {
      currentLevelIndex = i;
      break;
    }
  }

  const currentLevel = readingLevels[currentLevelIndex];
  const nextLevel = readingLevels[currentLevelIndex + 1];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Reading Level</Text>
        <Text style={styles.minutesText}>{minutesRead} min today</Text>
      </View>

      <View style={styles.levelsRow}>
        {readingLevels.map((level, index) => {
          const isAchieved = minutesRead >= level.minutes;
          const isCurrent = level.id === currentLevel.id;

          return (
            <View key={level.id} style={styles.levelItem}>
              <View
                style={[
                  styles.levelCircle,
                  isAchieved && {
                    backgroundColor: level.color,
                    borderColor: level.color,
                  },
                  isCurrent && styles.levelCircleCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.levelEmoji,
                    !isAchieved && styles.levelEmojiLocked,
                  ]}
                >
                  {level.emoji}
                </Text>
              </View>
              <Text
                style={[
                  styles.levelMinutes,
                  isAchieved && { color: level.color },
                ]}
              >
                {level.minutes}m
              </Text>
            </View>
          );
        })}
      </View>

      {nextLevel && (
        <View style={styles.nextLevelInfo}>
          <Text style={styles.nextLevelText}>
            {nextLevel.minutes - minutesRead}m until{' '}
            <Text style={{ color: nextLevel.color }}>{nextLevel.name}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const SIZE_STYLES = {
  sm: {
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radii.md,
    },
    emoji: {
      fontSize: 16,
    },
    levelName: {
      fontSize: typography.sizes.xs,
    },
  },
  md: {
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
    },
    emoji: {
      fontSize: 20,
    },
    levelName: {
      fontSize: typography.sizes.sm,
    },
  },
  lg: {
    badge: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.xl,
    },
    emoji: {
      fontSize: 28,
    },
    levelName: {
      fontSize: typography.sizes.lg,
    },
  },
};

const styles = StyleSheet.create({
  container: {},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {},
  textContainer: {},
  levelName: {
    fontWeight: '700',
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Card styles
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  minutesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  levelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircleCurrent: {
    borderWidth: 3,
  },
  levelEmoji: {
    fontSize: 20,
  },
  levelEmojiLocked: {
    opacity: 0.3,
  },
  levelMinutes: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  nextLevelInfo: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

