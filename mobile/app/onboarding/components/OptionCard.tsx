/**
 * Reusable option card for single/multi-select questions.
 */

import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { impactAsync } from '@/utils/haptics';

import { colors, spacing, radii, typography } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OptionCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  icon?: string;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
}

export function OptionCard({
  title,
  subtitle,
  emoji,
  icon,
  isSelected,
  onPress,
  color = colors.primary,
}: OptionCardProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    impactAsync();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isSelected && { borderColor: color },
        animatedStyle,
      ]}
    >
      {(emoji || icon) && (
        <View
          style={[
            styles.iconContainer,
            isSelected && { backgroundColor: `${color}20` },
          ]}
        >
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : icon ? (
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={isSelected ? color : colors.textSecondary}
            />
          ) : null}
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={[styles.title, isSelected && { color }]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
          isSelected && { backgroundColor: color, borderColor: color },
        ]}
      >
        {isSelected && (
          <MaterialCommunityIcons
            name="check"
            size={16}
            color={colors.textOnPrimary}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  containerSelected: {
    backgroundColor: colors.backgroundMuted,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderWidth: 0,
  },
});

