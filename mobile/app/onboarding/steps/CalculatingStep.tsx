/**
 * Calculating step - Animated progress while "building" the plan.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing, typography, shadows } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalculatingStepProps {
  onComplete: () => void;
}

const MESSAGES = [
  { progress: 0, text: 'Understanding your journey...' },
  { progress: 25, text: 'Analyzing your goals...' },
  { progress: 50, text: 'Selecting personalized content...' },
  { progress: 75, text: 'Building your learning path...' },
  { progress: 95, text: 'Finalizing your plan...' },
];

export function CalculatingStep({ onComplete }: CalculatingStepProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0].text);
  const animatedProgress = useSharedValue(0);

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          // Complete after a short delay
          setTimeout(() => {
            notificationAsync(NotificationFeedbackType.Success);
            onComplete();
          }, 500);
          return 100;
        }

        // Update message based on progress
        const currentMessage = MESSAGES.filter((m) => m.progress <= next).pop();
        if (currentMessage) {
          setMessage(currentMessage.text);
        }

        // Light haptic every 10%
        if (next % 10 === 0) {
          impactAsync();
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 50,
      easing: Easing.linear,
    });
  }, [progress, animatedProgress]);

  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.content}
      >
        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <View style={[styles.glow, shadows.glowPrimary]} />
          <Svg width={size} height={size} style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.backgroundMuted}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.primary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{progress}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.title}
        >
          Building Your Plan
        </Animated.Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  svg: {
    position: 'absolute',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text,
  },
  percentSymbol: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

