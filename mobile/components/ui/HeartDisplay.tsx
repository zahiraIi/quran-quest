/**
 * Heart display component showing remaining lives.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, radii } from '@/theme';

interface HeartDisplayProps {
  current: number;
  max: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  regenTime?: string; // ISO timestamp when next heart regenerates
  style?: ViewStyle;
}

export function HeartDisplay({
  current,
  max,
  showCount = true,
  size = 'md',
  regenTime,
  style,
}: HeartDisplayProps) {
  const sizeStyles = getSizeStyles(size);
  const isFull = current >= max;
  const isEmpty = current <= 0;

  // Calculate time until next heart
  const getTimeUntilRegen = (): string | null => {
    if (!regenTime || isFull) return null;

    const regenDate = new Date(regenTime);
    const now = new Date();
    const diffMs = regenDate.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const timeUntilRegen = getTimeUntilRegen();

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      <View style={styles.heartsRow}>
        {Array.from({ length: max }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(index * 50)}
            style={styles.heartWrapper}
          >
            <MaterialCommunityIcons
              name={index < current ? 'heart' : 'heart-outline'}
              size={sizeStyles.iconSize}
              color={index < current ? colors.heart : colors.textMuted}
            />
          </Animated.View>
        ))}
      </View>

      {showCount && (
        <Text
          style={[
            styles.countText,
            sizeStyles.text,
            isEmpty && styles.emptyText,
          ]}
        >
          {current}/{max}
        </Text>
      )}

      {timeUntilRegen && (
        <Text style={[styles.regenText, sizeStyles.smallText]}>
          +1 in {timeUntilRegen}
        </Text>
      )}
    </View>
  );
}

function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: {
          gap: spacing.xs,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.xs,
        },
        smallText: {
          fontSize: typography.sizes.xs - 2,
        },
        iconSize: 16,
      };
    case 'md':
      return {
        container: {
          gap: spacing.sm,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.sm,
        },
        smallText: {
          fontSize: typography.sizes.xs,
        },
        iconSize: 24,
      };
    case 'lg':
      return {
        container: {
          gap: spacing.md,
        } as ViewStyle,
        text: {
          fontSize: typography.sizes.lg,
        },
        smallText: {
          fontSize: typography.sizes.sm,
        },
        iconSize: 32,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  heartsRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  heartWrapper: {
    // Individual heart wrapper for animations
  },
  countText: {
    fontFamily: typography.fonts.semiBold,
    color: colors.heart,
  },
  emptyText: {
    color: colors.textMuted,
  },
  regenText: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
  },
});

