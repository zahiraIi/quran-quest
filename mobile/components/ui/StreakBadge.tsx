/**
 * 
 * Streak badge component with fire animation.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, radii } from '@/theme';

interface StreakBadgeProps {
  days: number;
  isActive?: boolean; // Currently on a streak today
  showFlame?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function StreakBadge({
  days,
  isActive = true,
  showFlame = true,
  size = 'md',
  style,
}: StreakBadgeProps) {
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);

  useEffect(() => {
    if (isActive && showFlame) {
      // Pulsing flame animation
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle rotation wobble
      flameRotation.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isActive, showFlame, flameScale, flameRotation]);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` },
    ],
  }));

  const sizeStyles = getSizeStyles(size);
  const flameColor = isActive ? colors.streak : colors.textMuted;

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {showFlame && (
        <Animated.View style={flameAnimatedStyle}>
          <MaterialCommunityIcons
            name="fire"
            size={sizeStyles.iconSize}
            color={flameColor}
          />
        </Animated.View>
      )}
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: isActive ? colors.streak : colors.textMuted },
        ]}
      >
        {days}
      </Text>
    </View>
  );
}

function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          gap: spacing.xxs,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.sm,
        },
        iconSize: 16,
      };
    case 'md':
      return {
        container: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.xs,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.lg,
        },
        iconSize: 24,
      };
    case 'lg':
      return {
        container: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.xxl,
        },
        iconSize: 36,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.full,
  },
  text: {
    fontFamily: typography.fonts.bold,
  },
});

