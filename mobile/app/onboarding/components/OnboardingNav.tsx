/**
 * Onboarding navigation buttons.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { impactAsync } from '@/utils/haptics';

import { colors, spacing, radii, typography, shadows } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OnboardingNavProps {
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
  showBack?: boolean;
  isLastStep?: boolean;
}

export function OnboardingNav({
  onBack,
  onContinue,
  canContinue,
  showBack = true,
  isLastStep = false,
}: OnboardingNavProps) {
  const continueScale = useSharedValue(1);

  const handleContinue = () => {
    if (!canContinue) return;
    impactAsync();
    onContinue();
  };

  const handleBack = () => {
    impactAsync();
    onBack();
  };

  const continueAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
    opacity: canContinue ? 1 : 0.5,
  }));

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.text}
          />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      <AnimatedPressable
        onPress={handleContinue}
        onPressIn={() => {
          continueScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          continueScale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        disabled={!canContinue}
        style={[styles.continueButton, continueAnimatedStyle]}
      >
        <Text style={styles.continueText}>
          {isLastStep ? 'Finish' : 'Continue'}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textOnPrimary}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  spacer: {
    width: 100,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.xs,
    ...shadows.glowPrimary,
  },
  continueText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
});

