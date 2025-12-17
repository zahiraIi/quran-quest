/**
 * Recitation service for analyzing Quran recitations.
 */

import { uploadFile, post, get } from './api';
import type { RecitationResult, Ayah, Word } from '@/types';

interface TranscriptionResponse {
  transcription: string;
  confidence: number;
  wordTimestamps?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

interface AccuracyResponse {
  accuracy: number;
  wer: number;
  feedback: Array<{
    wordIndex: number;
    word: string;
    expected: string;
    status: 'correct' | 'incorrect' | 'missing' | 'extra';
    suggestion?: string;
  }>;
}

/**
 * Submit a recorded audio file for transcription.
 *
 * @param audioUri - Local URI of the recorded audio file
 * @returns Transcription result
 */
export async function transcribeRecitation(
  audioUri: string
): Promise<TranscriptionResponse> {
  const response = await uploadFile<TranscriptionResponse>(
    '/recitation/transcribe',
    {
      uri: audioUri,
      name: 'recitation.m4a',
      type: 'audio/m4a',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Transcription failed');
  }

  return response.data;
}

/**
 * Analyze recitation accuracy compared to expected text.
 *
 * @param transcription - The transcribed text from audio
 * @param expectedText - The expected Quran text
 * @returns Accuracy analysis
 */
export async function analyzeAccuracy(
  transcription: string,
  expectedText: string
): Promise<AccuracyResponse> {
  const response = await post<AccuracyResponse>('/recitation/analyze', {
    transcription,
    expectedText,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Analysis failed');
  }

  return response.data;
}

/**
 * Submit and analyze a complete recitation in one call.
 *
 * @param audioUri - Local URI of the recorded audio file
 * @param ayahId - ID of the ayah being recited
 * @returns Complete recitation result with accuracy
 */
export async function submitRecitation(
  audioUri: string,
  ayahId: number
): Promise<RecitationResult> {
  const response = await uploadFile<RecitationResult>(
    '/recitation/submit',
    {
      uri: audioUri,
      name: 'recitation.m4a',
      type: 'audio/m4a',
    },
    {
      ayahId: ayahId.toString(),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Recitation submission failed');
  }

  return response.data;
}

/**
 * Submit and analyze a word-level recitation.
 *
 * @param audioUri - Local URI of the recorded audio file
 * @param wordId - ID of the word being recited
 * @returns Recitation result for single word
 */
export async function submitWordRecitation(
  audioUri: string,
  wordId: number
): Promise<RecitationResult> {
  const response = await uploadFile<RecitationResult>(
    '/recitation/submit-word',
    {
      uri: audioUri,
      name: 'recitation.m4a',
      type: 'audio/m4a',
    },
    {
      wordId: wordId.toString(),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Word recitation submission failed');
  }

  return response.data;
}

/**
 * Get recitation history for the current user.
 *
 * @param limit - Maximum number of results
 * @param offset - Offset for pagination
 * @returns Array of past recitation results
 */
export async function getRecitationHistory(
  limit = 20,
  offset = 0
): Promise<RecitationResult[]> {
  const response = await get<RecitationResult[]>(
    `/recitation/history?limit=${limit}&offset=${offset}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Failed to fetch history');
  }

  return response.data;
}

/**
 * Calculate simple Word Error Rate (WER) locally.
 * Used for quick feedback before server-side analysis.
 *
 * @param reference - Expected text (reference)
 * @param hypothesis - Transcribed text (hypothesis)
 * @returns WER as a decimal (0-1)
 */
export function calculateLocalWER(reference: string, hypothesis: string): number {
  const refWords = reference.trim().split(/\s+/);
  const hypWords = hypothesis.trim().split(/\s+/);

  if (refWords.length === 0) return 0;

  // Simple Levenshtein distance at word level
  const m = refWords.length;
  const n = hypWords.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n] / m;
}

/**
 * Generate local feedback by comparing words.
 * Used for quick visual feedback before server response.
 *
 * @param reference - Expected text
 * @param hypothesis - Transcribed text
 * @returns Array of word-level feedback
 */
export function generateLocalFeedback(
  reference: string,
  hypothesis: string
): Array<{
  word: string;
  expected: string;
  status: 'correct' | 'incorrect' | 'missing' | 'extra';
}> {
  const refWords = reference.trim().split(/\s+/);
  const hypWords = hypothesis.trim().split(/\s+/);
  const feedback: Array<{
    word: string;
    expected: string;
    status: 'correct' | 'incorrect' | 'missing' | 'extra';
  }> = [];

  let refIdx = 0;
  let hypIdx = 0;

  while (refIdx < refWords.length || hypIdx < hypWords.length) {
    if (refIdx >= refWords.length) {
      // Extra words in hypothesis
      feedback.push({
        word: hypWords[hypIdx],
        expected: '',
        status: 'extra',
      });
      hypIdx++;
    } else if (hypIdx >= hypWords.length) {
      // Missing words
      feedback.push({
        word: '',
        expected: refWords[refIdx],
        status: 'missing',
      });
      refIdx++;
    } else if (refWords[refIdx] === hypWords[hypIdx]) {
      // Correct match
      feedback.push({
        word: hypWords[hypIdx],
        expected: refWords[refIdx],
        status: 'correct',
      });
      refIdx++;
      hypIdx++;
    } else {
      // Mismatch - could be substitution, insertion, or deletion
      // Simple approach: treat as substitution
      feedback.push({
        word: hypWords[hypIdx],
        expected: refWords[refIdx],
        status: 'incorrect',
      });
      refIdx++;
      hypIdx++;
    }
  }

  return feedback;
}

