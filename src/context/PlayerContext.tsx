/**
 * BharatQuest PlayerContext — Supabase PostgreSQL Database Integration
 *
 * Source of Truth:
 *   1. Supabase PostgreSQL ('profiles', 'player_stats', 'user_badges', 'quest_completions')
 *   2. Optimistic local mirror for zero-latency gameplay
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  createBlankProfile,
  findLegacyProfileByEmail,
  loadPlayerProfile,
  savePlayerProfile,
  getGuestProfile,
  mergeBadges,
} from '../services/storageService';
import {
  loadPlayerFromDb,
  syncPlayerStatsToDb,
  updatePlayerAvatarInDb
} from '../services/playerService';
import { awardBadgeInDb } from '../services/badgeService';
import { recordQuestCompletionToDb } from '../services/attemptService';
import { AuthResult, Badge, CompletedQuest, PlayerData, User } from '../types';
import { getPlayerLevel, getNextLevelXp } from '../utils/levelEngine';

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface PlayerContextType {
  /** Raw Supabase user (null when not authenticated) */
  supabaseUser: SupabaseUser | null;
  /** Current Supabase session */
  session: Session | null;
  /** BharatQuest game profile */
  player: PlayerData;
  /** True while initial session is being restored on mount */
  isLoadingSession: boolean;
  /** True when user is authenticated with Supabase */
  isLoggedIn: boolean;

  // Auth — async (Supabase)
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    classYear: string,
    password: string,
    avatarIcon: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;

  // Game state mutations (Supabase PostgreSQL + Optimistic Local)
  gainXP: (amount: number) => { newXp: number; newLevel: number; leveledUp: boolean };
  deductXP: (amount: number) => { newXp: number; newLevel: number };
  updateAvatar: (avatarIcon: string) => void;
  awardBadge: (badgeId: string) => void;
  recordCompletion: (completion: CompletedQuest, score?: number, xpEarned?: number) => void;
  resetDemo: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function userToPlayerData(user: User): PlayerData {
  const currentLvl = getPlayerLevel(user.xp);
  const badges: Badge[] = mergeBadges(user.badges);
  return {
    name: user.name,
    email: user.email,
    classYear: user.classYear,
    avatar: user.avatar,
    avatarIcon: user.avatarIcon,
    xp: user.xp,
    level: currentLvl,
    maxXp: getNextLevelXp(currentLvl),
    questsDone: user.questsDone,
    accuracy: user.accuracy,
    historyScore: user.historyScore,
    cultureScore: user.cultureScore,
    geographyScore: user.geographyScore,
    badges,
    completedQuests: user.completedQuests || []
  };
}

