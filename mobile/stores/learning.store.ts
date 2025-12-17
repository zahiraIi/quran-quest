/**
 * Learning store for confidence-based Quran memorization.
 *
 * Implements a spaced repetition system where:
 * 1. User reads an ayah multiple times
 * 2. User indicates confidence level
 * 3. If confident → hide ayah → test recall → mark mastered if correct
 * 4. If not confident → continue reading until confident
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Ayah,
  AyahLearningState,
  AyahWithLearning,
  ConfidenceLevel,
  AyahLearningStatus,
  LearningSession,
  SurahLearningProgress,
  TestResult,
} from '@/types';

// ============================================================================
// Store Interface
// ============================================================================

interface LearningState {
  // All ayah learning states (persisted)
  ayahStates: Record<number, AyahLearningState>;

  // Current active session
  currentSession: LearningSession | null;
  currentAyahIndex: number;

  // Session stats
  sessionReadCount: number;
  sessionMasteredCount: number;

  // Actions
  initializeSession: (
    surahId: number,
    surahName: string,
    ayahs: Ayah[],
    startAyah: number,
    endAyah: number
  ) => void;
  
  getAyahLearningState: (ayahId: number) => AyahLearningState | null;
  
  // Core learning flow
  markAsRead: (ayahId: number) => void;
  setConfidence: (ayahId: number, level: ConfidenceLevel) => void;
  startTest: (ayahId: number) => void;
  submitTestResult: (result: TestResult) => void;
  
  // Navigation
  nextAyah: () => void;
  previousAyah: () => void;
  goToAyah: (index: number) => void;
  
  // Session management
  getCurrentAyah: () => AyahWithLearning | null;
  completeSession: () => void;
  resetSession: () => void;
  
  // Progress
  getSurahProgress: (surahId: number, totalAyahs: number) => SurahLearningProgress;
  getSessionProgress: () => { total: number; mastered: number; percentage: number };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create initial learning state for an ayah.
 */
function createInitialAyahState(
  ayahId: number,
  surahId: number,
  ayahNumber: number
): AyahLearningState {
  return {
    ayahId,
    surahId,
    ayahNumber,
    status: 'new',
    confidenceLevel: 'not_confident',
    readCount: 0,
    testAttempts: 0,
    successfulRecalls: 0,
    lastPracticed: null,
    masteredAt: null,
  };
}

/**
 * Determine next status based on confidence and test result.
 */
