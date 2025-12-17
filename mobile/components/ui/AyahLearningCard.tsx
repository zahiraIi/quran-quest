/**
 * AyahLearningCard - Duolingo-style confidence-based memorization card.
 *
 * Features:
 * - Big, friendly 3D buttons
 * - Encouraging feedback and animations
 * - Clear visual status (mastered = green celebration)
 * - Test mode with tap-to-reveal
 * - Playful, approachable UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography, radii, shadows, animations, encouragements } from '@/theme';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { DuoButton } from './DuoButton';
import type { AyahWithLearning, ConfidenceLevel, AyahLearningStatus } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface AyahLearningCardProps {
  ayah: AyahWithLearning;
  onMarkRead: () => void;
  onSetConfidence: (level: ConfidenceLevel) => void;
  onStartTest: () => void;
  onTestComplete: (passed: boolean) => void;
  onPlayAudio?: () => void;
  showTranslation?: boolean;
  isTestMode?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Friendly status badge with emoji.
 */
function StatusBadge({ status, readCount }: { status: AyahLearningStatus; readCount: number }) {
  const statusConfig = {
    new: { color: colors.accent, icon: 'star', emoji: '✨', label: 'New' },
    learning: { color: colors.secondary, icon: 'book-open-variant', emoji: '📖', label: 'Learning' },
    reviewing: { color: colors.purple, icon: 'brain', emoji: '🧠', label: 'Testing' },
    mastered: { color: colors.success, icon: 'check-circle', emoji: '🎉', label: 'Mastered!' },
  };

  const config = statusConfig[status];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.statusBadge, { backgroundColor: `${config.color}25` }]}
    >
      <Text style={styles.statusEmoji}>{config.emoji}</Text>
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      {readCount > 0 && status !== 'mastered' && (
        <View style={[styles.readCountBadge, { backgroundColor: config.color }]}>
          <Text style={styles.readCountText}>{readCount}x</Text>
        </View>
      )}
    </Animated.View>
  );
}

/**
 * Confidence level selector with friendly emojis.
 */
