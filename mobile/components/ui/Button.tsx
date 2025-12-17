/**
 * Animated Button component with variants and haptic feedback.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { impactAsync } from '@/utils/haptics';

import { colors, spacing, typography, radii } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  style,
  textStyle,
  onPress,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
    opacity.value = withTiming(0.9, { duration: 100 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 100 });
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    if (haptic) {
      impactAsync();
    }
    onPress?.();
  }, [haptic, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const variantStyles = getVariantStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  const baseOpacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.primary,
          borderWidth: 0,
          opacity: baseOpacity,
        } as ViewStyle,
        text: {
          color: colors.textOnPrimary,
        } as TextStyle,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.secondary,
          borderWidth: 0,
          opacity: baseOpacity,
        } as ViewStyle,
        text: {
          color: colors.textOnSecondary,
        } as TextStyle,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
          opacity: baseOpacity,
        } as ViewStyle,
        text: {
          color: colors.primary,
        } as TextStyle,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          opacity: baseOpacity,
        } as ViewStyle,
        text: {
          color: colors.primary,
        } as TextStyle,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: colors.error,
          borderWidth: 0,
          opacity: baseOpacity,
        } as ViewStyle,
        text: {
          color: colors.textOnPrimary,
        } as TextStyle,
      };
    default:
      return {
        container: {} as ViewStyle,
        text: {} as TextStyle,
      };
  }
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.sm,
        } as TextStyle,
      };
    case 'md':
      return {
        container: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          minHeight: 48,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.md,
        } as TextStyle,
      };
    case 'lg':
      return {
        container: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          minHeight: 56,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.lg,
        } as TextStyle,
      };
    default:
      return {
        container: {} as ViewStyle,
        text: {} as TextStyle,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

