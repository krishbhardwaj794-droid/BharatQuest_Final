import { supabase } from './supabase';
import { Quest } from '../types';

export interface DbQuestRow {
  id: string;
  display_title: string;
  subtitle: string | null;
  description: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  xp_reward: string | null;
  required_level: number | null;
  status: string | null;
  icon: string | null;
  badge_id: string | null;
  badge_name: string | null;
  tags: string[] | null;
  topic: string | null;
  time_limit: number | null;
  question_count: number | null;
  difficulty_tier: string | null;
  completion_message: string | null;
  order_index: number | null;
}

export interface DbQuestDetails extends Quest {
  topic: string;
  timeLimit: number;
  questionCount: number;
  difficultyTier: 'Basic' | 'Intermediate' | 'Advanced';
  completionMessage: string;
}

const QUEST_CLEAN_ICONS: Record<string, string> = {
  'ancient-india-01': '🏺',
  'explore-india-02': '🗺️',
  'culture-traditions-03': '🎭',
  'freedom-movement-04': '🇮🇳'
};

function sanitizeQuestIcon(icon: string | null | undefined, questId: string): string {
  if (QUEST_CLEAN_ICONS[questId]) {
    return QUEST_CLEAN_ICONS[questId];
  }
  if (!icon || icon.length > 4 || icon.includes('ð') || icon.includes('Ÿ') || icon.includes('â')) {
    return '🏺';
  }
  return icon;
}

function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/â€”/g, '—').replace(/â€“/g, '–').replace(/â€™/g, "'");
}

export function mapDbQuestToQuest(row: DbQuestRow): Quest {
  return {
    id: row.id,
    displayTitle: cleanText(row.display_title),
    subtitle: cleanText(row.subtitle),
    description: cleanText(row.description),
    difficulty: (row.difficulty as Quest['difficulty']) || 'Easy',
    estimatedTime: row.estimated_time || '~5 min',
    xpReward: row.xp_reward || '+250 XP',
    requiredLevel: row.required_level || 1,
    status: (row.status as Quest['status']) || 'active',
    icon: sanitizeQuestIcon(row.icon, row.id),
    badgeId: row.badge_id || '',
    badgeName: cleanText(row.badge_name),
    tags: row.tags || []
  };
}

export function mapDbQuestToDetails(row: DbQuestRow): DbQuestDetails {
  return {
    ...mapDbQuestToQuest(row),
    topic: row.topic || 'history',
    timeLimit: row.time_limit || 300,
    questionCount: row.question_count || 5,
    difficultyTier: (row.difficulty_tier as 'Basic' | 'Intermediate' | 'Advanced') || 'Basic',
    completionMessage: row.completion_message || 'You have successfully conquered this quest!'
  };
}

/**
 * Fetch all quests directly from Supabase PostgreSQL API.
 */
export async function getQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[questService] Supabase API error fetching quests:', error.message);
    return [];
  }

  return (data || []).map(mapDbQuestToQuest);
}

/**
 * Fetch a single quest with full mission parameters directly from Supabase PostgreSQL API.
 */
export async function getQuestById(questId: string): Promise<Quest | null> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  if (error || !data) {
    console.error('[questService] Supabase API error fetching quest by id:', error?.message);
    return null;
  }

  return mapDbQuestToQuest(data);
}

/**
 * Fetch full quest and mission details directly from Supabase PostgreSQL API.
 */
export async function getQuestDetails(questId: string): Promise<DbQuestDetails | null> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  if (error || !data) {
    console.error('[questService] Supabase API error fetching quest details:', error?.message);
    return null;
  }

  return mapDbQuestToDetails(data);
}
