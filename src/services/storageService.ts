/**
 * BharatQuest Storage Service
 *
 * Phase 1 (Supabase Auth):
 *   - ALL authentication is now handled by Supabase Auth.
 *   - Passwords are NEVER stored here.
 *   - Session tokens are managed by Supabase, not localStorage.
 *
 * What this service still manages (Phase 1):
 *   - Player game profile data (XP, badges, quests, scores) — keyed by Supabase user ID
 *   - Question history (anti-repeat) — keyed by user email
 *   - Arcade personal best scores
 *
 * Phase 2 will migrate player profile data to Supabase PostgreSQL.
 */

import { User } from '../types';
import { allBadges } from '../data/badges';

// ---------------------------------------------------------------------------
// Storage key helpers
// ---------------------------------------------------------------------------

/** Game profile key for a given Supabase user ID */
const playerKey = (userId: string) => `bq_profile_${userId}`;

/** Fallback guest profile key (unauthenticated / pre-migration) */
const GUEST_KEY = 'bq_profile_guest';

// ---------------------------------------------------------------------------
// Default/blank profile factory
// ---------------------------------------------------------------------------

export function createBlankProfile(
  userId: string,
  name: string,
  email: string,
  classYear: string,
  avatarIcon: string
): User {
  return {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    classYear,
    avatar: name.trim().charAt(0).toUpperCase() || 'E',
    avatarIcon: avatarIcon || '🦁',
    xp: 0,
    level: 1,
    questsDone: 0,
    accuracy: 0,
    historyScore: 0,
    cultureScore: 0,
    geographyScore: 0,
    badges: [{ id: 'first-discovery', earned: true }],
    completedQuests: []
  };
}

// ---------------------------------------------------------------------------
// Player profile CRUD (localStorage, Phase 1)
// ---------------------------------------------------------------------------

/** Load player game profile for a given Supabase user ID. Returns null if not found. */
export function loadPlayerProfile(userId: string): User | null {
  try {
    const raw = localStorage.getItem(playerKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    // Ensure required fields exist (forwards-compatibility)
    if (!parsed.badges) parsed.badges = [{ id: 'first-discovery', earned: true }];
    if (!parsed.completedQuests) parsed.completedQuests = [];
    return parsed;
  } catch (e) {
    console.warn('[BharatQuest] Could not load player profile from localStorage', e);
    return null;
  }
}

/** Save player game profile for a given Supabase user ID. */
export function savePlayerProfile(profile: User): void {
  try {
    // Never write passwords — the User type no longer has a password field.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safe = { ...profile } as any;
    if ('password' in safe) delete safe.password; // defensive strip

    localStorage.setItem(playerKey(profile.id), JSON.stringify(safe));
  } catch (e) {
    console.warn('[BharatQuest] Could not save player profile to localStorage', e);
  }
}

/** Remove player game profile from localStorage (e.g. on account reset). */
export function deletePlayerProfile(userId: string): void {
  try {
    localStorage.removeItem(playerKey(userId));
  } catch (e) {
    console.warn('[BharatQuest] Could not delete player profile', e);
  }
}

// ---------------------------------------------------------------------------
// Badge utility
// ---------------------------------------------------------------------------

/**
 * Merge the allBadges master list with a user's earned badge IDs,
 * returning a complete typed Badge[] array.
 */
export function mergeBadges(
  earnedBadges: { id: string; earned: boolean }[]
): import('../types').Badge[] {
  return allBadges.map(b => {
    const saved = earnedBadges.find(x => x.id === b.id);
    return {
      ...b,
      earned: saved ? !!saved.earned : b.id === 'first-discovery'
    };
  });
}

// ---------------------------------------------------------------------------
// Legacy migration helper (one-time, read-only)
// ---------------------------------------------------------------------------

/**
 * Attempt to find an existing player profile from the OLD bq_users localStorage
 * array (pre-Supabase) by email.
 *
 * Used once on first Supabase login to carry over game progress.
 * Returns null if nothing is found.
 *
 * IMPORTANT: The old record's password field is STRIPPED before returning.
 */
export function findLegacyProfileByEmail(email: string): Omit<User, 'id'> | null {
  try {
    const raw = localStorage.getItem('bq_users');
    if (!raw) return null;
    const users = JSON.parse(raw) as Array<Record<string, unknown>>;
    const match = users.find(
      u => typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase()
    );
    if (!match) return null;

    // Strip password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, id: _id, ...rest } = match as Record<string, unknown>;
    return rest as Omit<User, 'id'>;
  } catch {
    return null;
  }
}

/**
 * Clean up the legacy bq_users key from localStorage after a successful migration.
 * Call this only after legacy data has been merged into the new profile.
 */
export function clearLegacyUsersKey(): void {
  try {
    localStorage.removeItem('bq_users');
    localStorage.removeItem('bq_session');
    localStorage.removeItem('bq_player_data');
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Guest profile (pre-login placeholder — not persisted between sessions)
// ---------------------------------------------------------------------------

export function getGuestProfile(): User {
  return {
    id: GUEST_KEY,
    name: 'Explorer',
    email: '',
    classYear: '',
    avatar: 'E',
    avatarIcon: '🏛️',
    xp: 0,
    level: 1,
    questsDone: 0,
    accuracy: 0,
    historyScore: 0,
    cultureScore: 0,
    geographyScore: 0,
    badges: [{ id: 'first-discovery', earned: true }],
    completedQuests: []
  };
}