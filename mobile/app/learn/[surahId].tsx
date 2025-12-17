/**
 * Surah learning screen with confidence-based memorization.
 *
 * Flow:
 * 1. User reads ayah multiple times
 * 2. User indicates confidence level
 * 3. If confident → hide ayah → test recall
 * 4. If recalled correctly → mark as mastered (green)
 * 5. If not confident → keep reading
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

import { colors, spacing, typography, radii } from '@/theme';
import { fetchSurah, fetchAyahs } from '@/services/qul';
import { useLearningStore } from '@/stores/learning.store';
import { AyahLearningCard, ProgressBar } from '@/components/ui';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import type { Surah, Ayah, ConfidenceLevel } from '@/types';

// ============================================================================
// Main Component
// ============================================================================

export default function SurahLearningScreen() {
  const router = useRouter();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const surahIdNum = parseInt(surahId || '1', 10);

  // Store
  const {
    currentSession,
    currentAyahIndex,
    initializeSession,
    markAsRead,
    setConfidence,
    startTest,
    submitTestResult,
    nextAyah,
    previousAyah,
    getCurrentAyah,
    getSessionProgress,
    resetSession,
  } = useLearningStore();

  // Local state
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentAyah = getCurrentAyah();
  const sessionProgress = getSessionProgress();

  // Load surah and ayahs
  useEffect(() => {
    loadSurahData();

    return () => {
      // Cleanup on unmount
    };
  }, [surahIdNum]);

  const loadSurahData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch surah info
      const surahData = await fetchSurah(surahIdNum);
      if (!surahData) {
        throw new Error('Surah not found');
      }
      setSurah(surahData);

      // Fetch all ayahs for this surah
      const ayahs = await fetchAyahs(surahIdNum, {
        includeTranslation: true,
        includeWords: false,
      });

      // Initialize learning session
      initializeSession(
        surahIdNum,
        surahData.nameTransliteration,
        ayahs,
        1,
        ayahs.length
      );
    } catch (e) {
      console.error('Error loading surah:', e);
      setError('Failed to load surah. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleMarkRead = useCallback(() => {
    if (currentAyah) {
      markAsRead(currentAyah.id);
    }
  }, [currentAyah, markAsRead]);

  const handleSetConfidence = useCallback(
    (level: ConfidenceLevel) => {
      if (currentAyah) {
        setConfidence(currentAyah.id, level);
      }
    },
    [currentAyah, setConfidence]
  );

  const handleStartTest = useCallback(() => {
    if (currentAyah) {
      impactAsync(ImpactFeedbackStyle.Medium);
      startTest(currentAyah.id);
    }
  }, [currentAyah, startTest]);

  const handleTestComplete = useCallback(
    (passed: boolean) => {
      if (currentAyah) {
        submitTestResult({
          ayahId: currentAyah.id,
          passed,
          attemptedAt: new Date().toISOString(),
        });

        if (passed) {
          notificationAsync(NotificationFeedbackType.Success);
          // Auto-advance after a delay if mastered
          setTimeout(() => {
            if (currentAyahIndex < (currentSession?.ayahs.length || 1) - 1) {
              nextAyah();
            }
          }, 1500);
        }
      }
    },
    [currentAyah, submitTestResult, currentAyahIndex, currentSession, nextAyah]
  );

  const handlePreviousAyah = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    previousAyah();
  }, [previousAyah]);

  const handleNextAyah = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    nextAyah();
  }, [nextAyah]);

  const handleClose = useCallback(() => {
    resetSession();
    router.back();
  }, [resetSession, router]);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading surah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !surah || !currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSurahData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalAyahs = currentSession.ayahs.length;
  const isFirstAyah = currentAyahIndex === 0;
  const isLastAyah = currentAyahIndex === totalAyahs - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeIconButton}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.surahName}>{surah.nameTransliteration}</Text>
          <Text style={styles.ayahCounter}>
            Ayah {currentAyahIndex + 1} of {totalAyahs}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.masteredBadge}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.masteredCount}>{sessionProgress.mastered}</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={sessionProgress.percentage}
          color={colors.success}
          height={6}
        />
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentAyah && (
          <Animated.View
            key={currentAyah.id}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
          >
            <AyahLearningCard
              ayah={currentAyah}
              onMarkRead={handleMarkRead}
              onSetConfidence={handleSetConfidence}
              onStartTest={handleStartTest}
              onTestComplete={handleTestComplete}
              showTranslation
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstAyah && styles.navButtonDisabled]}
          onPress={handlePreviousAyah}
          disabled={isFirstAyah}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={isFirstAyah ? colors.textMuted : colors.text}
          />
          <Text style={[styles.navButtonText, isFirstAyah && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {/* Ayah dots indicator */}
        <View style={styles.dotsContainer}>
          {currentSession.ayahs.slice(
            Math.max(0, currentAyahIndex - 2),
            Math.min(totalAyahs, currentAyahIndex + 3)
          ).map((ayah, idx) => {
            const actualIndex = Math.max(0, currentAyahIndex - 2) + idx;
            const isCurrent = actualIndex === currentAyahIndex;
            const isMastered = ayah.learningState.status === 'mastered';

            return (
              <View
                key={ayah.id}
                style={[
                  styles.dot,
                  isCurrent && styles.dotCurrent,
                  isMastered && styles.dotMastered,
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonRight, isLastAyah && styles.navButtonDisabled]}
          onPress={handleNextAyah}
          disabled={isLastAyah}
          activeOpacity={0.8}
        >
          <Text style={[styles.navButtonText, isLastAyah && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={isLastAyah ? colors.textMuted : colors.text}
          />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  ayahCounter: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  masteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  masteredCount: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.success,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundMuted,
  },
  navButtonRight: {
    flexDirection: 'row',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundMuted,
  },
  dotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  dotMastered: {
    backgroundColor: colors.success,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  closeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  closeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

