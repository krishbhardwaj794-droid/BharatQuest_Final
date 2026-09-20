import { PlayerData } from '../types';
import { allBadges } from './badges';
import { getPlayerLevel, getNextLevelXp } from '../utils/levelEngine';

const initialXp = 1250;
const initialLevel = getPlayerLevel(initialXp);

export const defaultMockPlayer: PlayerData = {
  name: 'Krish',
  email: 'krish@example.com',
  classYear: 'College 2nd Year',
  avatar: 'K',
  avatarIcon: '🏛️',
  xp: initialXp,
  level: initialLevel,
  maxXp: getNextLevelXp(initialLevel),
  questsDone: 1,
  accuracy: 100,
  historyScore: 85,
  cultureScore: 75,
  geographyScore: 45,
  badges: allBadges.map(b => b.id === 'first-discovery' || b.id === 'heritage-explorer' ? { ...b, earned: true } : b),
  completedQuests: [
    {
      id: 'ancient-india-01',
      name: 'Ancient India — Mission 01',
      detail: 'Completed with 100% accuracy',
      accuracy: '100%',
      xp: '+250 XP',
      date: 'Completed',
      time: '02:45',
      badge: 'Heritage Explorer'
    }
  ]
};