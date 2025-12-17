/**
 * DuoButton - Duolingo-style 3D button with bottom border effect.
 *
 * Features:
 * - 3D pressed effect with bottom border
 * - Multiple variants (primary, secondary, accent, danger, outline)
 * - Sizes (sm, md, lg, xl)
 * - Animated press feedback
 * - Optional icon support
 */

import React, { useCallback } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, radii, typography, animations } from '@/theme';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

// ============================================================================
// Types
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost' | 'locked';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface DuoButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

// ============================================================================
// Config
// ============================================================================

const BORDER_WIDTH = 4;

const variantStyles: Record<ButtonVariant, { bg: string; border: string; text: string }> = {
  primary: {
    bg: colors.primary,
    border: colors.buttonShadow,
    text: colors.textOnPrimary,
  },
  secondary: {
    bg: colors.secondary,
    border: colors.buttonShadowSecondary,
    text: colors.textOnSecondary,
  },
  accent: {
    bg: colors.accent,
    border: colors.buttonShadowAccent,
    text: colors.textOnPrimary,
  },
  danger: {
    bg: colors.error,
    border: colors.buttonShadowError,
    text: colors.textOnPrimary,
  },
  outline: {
    bg: 'transparent',
    border: colors.border,
    text: colors.text,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    text: colors.primary,
  },
  locked: {
    bg: colors.backgroundMuted,
    border: colors.border,
    text: colors.textMuted,
  },
};

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { paddingV: 10, paddingH: 16, fontSize: typography.sizes.sm, iconSize: 16 },
  md: { paddingV: 14, paddingH: 24, fontSize: typography.sizes.md, iconSize: 20 },
  lg: { paddingV: 18, paddingH: 32, fontSize: typography.sizes.lg, iconSize: 24 },
  xl: { paddingV: 22, paddingH: 40, fontSize: typography.sizes.xl, iconSize: 28 },
};

// ============================================================================
// Component
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DuoButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: DuoButtonProps) {
  const pressed = useSharedValue(0);
  const variantConfig = variantStyles[disabled ? 'locked' : variant];
  const sizeConfig = sizeStyles[size];

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, animations.bounce);
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, animations.spring);
  }, [pressed]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    impactAsync(ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, loading, onPress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = pressed.value * 4;
    const bottomBorderWidth = BORDER_WIDTH - pressed.value * BORDER_WIDTH;

    return {
      transform: [{ translateY }],
      borderBottomWidth: bottomBorderWidth,
    };
  });

  const isOutline = variant === 'outline';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: variantConfig.bg,
          borderColor: isOutline ? colors.border : variantConfig.border,
          paddingVertical: sizeConfig.paddingV,
          paddingHorizontal: sizeConfig.paddingH,
          borderBottomWidth: BORDER_WIDTH,
          borderWidth: isOutline ? 2 : 0,
          borderBottomColor: variantConfig.border,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <MaterialCommunityIcons
            name={icon}
            size={sizeConfig.iconSize}
            color={variantConfig.text}
            style={styles.iconLeft}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: variantConfig.text,
            },
          ]}
        >
          {loading ? 'Loading...' : title}
        </Text>
        {icon && iconPosition === 'right' && (
          <MaterialCommunityIcons
            name={icon}
            size={sizeConfig.iconSize}
            color={variantConfig.text}
            style={styles.iconRight}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default DuoButton;

