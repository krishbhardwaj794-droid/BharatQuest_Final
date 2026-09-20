export type ArcadeCategory =
  | 'ALL'
  | 'PUZZLES'
  | 'ACTION'
  | 'MEMORY'
  | 'HISTORY'
  | 'CULTURE'
  | 'GEOGRAPHY'
  | '3D'
  | 'QUICK PLAY';

export type ArcadeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface ArcadeGame {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badgeTag: string;
  description: string;
  categories: ArcadeCategory[];
  difficulty: ArcadeDifficulty;
  stars: number;
  estTime: string;
  baseXp: number;
  maxXp: number;
  playable: boolean;
  themeColor: string;
}

export interface GameSessionResult {
  gameId: string;
  gameTitle: string;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  earnedXp: number;
  accuracyPct: number;
  timeTakenSeconds: number;
}

export type ArcadeScoresMap = Record<string, number>;
