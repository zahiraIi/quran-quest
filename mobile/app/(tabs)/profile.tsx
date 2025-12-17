/**
 * Profile screen - Premium redesigned with stats dashboard and achievements.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { impactAsync } from '@/utils/haptics';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { GlowCard, ReadingLevelBadge } from '@/components/ui';

// Mock user data
const MOCK_USER = {
  name: 'Abdullah',
  email: 'abdullah@example.com',
  level: 12,
  totalXp: 4580,
  streak: 27,
  daysActive: 45,
  versesMemorized: 147,
  minutesPracticed: 890,
  accuracy: 87,
  joinedDate: 'Nov 2024',
};

const MOCK_ACHIEVEMENTS = [
  { id: '1', icon: '🔥', name: 'Week Warrior', description: '7-day streak', unlocked: true },
  { id: '2', icon: '📖', name: 'Al-Fatiha Master', description: 'Memorized perfectly', unlocked: true },
  { id: '3', icon: '🌙', name: 'Night Owl', description: '10 late-night sessions', unlocked: true },
  { id: '4', icon: '🎯', name: 'Sharpshooter', description: '90%+ accuracy 5 times', unlocked: true },
  { id: '5', icon: '⚡', name: 'Speed Reader', description: 'Complete 10 lessons fast', unlocked: false },
  { id: '6', icon: '👑', name: 'Juz Champion', description: 'Memorize full Juz Amma', unlocked: false },
  { id: '7', icon: '💎', name: 'Diamond Streak', description: '30-day streak', unlocked: false },
  { id: '8', icon: '🏆', name: 'Hafiz Journey', description: 'Memorize 1000 verses', unlocked: false },
];

const STATS = [
  { label: 'Total XP', value: MOCK_USER.totalXp.toLocaleString(), icon: 'star-four-points', color: colors.xp },
  { label: 'Current Streak', value: `${MOCK_USER.streak} days`, icon: 'fire', color: colors.streak },
  { label: 'Verses Memorized', value: MOCK_USER.versesMemorized.toString(), icon: 'book-open-page-variant', color: colors.success },
  { label: 'Time Practiced', value: `${Math.floor(MOCK_USER.minutesPracticed / 60)}h ${MOCK_USER.minutesPracticed % 60}m`, icon: 'clock-outline', color: colors.info },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleToggle = (setter: (value: boolean) => void, value: boolean) => {
    impactAsync();
    setter(!value);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {MOCK_USER.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialCommunityIcons
                name="camera"
                size={16}
                color={colors.textOnPrimary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <Text style={styles.userEmail}>{MOCK_USER.email}</Text>

          <View style={styles.levelContainer}>
            <ReadingLevelBadge level={MOCK_USER.level} showXp xp={MOCK_USER.totalXp} />
          </View>

          <View style={styles.memberSince}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={16}
              color={colors.textMuted}
            />
            <Text style={styles.memberSinceText}>Member since {MOCK_USER.joinedDate}</Text>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat, index) => (
              <Animated.View
                key={stat.label}
                entering={FadeInRight.delay(150 + index * 50).duration(300)}
                style={styles.statCardWrapper}
              >
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <MaterialCommunityIcons
                      name={stat.icon as any}
                      size={20}
                      color={stat.color}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.achievementsGrid}>
            {MOCK_ACHIEVEMENTS.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInDown.delay(250 + index * 30).duration(300)}
              >
                <View
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementCardLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.achievementIcon,
                      !achievement.unlocked && styles.achievementIconLocked,
                    ]}
                  >
                    {achievement.icon}
                  </Text>
                  <Text
                    style={[
                      styles.achievementName,
                      !achievement.unlocked && styles.achievementNameLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {achievement.name}
                  </Text>
                  {!achievement.unlocked && (
                    <MaterialCommunityIcons
                      name="lock"
                      size={14}
                      color={colors.textMuted}
                      style={styles.lockIcon}
                    />
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryMuted }]}>
                  <MaterialCommunityIcons
                    name="bell"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.settingLabel}>Daily Reminders</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={() => handleToggle(setNotificationsEnabled, notificationsEnabled)}
                trackColor={{ false: colors.backgroundMuted, true: colors.primaryMuted }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.secondaryMuted }]}>
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={20}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.settingLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={() => handleToggle(setSoundEnabled, soundEnabled)}
                trackColor={{ false: colors.backgroundMuted, true: colors.secondaryMuted }}
                thumbColor={soundEnabled ? colors.secondary : colors.textMuted}
              />
            </View>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.infoMuted }]}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color={colors.info}
                  />
                </View>
                <Text style={styles.settingLabel}>Reminder Time</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>8:00 AM</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.warningMuted }]}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={20}
                    color={colors.warning}
                  />
                </View>
                <Text style={styles.settingLabel}>Daily Goal</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>10 min</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* More Options */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.moreOptionsCard}>
            <TouchableOpacity style={styles.moreOptionRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.moreOptionLabel}>Help & Support</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.moreOptionRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.moreOptionLabel}>Share App</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.moreOptionRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.moreOptionLabel}>About</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <TouchableOpacity style={styles.signOutButton}>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={colors.error}
            />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glowPrimary,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  levelContainer: {
    marginTop: spacing.md,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  memberSinceText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCardWrapper: {
    width: '47%',
  },
  statCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  achievementCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.lg,
    padding: spacing.sm,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: spacing.xxs,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementName: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: colors.textMuted,
  },
  lockIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  settingsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  moreOptionsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moreOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  moreOptionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorMuted,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.error,
  },
  bottomSpacer: {
    height: spacing.xxxl + 20,
  },
});
