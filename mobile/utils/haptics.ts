/**
 * Safe haptics wrapper that checks platform availability.
 * Prevents errors when running on web.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Check if haptics are available on the current platform.
 */
const isHapticsAvailable = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Trigger impact haptic feedback (light, medium, heavy).
 * Safe to call on web - will be a no-op.
 */
export async function impactAsync(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): Promise<void> {
  if (!isHapticsAvailable()) {
    return;
  }

  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // Silently fail on web or if haptics aren't available
    if (__DEV__) {
      console.debug('Haptics not available:', error);
    }
  }
}

/**
 * Trigger notification haptic feedback (success, warning, error).
 * Safe to call on web - will be a no-op.
 */
export async function notificationAsync(
  type: Haptics.NotificationFeedbackType
): Promise<void> {
  if (!isHapticsAvailable()) {
    return;
  }

  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    // Silently fail on web or if haptics aren't available
    if (__DEV__) {
      console.debug('Haptics not available:', error);
    }
  }
}

/**
 * Re-export haptics types for convenience.
 */
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';


