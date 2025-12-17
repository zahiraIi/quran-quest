/**
 * XP Badge component with animation.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationAsync, NotificationFeedbackType } from '@/utils/haptics';

import { colors, spacing, typography, radii } from '@/theme';

interface XpBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showPlus?: boolean;
  onAnimationComplete?: () => void;
  style?: ViewStyle;
}

export function XpBadge({
  amount,
  size = 'md',
  animated = false,
  showPlus = true,
  onAnimationComplete,
  style,
}: XpBadgeProps) {
  const scale = useSharedValue(animated ? 0 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 20 : 0);

  useEffect(() => {
    if (animated) {
      // Trigger haptic feedback
      notificationAsync(NotificationFeedbackType.Success);

      // Animate in with bounce
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });

      // Optional callback after animation
      if (onAnimationComplete) {
        const timeout = setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [animated, scale, opacity, translateY, onAnimationComplete]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View
      style={[styles.container, sizeStyles.container, animatedContainerStyle, style]}
    >
      <MaterialCommunityIcons
        name="star-four-points"
        size={sizeStyles.iconSize}
        color={colors.xp}
      />
      <Text style={[styles.text, sizeStyles.text]}>
        {showPlus && amount > 0 ? '+' : ''}
        {amount.toLocaleString()} XP
      </Text>
    </Animated.View>
  );
}

function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.xs,
        },
        iconSize: 12,
      };
    case 'md':
      return {
        container: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.sm,
        },
        iconSize: 16,
      };
    case 'lg':
      return {
        container: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.lg,
        },
        iconSize: 24,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.xp,
  },
  text: {
    fontFamily: typography.fonts.bold,
    color: colors.xp,
  },
});