function getNextStatus(
  currentStatus: AyahLearningStatus,
  confidence: ConfidenceLevel,
  testPassed?: boolean
): AyahLearningStatus {
  if (testPassed === true) {
    return 'mastered';
  }

  if (testPassed === false) {
    // Failed test, go back to learning
    return 'learning';
  }

  if (confidence === 'confident') {
    return 'reviewing'; // Ready for test
  }

  if (currentStatus === 'new') {
    return 'learning';
  }

  return currentStatus;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      // Initial state
      ayahStates: {},
      currentSession: null,
      currentAyahIndex: 0,
      sessionReadCount: 0,
      sessionMasteredCount: 0,

      // Initialize a new learning session
      initializeSession: (surahId, surahName, ayahs, startAyah, endAyah) => {
        const state = get();
        const sessionAyahs: AyahWithLearning[] = ayahs
          .filter((a) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah)
          .map((ayah) => {
            // Get existing state or create new
            const existing = state.ayahStates[ayah.id];
            const learningState = existing || createInitialAyahState(
              ayah.id,
              surahId,
              ayah.numberInSurah
            );

            return {
              ...ayah,
              learningState,
            };
          });

        const session: LearningSession = {
          id: `session_${Date.now()}`,
          surahId,
          surahName,
          ayahRange: { start: startAyah, end: endAyah },
          ayahs: sessionAyahs,
          startedAt: new Date().toISOString(),
          completedAt: null,
        };

        set({
          currentSession: session,
          currentAyahIndex: 0,
          sessionReadCount: 0,
          sessionMasteredCount: 0,
        });
      },

      getAyahLearningState: (ayahId) => {
        return get().ayahStates[ayahId] || null;
      },

      // Mark an ayah as read (increment read count)
      markAsRead: (ayahId) => {
        const state = get();
        const existing = state.ayahStates[ayahId];
        
        if (!existing) return;

        const updatedState: AyahLearningState = {
          ...existing,
          readCount: existing.readCount + 1,
          lastPracticed: new Date().toISOString(),
          status: existing.status === 'new' ? 'learning' : existing.status,
        };

        // Update global state
        const newAyahStates = {
          ...state.ayahStates,
          [ayahId]: updatedState,
        };

        // Update session if active
        let updatedSession = state.currentSession;
        if (updatedSession) {
          updatedSession = {
            ...updatedSession,
            ayahs: updatedSession.ayahs.map((a) =>
              a.id === ayahId ? { ...a, learningState: updatedState } : a
            ),
          };
        }

        set({
          ayahStates: newAyahStates,
          currentSession: updatedSession,
          sessionReadCount: state.sessionReadCount + 1,
        });
      },

      // Set confidence level for an ayah
      setConfidence: (ayahId, level) => {
        const state = get();
        const existing = state.ayahStates[ayahId];
        
        // If no existing state, create one
        const baseState = existing || createInitialAyahState(ayahId, 0, 0);

        const updatedState: AyahLearningState = {
          ...baseState,
          confidenceLevel: level,
          status: getNextStatus(baseState.status, level),
          lastPracticed: new Date().toISOString(),
        };

        const newAyahStates = {
          ...state.ayahStates,
          [ayahId]: updatedState,
        };

        // Update session
        let updatedSession = state.currentSession;
        if (updatedSession) {
          updatedSession = {
            ...updatedSession,
            ayahs: updatedSession.ayahs.map((a) =>
              a.id === ayahId ? { ...a, learningState: updatedState } : a
            ),
          };
        }

        set({
          ayahStates: newAyahStates,
          currentSession: updatedSession,
        });
      },

      // Mark ayah as ready for testing
      startTest: (ayahId) => {
        const state = get();
        const existing = state.ayahStates[ayahId];
        
        if (!existing) return;

        const updatedState: AyahLearningState = {
          ...existing,
          status: 'reviewing',
          testAttempts: existing.testAttempts + 1,
        };

        const newAyahStates = {
          ...state.ayahStates,
          [ayahId]: updatedState,
        };

        let updatedSession = state.currentSession;
        if (updatedSession) {
          updatedSession = {
            ...updatedSession,
            ayahs: updatedSession.ayahs.map((a) =>
              a.id === ayahId ? { ...a, learningState: updatedState } : a
            ),
          };
        }

        set({
          ayahStates: newAyahStates,
          currentSession: updatedSession,
        });
      },

      // Submit test result (pass/fail)
      submitTestResult: (result) => {
        const state = get();
        const existing = state.ayahStates[result.ayahId];
        
        if (!existing) return;

        const newStatus = getNextStatus(existing.status, existing.confidenceLevel, result.passed);
        
        const updatedState: AyahLearningState = {
          ...existing,
          status: newStatus,
          successfulRecalls: result.passed
            ? existing.successfulRecalls + 1
            : existing.successfulRecalls,
          masteredAt: result.passed ? new Date().toISOString() : existing.masteredAt,
          // If failed, reset confidence
          confidenceLevel: result.passed ? 'confident' : 'not_confident',
        };

        const newAyahStates = {
          ...state.ayahStates,
          [result.ayahId]: updatedState,
        };

        let updatedSession = state.currentSession;
        if (updatedSession) {
          updatedSession = {
            ...updatedSession,
            ayahs: updatedSession.ayahs.map((a) =>
              a.id === result.ayahId ? { ...a, learningState: updatedState } : a
            ),
          };
        }

        set({
          ayahStates: newAyahStates,
          currentSession: updatedSession,
          sessionMasteredCount: result.passed
            ? state.sessionMasteredCount + 1
            : state.sessionMasteredCount,
        });
      },

      // Navigation
      nextAyah: () => {
        const state = get();
        if (!state.currentSession) return;

        const maxIndex = state.currentSession.ayahs.length - 1;
        set({
          currentAyahIndex: Math.min(state.currentAyahIndex + 1, maxIndex),
        });
      },

      previousAyah: () => {
        set((state) => ({
          currentAyahIndex: Math.max(state.currentAyahIndex - 1, 0),
        }));
      },

      goToAyah: (index) => {
        const state = get();
        if (!state.currentSession) return;

        const maxIndex = state.currentSession.ayahs.length - 1;
        set({
          currentAyahIndex: Math.max(0, Math.min(index, maxIndex)),
        });
      },

      // Get current ayah in session
      getCurrentAyah: () => {
        const state = get();
        if (!state.currentSession) return null;
        return state.currentSession.ayahs[state.currentAyahIndex] || null;
      },

      // Complete the session
      completeSession: () => {
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                completedAt: new Date().toISOString(),
              }
            : null,
        }));
      },

      // Reset session
      resetSession: () => {
        set({
          currentSession: null,
          currentAyahIndex: 0,
          sessionReadCount: 0,
          sessionMasteredCount: 0,
        });
      },

      // Get progress for a surah
      getSurahProgress: (surahId, totalAyahs) => {
        const state = get();
        const ayahStatesForSurah = Object.values(state.ayahStates).filter(
          (s) => s.surahId === surahId
        );

        const counts = {
          new: 0,
          learning: 0,
          reviewing: 0,
          mastered: 0,
        };

        ayahStatesForSurah.forEach((s) => {
          counts[s.status]++;
        });

        // Ayahs not yet started count as new
        const trackedCount = ayahStatesForSurah.length;
        counts.new += totalAyahs - trackedCount;

        return {
          surahId,
          totalAyahs,
          newCount: counts.new,
          learningCount: counts.learning,
          reviewingCount: counts.reviewing,
          masteredCount: counts.mastered,
          percentComplete: totalAyahs > 0 ? (counts.mastered / totalAyahs) * 100 : 0,
        };
      },

      // Get session progress
      getSessionProgress: () => {
        const state = get();
        if (!state.currentSession) {
          return { total: 0, mastered: 0, percentage: 0 };
        }

        const total = state.currentSession.ayahs.length;
        const mastered = state.currentSession.ayahs.filter(
          (a) => a.learningState.status === 'mastered'
        ).length;

        return {
          total,
          mastered,
          percentage: total > 0 ? (mastered / total) * 100 : 0,
        };
      },
    }),
    {
      name: 'quran-quest-learning',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist ayahStates, not session
      partialize: (state) => ({
        ayahStates: state.ayahStates,
      }),
    }
  )
);

