/**
 * Layout for the learning path screens.
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[surahId]"
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

