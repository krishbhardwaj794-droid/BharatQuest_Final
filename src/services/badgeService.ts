import { supabase } from './supabase';
import { Badge } from '../types';
import { allBadges as fallbackBadges } from '../data/badges';

export interface DbBadgeRow {
  id: string;
  icon: string;
  name: string;
  desc: string | null;
  criteria: string | null;
  order_index: number | null;
}

export async function getAllBadgesFromDb(): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackBadges;
    }

    return data.map(b => ({
      id: b.id,
      icon: b.icon,
      name: b.name,
      desc: b.desc || '',
      criteria: b.criteria || '',
      earned: false
    }));
  } catch {
    return fallbackBadges;
  }
}

export async function fetchUserBadgesFromDb(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (error || !data) return ['first-discovery'];
    return data.map(r => r.badge_id);
  } catch {
    return ['first-discovery'];
  }
}

export async function awardBadgeInDb(userId: string, badgeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId });

    if (error && error.code !== '23505' && error.code !== 'PGRST205') {
      console.warn('[badgeService] Error saving badge to DB:', error.message);
    }
  } catch (err) {
    console.warn('[badgeService] Exception awarding badge in DB:', err);
  }
}
