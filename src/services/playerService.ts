import { supabase } from './supabase';
import { User, CompletedQuest } from '../types';
import { fetchUserBadgesFromDb } from './badgeService';
import { fetchUserCompletionsFromDb, calculateTopicPerformance } from './attemptService';
import { getPlayerLevel } from '../utils/levelEngine';

/**
 * Load complete player profile and game statistics from Supabase PostgreSQL.
 * Seamlessly integrates profiles, player_stats, user_badges, and quest_completions.
 */
export async function loadPlayerFromDb(userId: string, email: string): Promise<User | null> {
  try {
    // 1. Fetch Profile
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let profile = profileData;
    if (profileErr || !profile) {
      // Upsert profile in Supabase so the user's name appears on leaderboard and profiles
      const defaultName = email.split('@')[0] || 'Explorer';
      const { data: createdProfile } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: defaultName,
          email: email,
          class_year: 'Class 9–10',
          avatar: defaultName.charAt(0).toUpperCase() || 'E',
          avatar_icon: '🦁'
        })
        .select()
        .maybeSingle();

      profile = createdProfile || {
        id: userId,
        name: defaultName,
        email: email,
        class_year: 'Class 9–10',
        avatar: defaultName.charAt(0).toUpperCase() || 'E',
        avatar_icon: '🦁'
      };
    }

    // 2. Fetch Player Stats
    let { data: statsData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!statsData) {
      const { data: createdStats } = await supabase
        .from('player_stats')
        .upsert({
          user_id: userId,
          xp: 0,
          level: 1,
          completed_quests: 0,
          accuracy: 0
        })
        .select()
        .maybeSingle();
      statsData = createdStats;
    }

    // 3. Fetch User Badges
    const earnedBadgeIds = await fetchUserBadgesFromDb(userId);

    // 4. Fetch Completed Quests
    const completedQuests: CompletedQuest[] = await fetchUserCompletionsFromDb(userId);

    // 5. Calculate real dynamic topic performance
    const topicScores = await calculateTopicPerformance(userId);

    const xp = statsData?.xp || 0;
    const level = statsData?.level || getPlayerLevel(xp);

    const user: User = {
      id: userId,
      name: profile?.name || 'Explorer',
      email: profile?.email || email,
      classYear: profile?.class_year || 'Class 9–10',
      avatar: profile?.avatar || 'E',
      avatarIcon: profile?.avatar_icon || '🦁',
      xp: xp,
      level: level,
      questsDone: statsData?.completed_quests ?? completedQuests.length,
      accuracy: Number(statsData?.accuracy) || (completedQuests.length > 0 ? 100 : 0),
      historyScore: topicScores.historyScore,
      cultureScore: topicScores.cultureScore,
      geographyScore: topicScores.geographyScore,
      badges: earnedBadgeIds.map(id => ({ id, earned: true })),
      completedQuests: completedQuests
    };

    return user;
  } catch (err) {
    console.warn('[playerService] Error loading player from DB:', err);
    return null;
  }
}

/**
 * Sync player statistics and profile changes to Supabase PostgreSQL.
 */
export async function syncPlayerStatsToDb(
  userId: string,
  updates: {
    xp?: number;
    level?: number;
    questsDone?: number;
    accuracy?: number;
    historyScore?: number;
    cultureScore?: number;
    geographyScore?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('player_stats')
      .upsert({
        user_id: userId,
        xp: updates.xp,
        level: updates.level,
        completed_quests: updates.questsDone,
        accuracy: updates.accuracy,
        history_score: updates.historyScore,
        culture_score: updates.cultureScore,
        geography_score: updates.geographyScore,
        updated_at: new Date().toISOString()
      });

    if (error && error.code !== 'PGRST205') {
      console.warn('[playerService] Error syncing player stats to DB:', error.message);
    }
  } catch (err) {
    console.warn('[playerService] Exception syncing player stats:', err);
  }
}

/**
 * Update player avatar in Supabase `profiles` table.
 */
export async function updatePlayerAvatarInDb(userId: string, avatarIcon: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_icon: avatarIcon, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error && error.code !== 'PGRST205') {
      console.warn('[playerService] Error updating avatar in DB:', error.message);
    }
  } catch (err) {
    console.warn('[playerService] Exception updating avatar:', err);
  }
}
