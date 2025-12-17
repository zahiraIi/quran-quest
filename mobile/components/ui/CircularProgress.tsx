/**
 * Animated circular progress ring for daily goals.
 * Features glow effect and smooth animations.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { colors, typography, spacing, shadows } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size of the component */
  size?: number;
  /** Stroke width of the progress ring */
  strokeWidth?: number;
  /** Show percentage text in center */
  showPercentage?: boolean;
  /** Custom center content */
  centerContent?: React.ReactNode;
  /** Gradient colors for the progress ring */
  gradientColors?: [string, string];
  /** Enable glow effect */
  glow?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Container style */
  style?: ViewStyle;
}

export function CircularProgress({
  progress,
  size = 140,
  strokeWidth = 10,
  showPercentage = true,
  centerContent,
  gradientColors = [colors.primary, colors.primaryLight],
  glow = true,
  duration = 800,
  style,
}: CircularProgressProps) {
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress, duration, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Glow layer */}
      {glow && progress > 0 && (
        <View
          style={[
            styles.glowLayer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            shadows.glowPrimary,
          ]}
        />
      )}

      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.backgroundMuted}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContainer}>
        {centerContent ? (
          centerContent
        ) : showPercentage ? (
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{Math.round(progress)}</Text>
            <Text style={styles.percentageSymbol}>%</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

interface DailyGoalRingProps {
  currentXp: number;
  goalXp: number;
  size?: number;
  style?: ViewStyle;
}

export function DailyGoalRing({
  currentXp,
  goalXp,
  size = 160,
  style,
}: DailyGoalRingProps) {
  const progress = Math.min((currentXp / goalXp) * 100, 100);
  const isComplete = currentXp >= goalXp;

  return (
    <CircularProgress
      progress={progress}
      size={size}
      strokeWidth={12}
      showPercentage={false}
      glow={true}
      gradientColors={
        isComplete
          ? [colors.success, colors.successLight]
          : [colors.primary, colors.primaryLight]
      }
      style={style}
      centerContent={
        <View style={styles.goalContent}>
          {isComplete ? (
            <>
              <Text style={styles.goalCompleteEmoji}>🎉</Text>
              <Text style={styles.goalCompleteText}>Complete!</Text>
            </>
          ) : (
            <>
              <Text style={styles.goalXpCurrent}>{currentXp}</Text>
              <Text style={styles.goalXpDivider}>/ {goalXp} XP</Text>
            </>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  svg: {
    position: 'absolute',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  percentageSymbol: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  goalContent: {
    alignItems: 'center',
  },
  goalXpCurrent: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.text,
  },
  goalXpDivider: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },
  goalCompleteEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  goalCompleteText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.success,
  },
});


