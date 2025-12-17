/**
 * Arabic Alphabet Learning Hub.
 *
 * Shows all alphabet lessons in a Duolingo-style path.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { ALPHABET_LESSONS, ARABIC_ALPHABET, getLettersForLesson } from '@/data/arabic-alphabet';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

const COMPLETED_LESSONS_KEY = 'alphabet_completed_lessons';

interface LessonNodeProps {
  lesson: typeof ALPHABET_LESSONS[0];
  index: number;
  completed: boolean;
  locked: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

function LessonNode({ lesson, index, completed, locked, isCurrent, onPress }: LessonNodeProps) {
  const letters = getLettersForLesson(lesson.id);
  const pulseScale = useSharedValue(1);
  
  // Animate current lesson
  React.useEffect(() => {
    if (isCurrent) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        -1,
        true
      );
    }
  }, [isCurrent]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isCurrent ? pulseScale.value : 1 }],
  }));
  
  const handlePress = () => {
    if (locked) return;
    impactAsync(ImpactFeedbackStyle.Medium);
    onPress();
  };
  
  const getNodeColor = () => {
    if (completed) return colors.success;
    if (locked) return colors.backgroundMuted;
    return colors.primary;
  };
  
  const getNodeBorderColor = () => {
    if (completed) return colors.successLight;
    if (locked) return colors.border;
    return colors.primaryLight;
  };

  // Zigzag pattern
  const isRight = index % 2 === 0;
  
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[
        styles.lessonNodeContainer,
        { alignItems: isRight ? 'flex-start' : 'flex-end' },
      ]}
    >
      {/* Connector line */}
      {index > 0 && (
        <View
          style={[
            styles.connector,
            {
              left: isRight ? 35 : undefined,
              right: isRight ? undefined : 35,
              transform: [{ rotate: isRight ? '-30deg' : '30deg' }],
            },
          ]}
        />
      )}
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={locked}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.lessonNode,
            {
              backgroundColor: getNodeColor(),
              borderColor: getNodeBorderColor(),
            },
            animatedStyle,
          ]}
        >
          {completed ? (
            <MaterialCommunityIcons name="check" size={32} color={colors.textOnPrimary} />
          ) : locked ? (
            <MaterialCommunityIcons name="lock" size={28} color={colors.textMuted} />
          ) : (
            <Text style={styles.lessonNodeText}>
              {letters.map(l => l.isolated).join('')}
            </Text>
          )}
          
          {isCurrent && !locked && (
            <View style={styles.currentIndicator}>
              <MaterialCommunityIcons name="star" size={16} color={colors.secondary} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      <Text style={[styles.lessonTitle, locked && styles.lessonTitleLocked]}>
        {lesson.title.replace('Lesson ', '').replace(': ', '\n')}
      </Text>
    </Animated.View>
  );
}

export default function AlphabetIndexScreen() {
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  useEffect(() => {
    loadCompletedLessons();
  }, []);
  
  const loadCompletedLessons = async () => {
    try {
      const saved = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };
  
  const handleLessonPress = (lessonId: string) => {
    router.push(`/alphabet/${lessonId}`);
  };
  
  const getCurrentLessonIndex = () => {
    for (let i = 0; i < ALPHABET_LESSONS.length; i++) {
      if (!completedLessons.includes(ALPHABET_LESSONS[i].id)) {
        return i;
      }
    }
    return ALPHABET_LESSONS.length - 1;
  };
  
  const currentLessonIndex = getCurrentLessonIndex();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Arabic Alphabet</Text>
          <Text style={styles.headerSubtitle}>
            {completedLessons.length}/{ALPHABET_LESSONS.length} lessons completed
          </Text>
        </View>
        
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>أ ب ت</Text>
        </View>
      </Animated.View>
      
      {/* Progress Bar */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedLessons.length / ALPHABET_LESSONS.length) * 100}%` },
            ]}
          />
        </View>
      </Animated.View>
      
      {/* Lessons Path */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pathContainer}>
          {ALPHABET_LESSONS.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = index > currentLessonIndex && !isCompleted;
            const isCurrent = index === currentLessonIndex;
            
            return (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={index}
                completed={isCompleted}
                locked={isLocked}
                isCurrent={isCurrent}
                onPress={() => handleLessonPress(lesson.id)}
              />
            );
          })}
        </View>
        
        {/* Alphabet Reference */}
        <Animated.View
          entering={FadeInDown.delay(1500)}
          style={styles.referenceCard}
        >
          <Text style={styles.referenceTitle}>Quick Reference</Text>
          <View style={styles.alphabetGrid}>
            {ARABIC_ALPHABET.map((letter) => (
              <View key={letter.id} style={styles.letterCell}>
                <Text style={styles.letterArabic}>{letter.isolated}</Text>
                <Text style={styles.letterName}>{letter.nameEn}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  headerBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  headerBadgeText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Progress
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  
  // Path
  pathContainer: {
    paddingVertical: spacing.xl,
  },
  lessonNodeContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  connector: {
    position: 'absolute',
    top: -30,
    width: 4,
    height: 40,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  lessonNode: {
    width: 70,
    height: 70,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...shadows.md,
  },
  lessonNodeText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  currentIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: radii.full,
    padding: 2,
  },
  lessonTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 100,
  },
  lessonTitleLocked: {
    color: colors.textMuted,
  },
  
  // Reference
  referenceCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  referenceTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  letterCell: {
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
  },
  letterArabic: {
    fontSize: 24,
    color: colors.textArabic,
  },
  letterName: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

