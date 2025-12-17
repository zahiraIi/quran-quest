/**
 * Lesson store using Zustand.
 *
 * Manages current lesson state, exercises, and progress tracking.
 */

import { create } from 'zustand';
import type { Lesson, Exercise, ExerciseType, RecitationResult } from '@/types';

interface LessonState {
  // Current lesson
  currentLesson: Lesson | null;
  currentExerciseIndex: number;
  answers: Map<string, ExerciseAnswer>;

  // Session stats
  correctCount: number;
  incorrectCount: number;
  startTime: number | null;
  combo: number; // Consecutive correct answers
  maxCombo: number;

  // Hearts used this session
  heartsUsed: number;

  // Actions
  startLesson: (lesson: Lesson) => void;
  submitAnswer: (exerciseId: string, answer: ExerciseAnswer) => boolean;
  nextExercise: () => void;
  previousExercise: () => void;
  completeLesson: () => LessonResult;
  resetLesson: () => void;
  getCurrentExercise: () => Exercise | null;
  getProgress: () => number;
}

export interface ExerciseAnswer {
  exerciseId: string;
  type: ExerciseType;
  answer: string | string[] | RecitationResult;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
}

export interface LessonResult {
  lessonId: string;
  totalExercises: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  timeSpent: number;
  xpEarned: number;
  stars: 0 | 1 | 2 | 3;
  maxCombo: number;
  isPerfect: boolean;
}

// XP bonuses
const XP_PER_CORRECT = 10;
const COMBO_BONUS_MULTIPLIER = 0.5; // 50% bonus per combo level (max 5x)
const PERFECT_BONUS = 50;
const SPEED_BONUS_THRESHOLD = 30000; // 30 seconds for speed bonus
const SPEED_BONUS = 25;

export const useLessonStore = create<LessonState>((set, get) => ({
  // Initial state
  currentLesson: null,
  currentExerciseIndex: 0,
  answers: new Map(),
  correctCount: 0,
  incorrectCount: 0,
  startTime: null,
  combo: 0,
  maxCombo: 0,
  heartsUsed: 0,

  // Actions
  startLesson: (lesson) =>
    set({
      currentLesson: lesson,
      currentExerciseIndex: 0,
      answers: new Map(),
      correctCount: 0,
      incorrectCount: 0,
      startTime: Date.now(),
      combo: 0,
      maxCombo: 0,
      heartsUsed: 0,
    }),

  submitAnswer: (exerciseId, answer) => {
    const state = get();
    const newAnswers = new Map(state.answers);
    newAnswers.set(exerciseId, answer);

    if (answer.isCorrect) {
      const newCombo = state.combo + 1;
      set({
        answers: newAnswers,
        correctCount: state.correctCount + 1,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
      });
    } else {
      set({
        answers: newAnswers,
        incorrectCount: state.incorrectCount + 1,
        combo: 0,
        heartsUsed: state.heartsUsed + 1,
      });
    }

    return answer.isCorrect;
  },

  nextExercise: () =>
    set((state) => ({
      currentExerciseIndex: Math.min(
        state.currentExerciseIndex + 1,
        (state.currentLesson?.exercises.length ?? 1) - 1
      ),
    })),

  previousExercise: () =>
    set((state) => ({
      currentExerciseIndex: Math.max(state.currentExerciseIndex - 1, 0),
    })),

  completeLesson: () => {
    const state = get();
    const { currentLesson, correctCount, incorrectCount, startTime, maxCombo } = state;

    if (!currentLesson) {
      throw new Error('No lesson in progress');
    }

    const totalExercises = currentLesson.exercises.length;
    const accuracy = totalExercises > 0 ? (correctCount / totalExercises) * 100 : 0;
    const timeSpent = startTime ? Date.now() - startTime : 0;
    const isPerfect = incorrectCount === 0;

    // Calculate stars based on accuracy
    let stars: 0 | 1 | 2 | 3 = 0;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;
    else if (accuracy >= 50) stars = 1;

    // Calculate XP
    let xpEarned = correctCount * XP_PER_CORRECT;

    // Combo bonus (max 5x multiplier)
    const comboMultiplier = Math.min(maxCombo * COMBO_BONUS_MULTIPLIER, 5);
    xpEarned += Math.floor(xpEarned * comboMultiplier);

    // Perfect lesson bonus
    if (isPerfect) {
      xpEarned += PERFECT_BONUS;
    }

    // Speed bonus (complete in under 30 seconds per exercise)
    const avgTimePerExercise = timeSpent / totalExercises;
    if (avgTimePerExercise < SPEED_BONUS_THRESHOLD) {
      xpEarned += SPEED_BONUS;
    }

    // Add base lesson XP
    xpEarned += currentLesson.xpReward;

    return {
      lessonId: currentLesson.id,
      totalExercises,
      correctCount,
      incorrectCount,
      accuracy,
      timeSpent,
      xpEarned,
      stars,
      maxCombo,
      isPerfect,
    };
  },

  resetLesson: () =>
    set({
      currentLesson: null,
      currentExerciseIndex: 0,
      answers: new Map(),
      correctCount: 0,
      incorrectCount: 0,
      startTime: null,
      combo: 0,
      maxCombo: 0,
      heartsUsed: 0,
    }),

  getCurrentExercise: () => {
    const state = get();
    if (!state.currentLesson) return null;
    return state.currentLesson.exercises[state.currentExerciseIndex] ?? null;
  },

  getProgress: () => {
    const state = get();
    if (!state.currentLesson || state.currentLesson.exercises.length === 0) return 0;
    return ((state.currentExerciseIndex + 1) / state.currentLesson.exercises.length) * 100;
  },
}));

