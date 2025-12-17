/**
 * Home screen - Duolingo-inspired learning path.
 *
 * Features:
 * - Friendly header with streak and hearts
 * - Visual lesson path with connected nodes
 * - Daily goal progress
 * - Encouraging UI with playful elements
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
  HeartDisplay,
  DuoButton,
} from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_LESSONS = [
  {
    id: '1',
    title: 'Arabic Letters',
    titleArabic: 'الحروف',
    icon: 'abjad-arabic',
    color: colors.primary,
    progress: 70,
    completed: false,
    locked: false,
    crown: 2,
  },
  {
    id: '2',
    title: 'Pronunciation',
    titleArabic: 'النطق',
    icon: 'microphone',
    color: colors.accent,
    progress: 30,
    completed: false,
    locked: false,
    crown: 1,
  },
  {
    id: '3',
    title: 'Al-Fatiha',
    titleArabic: 'الفاتحة',
    icon: 'book-open-page-variant',
    color: colors.secondary,
    progress: 0,
    completed: false,
    locked: false,
    crown: 0,
  },
  {
    id: '4',
    title: 'Basic Tajweed',
    titleArabic: 'التجويد',
    icon: 'music-note',
    color: colors.purple,
    progress: 0,
    completed: false,
    locked: true,
    crown: 0,
  },
  {
    id: '5',
    title: 'Short Surahs',
    titleArabic: 'القصار',
    icon: 'star',
    color: colors.streak,
    progress: 0,
    completed: false,
    locked: true,
    crown: 0,
  },
];

const MOCK_STATS = {
  currentStreak: 7,
  hearts: 4,
  maxHearts: 5,
  dailyXp: 32,
  dailyGoal: 50,
  totalXp: 1250,
  gems: 340,
};

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Header with streak, gems, hearts - Duolingo style.
 */
function Header({ stats }: { stats: typeof MOCK_STATS }) {
  return (
    <View style={styles.header}>
      {/* Streak */}
      <TouchableOpacity style={styles.headerItem}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.headerValue}>{stats.currentStreak}</Text>
      </TouchableOpacity>

      {/* Gems */}
      <TouchableOpacity style={styles.headerItem}>
        <MaterialCommunityIcons name="diamond-stone" size={24} color={colors.accent} />
        <Text style={[styles.headerValue, { color: colors.accent }]}>{stats.gems}</Text>
      </TouchableOpacity>

      {/* Hearts */}
      <HeartDisplay current={stats.hearts} max={stats.maxHearts} size="sm" showCount />
    </View>
  );
}

/**
 * Single lesson node in the path - Duolingo style circular button.
 */
