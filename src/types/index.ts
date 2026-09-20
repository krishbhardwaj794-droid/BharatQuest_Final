export type ScreenType =
  | 'auth'
  | 'home'
  | 'quests'
  | 'brief'
  | 'challenge'
  | 'result'
  | 'recommendation'
  | 'progress'
  | 'leaderboard'
  | 'arcade';

export type MissionInfoType = 'difficulty' | 'time' | 'reward' | 'badge';

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  criteria: string;
  earned: boolean;
}

export type QuestStatus = 'active' | 'locked' | 'coming';

export interface Quest {
  id: string;
  displayTitle: string;
  subtitle: string;
  description: string;
  difficulty: 'Easy' | 'Intermediate' | 'Medium' | 'Advanced';
  estimatedTime: string;
  xpReward: string;
  requiredLevel: number;
  status: QuestStatus;
  icon: string;
  badgeId: string;
  badgeName: string;
  tags: string[];
}

export interface CompletedQuest {
  id: string;
  name: string;
  detail: string;
  accuracy: string;
  xp: string;
  date: string;
  time: string;
  badge: string;
  cluesUsed?: number;
}

export interface PlayerData {
  name: string;
  email: string;
  classYear: string;
  avatar: string;
  avatarIcon: string;
  xp: number;
  level: number;
  maxXp: number;
  questsDone: number;
  accuracy: number;
  historyScore: number;
  cultureScore: number;
  geographyScore: number;
  badges: Badge[];
  completedQuests: CompletedQuest[];
}

export interface User {
  id: string;          // Supabase auth user.id (UUID)
  name: string;
  email: string;
  // NOTE: password field removed — Supabase Auth manages credentials.
  // Passwords are NEVER stored by BharatQuest.
  classYear: string;
  avatar: string;
  avatarIcon: string;
  xp: number;
  level: number;
  questsDone: number;
  accuracy: number;
  historyScore: number;
  cultureScore: number;
  geographyScore: number;
  badges: { id: string; earned: boolean }[];
  completedQuests: CompletedQuest[];
}

// SessionData removed — Supabase Auth manages session tokens internally.

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  requiresEmailConfirmation?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  badge: string;
  isMe?: boolean;
}

export interface TopicScore {
  name: string;
  score: number;
  status: 'Strong' | 'Good Progress' | 'Developing' | 'Needs Practice';
  questId: string;
  questTitle: string;
}

export interface QuestionImageSearch {
  title: string;
  query: string;
}

export interface Question {
  id: string;
  topic: string;
  title: string;
  question: string;
  sub: string;
  clue: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  fact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  imageSearch?: QuestionImageSearch;
}

export interface Mission {
  id: string;
  title: string;
  shortTitle: string;
  categoryTag: string;
  theme: string;
  topic: 'history' | 'geography' | 'culture';
  difficultyTier?: 'Basic' | 'Intermediate' | 'Advanced';
  timeLimit: number;
  questionCount: number;
  questionBank: Question[];
  badgeId: string;
  badgeName: string;
  completionMessage: string;
}

export interface QuestionHistoryItem {
  questionId: string;
  shownAt: number;
}