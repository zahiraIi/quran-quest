/**
 * Home screen - Premium redesigned learning path.
 *
 * Features:
 * - Weekly streak calendar at top
 * - Daily goal ring with animated progress
 * - Reading level badge
 * - Stats row (time, verses, XP)
 * - Continue reading card
 * - Lesson modules
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import {
  DailyGoalRing,
  WeeklyStreakCalendar,
  generateWeekDays,
  GlowCard,
  ReadingLevelBadge,
  StatsRow,
  HeartDisplay,
} from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

// Mock data for lesson modules
const MOCK_MODULES = [
  {
    id: '1',
    title: 'Arabic Letters',
    titleArabic: 'الحروف العربية',
    description: 'Learn the Arabic alphabet',
    iconName: 'abjad-arabic',
    color: colors.primary,
    lessonCount: 10,
    completedCount: 7,
    locked: false,
  },
  {
    id: '2',
    title: 'Pronunciation',
    titleArabic: 'المخارج',
    description: 'Master letter sounds',
    iconName: 'speaker',
    color: colors.secondary,
    lessonCount: 8,
    completedCount: 3,
    locked: false,
  },
  {
    id: '3',
    title: 'Surah Al-Fatiha',
    titleArabic: 'سورة الفاتحة',
    description: 'Learn the opening chapter',
    iconName: 'book-open-page-variant',
    color: colors.accent,
    lessonCount: 7,
    completedCount: 0,
    locked: false,
  },
  {
    id: '4',
    title: 'Basic Tajweed',
    titleArabic: 'التجويد',
    description: 'Proper recitation rules',
    iconName: 'tune',
    color: colors.streak,
    lessonCount: 12,
    completedCount: 0,
    locked: true,
  },
];

// Mock user stats
const MOCK_STATS = {
  currentStreak: 7,
  hearts: 4,
  maxHearts: 5,
  dailyXp: 32,
  dailyGoal: 50,
  totalXp: 1250,
  minutesToday: 12,
  versesToday: 5,
  level: 5,
};

export default function HomeScreen() {
  const router = useRouter();
  const { progress } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const userStats = MOCK_STATS;
  const weekDays = generateWeekDays([], userStats.currentStreak);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleModulePress = (moduleId: string, locked: boolean) => {
    if (locked) return;
    router.push(`/lesson/${moduleId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Assalamu Alaikum</Text>
            <Text style={styles.subtitle}>Ready to learn today?</Text>
          </View>
          <HeartDisplay
            current={userStats.hearts}
            max={userStats.maxHearts}
            size="md"
            showCount
          />
        </Animated.View>

        {/* Weekly Streak Calendar */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <WeeklyStreakCalendar
            days={weekDays}
            currentStreak={userStats.currentStreak}
            style={styles.streakCalendar}
          />
        </Animated.View>

        {/* Daily Goal Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.goalSection}
        >
          <GlowCard
            variant="primary"
            glow={userStats.dailyXp >= userStats.dailyGoal}
            style={styles.goalCard}
          >
            <View style={styles.goalContent}>
              <View style={styles.goalLeft}>
                <Text style={styles.goalTitle}>Daily Goal</Text>
                <Text style={styles.goalDescription}>
                  {userStats.dailyXp >= userStats.dailyGoal
                    ? '🎉 Goal achieved!'
                    : `${userStats.dailyGoal - userStats.dailyXp} XP to go`}
                </Text>
                <ReadingLevelBadge
                  levelId={Math.ceil(userStats.minutesToday / 10) || 1}
                  minutesRead={userStats.minutesToday}
                  size="sm"
                  style={styles.levelBadge}
                />
              </View>
              <DailyGoalRing
                currentXp={userStats.dailyXp}
                goalXp={userStats.dailyGoal}
                size={120}
              />
            </View>
          </GlowCard>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <StatsRow
            stats={[
              {
                value: userStats.minutesToday,
                label: 'Minutes',
                icon: 'clock-outline',
                iconColor: colors.info,
                format: 'number',
                suffix: 'm',
              },
              {
                value: userStats.versesToday,
                label: 'Verses',
                icon: 'book-open-variant',
                iconColor: colors.accent,
              },
              {
                value: userStats.dailyXp,
                label: 'XP Today',
                icon: 'star-four-points',
                iconColor: colors.xp,
              },
            ]}
            style={styles.statsRow}
          />
        </Animated.View>

        {/* Learn & Memorize Card */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/learn')}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueCard}
            >
              <View style={styles.continueContent}>
                <View style={styles.continueIcon}>
                  <MaterialCommunityIcons
                    name="brain"
                    size={48}
                    color={colors.text}
                  />
                </View>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>Learn & Memorize</Text>
                  <Text style={styles.continueSubtitle}>
                    Confidence-based Quran memorization
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color={colors.text}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Continue Reading Card */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/practice')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueCard}
            >
              <View style={styles.continueContent}>
                <View style={styles.continueIcon}>
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={48}
                    color={colors.text}
                  />
                </View>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>Continue Practice</Text>
                  <Text style={styles.continueSubtitle}>
                    Surah Al-Fatiha • Ayah 1
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color={colors.text}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Your Learning Path</Text>

        {/* Lesson Modules */}
        {MOCK_MODULES.map((module, index) => (
          <Animated.View
            key={module.id}
            entering={FadeInDown.delay(500 + index * 80).duration(400)}
          >
            <TouchableOpacity
              activeOpacity={module.locked ? 1 : 0.8}
              onPress={() => handleModulePress(module.id, module.locked)}
              style={[
                styles.moduleCard,
                module.locked && styles.moduleCardLocked,
              ]}
            >
              <View
                style={[
                  styles.moduleIcon,
                  {
                    backgroundColor: module.locked
                      ? colors.backgroundMuted
                      : `${module.color}20`,
                    borderColor: module.locked ? colors.border : module.color,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={module.iconName as any}
                  size={26}
                  color={module.locked ? colors.textMuted : module.color}
                />
              </View>

              <View style={styles.moduleContent}>
                <View style={styles.moduleTitleRow}>
                  <Text
                    style={[
                      styles.moduleTitle,
                      module.locked && styles.moduleTitleLocked,
                    ]}
                  >
                    {module.title}
                  </Text>
                  {module.locked && (
                    <MaterialCommunityIcons
                      name="lock"
                      size={16}
                      color={colors.textMuted}
                    />
                  )}
                </View>
                <Text style={styles.moduleDescription}>{module.description}</Text>

                {!module.locked && (
                  <View style={styles.moduleProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(module.completedCount / module.lessonCount) * 100}%`,
                            backgroundColor: module.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moduleProgressText}>
                      {module.completedCount}/{module.lessonCount}
                    </Text>
                  </View>
                )}
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={module.locked ? colors.textMuted : colors.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  streakCalendar: {
    marginBottom: spacing.lg,
  },
  goalSection: {
    marginBottom: spacing.lg,
  },
  goalCard: {
    padding: spacing.lg,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  goalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  goalDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  levelBadge: {
    marginTop: spacing.md,
  },
  statsRow: {
    marginBottom: spacing.lg,
  },
  continueCard: {
    borderRadius: radii.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  continueIcon: {
    marginRight: spacing.md,
  },
  continueText: {
    flex: 1,
  },
  continueTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  continueSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xxs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1.5,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  moduleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  moduleTitleLocked: {
    color: colors.textMuted,
  },
  moduleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  moduleProgress: {
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
    borderRadius: 3,
  },
  moduleProgressText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  bottomSpacer: {
    height: spacing.xxxl + 20,
  },
});
