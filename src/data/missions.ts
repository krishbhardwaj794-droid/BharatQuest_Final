import { Mission } from '../types';
import { ancientIndiaQuestionBank } from './questions/ancientIndia';
import { exploreIndiaQuestionBank } from './questions/exploreIndia';
import { cultureTraditionsQuestionBank } from './questions/cultureTraditions';
import { freedomMovementQuestionBank } from './questions/freedomMovement';

export const missionsData: Record<string, Mission> = {
  'ancient-india-01': {
    id: 'ancient-india-01',
    title: 'Ancient India — Mission 01: The Lost Artifact',
    shortTitle: 'Ancient India · Mission 01',
    categoryTag: '🏺 Ancient India · Mission 01',
    theme: 'Ancient India',
    topic: 'history',
    difficultyTier: 'Basic',
    timeLimit: 300,        // 5 minutes = 300s
    questionCount: 5,      // Exactly 5 questions
    questionBank: ancientIndiaQuestionBank,
    badgeId: 'heritage-explorer',
    badgeName: 'Heritage Explorer',
    completionMessage: 'You have successfully decoded the archaeological secrets of the Indus Valley!'
  },
  'explore-india-02': {
    id: 'explore-india-02',
    title: 'Explore India — Level 2: Rivers of India — The Journey of Water',
    shortTitle: 'Explore India · Level 2',
    categoryTag: '🌊 Explore India · Level 2 · Rivers of India',
    theme: 'Indian Geography',
    topic: 'geography',
    difficultyTier: 'Intermediate',
    timeLimit: 180,        // 3 minutes = 180s
    questionCount: 3,      // Exactly 3 questions
    questionBank: exploreIndiaQuestionBank,
    badgeId: 'river-navigator',
    badgeName: 'River Navigator',
    completionMessage: 'You have successfully navigated the sacred and lifeline river networks of India!'
  },
  'culture-traditions-03': {
    id: 'culture-traditions-03',
    title: 'Culture & Traditions — Level 3: Living Heritages',
    shortTitle: 'Culture & Traditions',
    categoryTag: '🎭 Culture & Traditions',
    theme: 'Indian Culture',
    topic: 'culture',
    difficultyTier: 'Intermediate',
    timeLimit: 300,
    questionCount: 5,
    questionBank: cultureTraditionsQuestionBank,
    badgeId: 'quest-warrior',
    badgeName: 'Quest Warrior',
    completionMessage: 'You celebrated and mastered the vibrant classical and folk traditions of India!'
  },
  'freedom-movement-04': {
    id: 'freedom-movement-04',
    title: 'Freedom Movement — Level 4: The Struggle for Swaraj',
    shortTitle: 'Freedom Movement',
    categoryTag: '🇮🇳 Freedom Movement',
    theme: 'Modern History',
    topic: 'history',
    difficultyTier: 'Advanced',
    timeLimit: 300,
    questionCount: 5,
    questionBank: freedomMovementQuestionBank,
    badgeId: 'star-scholar',
    badgeName: 'Star Scholar',
    completionMessage: 'You relived the monumental sacrifices and triumphs that birthed free India!'
  }
};