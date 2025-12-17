/**
 * Challenges step - What's your biggest challenge?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface ChallengesStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  {
    id: 'consistency',
    emoji: '📅',
    title: 'Staying consistent',
    subtitle: 'I start strong but lose momentum',
  },
  {
    id: 'pronunciation',
    emoji: '🗣️',
    title: 'Correct pronunciation',
    subtitle: 'Unsure if I\'m reciting correctly',
  },
  {
    id: 'time',
    emoji: '⏰',
    title: 'Finding time',
    subtitle: 'My schedule is packed',
  },
  {
    id: 'motivation',
    emoji: '💭',
    title: 'Staying motivated',
    subtitle: 'I need encouragement to keep going',
  },
  {
    id: 'understanding',
    emoji: '🤔',
    title: 'Understanding Arabic',
    subtitle: 'I read but don\'t understand',
  },
  {
    id: 'retention',
    emoji: '🧠',
    title: 'Retaining what I memorize',
    subtitle: 'I forget quickly after memorizing',
  },
];

export function ChallengesStep({ selected, onSelect }: ChallengesStepProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>What's your biggest{'\n'}challenge?</Text>
        <Text style={styles.subtitle}>
          We'll help you overcome it. Pick the main one.
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


