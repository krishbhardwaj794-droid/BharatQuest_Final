import { supabase } from './supabase';
import { LeaderboardEntry } from '../types';

/**
 * Fetch leaderboard exclusively from Supabase PostgreSQL.
 * Queries `player_stats` joined with `profiles`.
 * ZERO mock / fake / virtual users.
 */
export async function getLeaderboardFromDb(currentUserId?: string): Promise<LeaderboardEntry[]> {
  try {
    // 1. Fetch real player stats ordered by XP DESC
    const { data: statsData, error: statsErr } = await supabase
      .from('player_stats')
      .select('user_id, xp, level, completed_quests, updated_at')
      .order('xp', { ascending: false })
      .order('completed_quests', { ascending: false })
      .limit(50);

    if (statsErr || !statsData || statsData.length === 0) {
      return [];
    }

    // 2. Fetch profiles for display names and avatars
    const userIds = statsData.map(s => s.user_id);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, name, avatar, avatar_icon')
      .in('id', userIds);

    const profileMap = new Map((profileData || []).map(p => [p.id, p]));

    // 3. Compute dynamic competition ranks and map to LeaderboardEntry
    let currentRank = 1;
    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < statsData.length; i++) {
      const row = statsData[i];
      // Dynamic ranking: if XP dropped from previous entry, new rank is i + 1
      if (i > 0 && row.xp < statsData[i - 1].xp) {
        currentRank = i + 1;
      }

      const prof = profileMap.get(row.user_id);
      const isMe = currentUserId ? row.user_id === currentUserId : false;

      let badge = '🏺 Heritage Explorer';
      if (currentRank === 1) badge = '👑 National Champion';
      else if (currentRank === 2) badge = '⚔️ Master Scholar';
      else if (currentRank === 3) badge = '📜 Senior Archaeologist';

      entries.push({
        rank: currentRank,
        name: prof?.name || (isMe ? 'Explorer (You)' : 'Explorer'),
        xp: row.xp || 0,
        avatar: prof?.avatar_icon || prof?.avatar || '🦁',
        badge,
        isMe
      });
    }

    return entries;
  } catch (err) {
    console.error('[leaderboardService] Error querying real leaderboard from DB:', err);
    return [];
  }
}
