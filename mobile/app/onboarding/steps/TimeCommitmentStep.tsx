/**
 * Time commitment step - How much time can you dedicate daily?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface TimeCommitmentStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  {
    id: '5min',
    emoji: '🥚',
    title: '5 minutes',
    subtitle: 'Break the egg — small but consistent',
  },
  {
    id: '10min',
    emoji: '🌱',
    title: '10 minutes',
    subtitle: 'Perfect for building a habit',
  },
  {
    id: '15min',
    emoji: '🔥',
    title: '15 minutes',
    subtitle: 'Great progress without burnout',
  },
  {
    id: '30min',
    emoji: '💪',
    title: '30 minutes',
    subtitle: 'Beast mode — serious commitment',
  },
  {
    id: '60min',
    emoji: '🏆',
    title: '1 hour+',
    subtitle: 'Champion level dedication',
  },
];

export function TimeCommitmentStep({ selected, onSelect }: TimeCommitmentStepProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>How much time can you{'\n'}dedicate daily?</Text>
        <Text style={styles.subtitle}>
          Start small. Consistency beats intensity.
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


