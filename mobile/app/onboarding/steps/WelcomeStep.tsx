/**
 * Welcome step - First screen of onboarding.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

import { colors, spacing, typography, radii, shadows } from '@/theme';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  const glowOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleContinue = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    onContinue();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Icon */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.logoContainer}
        >
          <Animated.View style={[styles.glow, glowStyle]} />
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>📖</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.title}
        >
          Assalamu Alaikum 👋
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.subtitle}
        >
          Welcome to Quran Quest
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.description}
        >
          Your personal journey to connect with the Quran.{'\n'}
          Let's create a plan just for you.
        </Animated.Text>
      </View>

      {/* CTA Button */}
      <Animated.View
        entering={FadeInDown.delay(1000).duration(600)}
        style={styles.ctaContainer}
      >
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
        >
          <Text style={styles.ctaText}>Let's Begin</Text>
        </Pressable>

        <Text style={styles.timeEstimate}>
          Takes about 2 minutes
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  content: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    top: -10,
    left: -10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  logoEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    alignItems: 'center',
    ...shadows.glowPrimary,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  timeEstimate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

