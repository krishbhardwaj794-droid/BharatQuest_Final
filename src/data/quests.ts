import { Quest } from '../types';

export const questsData: Quest[] = [
  {
    id: 'ancient-india-01',
    displayTitle: 'Ancient India',
    subtitle: 'The Lost Artifact · Mission 01',
    description: 'Journey back to the dawn of civilization. Unravel mysteries of the Indus Valley, Vedic age, and mighty empires through archaeological clues.',
    difficulty: 'Easy',
    estimatedTime: '~5 min',
    xpReward: '+250 XP Max',
    requiredLevel: 1,
    status: 'active',
    icon: '🏺',
    badgeId: 'heritage-explorer',
    badgeName: 'Heritage Explorer',
    tags: ['Indus Valley', 'Archeology', 'Harappa']
  },
  {
    id: 'explore-india-02',
    displayTitle: 'Explore India — Level 2',
    subtitle: 'Rivers and Landscapes',
    description: 'Traverse India’s legendary geography — from Himalayan passes to Indus tributaries, Deccan plateaus, and sacred river basins.',
    difficulty: 'Intermediate',
    estimatedTime: '10 min',
    xpReward: '+75 XP',
    requiredLevel: 4,
    status: 'locked',
    icon: '🗺️',
    badgeId: 'river-navigator',
    badgeName: 'River Navigator',
    tags: ['Geography', 'Rivers', 'Himalayas']
  },
  {
    id: 'culture-traditions-03',
    displayTitle: 'Culture & Traditions',
    subtitle: 'Classical Arts & Heritage',
    description: 'Discover the vibrant tapestry of Indian festivals, classical dance forms, musical heritages, and timeless artistic traditions across 28 states.',
    difficulty: 'Medium',
    estimatedTime: '15 min',
    xpReward: '+100 XP',
    requiredLevel: 5,
    status: 'coming',
    icon: '🎭',
    badgeId: 'quest-warrior',
    badgeName: 'Quest Warrior',
    tags: ['Festivals', 'Architecture', 'Arts']
  },
  {
    id: 'freedom-movement-04',
    displayTitle: 'Freedom Movement',
    subtitle: 'The Struggle for Swaraj',
    description: 'Walk alongside freedom fighters. Relive the landmark movements, sacrifices, and unity that birthed a modern sovereign republic.',
    difficulty: 'Advanced',
    estimatedTime: '15 min',
    xpReward: '+150 XP',
    requiredLevel: 6,
    status: 'coming',
    icon: '🇮🇳',
    badgeId: 'star-scholar',
    badgeName: 'Star Scholar',
    tags: ['Independence', 'Modern History', 'Leaders']
  }
];