/**
 * Surah selection screen for learning path.
 *
 * Displays list of surahs with progress indicators.
 * User can select a surah to start/continue memorizing.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { fetchAllSurahs, COMMON_SURAHS } from '@/services/qul';
import { useLearningStore } from '@/stores/learning.store';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';
import type { Surah } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface SurahWithProgress extends Surah {
  progress: number;
  masteredCount: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function LearnIndexScreen() {
  const router = useRouter();
  const { getSurahProgress } = useLearningStore();
  
  const [surahs, setSurahs] = useState<SurahWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch surahs on mount
  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      let fetchedSurahs: Surah[];
      try {
        fetchedSurahs = await fetchAllSurahs();
      } catch (e) {
        // Fallback to common surahs if API fails
        console.warn('API fetch failed, using fallback:', e);
        fetchedSurahs = COMMON_SURAHS.map((s) => ({
          id: s.id,
          name: s.name,
          nameTransliteration: s.nameEn,
          nameTranslation: s.nameEn,
          versesCount: s.ayahCount,
          revelationType: 'meccan' as const,
          order: s.id,
        }));
      }

      // Add progress data
      const surahsWithProgress: SurahWithProgress[] = fetchedSurahs.map((surah) => {
        const progress = getSurahProgress(surah.id, surah.versesCount);
        return {
          ...surah,
          progress: progress.percentComplete,
          masteredCount: progress.masteredCount,
        };
      });

      setSurahs(surahsWithProgress);
    } catch (e) {
      setError('Failed to load surahs. Please try again.');
      console.error('Error loading surahs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahPress = (surahId: number) => {
    impactAsync(ImpactFeedbackStyle.Light);
    router.push(`/learn/${surahId}`);
  };

  const renderSurahItem = ({ item, index }: { item: SurahWithProgress; index: number }) => {
    const hasProgress = item.progress > 0;
    const isCompleted = item.progress >= 100;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={[styles.surahCard, isCompleted && styles.surahCardCompleted]}
          onPress={() => handleSurahPress(item.id)}
          activeOpacity={0.8}
        >
          {/* Surah number */}
          <View style={[styles.surahNumber, hasProgress && styles.surahNumberActive]}>
            <Text style={[styles.surahNumberText, hasProgress && styles.surahNumberTextActive]}>
              {item.id}
            </Text>
          </View>

          {/* Surah info */}
          <View style={styles.surahInfo}>
            <View style={styles.surahNames}>
              <Text style={styles.surahNameArabic}>{item.name}</Text>
              <Text style={styles.surahNameEnglish}>{item.nameTransliteration}</Text>
            </View>
            <Text style={styles.surahMeta}>
              {item.versesCount} ayahs • {item.revelationType}
            </Text>

            {/* Progress bar */}
            {hasProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.progress}%` },
                      isCompleted && styles.progressFillComplete,
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.masteredCount}/{item.versesCount}
                </Text>
              </View>
            )}
          </View>

          {/* Status icon */}
          <View style={styles.statusIcon}>
            {isCompleted ? (
              <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
            ) : hasProgress ? (
              <MaterialCommunityIcons name="play-circle" size={24} color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Learn & Memorize</Text>
          <Text style={styles.headerSubtitle}>Choose a surah to begin</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading surahs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSurahs}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={surahs}
          renderItem={renderSurahItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  surahCardCompleted: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}08`,
  },
  surahNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  surahNumberActive: {
    backgroundColor: colors.primaryMuted,
  },
  surahNumberText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textMuted,
  },
  surahNumberTextActive: {
    color: colors.primary,
  },
  surahInfo: {
    flex: 1,
  },
  surahNames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  surahNameArabic: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textArabic,
  },
  surahNameEnglish: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  surahMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textTransform: 'capitalize',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statusIcon: {
    marginLeft: spacing.sm,
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
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});

