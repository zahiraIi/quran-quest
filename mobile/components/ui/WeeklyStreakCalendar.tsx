/**
 * Weekly streak calendar component.
 * Shows 7-day streak with glow effects on completed days.
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
  withDelay,
} from 'react-native-reanimated';

import { colors, typography, spacing, radii, shadows } from '@/theme';

interface DayStatus {
  /** Day abbreviation (M, T, W, etc.) */
  day: string;
  /** Full date for accessibility */
  date: string;
  /** Whether the day is completed */
  completed: boolean;
  /** Whether this is today */
  isToday: boolean;
}

interface WeeklyStreakCalendarProps {
  /** Array of 7 days with their status */
  days: DayStatus[];
  /** Current streak count */
  currentStreak: number;
  /** Container style */
  style?: ViewStyle;
}

const DAY_ABBREVIATIONS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeeklyStreakCalendar({
  days,
  currentStreak,
  style,
}: WeeklyStreakCalendarProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Streak count header */}
      <View style={styles.header}>
        <View style={styles.streakInfo}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      {/* Days row */}
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <DayCircle
            key={day.date}
            day={day.day}
            completed={day.completed}
            isToday={day.isToday}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

interface DayCircleProps {
  day: string;
  completed: boolean;
  isToday: boolean;
  index: number;
}

function DayCircle({ day, completed, isToday, index }: DayCircleProps) {
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isToday && !completed) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [isToday, completed, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      style={[
        styles.dayContainer,
        isToday && !completed && animatedStyle,
      ]}
    >
      <View
        style={[
          styles.dayCircle,
          completed && styles.dayCircleCompleted,
          isToday && !completed && styles.dayCircleToday,
          completed && shadows.glowStreak,
        ]}
      >
        {completed ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <Text
            style={[
              styles.dayText,
              isToday && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
        )}
      </View>
      {isToday && (
        <View style={styles.todayIndicator}>
          <View style={styles.todayDot} />
        </View>
      )}
    </Animated.View>
  );
}

/** Helper function to generate week days */
export function generateWeekDays(
  completedDates: string[],
  currentStreak: number
): DayStatus[] {
  const today = new Date();
  const days: DayStatus[] = [];

  // Get Monday of current week
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;

    days.push({
      day: DAY_ABBREVIATIONS[i],
      date: dateStr,
      completed: completedDates.includes(dateStr) || (isPast && currentStreak > 0),
      isToday,
    });
  }

  return days;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fireEmoji: {
    fontSize: 24,
  },
  streakCount: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.streak,
  },
  streakLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCircleCompleted: {
    backgroundColor: colors.streak,
    borderColor: colors.streak,
  },
  dayCircleToday: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dayTextToday: {
    color: colors.primary,
  },
  checkmark: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  todayIndicator: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});


