/**
 * Layout for the Arabic Alphabet learning section.
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function AlphabetLayout() {
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
        name="[lessonId]"
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}

