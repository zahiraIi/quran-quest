/**
 * Card component with neon border glow effect.
 * Used for premium UI elements throughout the app.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii, spacing, shadows } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlowVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface GlowCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Glow color variant */
  variant?: GlowVariant;
  /** Enable glow effect */
  glow?: boolean;
  /** Show gradient border */
  gradientBorder?: boolean;
  /** Border width */
  borderWidth?: number;
  /** Border radius */
  borderRadius?: number;
  /** Enable press animation */
  pressable?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Inner content style */
  contentStyle?: ViewStyle;
}

const GLOW_COLORS: Record<GlowVariant, { glow: typeof shadows.glowPrimary; border: string }> = {
  primary: { glow: shadows.glowPrimary, border: colors.primary },
  secondary: { glow: shadows.glowSecondary, border: colors.secondary },
  accent: { glow: shadows.glowAccent, border: colors.accent },
  success: { glow: shadows.glowSuccess, border: colors.success },
  warning: { glow: shadows.glowSecondary, border: colors.warning },
  error: { glow: shadows.glowError, border: colors.error },
};

export function GlowCard({
  children,
  variant = 'primary',
  glow = true,
  gradientBorder = false,
  borderWidth = 1,
  borderRadius = radii.xl,
  pressable = false,
  style,
  contentStyle,
  onPress,
  ...pressableProps
}: GlowCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const glowStyle = glow ? GLOW_COLORS[variant].glow : {};
  const borderColor = GLOW_COLORS[variant].border;

  const content = (
    <View
      style={[
        styles.content,
        {
          borderRadius: borderRadius - borderWidth,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (gradientBorder) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!pressable && !onPress}
        style={[styles.container, animatedStyle, glow && glowStyle, style]}
        {...pressableProps}
      >
        <LinearGradient
          colors={[borderColor, `${borderColor}66`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientBorder,
            {
              borderRadius,
              padding: borderWidth,
            },
          ]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!pressable && !onPress}
      style={[
        styles.container,
        styles.solidBorder,
        {
          borderRadius,
          borderWidth,
          borderColor: glow ? borderColor : colors.border,
        },
        animatedStyle,
        glow && glowStyle,
        style,
      ]}
      {...pressableProps}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Simple card without glow - for regular content */
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.simpleCard, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  solidBorder: {
    backgroundColor: colors.backgroundCard,
  },
  gradientBorder: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: colors.backgroundCard,
    overflow: 'hidden',
  },
  simpleCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});


