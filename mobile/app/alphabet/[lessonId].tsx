/**
 * Arabic Alphabet Lesson Screen.
 *
 * Duolingo-style quiz for learning Arabic letters:
 * - Progress bar at top
 * - Hearts system
 * - Multiple choice challenges
 * - Sound effects & haptics
 * - Celebration on completion
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-audio';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { colors, spacing, typography, radii, shadows, animations } from '@/theme';
import { DuoButton } from '@/components/ui';
import {
  ARABIC_ALPHABET,
  ALPHABET_LESSONS,
  generateLesson,
  type AlphabetChallenge,
  type AlphabetOption,
} from '@/data/arabic-alphabet';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useAuthStore } from '@/stores/auth.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Sub-components
// ============================================================================

interface LessonHeaderProps {
  progress: number;
  hearts: number;
  onClose: () => void;
}

function LessonHeader({ progress, hearts, onClose }: LessonHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={28} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
      </View>
      
      <View style={styles.heartsContainer}>
        <MaterialCommunityIcons name="heart" size={24} color={colors.heart} />
        <Text style={styles.heartsText}>{hearts}</Text>
      </View>
    </View>
  );
}

interface OptionCardProps {
  option: AlphabetOption;
  index: number;
  selected: boolean;
  status: 'none' | 'correct' | 'wrong';
  disabled: boolean;
  onSelect: () => void;
  isLargeText?: boolean;
}

function OptionCard({
  option,
  index,
  selected,
  status,
  disabled,
  onSelect,
  isLargeText = false,
}: OptionCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withSpring(0.95, animations.bounce),
      withSpring(1, animations.spring)
    );
    impactAsync(ImpactFeedbackStyle.Light);
    onSelect();
  };

  const getBackgroundColor = () => {
    if (!selected) return colors.backgroundCard;
    if (status === 'correct') return colors.successMuted;
    if (status === 'wrong') return colors.errorMuted;
    return colors.accentMuted;
  };

  const getBorderColor = () => {
    if (!selected) return colors.border;
    if (status === 'correct') return colors.success;
    if (status === 'wrong') return colors.error;
    return colors.accent;
  };

  const getTextColor = () => {
    if (!selected) return colors.text;
    if (status === 'correct') return colors.success;
    if (status === 'wrong') return colors.error;
    return colors.accent;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(300)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.optionCard,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
          disabled && !selected && styles.optionDisabled,
        ]}
      >
        <View style={styles.optionContent}>
          <View
            style={[
              styles.optionShortcut,
              selected && { borderColor: getBorderColor() },
            ]}
          >
            <Text
              style={[
                styles.optionShortcutText,
                selected && { color: getTextColor() },
              ]}
            >
              {index + 1}
            </Text>
          </View>
          
          <Text
            style={[
              isLargeText ? styles.optionTextLarge : styles.optionText,
              { color: getTextColor() },
            ]}
          >
            {option.text}
          </Text>
          
          {option.textArabic && !isLargeText && (
            <Text style={[styles.optionTextArabic, { color: getTextColor() }]}>
              {option.textArabic}
            </Text>
          )}
        </View>
        
        {selected && status !== 'none' && (
          <MaterialCommunityIcons
            name={status === 'correct' ? 'check-circle' : 'close-circle'}
            size={24}
            color={status === 'correct' ? colors.success : colors.error}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

interface QuestionBubbleProps {
  text: string;
  arabicText?: string;
}

function QuestionBubble({ text, arabicText }: QuestionBubbleProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.questionBubble}>
      <View style={styles.mascotContainer}>
        <Text style={styles.mascotEmoji}>📚</Text>
      </View>
      <View style={styles.bubbleContainer}>
        <Text style={styles.questionText}>{text}</Text>
        {arabicText && (
          <Text style={styles.questionArabic}>{arabicText}</Text>
        )}
      </View>
    </Animated.View>
  );
}

interface LessonFooterProps {
  status: 'none' | 'correct' | 'wrong' | 'completed';
  disabled: boolean;
  onCheck: () => void;
  onContinue?: () => void;
}

function LessonFooter({ status, disabled, onCheck, onContinue }: LessonFooterProps) {
  const getButtonText = () => {
    if (status === 'completed') return 'Continue';
    if (status === 'correct') return 'Continue 🎉';
    if (status === 'wrong') return 'Got it';
    return 'Check';
  };

  const getButtonVariant = (): 'primary' | 'secondary' | 'danger' => {
    if (status === 'correct') return 'primary';
    if (status === 'wrong') return 'danger';
    return 'primary';
  };

  return (
    <View style={styles.footer}>
      {status === 'correct' && (
        <Animated.View entering={FadeIn} style={styles.feedbackBanner}>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
          <Text style={styles.feedbackTextCorrect}>Excellent! 🎉</Text>
        </Animated.View>
      )}
      
      {status === 'wrong' && (
        <Animated.View entering={FadeIn} style={styles.feedbackBannerWrong}>
          <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
          <Text style={styles.feedbackTextWrong}>Not quite, try again!</Text>
        </Animated.View>
      )}
      
      <DuoButton
        title={getButtonText()}
        variant={getButtonVariant()}
        onPress={status === 'none' ? onCheck : (onContinue || onCheck)}
        disabled={disabled}
        size="lg"
        fullWidth
      />
    </View>
  );
}

interface CompletionScreenProps {
  xpEarned: number;
  accuracy: number;
  onFinish: () => void;
}

function CompletionScreen({ xpEarned, accuracy, onFinish }: CompletionScreenProps) {
  useEffect(() => {
    notificationAsync(NotificationFeedbackType.Success);
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.completionContainer}>
      <Animated.Text entering={FadeInUp.delay(200)} style={styles.completionEmoji}>
        🎉
      </Animated.Text>
      
      <Animated.Text entering={FadeInUp.delay(400)} style={styles.completionTitle}>
        Lesson Complete!
      </Animated.Text>
      
      <Animated.Text entering={FadeInUp.delay(600)} style={styles.completionSubtitle}>
        Great job learning Arabic letters!
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(800)} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="star" size={32} color={colors.xp} />
          <Text style={styles.statValue}>+{xpEarned}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="target" size={32} color={colors.success} />
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(1000)} style={styles.completionButton}>
        <DuoButton
          title="Continue"
          variant="primary"
          onPress={onFinish}
          size="xl"
          fullWidth
        />
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlphabetLessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { updateProgress } = useAuthStore();
  
  // Find lesson config
  const lessonConfig = ALPHABET_LESSONS.find(l => l.id === lessonId);
  
  // Generate lesson challenges
  const [lesson] = useState(() => {
    if (!lessonConfig) return null;
    return generateLesson(
      lessonConfig.id,
      lessonConfig.title,
      lessonConfig.titleArabic,
      lessonConfig.letterIds,
      ARABIC_ALPHABET
    );
  });
  
  // State
  const [hearts, setHearts] = useState(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'none' | 'correct' | 'wrong'>('none');
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const challenges = lesson?.challenges || [];
  const currentChallenge = challenges[activeIndex];
  const progress = ((activeIndex) / challenges.length) * 100;
  
  // Handlers
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);
  
  const handleSelectOption = useCallback((optionId: string) => {
    if (status !== 'none') return;
    setSelectedOptionId(optionId);
  }, [status]);
  
  const handleCheck = useCallback(() => {
    if (!selectedOptionId || !currentChallenge) return;
    
    const isCorrect = selectedOptionId === currentChallenge.correctOptionId;
    
    if (isCorrect) {
      setStatus('correct');
      setCorrectCount(prev => prev + 1);
      notificationAsync(NotificationFeedbackType.Success);
    } else {
      setStatus('wrong');
      setHearts(prev => Math.max(0, prev - 1));
      notificationAsync(NotificationFeedbackType.Error);
    }
  }, [selectedOptionId, currentChallenge]);
  
  const handleContinue = useCallback(() => {
    if (activeIndex >= challenges.length - 1) {
      // Lesson complete
      setIsCompleted(true);
      updateProgress({
        xp: lesson?.xpReward || 0,
      });
    } else {
      setActiveIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setStatus('none');
    }
  }, [activeIndex, challenges.length, lesson, updateProgress]);
  
  const handleFinish = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);
  
  // Error state
  if (!lesson || !currentChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <DuoButton title="Go Back" onPress={handleClose} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }
  
  // Completion state
  if (isCompleted) {
    const accuracy = Math.round((correctCount / challenges.length) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <CompletionScreen
          xpEarned={lesson.xpReward}
          accuracy={accuracy}
          onFinish={handleFinish}
        />
      </SafeAreaView>
    );
  }
  
  // Determine if options should show large Arabic text
  const isArabicOptions = currentChallenge.type === 'identify_name' ||
    currentChallenge.type === 'match_forms' ||
    currentChallenge.type === 'identify_sound';
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LessonHeader
        progress={progress}
        hearts={hearts}
        onClose={handleClose}
      />
      
      <View style={styles.content}>
        <QuestionBubble
          text={currentChallenge.question}
          arabicText={currentChallenge.questionArabic}
        />
        
        <Animated.View
          key={activeIndex}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.optionsContainer}
        >
          {currentChallenge.options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              index={index}
              selected={selectedOptionId === option.id}
              status={selectedOptionId === option.id ? status : 'none'}
              disabled={status !== 'none'}
              onSelect={() => handleSelectOption(option.id)}
              isLargeText={isArabicOptions}
            />
          ))}
        </Animated.View>
      </View>
      
      <LessonFooter
        status={status}
        disabled={!selectedOptionId}
        onCheck={handleCheck}
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    flex: 1,
  },
  progressBg: {
    height: 12,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heartsText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.heart,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  
  // Question bubble
  questionBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  mascotContainer: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  bubbleContainer: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  questionArabic: {
    fontSize: 48,
    fontWeight: '400',
    color: colors.textArabic,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 64,
  },
  
  // Options
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    ...shadows.sm,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  optionShortcut: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionShortcutText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  optionText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  optionTextLarge: {
    fontSize: 36,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  optionTextArabic: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  
  // Footer
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successMuted,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  feedbackBannerWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorMuted,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  feedbackTextCorrect: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.success,
  },
  feedbackTextWrong: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.error,
  },
  
  // Completion
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  completionTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  statCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completionButton: {
    width: '100%',
    marginTop: spacing.xxl,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
});

