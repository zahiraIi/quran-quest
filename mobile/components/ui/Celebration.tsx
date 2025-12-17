/**
 * Celebration components - Duolingo-style celebrations and feedback.
 *
 * Features:
 * - Confetti animation
 * - XP earned popup
 * - Streak celebration
 * - Mastered ayah celebration
 * - Encouraging messages
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInDown,
  BounceIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, radii, shadows, animations, encouragements } from '@/theme';
import { DuoButton } from './DuoButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Confetti Piece Component
// ============================================================================

const CONFETTI_COLORS = [
  colors.primary,
  colors.secondary,
  colors.accent,
  colors.purple,
  colors.error,
  colors.success,
];

interface ConfettiPieceProps {
  index: number;
  delay: number;
}

function ConfettiPiece({ index, delay }: ConfettiPieceProps) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = Math.random() * SCREEN_WIDTH;
  const size = 8 + Math.random() * 8;
  const duration = 2000 + Math.random() * 1000;

  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, { duration, easing: Easing.linear })
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(Math.random() > 0.5 ? 30 : -30, { duration: 500 }),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1000 }), -1, false)
    );
    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: startX,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 0,
        },
        animatedStyle,
      ]}
    />
  );
}

// ============================================================================
// Confetti Overlay
// ============================================================================

interface ConfettiProps {
  visible: boolean;
  onComplete?: () => void;
}

export function Confetti({ visible, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    if (visible) {
      // Generate confetti pieces
      setPieces(Array.from({ length: 50 }, (_, i) => i));

      // Cleanup after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [visible, onComplete]);

  if (!visible || pieces.length === 0) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {pieces.map((index) => (
        <ConfettiPiece key={index} index={index} delay={index * 30} />
      ))}
    </View>
  );
}

// ============================================================================
// XP Earned Popup
// ============================================================================

interface XpPopupProps {
  xp: number;
  visible: boolean;
  onDismiss: () => void;
}

export function XpPopup({ xp, visible, onDismiss }: XpPopupProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, animations.celebration);
    } else {
      scale.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.popupOverlay} pointerEvents="box-none">
      <Animated.View style={[styles.xpPopup, animatedStyle]}>
        <Text style={styles.xpPopupEmoji}>⭐</Text>
        <Text style={styles.xpPopupValue}>+{xp} XP</Text>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// Lesson Complete Modal
// ============================================================================

interface LessonCompleteModalProps {
  visible: boolean;
  xpEarned: number;
  accuracy: number;
  ayahsMastered: number;
  onContinue: () => void;
}

export function LessonCompleteModal({
  visible,
  xpEarned,
  accuracy,
  ayahsMastered,
  onContinue,
}: LessonCompleteModalProps) {
  const randomEncouragement = encouragements.correct[
    Math.floor(Math.random() * encouragements.correct.length)
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Confetti visible={visible} />

        <Animated.View
          entering={SlideInUp.springify().damping(12)}
          style={styles.modalContent}
        >
          {/* Celebration header */}
          <View style={styles.celebrationHeader}>
            <Animated.Text
              entering={BounceIn.delay(300)}
              style={styles.celebrationEmoji}
            >
              🎉
            </Animated.Text>
            <Text style={styles.celebrationTitle}>Lesson Complete!</Text>
            <Text style={styles.celebrationSubtitle}>{randomEncouragement}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <Animated.View
              entering={ZoomIn.delay(400)}
              style={styles.statItem}
            >
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>{xpEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </Animated.View>

            <Animated.View
              entering={ZoomIn.delay(500)}
              style={styles.statItem}
            >
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </Animated.View>

            <Animated.View
              entering={ZoomIn.delay(600)}
              style={styles.statItem}
            >
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>{ayahsMastered}</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </Animated.View>
          </View>

          {/* Continue button */}
          <Animated.View
            entering={SlideInDown.delay(700)}
            style={styles.continueButtonContainer}
          >
            <DuoButton
              title="Continue"
              onPress={onContinue}
              variant="primary"
              size="xl"
              fullWidth
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Streak Celebration Modal
// ============================================================================

interface StreakCelebrationProps {
  visible: boolean;
  streakCount: number;
  onDismiss: () => void;
}

export function StreakCelebration({
  visible,
  streakCount,
  onDismiss,
}: StreakCelebrationProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Confetti visible={visible} />

        <Animated.View
          entering={SlideInUp.springify().damping(10)}
          style={styles.streakModalContent}
        >
          <LinearGradient
            colors={[colors.secondary, colors.streak]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakGradient}
          >
            <Animated.Text
              entering={BounceIn.delay(200)}
              style={styles.streakFireEmoji}
            >
              🔥
            </Animated.Text>

            <Text style={styles.streakCount}>{streakCount}</Text>
            <Text style={styles.streakLabel}>Day Streak!</Text>
            <Text style={styles.streakMessage}>
              You're on fire! Keep up the amazing work!
            </Text>

            <DuoButton
              title="Keep Going!"
              onPress={onDismiss}
              variant="secondary"
              size="lg"
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Mastered Badge Animation
// ============================================================================

interface MasteredBadgeProps {
  visible: boolean;
}

export function MasteredBadge({ visible }: MasteredBadgeProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={BounceIn.duration(600)}
      exiting={FadeOut.duration(300)}
      style={styles.masteredBadge}
    >
      <LinearGradient
        colors={[colors.success, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.masteredBadgeGradient}
      >
        <MaterialCommunityIcons name="check-decagram" size={40} color="white" />
      </LinearGradient>
    </Animated.View>
  );
}

// ============================================================================
// Toast Notification
// ============================================================================

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  emoji?: string;
}

export function Toast({ message, type = 'success', visible, emoji }: ToastProps) {
  const colors_map = {
    success: colors.success,
    error: colors.error,
    info: colors.accent,
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInUp.springify()}
      exiting={FadeOut.duration(200)}
      style={[styles.toast, { backgroundColor: colors_map[type] }]}
    >
      {emoji && <Text style={styles.toastEmoji}>{emoji}</Text>}
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Confetti
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
  },

  // Popup overlay
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  xpPopup: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.xl,
  },
  xpPopupEmoji: {
    fontSize: 28,
  },
  xpPopupValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.textOnSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.xl,
  },

  // Celebration
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  celebrationSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },

  // Continue button
  continueButtonContainer: {
    width: '100%',
  },

  // Streak modal
  streakModalContent: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
    ...shadows.xl,
  },
  streakGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  streakFireEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  streakCount: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.textOnSecondary,
  },
  streakLabel: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textOnSecondary,
    marginBottom: spacing.md,
  },
  streakMessage: {
    fontSize: typography.sizes.md,
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Mastered badge
  masteredBadge: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 10,
  },
  masteredBadgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },
  toastEmoji: {
    fontSize: 20,
  },
  toastText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textOnPrimary,
    flex: 1,
  },
});