function ConfidenceSelector({
  currentLevel,
  onSelect,
  disabled,
}: {
  currentLevel: ConfidenceLevel;
  onSelect: (level: ConfidenceLevel) => void;
  disabled?: boolean;
}) {
  const levels: { value: ConfidenceLevel; label: string; emoji: string; color: string }[] = [
    { value: 'not_confident', label: 'Need more practice', emoji: '🤔', color: colors.secondary },
    { value: 'somewhat_confident', label: 'Almost there!', emoji: '💭', color: colors.accent },
    { value: 'confident', label: 'I know this!', emoji: '💪', color: colors.primary },
  ];

  return (
    <View style={styles.confidenceContainer}>
      <Text style={styles.confidenceTitle}>How confident are you?</Text>
      <View style={styles.confidenceButtons}>
        {levels.map((level, index) => {
          const isSelected = currentLevel === level.value;
          return (
            <Animated.View
              key={level.value}
              entering={FadeInDown.delay(index * 100).duration(300)}
              style={{ flex: 1 }}
            >
              <Pressable
                style={[
                  styles.confidenceButton,
                  isSelected && { borderColor: level.color, backgroundColor: `${level.color}20` },
                ]}
                onPress={() => {
                  impactAsync(ImpactFeedbackStyle.Light);
                  onSelect(level.value);
                }}
                disabled={disabled}
              >
                <Text style={styles.confidenceEmoji}>{level.emoji}</Text>
                <Text
                  style={[
                    styles.confidenceLabel,
                    isSelected && { color: level.color, fontWeight: '700' },
                  ]}
                  numberOfLines={2}
                >
                  {level.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Test mode - Hidden ayah with tap to reveal.
 */
function TestModeView({
  onReveal,
  onPass,
  onFail,
  revealed,
  ayahText,
}: {
  onReveal: () => void;
  onPass: () => void;
  onFail: () => void;
  revealed: boolean;
  ayahText: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleRevealPress = () => {
    scale.value = withSequence(
      withSpring(0.95, animations.bounce),
      withSpring(1, animations.bounce)
    );
    impactAsync(ImpactFeedbackStyle.Medium);
    onReveal();
  };

  if (!revealed) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable style={styles.hiddenAyahBox} onPress={handleRevealPress}>
          <View style={styles.hiddenIconContainer}>
            <MaterialCommunityIcons name="eye-off" size={48} color={colors.accent} />
          </View>
          <Text style={styles.hiddenTitle}>Test yourself! 🧠</Text>
          <Text style={styles.hiddenSubtext}>
            Try to recite from memory, then tap to check
          </Text>
          <View style={styles.tapHint}>
            <MaterialCommunityIcons name="gesture-tap" size={20} color={colors.textMuted} />
            <Text style={styles.tapHintText}>Tap to reveal</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.revealedContainer}>
      <Text style={styles.revealedAyah}>{ayahText}</Text>

      <Text style={styles.testQuestion}>Did you get it right?</Text>

      <View style={styles.testButtonsRow}>
        <View style={{ flex: 1 }}>
          <DuoButton
            title="Not quite"
            onPress={() => {
              notificationAsync(NotificationFeedbackType.Warning);
              onFail();
            }}
            variant="danger"
            icon="close"
            fullWidth
          />
        </View>
        <View style={{ width: spacing.md }} />
        <View style={{ flex: 1 }}>
          <DuoButton
            title="Got it!"
            onPress={() => {
              notificationAsync(NotificationFeedbackType.Success);
              onPass();
            }}
            variant="primary"
            icon="check"
            fullWidth
          />
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Mastered celebration banner.
 */
function MasteredBanner() {
  const randomEncouragement = encouragements.correct[
    Math.floor(Math.random() * encouragements.correct.length)
  ];

  return (
    <Animated.View entering={SlideInUp.springify().damping(8)} style={styles.masteredBanner}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.masteredGradient}
      >
        <Text style={styles.masteredEmoji}>🎉</Text>
        <View style={styles.masteredTextContainer}>
          <Text style={styles.masteredTitle}>Ayah Mastered!</Text>
          <Text style={styles.masteredSubtitle}>{randomEncouragement}</Text>
        </View>
        <MaterialCommunityIcons name="check-decagram" size={32} color={colors.textOnPrimary} />
      </LinearGradient>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AyahLearningCard({
  ayah,
  onMarkRead,
  onSetConfidence,
  onStartTest,
  onTestComplete,
  onPlayAudio,
  showTranslation = true,
  isTestMode = false,
}: AyahLearningCardProps) {
  const [revealed, setRevealed] = useState(false);
  const { learningState } = ayah;
  const isMastered = learningState.status === 'mastered';
  const isReviewing = learningState.status === 'reviewing';

  // Animation values
  const cardScale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handlePass = useCallback(() => {
    cardScale.value = withSequence(
      withSpring(1.02, animations.celebration),
      withSpring(1, animations.gentle)
    );
    onTestComplete(true);
    setRevealed(false);
  }, [onTestComplete, cardScale]);

  const handleFail = useCallback(() => {
    cardScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, animations.spring)
    );
    onTestComplete(false);
    setRevealed(false);
  }, [onTestComplete, cardScale]);

  const handleReadAgain = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    onMarkRead();
  }, [onMarkRead]);

  const handleConfidenceSelect = useCallback(
    (level: ConfidenceLevel) => {
      onSetConfidence(level);

      if (level === 'confident') {
        setTimeout(() => {
          onStartTest();
        }, 600);
      }
    },
    [onSetConfidence, onStartTest]
  );

  return (
    <Animated.View style={[styles.card, animatedCardStyle, isMastered && styles.cardMastered]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.ayahNumberContainer}>
          <Text style={styles.ayahNumber}>{ayah.numberInSurah}</Text>
        </View>

        <StatusBadge status={learningState.status} readCount={learningState.readCount} />

        {onPlayAudio && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={onPlayAudio}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="volume-high" size={24} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isTestMode || isReviewing ? (
        <TestModeView
          onReveal={handleReveal}
          onPass={handlePass}
          onFail={handleFail}
          revealed={revealed}
          ayahText={ayah.textUthmani || ayah.text || `[Ayah ${ayah.numberInSurah}]`}
        />
      ) : (
        <>
          {/* Arabic text */}
          <View style={styles.ayahContainer}>
            <Text style={styles.arabicText}>
              {ayah.textUthmani || ayah.text || `[Ayah ${ayah.numberInSurah}]`}
            </Text>
          </View>

          {/* Translation */}
          {showTranslation && (
            <View style={styles.translationContainer}>
              <Text style={styles.translationText}>
                {ayah.translation || ayah.transliteration || '...'}
              </Text>
            </View>
          )}

          {/* Read again button */}
          {!isMastered && (
            <TouchableOpacity style={styles.readButton} onPress={handleReadAgain}>
              <MaterialCommunityIcons name="refresh" size={20} color={colors.accent} />
              <Text style={styles.readButtonText}>I've read it again</Text>
            </TouchableOpacity>
          )}

          {/* Confidence selector */}
          {!isMastered && (
            <ConfidenceSelector
              currentLevel={learningState.confidenceLevel}
              onSelect={handleConfidenceSelect}
              disabled={isMastered}
            />
          )}

          {/* Ready to test button */}
          {learningState.confidenceLevel === 'confident' && !isMastered && (
            <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.testButtonContainer}>
              <DuoButton
                title="Test Me! 🧠"
                onPress={onStartTest}
                variant="accent"
                size="lg"
                fullWidth
              />
            </Animated.View>
          )}

          {/* Mastered celebration */}
          {isMastered && <MasteredBanner />}
        </>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardMastered: {
    borderColor: colors.success,
    borderWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  ayahNumberContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  ayahNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xs,
    flex: 1,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  readCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    marginLeft: 'auto',
  },
  readCountText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  arabicText: {
    fontSize: 32,
    fontWeight: '400',
    color: colors.textArabic,
    textAlign: 'center',
    lineHeight: 64,
  },
  translationContainer: {
    marginBottom: spacing.lg,
  },
  translationText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accentMuted,
    borderRadius: radii.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  readButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.accent,
  },
  confidenceContainer: {
    marginTop: spacing.sm,
  },
  confidenceTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  confidenceButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confidenceButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 100,
    justifyContent: 'center',
  },
  confidenceEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  testButtonContainer: {
    marginTop: spacing.lg,
  },
  // Mastered banner
  masteredBanner: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  masteredGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  masteredEmoji: {
    fontSize: 32,
  },
  masteredTextContainer: {
    flex: 1,
  },
  masteredTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  masteredSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xxs,
  },
  // Test mode
  hiddenAyahBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  hiddenIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  hiddenTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hiddenSubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tapHintText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  revealedContainer: {
    alignItems: 'center',
  },
  revealedAyah: {
    fontSize: 28,
    color: colors.textArabic,
    textAlign: 'center',
    lineHeight: 56,
    backgroundColor: colors.surfaceLight,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  testQuestion: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  testButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});

export default AyahLearningCard;
