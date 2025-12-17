/**
 * Goals step - What do you want to achieve?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface GoalsStepProps {
  selected: string[];
  onSelect: (value: string[]) => void;
}

const OPTIONS = [
  {
    id: 'read_fluently',
    emoji: '📖',
    title: 'Read the Quran fluently',
    color: colors.primary,
  },
  {
    id: 'memorize',
    emoji: '🧠',
    title: 'Memorize surahs & verses',
    color: colors.accent,
  },
  {
    id: 'tajweed',
    emoji: '🎯',
    title: 'Perfect my tajweed',
    color: colors.secondary,
  },
  {
    id: 'understand',
    emoji: '💡',
    title: 'Understand the meaning',
    color: colors.info,
  },
  {
    id: 'daily_habit',
    emoji: '🔥',
    title: 'Build a daily reading habit',
    color: colors.streak,
  },
  {
    id: 'spiritual',
    emoji: '🤲',
    title: 'Strengthen my connection with Allah',
    color: colors.success,
  },
];

export function GoalsStep({ selected, onSelect }: GoalsStepProps) {
  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>What are your goals?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. We'll tailor your journey.
        </Text>
      </Animated.View>

      <View style={styles.options}>
        {OPTIONS.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay(100 + index * 60).duration(400)}
          >
            <OptionCard
              emoji={option.emoji}
              title={option.title}
              isSelected={selected.includes(option.id)}
              onPress={() => toggleOption(option.id)}
              color={option.color}
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