function loadOrCreateProfile(supabaseUser: SupabaseUser): User {
  const userId = supabaseUser.id;
  const email = supabaseUser.email || '';
  const meta = supabaseUser.user_metadata || {};

  // 1. Try the new keyed profile first
  const existing = loadPlayerProfile(userId);
  if (existing) return existing;

  // 2. Try to migrate legacy data from old bq_users array (one-time migration)
  const legacy = findLegacyProfileByEmail(email);
  if (legacy) {
    const migrated: User = {
      id: userId,
      name: legacy.name || meta['name'] || 'Explorer',
      email,
      classYear: legacy.classYear || meta['class_year'] || '',
      avatar: legacy.avatar || (legacy.name as string || 'E').charAt(0).toUpperCase(),
      avatarIcon: legacy.avatarIcon || meta['avatar_icon'] || '🏛️',
      xp: (legacy.xp as number) || 0,
      level: (legacy.level as number) || 1,
      questsDone: (legacy.questsDone as number) || 0,
      accuracy: (legacy.accuracy as number) || 0,
      historyScore: (legacy.historyScore as number) || 0,
      cultureScore: (legacy.cultureScore as number) || 0,
      geographyScore: (legacy.geographyScore as number) || 0,
      badges: Array.isArray(legacy.badges) ? (legacy.badges as User['badges']) : [{ id: 'first-discovery', earned: true }],
      completedQuests: Array.isArray(legacy.completedQuests) ? (legacy.completedQuests as CompletedQuest[]) : []
    };
    savePlayerProfile(migrated);
    return migrated;
  }

  // 3. Fresh profile — use metadata stored during signUp
  const fresh = createBlankProfile(
    userId,
    meta['name'] || 'Explorer',
    email,
    meta['class_year'] || '',
    meta['avatar_icon'] || '🦁'
  );
  savePlayerProfile(fresh);
  return fresh;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [gameProfile, setGameProfile] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // -------------------------------------------------------------------------
  // Session restoration + auth state listener + PostgreSQL load
  // -------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    // 1. Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      if (s?.user) {
        setSession(s);
        setSupabaseUser(s.user);

        // Load from Supabase PostgreSQL first
        const dbUser = await loadPlayerFromDb(s.user.id, s.user.email || '');
        if (dbUser && mounted) {
          setGameProfile(dbUser);
          savePlayerProfile(dbUser);
        } else if (mounted) {
          const profile = loadOrCreateProfile(s.user);
          setGameProfile(profile);
        }
      }
      setIsLoadingSession(false);
    });

    // 2. Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        if (s?.user) {
          setSession(s);
          setSupabaseUser(s.user);
          loadPlayerFromDb(s.user.id, s.user.email || '').then(dbUser => {
            if (!mounted) return;
            if (dbUser) {
              setGameProfile(dbUser);
              savePlayerProfile(dbUser);
            } else {
              setGameProfile(prev => {
                if (prev && prev.id === s.user.id) return prev;
                return loadOrCreateProfile(s.user);
              });
            }
          });
        } else {
          // SIGNED_OUT — clear all auth state
          setSession(null);
          setSupabaseUser(null);
          setGameProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Auth actions (async — Supabase)
  // -------------------------------------------------------------------------

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (msg.includes('email not confirmed')) {
        return { success: false, error: 'Please verify your email before signing in. Check your inbox.' };
      }
      return { success: false, error: error.message || 'Authentication service error. Please try again.' };
    }

    if (!data.user) {
      return { success: false, error: 'Sign-in failed. Please try again.' };
    }

    return { success: true };
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    classYear: string,
    password: string,
    avatarIcon: string
  ): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          class_year: classYear,
          avatar_icon: avatarIcon || '🦁'
        }
      }
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('user already registered')) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      }
      if (msg.includes('password')) {
        return { success: false, error: 'Password is too weak. Use at least 6 characters.' };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (msg.includes('rate limit') || (error as any).status === 429) {
        return {
          success: false,
          error: 'Supabase email rate limit reached. In Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email" to enable unlimited instant signups.'
        };
      }
      if (msg.includes('invalid email') || msg.includes('unable to validate email address')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      return { success: false, error: error.message || 'Could not create account. Please try again.' };
    }

    if (!data.user) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }

    const requiresEmailConfirmation = !data.session;

    if (requiresEmailConfirmation) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        user: undefined
      };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  // -------------------------------------------------------------------------
  // Game state mutations (Optimistic Local + Supabase PostgreSQL Sync)
  // -------------------------------------------------------------------------

  const updateProfile = useCallback((updater: (prev: User) => User) => {
    setGameProfile(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      savePlayerProfile(updated);
      return updated;
    });
  }, []);

  const gainXP = useCallback((amount: number): { newXp: number; newLevel: number; leveledUp: boolean } => {
    let result = { newXp: 0, newLevel: 1, leveledUp: false };
    updateProfile(prev => {
      const oldLevel = getPlayerLevel(prev.xp);
      const newXp = Math.max(0, prev.xp + amount);
      const newLevel = getPlayerLevel(newXp);
      result = { newXp, newLevel, leveledUp: newLevel > oldLevel };

      // Sync to Supabase PostgreSQL player_stats table
      if (supabaseUser) {
        syncPlayerStatsToDb(supabaseUser.id, {
          xp: newXp,
          level: newLevel,
          questsDone: prev.questsDone
        });
      }

      return { ...prev, xp: newXp, level: newLevel };
    });
    return result;
  }, [updateProfile, supabaseUser]);

  const deductXP = useCallback((amount: number): { newXp: number; newLevel: number } => {
    let result = { newXp: 0, newLevel: 1 };
    updateProfile(prev => {
      const newXp = Math.max(0, prev.xp - amount);
      const newLevel = getPlayerLevel(newXp);
      result = { newXp, newLevel };

      if (supabaseUser) {
        syncPlayerStatsToDb(supabaseUser.id, {
          xp: newXp,
          level: newLevel
        });
      }

      return { ...prev, xp: newXp, level: newLevel };
    });
    return result;
  }, [updateProfile, supabaseUser]);

  const updateAvatar = useCallback((avatarIcon: string): void => {
    updateProfile(prev => {
      if (supabaseUser) {
        updatePlayerAvatarInDb(supabaseUser.id, avatarIcon);
      }
      return { ...prev, avatarIcon };
    });
  }, [updateProfile, supabaseUser]);

  const awardBadge = useCallback((badgeId: string): void => {
    updateProfile(prev => {
      const existingIdx = prev.badges.findIndex(b => b.id === badgeId);
      let updatedBadges = [...prev.badges];
      if (existingIdx !== -1) {
        updatedBadges[existingIdx] = { ...updatedBadges[existingIdx], earned: true };
      } else {
        updatedBadges.push({ id: badgeId, earned: true });
      }

      if (supabaseUser) {
        awardBadgeInDb(supabaseUser.id, badgeId);
      }

      return { ...prev, badges: updatedBadges };
    });
  }, [updateProfile, supabaseUser]);

  const recordCompletion = useCallback((completion: CompletedQuest, score: number = 0, xpEarned: number = 0): void => {
    updateProfile(prev => {
      const existingIdx = prev.completedQuests.findIndex(q => q.id === completion.id);
      let updatedQuests = [...prev.completedQuests];
      let questsDone = prev.questsDone;
      if (existingIdx !== -1) {
        updatedQuests[existingIdx] = completion;
      } else {
        updatedQuests.push(completion);
        questsDone += 1;
      }

      if (supabaseUser) {
        recordQuestCompletionToDb(supabaseUser.id, completion, score, xpEarned);
        syncPlayerStatsToDb(supabaseUser.id, {
          questsDone: questsDone
        });
      }

      return { ...prev, questsDone, completedQuests: updatedQuests };
    });
  }, [updateProfile, supabaseUser]);

  const resetDemo = useCallback((): void => {
    if (!supabaseUser) return;
    const fresh = createBlankProfile(
      supabaseUser.id,
      supabaseUser.user_metadata?.['name'] || 'Explorer',
      supabaseUser.email || '',
      supabaseUser.user_metadata?.['class_year'] || '',
      supabaseUser.user_metadata?.['avatar_icon'] || '🏛️'
    );
    fresh.badges = [{ id: 'first-discovery', earned: true }];
    setGameProfile(fresh);
    savePlayerProfile(fresh);

    syncPlayerStatsToDb(supabaseUser.id, {
      xp: 0,
      level: 1,
      questsDone: 0,
      accuracy: 0
    });
  }, [supabaseUser]);

  // -------------------------------------------------------------------------
  // Derived player data
  // -------------------------------------------------------------------------

  const activePlayer: PlayerData = gameProfile
    ? userToPlayerData(gameProfile)
    : userToPlayerData(getGuestProfile());

  const isLoggedIn = !!supabaseUser && !!session;

  return (
    <PlayerContext.Provider
      value={{
        supabaseUser,
        session,
        player: activePlayer,
        isLoadingSession,
        isLoggedIn,
        login,
        register,
        logout,
        gainXP,
        deductXP,
        updateAvatar,
        awardBadge,
        recordCompletion,
        resetDemo
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}