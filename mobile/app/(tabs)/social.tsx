/**
 * Social screen - Premium redesigned friends, leaderboards, and challenges.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { impactAsync } from '@/utils/haptics';

import { colors, spacing, typography, radii, shadows } from '@/theme';
import { GlowCard } from '@/components/ui';

type TabType = 'leaderboard' | 'friends' | 'challenges';

// Mock data
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Ahmad K.', xp: 2450, avatar: null, isMe: false, change: 0 },
  { rank: 2, name: 'Fatima S.', xp: 2380, avatar: null, isMe: false, change: 1 },
  { rank: 3, name: 'Omar H.', xp: 2150, avatar: null, isMe: false, change: -1 },
  { rank: 4, name: 'You', xp: 1950, avatar: null, isMe: true, change: 2 },
  { rank: 5, name: 'Aisha M.', xp: 1820, avatar: null, isMe: false, change: 0 },
  { rank: 6, name: 'Yusuf T.', xp: 1750, avatar: null, isMe: false, change: -2 },
];

const MOCK_FRIENDS = [
  { id: '1', name: 'Ahmad K.', streak: 45, level: 12, online: true, lastActive: 'Now' },
  { id: '2', name: 'Fatima S.', streak: 30, level: 10, online: true, lastActive: '5m ago' },
  { id: '3', name: 'Omar H.', streak: 15, level: 8, online: false, lastActive: '2h ago' },
  { id: '4', name: 'Aisha M.', streak: 7, level: 6, online: false, lastActive: 'Yesterday' },
];

const MOCK_CHALLENGES = [
  {
    id: '1',
    type: 'recitation',
    opponent: 'Ahmad K.',
    status: 'active',
    myScore: 85,
    opponentScore: 78,
    expiresIn: '2h 30m',
  },
  {
    id: '2',
    type: 'streak',
    opponent: 'Fatima S.',
    status: 'pending',
    myScore: null,
    opponentScore: null,
    expiresIn: '23h',
  },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const handleTabChange = (tab: TabType) => {
    impactAsync();
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons
            name="account-plus"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['leaderboard', 'friends', 'challenges'] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => handleTabChange(tab)}
          >
            <MaterialCommunityIcons
              name={
                tab === 'leaderboard'
                  ? 'trophy'
                  : tab === 'friends'
                  ? 'account-group'
                  : 'sword-cross'
              }
              size={20}
              color={activeTab === tab ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'leaderboard' && <LeaderboardContent />}
        {activeTab === 'friends' && <FriendsContent />}
        {activeTab === 'challenges' && <ChallengesContent />}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LeaderboardContent() {
  return (
    <View style={styles.tabContent}>
      {/* League Card */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <GlowCard variant="secondary" glow style={styles.leagueCard}>
          <View style={styles.leagueHeader}>
            <Text style={styles.leagueTrophy}>🏆</Text>
            <View>
              <Text style={styles.leagueName}>Gold League</Text>
              <Text style={styles.leagueSubtitle}>Top 10 advance to Sapphire</Text>
            </View>
          </View>
          <View style={styles.leagueFooter}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={styles.leagueTime}>Ends in 3 days</Text>
          </View>
        </GlowCard>
      </Animated.View>

      {/* Leaderboard */}
      {MOCK_LEADERBOARD.map((entry, index) => (
        <Animated.View
          key={entry.rank}
          entering={FadeInRight.delay(index * 60).duration(300)}
        >
          <View
            style={[
              styles.leaderboardEntry,
              entry.isMe && styles.leaderboardEntryMe,
            ]}
          >
            {/* Rank */}
            <View style={styles.rankContainer}>
              {entry.rank === 1 ? (
                <Text style={styles.rankEmoji}>🥇</Text>
              ) : entry.rank === 2 ? (
                <Text style={styles.rankEmoji}>🥈</Text>
              ) : entry.rank === 3 ? (
                <Text style={styles.rankEmoji}>🥉</Text>
              ) : (
                <Text style={styles.rankNumber}>{entry.rank}</Text>
              )}
            </View>

            {/* Avatar */}
            <View
              style={[
                styles.avatar,
                entry.isMe && styles.avatarMe,
              ]}
            >
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={entry.isMe ? colors.primary : colors.textMuted}
              />
            </View>

            {/* Info */}
            <View style={styles.entryInfo}>
              <Text style={[styles.entryName, entry.isMe && styles.entryNameMe]}>
                {entry.name}
              </Text>
              {entry.change !== 0 && (
                <View style={styles.changeContainer}>
                  <MaterialCommunityIcons
                    name={entry.change > 0 ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={entry.change > 0 ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: entry.change > 0 ? colors.success : colors.error },
                    ]}
                  >
                    {Math.abs(entry.change)}
                  </Text>
                </View>
              )}
            </View>

            {/* XP */}
            <View style={styles.xpContainer}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={16}
                color={colors.xp}
              />
              <Text style={styles.xpText}>{entry.xp.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function FriendsContent() {
  return (
    <View style={styles.tabContent}>
      {/* Add Friend Button */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <TouchableOpacity style={styles.addFriendButton}>
          <MaterialCommunityIcons
            name="account-plus"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.addFriendText}>Add Friends</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Friends List */}
      {MOCK_FRIENDS.map((friend, index) => (
        <Animated.View
          key={friend.id}
          entering={FadeInDown.delay(100 + index * 60).duration(300)}
        >
          <View style={styles.friendCard}>
            <View style={styles.friendAvatarContainer}>
              <View style={styles.friendAvatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={28}
                  color={colors.textSecondary}
                />
              </View>
              {friend.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <View style={styles.friendStats}>
                <View style={styles.friendStat}>
                  <Text style={styles.friendStatEmoji}>🔥</Text>
                  <Text style={styles.friendStatText}>{friend.streak}d</Text>
                </View>
                <View style={styles.friendStat}>
                  <Text style={styles.friendStatEmoji}>⭐</Text>
                  <Text style={styles.friendStatText}>Lvl {friend.level}</Text>
                </View>
                <Text style={styles.lastActive}>{friend.lastActive}</Text>
              </View>
            </View>

            <View style={styles.friendActions}>
              <TouchableOpacity style={styles.nudgeButton}>
                <MaterialCommunityIcons
                  name="bell-ring-outline"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.challengeButton}>
                <MaterialCommunityIcons
                  name="sword-cross"
                  size={18}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function ChallengesContent() {
  if (MOCK_CHALLENGES.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>⚔️</Text>
        <Text style={styles.emptyTitle}>No Active Challenges</Text>
        <Text style={styles.emptyText}>
          Challenge a friend to a recitation battle!
        </Text>
        <TouchableOpacity style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Find a Friend</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {MOCK_CHALLENGES.map((challenge, index) => (
        <Animated.View
          key={challenge.id}
          entering={FadeInDown.delay(index * 100).duration(300)}
        >
          <GlowCard
            variant={challenge.status === 'pending' ? 'secondary' : 'primary'}
            glow={challenge.status === 'active'}
            style={styles.challengeCard}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.challengeType}>
                <MaterialCommunityIcons
                  name={challenge.type === 'recitation' ? 'microphone' : 'fire'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.challengeTypeText}>
                  {challenge.type === 'recitation' ? 'Recitation Battle' : 'Streak Challenge'}
                </Text>
              </View>
              <View style={styles.expiresContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={colors.warning}
                />
                <Text style={styles.expiresText}>{challenge.expiresIn}</Text>
              </View>
            </View>

            <View style={styles.versusContainer}>
              <View style={styles.player}>
                <View style={[styles.playerAvatar, styles.playerAvatarMe]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.playerName}>You</Text>
                {challenge.myScore !== null && (
                  <Text style={styles.playerScore}>{challenge.myScore}%</Text>
                )}
              </View>

              <Text style={styles.vsText}>VS</Text>

              <View style={styles.player}>
                <View style={styles.playerAvatar}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={styles.playerName}>{challenge.opponent}</Text>
                {challenge.opponentScore !== null && (
                  <Text style={styles.playerScore}>{challenge.opponentScore}%</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.challengeAction,
                challenge.status === 'pending' && styles.challengeActionPending,
              ]}
            >
              <Text
                style={[
                  styles.challengeActionText,
                  challenge.status === 'pending' && styles.challengeActionTextPending,
                ]}
              >
                {challenge.status === 'pending' ? 'Accept Challenge' : 'Continue Battle'}
              </Text>
            </TouchableOpacity>
          </GlowCard>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundCard,
  },
  tabActive: {
    backgroundColor: colors.primaryMuted,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  tabContent: {
    gap: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxxl + 20,
  },
  // League Card
  leagueCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  leagueTrophy: {
    fontSize: 40,
  },
  leagueName: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.secondary,
  },
  leagueSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  leagueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leagueTime: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  // Leaderboard Entry
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardEntryMe: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textMuted,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  avatarMe: {
    backgroundColor: colors.primaryMuted,
  },
  entryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  entryNameMe: {
    color: colors.primary,
    fontWeight: '700',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.xp,
  },
  // Friends
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addFriendText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendAvatarContainer: {
    position: 'relative',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.backgroundCard,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxs,
  },
  friendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  friendStatEmoji: {
    fontSize: 12,
  },
  friendStatText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  lastActive: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  friendActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  nudgeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    ...shadows.glowPrimary,
  },
  emptyButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  // Challenges
  challengeCard: {
    padding: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  challengeTypeText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  expiresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expiresText: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
  },
  versusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  player: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  playerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarMe: {
    backgroundColor: colors.primaryMuted,
  },
  playerName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  playerScore: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  vsText: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textMuted,
  },
  challengeAction: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    alignItems: 'center',
  },
  challengeActionPending: {
    backgroundColor: colors.secondary,
  },
  challengeActionText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  challengeActionTextPending: {
    color: colors.textOnSecondary,
  },
});
