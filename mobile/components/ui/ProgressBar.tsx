/**
 * Animated progress bar component.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii, spacing } from '@/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showGlow?: boolean;
  animated?: boolean;
  gradientColors?: string[];
  backgroundColor?: string;
  style?: ViewStyle;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 100,
  mass: 1,
};

export function ProgressBar({
  progress,
  height = 8,
  showGlow = true,
  animated = true,
  gradientColors = [colors.primary, colors.primaryLight],
  backgroundColor = colors.backgroundMuted,
  style,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = animated
      ? withSpring(Math.min(Math.max(progress, 0), 100), SPRING_CONFIG)
      : Math.min(Math.max(progress, 0), 100);
  }, [progress, animated, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { borderRadius: height / 2 },
          showGlow && progress > 0 && styles.glow,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: height / 2 }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});

