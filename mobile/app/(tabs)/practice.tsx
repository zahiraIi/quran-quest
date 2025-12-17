/**
 * Practice screen - Premium recitation practice with voice recording.
 * Features animated waveform and detailed feedback.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { GlowCard } from '@/components/ui';
import { useRecording, formatDuration } from '@/hooks/useRecording';
import type { RecitationResult } from '@/types';

// Mock ayah for practice
const MOCK_AYAH = {
  id: 1,
  surahId: 1,
  numberInSurah: 1,
  text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  transliteration: 'Bismillāhi r-raḥmāni r-raḥīm',
  translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
};

type RecordingPhase = 'idle' | 'recording' | 'processing' | 'result';

export default function PracticeScreen() {
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [result, setResult] = useState<RecitationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isRecording,
    duration,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
    reset,
  } = useRecording({
    maxDuration: 30,
    onRecordingComplete: async (uri, recordingDuration) => {
      await handleRecordingComplete(uri, recordingDuration);
    },
    onError: (err) => {
      setError(err.message);
      setPhase('idle');
    },
  });

  // Animation values
  const pulseScale = useSharedValue(1);
  const waveValues = Array.from({ length: 5 }, () => useSharedValue(0.3));
  const glowOpacity = useSharedValue(0.3);

  const startRecordingAnimation = useCallback(() => {
    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );

    // Wave animations with different speeds
    waveValues.forEach((wave, index) => {
      wave.value = withRepeat(
        withSequence(
          withTiming(0.8 + Math.random() * 0.2, { duration: 200 + index * 50 }),
          withTiming(0.3 + Math.random() * 0.2, { duration: 200 + index * 50 })
        ),
        -1,
        true
      );
    });
  }, [pulseScale, glowOpacity, waveValues]);

  const stopRecordingAnimation = useCallback(() => {
    pulseScale.value = withSpring(1);
    glowOpacity.value = withTiming(0.3);
    waveValues.forEach((wave) => {
      wave.value = withTiming(0.3);
    });
  }, [pulseScale, glowOpacity, waveValues]);

  const handleStartRecording = async () => {
    if (hasPermission === false) {
      const granted = await requestPermission();
      if (!granted) {
        setError('Microphone permission is required');
        return;
      }
    }

    impactAsync(ImpactFeedbackStyle.Medium);
    setError(null);
    setPhase('recording');
    startRecordingAnimation();

    try {
      await startRecording();
    } catch (err) {
      setPhase('idle');
      stopRecordingAnimation();
    }
  };

  const handleStopRecording = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    stopRecordingAnimation();
    setPhase('processing');
    await stopRecording();
  };

  const handleRecordingComplete = async (uri: string, recordingDuration: number) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: RecitationResult = {
        id: Date.now().toString(),
        userId: 'user-1',
        ayahId: MOCK_AYAH.id,
        audioUrl: uri,
        transcription: 'بسم الله الرحمن الرحيم',
        expectedText: MOCK_AYAH.text,
        accuracy: Math.floor(Math.random() * 30) + 70,
        wer: Math.random() * 0.3,
        feedback: [],
        duration: recordingDuration * 1000,
        createdAt: new Date().toISOString(),
      };

      setResult(mockResult);
      setPhase('result');
      notificationAsync(NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to analyze recitation. Please try again.');
      setPhase('idle');
    }
  };

  const handleRetry = () => {
    reset();
    setResult(null);
    setPhase('idle');
    setError(null);
  };

  const recordButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Practice Recitation</Text>
          <Text style={styles.subtitle}>Record and get instant AI feedback</Text>
        </Animated.View>

        {/* Ayah Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlowCard variant="primary" glow={phase === 'recording'} style={styles.ayahCard}>
            <View style={styles.ayahHeader}>
              <View style={styles.ayahBadge}>
                <Text style={styles.ayahBadgeText}>Surah Al-Fatiha</Text>
              </View>
              <Text style={styles.ayahNumber}>Ayah {MOCK_AYAH.numberInSurah}</Text>
            </View>

            <Text style={styles.arabicText}>{MOCK_AYAH.text}</Text>

            <Text style={styles.transliteration}>{MOCK_AYAH.transliteration}</Text>
            <Text style={styles.translation}>{MOCK_AYAH.translation}</Text>
          </GlowCard>
        </Animated.View>

        {/* Recording State Display */}
        <View style={styles.stateContainer}>
          {phase === 'idle' && (
            <Animated.View entering={FadeIn} style={styles.idleState}>
              <MaterialCommunityIcons
                name="microphone-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={styles.idleText}>Tap below to start recording</Text>
            </Animated.View>
          )}

          {phase === 'recording' && (
            <Animated.View entering={FadeIn} style={styles.recordingState}>
              {/* Waveform visualization */}
              <View style={styles.waveform}>
                {waveValues.map((wave, index) => {
                  const animatedWaveStyle = useAnimatedStyle(() => ({
                    transform: [{ scaleY: wave.value }],
                  }));
                  return (
                    <Animated.View
                      key={index}
                      style={[styles.waveBar, animatedWaveStyle]}
                    />
                  );
                })}
              </View>
              <Text style={styles.recordingLabel}>Recording...</Text>
              <Text style={styles.recordingDuration}>{formatDuration(duration)}</Text>
            </Animated.View>
          )}

          {phase === 'processing' && (
            <Animated.View entering={FadeIn} style={styles.processingState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Analyzing your recitation...</Text>
            </Animated.View>
          )}

          {phase === 'result' && result && (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.resultState}>
              {/* Accuracy Score */}
              <View
                style={[
                  styles.scoreCircle,
                  {
                    borderColor:
                      result.accuracy >= 90
                        ? colors.success
                        : result.accuracy >= 70
                        ? colors.warning
                        : colors.error,
                  },
                ]}
              >
                <Text style={styles.scoreText}>{result.accuracy}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>

              {/* Feedback */}
              <View style={styles.feedbackContainer}>
                {result.accuracy >= 90 ? (
                  <>
                    <Text style={styles.feedbackEmoji}>🎉</Text>
                    <Text style={styles.feedbackTitle}>Excellent!</Text>
                    <Text style={styles.feedbackText}>
                      MashaAllah! Your recitation was beautiful.
                    </Text>
                  </>
                ) : result.accuracy >= 70 ? (
                  <>
                    <Text style={styles.feedbackEmoji}>💪</Text>
                    <Text style={styles.feedbackTitle}>Good effort!</Text>
                    <Text style={styles.feedbackText}>
                      Keep practicing. You're getting better!
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.feedbackEmoji}>📖</Text>
                    <Text style={styles.feedbackTitle}>Keep going!</Text>
                    <Text style={styles.feedbackText}>
                      Listen to the correct pronunciation and try again.
                    </Text>
                  </>
                )}
              </View>

              {/* XP Earned */}
              <View style={styles.xpContainer}>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={20}
                  color={colors.xp}
                />
                <Text style={styles.xpText}>
                  +{Math.floor(result.accuracy / 10) * 5} XP
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={20}
                    color={colors.text}
                  />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextButton}
                >
                  <Text style={styles.nextButtonText}>Next Ayah</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Record Button */}
      {(phase === 'idle' || phase === 'recording') && (
        <View style={styles.recordButtonContainer}>
          {/* Glow effect */}
          {phase === 'recording' && (
            <Animated.View style={[styles.recordGlow, glowAnimatedStyle]} />
          )}

          <Animated.View style={recordButtonAnimatedStyle}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={phase === 'recording' ? handleStopRecording : handleStartRecording}
              style={[
                styles.recordButton,
                phase === 'recording' && styles.recordButtonActive,
              ]}
            >
              <MaterialCommunityIcons
                name={phase === 'recording' ? 'stop' : 'microphone'}
                size={32}
                color={colors.text}
              />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordHint}>
            {phase === 'recording' ? 'Tap to stop' : 'Tap to record'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 200,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  ayahCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ayahBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  ayahBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  ayahNumber: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  arabicText: {
    fontSize: typography.sizes.arabicLg,
    color: colors.textArabic,
    textAlign: 'center',
    lineHeight: 60,
    marginBottom: spacing.lg,
  },
  transliteration: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  translation: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stateContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleState: {
    alignItems: 'center',
    gap: spacing.md,
  },
  idleText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  recordingState: {
    alignItems: 'center',
    gap: spacing.md,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 60,
  },
  waveBar: {
    width: 8,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  recordingLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.error,
  },
  recordingDuration: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.text,
  },
  processingState: {
    alignItems: 'center',
    gap: spacing.md,
  },
  processingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  resultState: {
    alignItems: 'center',
    width: '100%',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scoreText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.text,
  },
  scoreLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  feedbackTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  xpText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.xp,
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    gap: spacing.xs,
    ...shadows.glowPrimary,
  },
  nextButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  errorContainer: {
    backgroundColor: colors.errorMuted,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: spacing.xxxl + 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glowPrimary,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
    ...shadows.glowError,
  },
  recordHint: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
