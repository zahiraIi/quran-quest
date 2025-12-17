/**
 * Motivation step - Why is this important to you?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';
import { OptionCard } from '../components/OptionCard';

interface MotivationStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const OPTIONS = [
  {
    id: 'closer_allah',
    emoji: '🤲',
    title: 'Get closer to Allah',
    subtitle: 'Strengthen my relationship with my Creator',
  },
  {
    id: 'parents',
    emoji: '👨‍👩‍👧',
    title: 'Make my parents proud',
    subtitle: 'Honor my family through knowledge',
  },
  {
    id: 'peace',
    emoji: '🕊️',
    title: 'Find inner peace',
    subtitle: 'The Quran brings me tranquility',
  },
  {
    id: 'children',
    emoji: '👶',
    title: 'Teach my children',
    subtitle: 'Pass the gift of Quran to the next generation',
  },
  {
    id: 'salah',
    emoji: '🕌',
    title: 'Beautify my salah',
    subtitle: 'Recite with confidence in prayer',
  },
  {
    id: 'akhirah',
    emoji: '✨',
    title: 'Prepare for the Akhirah',
    subtitle: 'Invest in my eternal success',
  },
];

export function MotivationStep({ selected, onSelect }: MotivationStepProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>Why is learning Quran{'\n'}important to you?</Text>
        <Text style={styles.subtitle}>
          Paint the vision. This will fuel your journey.
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

