/**
 * Name step - What's your name?
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography, radii } from '@/theme';

interface NameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameStep({ value, onChange }: NameStepProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input after animation
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>
          So we can personalize your experience.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChange}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.privacyNote}
      >
        <Text style={styles.privacyText}>
          🔒 Your information is stored securely on your device
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  privacyNote: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});

