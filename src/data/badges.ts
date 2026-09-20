import { Badge } from '../types';

export const allBadges: Badge[] = [
  {
    id: 'heritage-explorer',
    icon: '🏺',
    name: 'Heritage Explorer',
    desc: 'Awarded for completing Ancient India — Mission 01: The Lost Artifact. Proves foundational mastery of Indus Valley archaeological treasures.',
    criteria: 'Complete all 5 questions in Ancient India Mission 01.',
    earned: false
  },
  {
    id: 'river-navigator',
    icon: '🌊',
    name: 'River Navigator',
    desc: 'Awarded for traversing India’s legendary river systems and geographic corridors in Explore India — Level 2.',
    criteria: 'Complete the Rivers of India exploration mission with at least 80% accuracy.',
    earned: false
  },
  {
    id: 'first-discovery',
    icon: '🔍',
    name: 'First Discovery',
    desc: 'Awarded to every explorer who embarks on their journey into India’s vast historical tapestry.',
    criteria: 'Register an explorer account and start your BharatQuest journey.',
    earned: true
  },
  {
    id: 'quest-warrior',
    icon: '⚔️',
    name: 'Quest Warrior',
    desc: 'Awarded to dedicated historians who conquer multiple challenging quests across diverse civilizations.',
    criteria: 'Reach Level 5 and complete the Culture & Traditions quest.',
    earned: false
  },
  {
    id: 'scroll-master',
    icon: '📜',
    name: 'Scroll Master',
    desc: 'Awarded for demonstrating encyclopedic mastery with 100% accuracy on a full mission challenge.',
    criteria: 'Answer every question correctly on your first attempt without hints or errors.',
    earned: false
  },
  {
    id: 'champion',
    icon: '🏆',
    name: 'Champion',
    desc: 'Awarded for ascending to the coveted podium ranks of the national BharatQuest leaderboard.',
    criteria: 'Achieve a top 3 rank on the explorer leaderboard by mastering quests.',
    earned: false
  },
  {
    id: 'star-scholar',
    icon: '🌟',
    name: 'Star Scholar',
    desc: 'Awarded to supreme scholars who master all four foundational quest storylines across India.',
    criteria: 'Complete Ancient India, Explore India, Culture & Traditions, and Freedom Movement.',
    earned: false
  }
];