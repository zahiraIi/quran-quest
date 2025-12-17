/**
 * Animated stat counter component.
 * Shows statistics with animated number transitions.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, typography, spacing, radii } from '@/theme';

interface StatCounterProps {
  /** The value to display */
  value: number;
  /** Label text */
  label: string;
  /** Icon name from MaterialCommunityIcons */
  icon?: string;
  /** Icon color */
  iconColor?: string;
  /** Format type for the value */
  format?: 'number' | 'time' | 'percentage';
  /** Suffix text (e.g., "XP", "days") */
  suffix?: string;
  /** Enable count animation */
  animate?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Container style */
  style?: ViewStyle;
}

export function StatCounter({
  value,
  label,
  icon,
  iconColor = colors.primary,
  format = 'number',
  suffix,
  animate = true,
  size = 'md',
  style,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(animate ? 0 : value);
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      animatedValue.value = withTiming(value, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      // Update display value during animation
      const interval = setInterval(() => {
        setDisplayValue(Math.round(animatedValue.value));
      }, 16);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayValue(value);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, animate, animatedValue]);

  const formattedValue = formatValue(displayValue, format);
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {icon && (
        <View style={[styles.iconContainer, sizeStyles.iconContainer]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={sizeStyles.iconSize}
            color={iconColor}
          />
        </View>
      )}
      <Text style={[styles.value, sizeStyles.value]}>
        {formattedValue}
        {suffix && <Text style={styles.suffix}> {suffix}</Text>}
      </Text>
      <Text style={[styles.label, sizeStyles.label]}>{label}</Text>
    </View>
  );
}

function formatValue(value: number, format: 'number' | 'time' | 'percentage'): string {
  switch (format) {
    case 'time':
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    case 'percentage':
      return `${value}%`;
    default:
      return value.toLocaleString();
  }
}

interface StatsRowProps {
  stats: Array<{
    value: number;
    label: string;
    icon?: string;
    iconColor?: string;
    format?: 'number' | 'time' | 'percentage';
    suffix?: string;
  }>;
  style?: ViewStyle;
}

export function StatsRow({ stats, style }: StatsRowProps) {
  return (
    <View style={[styles.row, style]}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <StatCounter
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            iconColor={stat.iconColor}
            format={stat.format}
            suffix={stat.suffix}
            size="sm"
            style={styles.rowStat}
          />
          {index < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: string;
  iconColor?: string;
  format?: 'number' | 'time' | 'percentage';
  suffix?: string;
  style?: ViewStyle;
}

export function StatCard({
  value,
  label,
  icon,
  iconColor = colors.primary,
  format = 'number',
  suffix,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.cardIcon, { backgroundColor: `${iconColor}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.cardValue}>
        {formatValue(value, format)}
        {suffix && <Text style={styles.cardSuffix}> {suffix}</Text>}
      </Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const SIZE_STYLES = {
  sm: {
    container: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: spacing.xs,
    },
    iconSize: 18,
    value: {
      fontSize: typography.sizes.lg,
    },
    label: {
      fontSize: typography.sizes.xs,
    },
  },
  md: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginBottom: spacing.sm,
    },
    iconSize: 22,
    value: {
      fontSize: typography.sizes.xxl,
    },
    label: {
      fontSize: typography.sizes.sm,
    },
  },
  lg: {
    container: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginBottom: spacing.md,
    },
    iconSize: 28,
    value: {
      fontSize: typography.sizes.xxxl,
    },
    label: {
      fontSize: typography.sizes.md,
    },
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
    color: colors.text,
  },
  suffix: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  label: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  // Row styles
  row: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
  },
  rowStat: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  // Card styles
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 100,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.text,
  },
  cardSuffix: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cardLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
});


