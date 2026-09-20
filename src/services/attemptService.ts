import { supabase } from './supabase';
import { CompletedQuest } from '../types';

export interface AttemptRecord {
  userId: string;
  questId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  usedHint?: boolean;
  xpChange?: number;
}

/**
 * Record a single answer attempt to Supabase PostgreSQL `attempts` table.
 */
export async function recordAttemptToDb(attempt: AttemptRecord): Promise<void> {
  try {
    const { error } = await supabase.from('attempts').insert({
      user_id: attempt.userId,
      quest_id: attempt.questId,
      question_id: attempt.questionId,
      selected_answer: attempt.selectedAnswer,
      is_correct: attempt.isCorrect,
      used_hint: attempt.usedHint || false,
      xp_change: attempt.xpChange || 0,
      answered_at: new Date().toISOString()
    });

    if (error && error.code !== 'PGRST205') {
      console.warn('[attemptService] Failed to record attempt to DB:', error.message);
    }
  } catch (err) {
    console.warn('[attemptService] Exception recording attempt:', err);
  }
}

/**
 * Record a completed quest mission to Supabase PostgreSQL `quest_completions` table.
 */
export async function recordQuestCompletionToDb(
  userId: string,
  completion: CompletedQuest,
  score: number = 0,
  xpEarned: number = 0
): Promise<void> {
  try {
    const { error } = await supabase.from('quest_completions').insert({
      user_id: userId,
      quest_id: completion.id,
      quest_name: completion.name,
      score: score,
      xp_earned: xpEarned,
      accuracy: completion.accuracy,
      time_taken: completion.time,
      badge_earned: completion.badge,
      clues_used: completion.cluesUsed || 0,
      completed_at: new Date().toISOString()
    });

    if (error && error.code !== 'PGRST205') {
      console.warn('[attemptService] Failed to record quest completion to DB:', error.message);
    }
  } catch (err) {
    console.warn('[attemptService] Exception recording quest completion:', err);
  }
}

/**
 * Fetch all completed quests for a user from Supabase.
 */
export async function fetchUserCompletionsFromDb(userId: string): Promise<CompletedQuest[]> {
  try {
    const { data, error } = await supabase
      .from('quest_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error || !data) return [];

    return data.map(row => ({
      id: row.quest_id,
      name: row.quest_name,
      detail: `Completed with ${row.accuracy} accuracy`,
      accuracy: row.accuracy,
      xp: `+${row.xp_earned} XP`,
      date: new Date(row.completed_at).toLocaleDateString(),
      time: row.time_taken,
      badge: row.badge_earned || 'Badge',
      cluesUsed: row.clues_used
    }));
  } catch {
    return [];
  }
}

import { getUserTopicPerformance } from './recommendationService';

/**
 * Calculate dynamic topic scores (History, Culture, Geography) based on real attempt history.
 * Zero hardcoding: Returns true accuracy derived from Supabase attempts table, or 0 if no attempts.
 */
export async function calculateTopicPerformance(userId: string): Promise<{
  historyScore: number;
  cultureScore: number;
  geographyScore: number;
}> {
  try {
    const perf = await getUserTopicPerformance(userId);
    return {
      historyScore: perf.history.accuracy,
      cultureScore: perf.culture.accuracy,
      geographyScore: perf.geography.accuracy
    };
  } catch {
    return { historyScore: 0, cultureScore: 0, geographyScore: 0 };
  }
}