function LessonNode({
  lesson,
  index,
  onPress,
}: {
  lesson: typeof MOCK_LESSONS[0];
  index: number;
  onPress: () => void;
}) {
  const isOdd = index % 2 === 1;
  const offset = isOdd ? 60 : -60;

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(400)}
      style={[styles.lessonNodeContainer, { marginLeft: offset }]}
    >
      {/* Connector line (not for first) */}
      {index > 0 && (
        <View style={[styles.connector, { left: isOdd ? -30 : 30 }]} />
      )}

      {/* Main node */}
      <TouchableOpacity
        style={[
          styles.lessonNode,
          { backgroundColor: lesson.locked ? colors.backgroundMuted : lesson.color },
          lesson.locked && styles.lessonNodeLocked,
        ]}
        onPress={onPress}
        activeOpacity={lesson.locked ? 1 : 0.8}
        disabled={lesson.locked}
      >
        {lesson.locked ? (
          <MaterialCommunityIcons name="lock" size={32} color={colors.textMuted} />
        ) : (
          <MaterialCommunityIcons
            name={lesson.icon as any}
            size={36}
            color={colors.textOnPrimary}
          />
        )}

        {/* Progress ring */}
        {!lesson.locked && lesson.progress > 0 && (
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressRingFill,
                {
                  backgroundColor: colors.primaryLight,
                  width: `${lesson.progress}%`,
                },
              ]}
            />
          </View>
        )}

        {/* Crown badges */}
        {lesson.crown > 0 && (
          <View style={styles.crownBadge}>
            {Array.from({ length: lesson.crown }).map((_, i) => (
              <Text key={i} style={styles.crownEmoji}>👑</Text>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Label */}
      <Text style={[styles.lessonTitle, lesson.locked && styles.lessonTitleLocked]}>
        {lesson.title}
      </Text>
      <Text style={[styles.lessonTitleArabic, lesson.locked && styles.lessonTitleLocked]}>
        {lesson.titleArabic}
      </Text>
    </Animated.View>
  );
}

/**
 * Daily goal card.
 */
function DailyGoalCard({ current, goal }: { current: number; goal: number }) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>Daily Goal</Text>
        {isComplete && <Text style={styles.goalComplete}>🎉 Complete!</Text>}
      </View>

      <View style={styles.goalContent}>
        <DailyGoalRing currentXp={current} goalXp={goal} size={80} />
        <View style={styles.goalText}>
          <Text style={styles.goalXp}>
            <Text style={styles.goalXpCurrent}>{current}</Text>
            <Text style={styles.goalXpSlash}> / </Text>
            <Text style={styles.goalXpGoal}>{goal} XP</Text>
          </Text>
          <View style={styles.goalProgressBar}>
            <View style={[styles.goalProgressFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.goalEncouragement}>
            {isComplete
              ? "Amazing work! 💪"
              : `${goal - current} XP to go - you've got this!`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

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

  const handleLessonPress = (lessonId: string) => {
    impactAsync(ImpactFeedbackStyle.Medium);
    router.push('/learn');
  };

  const handleStartLearning = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    router.push('/learn');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Header stats={userStats} />

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
        {/* Greeting */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.greeting}>
          <Text style={styles.greetingText}>Assalamu Alaikum! 👋</Text>
          <Text style={styles.greetingSubtext}>Ready to learn today?</Text>
        </Animated.View>

        {/* Weekly Streak Calendar */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <WeeklyStreakCalendar
            days={weekDays}
            currentStreak={userStats.currentStreak}
            style={styles.streakCalendar}
          />
        </Animated.View>

        {/* Daily Goal */}
        <DailyGoalCard current={userStats.dailyXp} goal={userStats.dailyGoal} />

        {/* Start Learning Button */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.startButtonContainer}>
          <DuoButton
            title="Start Learning 📖"
            onPress={handleStartLearning}
            variant="primary"
            size="xl"
            fullWidth
            icon="brain"
          />
        </Animated.View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Your Learning Path</Text>

        {/* Lesson Path */}
        <View style={styles.lessonPath}>
          {MOCK_LESSONS.map((lesson, index) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              index={index}
              onPress={() => handleLessonPress(lesson.id)}
            />
          ))}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakEmoji: {
    fontSize: 24,
  },
  headerValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.streak,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  greetingSubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  streakCalendar: {
    marginBottom: spacing.lg,
  },
  // Daily Goal Card
  goalCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  goalComplete: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.success,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  goalText: {
    flex: 1,
  },
  goalXp: {
    marginBottom: spacing.sm,
  },
  goalXpCurrent: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.secondary,
  },
  goalXpSlash: {
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
  },
  goalXpGoal: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  goalEncouragement: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Start Button
  startButtonContainer: {
    marginBottom: spacing.xl,
  },
  // Section Title
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // Lesson Path
  lessonPath: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  lessonNodeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  connector: {
    position: 'absolute',
    top: -spacing.lg,
    width: 4,
    height: spacing.lg + 10,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  lessonNode: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    ...shadows.lg,
  },
  lessonNodeLocked: {
    borderColor: colors.border,
    opacity: 0.6,
  },
  progressRing: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressRingFill: {
    height: '100%',
    borderRadius: 3,
  },
  crownBadge: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
  },
  crownEmoji: {
    fontSize: 16,
    marginHorizontal: -2,
  },
  lessonTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  lessonTitleArabic: {
    fontSize: typography.sizes.lg,
    color: colors.textArabic,
    marginTop: spacing.xxs,
  },
  lessonTitleLocked: {
    color: colors.textMuted,
  },
  bottomSpacer: {
    height: spacing.xxxl + 40,
  },
});
