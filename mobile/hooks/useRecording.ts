/**
 * Custom hook for audio recording with real-time amplitude tracking.
 *
 * Handles microphone permissions, recording lifecycle, and audio level monitoring.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import { impactAsync, ImpactFeedbackStyle } from '@/utils/haptics';

import type { RecordingState } from '@/types';

interface UseRecordingOptions {
  maxDuration?: number; // Maximum recording duration in seconds
  hapticFeedback?: boolean;
  onRecordingComplete?: (uri: string, duration: number) => void;
  onError?: (error: Error) => void;
}

interface UseRecordingReturn {
  // State
  isRecording: boolean;
  isPrepared: boolean;
  duration: number;
  uri: string | null;
  amplitude: number; // 0-1 normalized audio level
  hasPermission: boolean | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => void;
  reset: () => void;
}

export function useRecording(options: UseRecordingOptions = {}): UseRecordingReturn {
  const {
    maxDuration = 60, // Default 60 seconds
    hapticFeedback = true,
    onRecordingComplete,
    onError,
  } = options;

  // Core recorder from expo-audio
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Local state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPrepared, setIsPrepared] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uri, setUri] = useState<string | null>(null);

  // Refs for interval management
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      const granted = status.granted;
      setHasPermission(granted);

      if (granted) {
        // Configure audio mode for recording
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }

      return granted;
    } catch (error) {
      console.error('Failed to request permission:', error);
      setHasPermission(false);
      onError?.(error as Error);
      return false;
    }
  }, [onError]);

  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Check permission first
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Microphone permission denied');
        }
      }

      // Haptic feedback
      if (hapticFeedback) {
        await impactAsync(ImpactFeedbackStyle.Medium);
      }

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      setIsPrepared(true);
      audioRecorder.record();

      // Track duration
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDuration(elapsed);

          // Auto-stop if max duration reached
          if (elapsed >= maxDuration) {
            stopRecording();
          }
        }
      }, 100);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [hasPermission, hapticFeedback, maxDuration, audioRecorder, requestPermission, onError]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Haptic feedback
      if (hapticFeedback) {
        await impactAsync();
      }

      // Stop the recorder
      await audioRecorder.stop();

      // Get the recording URI
      const recordingUri = audioRecorder.uri;
      setUri(recordingUri ?? null);
      setIsPrepared(false);

      // Calculate final duration
      const finalDuration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : duration;

      startTimeRef.current = null;

      // Callback with result
      if (recordingUri) {
        onRecordingComplete?.(recordingUri, finalDuration);
      }

      return recordingUri ?? null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError?.(error as Error);
      return null;
    }
  }, [audioRecorder, duration, hapticFeedback, onRecordingComplete, onError]);

  // Cancel recording without saving
  const cancelRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    audioRecorder.stop().catch(() => {
      // Ignore errors when cancelling
    });

    setIsPrepared(false);
    setDuration(0);
    startTimeRef.current = null;
  }, [audioRecorder]);

  // Reset state for new recording
  const reset = useCallback(() => {
    cancelRecording();
    setUri(null);
    setDuration(0);
    setAmplitude(0);
  }, [cancelRecording]);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await AudioModule.getRecordingPermissionsAsync();
        setHasPermission(status.granted);
      } catch {
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isRecording: recorderState.isRecording,
    isPrepared,
    duration,
    uri,
    amplitude,
    hasPermission,

    // Actions
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}

/**
 * Format duration in seconds to mm:ss string.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

