/**
 * Tab navigation layout with premium floating tab bar.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

import { colors, spacing, radii, shadows, typography } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TabName = 'index' | 'practice' | 'social' | 'profile';

interface TabConfig {
  name: TabName;
  title: string;
  icon: string;
  iconActive: string;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Learn', icon: 'book-open-outline', iconActive: 'book-open-page-variant' },
  { name: 'practice', title: 'Practice', icon: 'microphone-outline', iconActive: 'microphone' },
  { name: 'social', title: 'Friends', icon: 'account-group-outline', iconActive: 'account-group' },
  { name: 'profile', title: 'Profile', icon: 'account-circle-outline', iconActive: 'account-circle' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}

interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.floatingBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = TABS[index];

          const onPress = () => {
            impactAsync();

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            impactAsync(ImpactFeedbackStyle.Medium);
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              icon={isFocused ? tabConfig.iconActive : tabConfig.icon}
              label={tabConfig.title}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabButtonProps {
  icon: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabButton({
  icon,
  label,
  isFocused,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, animatedStyle]}
    >
      <View
        style={[
          styles.tabIconContainer,
          isFocused && styles.tabIconContainerActive,
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={isFocused ? colors.primary : colors.textMuted}
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          isFocused && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: 'none', // Hide default tab bar
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  floatingBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: radii.xxl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tabIconContainer: {
    width: 48,
    height: 36,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  tabIconContainerActive: {
    backgroundColor: colors.primaryMuted,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
