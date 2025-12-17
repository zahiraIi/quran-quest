/**
 * Onboarding progress bar component.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, spacing, radii } from '@/theme';

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const progress = (current / total) * 100;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  track: {
    height: 6,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
});

