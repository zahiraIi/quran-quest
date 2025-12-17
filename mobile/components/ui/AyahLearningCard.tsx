/**
 * AyahLearningCard - Core component for confidence-based memorization.
 *
 * Features:
 * - Shows Arabic ayah text with optional translation
 * - Confidence level selector (Not confident / Somewhat / Confident)
 * - Test mode: hides text, reveals on tap
 * - Status indicator (green checkmark when mastered)
 * - Read counter
 * - Audio playback
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
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
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
 * Status indicator badge showing current learning state.
 */
function StatusBadge({ status, readCount }: { status: AyahLearningStatus; readCount: number }) {
  const statusConfig = {
    new: { color: colors.textMuted, icon: 'circle-outline', label: 'New' },
    learning: { color: colors.info, icon: 'book-open-variant', label: 'Learning' },
    reviewing: { color: colors.warning, icon: 'eye', label: 'Testing' },
    mastered: { color: colors.success, icon: 'check-circle', label: 'Mastered' },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
      <MaterialCommunityIcons name={config.icon as any} size={14} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      {readCount > 0 && (
        <Text style={[styles.readCount, { color: config.color }]}>• {readCount}x read</Text>
      )}
    </View>
  );
}

/**
 * Confidence level selector buttons.
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
  const levels: { value: ConfidenceLevel; label: string; emoji: string }[] = [
    { value: 'not_confident', label: 'Not yet', emoji: '😕' },
    { value: 'somewhat_confident', label: 'Almost', emoji: '🤔' },
    { value: 'confident', label: 'I know it!', emoji: '💪' },
  ];

  return (
    <View style={styles.confidenceContainer}>
      <Text style={styles.confidenceTitle}>How well do you know this ayah?</Text>
      <View style={styles.confidenceButtons}>
        {levels.map((level) => {
          const isSelected = currentLevel === level.value;
          return (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.confidenceButton,
                isSelected && styles.confidenceButtonSelected,
                level.value === 'confident' && isSelected && styles.confidenceButtonConfident,
              ]}
              onPress={() => {
                impactAsync(ImpactFeedbackStyle.Light);
                onSelect(level.value);
              }}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={styles.confidenceEmoji}>{level.emoji}</Text>
              <Text
                style={[
                  styles.confidenceLabel,
                  isSelected && styles.confidenceLabelSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Hidden ayah view for test mode.
 */
function HiddenAyahView({
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
  return (
    <View style={styles.testContainer}>
      {!revealed ? (
        <Pressable style={styles.hiddenAyahBox} onPress={onReveal}>
          <MaterialCommunityIcons name="eye-off" size={48} color={colors.textMuted} />
          <Text style={styles.hiddenText}>Tap to reveal and check</Text>
          <Text style={styles.hiddenSubtext}>Try to recite from memory first</Text>
        </Pressable>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.revealedContainer}>
          <Text style={styles.revealedAyah}>{ayahText}</Text>
          
          <Text style={styles.testQuestion}>Did you recall it correctly?</Text>
          
          <View style={styles.testButtons}>
            <TouchableOpacity
              style={[styles.testButton, styles.testButtonFail]}
              onPress={onFail}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.error} />
              <Text style={[styles.testButtonText, { color: colors.error }]}>Not quite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.testButtonPass]}
              onPress={onPass}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={24} color={colors.success} />
              <Text style={[styles.testButtonText, { color: colors.success }]}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
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

  // Animation for mastered state
  const cardScale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleReveal = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Medium);
    setRevealed(true);
  }, []);

  const handlePass = useCallback(() => {
    notificationAsync(NotificationFeedbackType.Success);
    cardScale.value = withSequence(
      withSpring(1.02),
      withSpring(1)
    );
    onTestComplete(true);
    setRevealed(false);
  }, [onTestComplete, cardScale]);

  const handleFail = useCallback(() => {
    notificationAsync(NotificationFeedbackType.Warning);
    onTestComplete(false);
    setRevealed(false);
  }, [onTestComplete]);

  const handleReadAgain = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    onMarkRead();
  }, [onMarkRead]);

  const handleConfidenceSelect = useCallback(
    (level: ConfidenceLevel) => {
      onSetConfidence(level);
      
      // If confident, automatically start test
      if (level === 'confident') {
        setTimeout(() => {
          onStartTest();
        }, 500);
      }
    },
    [onSetConfidence, onStartTest]
  );

  return (
    <Animated.View style={[styles.card, animatedCardStyle, isMastered && styles.cardMastered]}>
      {/* Mastered glow effect */}
      {isMastered && (
        <LinearGradient
          colors={[`${colors.success}15`, 'transparent']}
          style={styles.masteredGlow}
        />
      )}

      {/* Header: Ayah number + status */}
      <View style={styles.header}>
        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
        </View>
        <StatusBadge status={learningState.status} readCount={learningState.readCount} />
        
        {onPlayAudio && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={onPlayAudio}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="volume-high" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main content */}
      {isTestMode || isReviewing ? (
        <HiddenAyahView
          onReveal={handleReveal}
          onPass={handlePass}
          onFail={handleFail}
          revealed={revealed}
          ayahText={ayah.textUthmani}
        />
      ) : (
        <>
          {/* Arabic text */}
          <View style={styles.ayahContainer}>
            <Text style={styles.arabicText}>{ayah.textUthmani}</Text>
          </View>

          {/* Translation */}
          {showTranslation && ayah.translation && (
            <Text style={styles.translationText}>{ayah.translation}</Text>
          )}

          {/* Read again button */}
          <TouchableOpacity
            style={styles.readButton}
            onPress={handleReadAgain}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={18} color={colors.primary} />
            <Text style={styles.readButtonText}>I've read it again</Text>
          </TouchableOpacity>

          {/* Confidence selector */}
          {!isMastered && (
            <ConfidenceSelector
              currentLevel={learningState.confidenceLevel}
              onSelect={handleConfidenceSelect}
              disabled={isMastered}
            />
          )}

          {/* Mastered message */}
          {isMastered && (
            <Animated.View entering={SlideInUp.duration(300)} style={styles.masteredBanner}>
              <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.masteredText}>You've memorized this ayah! 🎉</Text>
            </Animated.View>
          )}
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
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardMastered: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  masteredGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  ayahNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: spacing.xxs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  readCount: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  audioButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahContainer: {
    marginBottom: spacing.md,
  },
  arabicText: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.textArabic,
    textAlign: 'right',
    lineHeight: 56,
    fontFamily: 'System', // Will use system Arabic font
  },
  translationText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.lg,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  readButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  confidenceContainer: {
    marginTop: spacing.sm,
  },
  confidenceTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  confidenceButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confidenceButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  confidenceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  confidenceButtonConfident: {
    borderColor: colors.success,
    backgroundColor: colors.successMuted,
  },
  confidenceEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  confidenceLabelSelected: {
    color: colors.text,
  },
  masteredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.successMuted,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  masteredText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.success,
  },
  // Test mode styles
  testContainer: {
    minHeight: 200,
  },
  hiddenAyahBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  hiddenText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  hiddenSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  revealedContainer: {
    alignItems: 'center',
  },
  revealedAyah: {
    fontSize: 26,
    color: colors.textArabic,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: spacing.lg,
  },
  testQuestion: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  testButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  testButtonPass: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  testButtonFail: {
    backgroundColor: colors.errorMuted,
    borderColor: colors.error,
  },
  testButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
});

export default AyahLearningCard;

