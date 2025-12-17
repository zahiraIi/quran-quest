/**
 * Experience step - Where are you on your Quran journey?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface ExperienceStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  {
    id: 'beginner',
    emoji: '🌱',
    title: 'Just starting out',
    subtitle: "I'm new to reading Arabic or the Quran",
  },
  {
    id: 'learning',
    emoji: '📚',
    title: 'Learning to read',
    subtitle: 'I can read some Arabic but still practicing',
  },
  {
    id: 'comfortable',
    emoji: '📖',
    title: 'Comfortable reading',
    subtitle: 'I can read the Quran but want to improve',
  },
  {
    id: 'fluent',
    emoji: '⭐',
    title: 'Fluent reader',
    subtitle: "I'm focused on memorization and tajweed",
  },
];

export function ExperienceStep({ selected, onSelect }: ExperienceStepProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>Where are you on your{'\n'}Quran journey?</Text>
        <Text style={styles.subtitle}>
          Be honest—this helps us personalize your experience.
        </Text>
      </Animated.View>

      <View style={styles.options}>
        {OPTIONS.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay(100 + index * 80).duration(400)}
          >
            <OptionCard
              emoji={option.emoji}
              title={option.title}
              subtitle={option.subtitle}
              isSelected={selected === option.id}
              onPress={() => onSelect(option.id)}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
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
  options: {},
});


