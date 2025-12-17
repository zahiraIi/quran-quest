/**
 * Memorization step - How much have you memorized?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface MemorizationStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  {
    id: 'none',
    emoji: '🌟',
    title: 'Not yet started',
    subtitle: "I haven't memorized any surahs yet",
  },
  {
    id: 'short_surahs',
    emoji: '📿',
    title: 'A few short surahs',
    subtitle: 'Al-Fatiha, Al-Ikhlas, An-Nas, etc.',
  },
  {
    id: 'juz_amma',
    emoji: '📖',
    title: "Part of Juz' Amma",
    subtitle: 'Working through the 30th juz',
  },
  {
    id: 'multiple_juz',
    emoji: '🏆',
    title: 'Multiple juz',
    subtitle: "I've memorized more than one juz",
  },
  {
    id: 'hafiz',
    emoji: '👑',
    title: 'Hafiz / Working towards it',
    subtitle: 'Significant portions or complete Quran',
  },
];

export function MemorizationStep({ selected, onSelect }: MemorizationStepProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>How much Quran have{'\n'}you memorized?</Text>
        <Text style={styles.subtitle}>
          This helps us suggest appropriate content.
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


