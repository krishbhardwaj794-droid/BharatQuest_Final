export function getPlayerLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / 500) + 1;
}

export function getNextLevelXp(level: number): number {
  return level * 500;
}

export function getCurrentLevelBaseXp(level: number): number {
  return (level - 1) * 500;
}

export const levelTitles: Record<number, string> = {
  1: 'Curious Mind',
  2: 'Novice Explorer',
  3: 'History Seeker',
  4: 'Heritage Seeker',
  5: 'Cultural Scout',
  6: 'Artifact Hunter',
  7: 'Civilization Guide',
  8: 'Ancient Scholar',
  9: 'Heritage Guardian',
  10: 'Grand Historian'
};