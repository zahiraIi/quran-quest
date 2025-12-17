/**
 * Root layout for the Quran Quest app.
 *
 * Sets up navigation, theme, and global providers.
 * Handles onboarding flow for new users.
 */

import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function useOnboardingCheck() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboarding_complete');
        setIsOnboardingComplete(value === 'true');
      } catch {
        setIsOnboardingComplete(false);
      }
    };

    checkOnboarding();
  }, []);

  // Handle routing based on onboarding status
  useEffect(() => {
    if (isOnboardingComplete === null) return; // Still loading

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboardingComplete && !inOnboarding) {
      // User hasn't completed onboarding, redirect to it
      router.replace('/onboarding');
    } else if (isOnboardingComplete && inOnboarding) {
      // User completed onboarding but is still on onboarding screen
      router.replace('/(tabs)');
    }
  }, [isOnboardingComplete, segments, router]);

  return isOnboardingComplete;
}

export default function RootLayout() {
  // Load custom fonts (optional - will use system fonts if not available)
  const [fontsLoaded] = useFonts({});

  // Check onboarding status
  const isOnboardingComplete = useOnboardingCheck();

  useEffect(() => {
    // Hide splash screen when fonts are loaded and onboarding check is done
    if (fontsLoaded !== undefined && isOnboardingComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isOnboardingComplete]);

  // Don't render until we know onboarding status
  if (isOnboardingComplete === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="lesson/[id]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="recite/[ayahId]"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
