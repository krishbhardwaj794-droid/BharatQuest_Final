import { supabase } from './supabase';
import { Quest } from '../types';
import { getQuests } from './questService';
import { fetchUserCompletionsFromDb } from './attemptService';

export type TopicRating =
  | 'No Data Yet'
  | 'Not enough data'
  | 'Needs Practice'
  | 'Keep Improving'
  | 'Strong'
  | 'Mastered';

export interface TopicMetric {
  topic: 'history' | 'culture' | 'geography';
  name: string;
  icon: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  status: TopicRating;
  label: string;
  statusClass: 'no-data' | 'not-enough' | 'needs-practice' | 'developing' | 'good' | 'strong' | 'mastered';
  gradient: string;
  hasEnoughData: boolean;
}

export interface TopicPerformanceResult {
  topics: {
    history: TopicMetric;
    culture: TopicMetric;
    geography: TopicMetric;
  };
  history: TopicMetric;
  culture: TopicMetric;
  geography: TopicMetric;
  weakestTopic: TopicMetric | null;
  strongestTopic: TopicMetric | null;
  totalAttempts: number;
  hasEnoughData: boolean;
  isNewUser: boolean;
}

export interface QuestRecommendation {
  recommendedQuest: Quest | null;
  reason: string;
  weakestTopic: TopicMetric | null;
  strongestTopic: TopicMetric | null;
  isNewUser: boolean;
  insightMessage: string;
  progressionNotice: string;
}

const QUEST_TOPIC_MAP: Record<string, 'history' | 'culture' | 'geography'> = {
  'ancient-india-01': 'history',
  'explore-india-02': 'geography',
  'culture-traditions-03': 'culture',
  'freedom-movement-04': 'history'
};

function createDefaultMetric(
  topic: 'history' | 'culture' | 'geography',
  name: string,
  icon: string
): TopicMetric {
  return {
    topic,
    name,
    icon,
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    status: 'No Data Yet',
    label: 'NO DATA YET',
    statusClass: 'no-data',
    gradient: 'linear-gradient(90deg, #64748B, #475569)',
    hasEnoughData: false
  };
}

/**
 * Calculate dynamic, user-specific topic performance by querying the Supabase attempts table.
 */
export async function getUserTopicPerformance(userId: string): Promise<TopicPerformanceResult> {
  const result: TopicPerformanceResult = {
    topics: {
      history: createDefaultMetric('history', 'History', '📜'),
      culture: createDefaultMetric('culture', 'Culture', '🎭'),
      geography: createDefaultMetric('geography', 'Geography', '🗺️')
    },
    history: createDefaultMetric('history', 'History', '📜'),
    culture: createDefaultMetric('culture', 'Culture', '🎭'),
    geography: createDefaultMetric('geography', 'Geography', '🗺️'),
    weakestTopic: null,
    strongestTopic: null,
    totalAttempts: 0,
    hasEnoughData: false,
    isNewUser: true
  };

  if (!userId) return result;

  try {
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('id, quest_id, question_id, is_correct, used_hint, answered_at')
      .eq('user_id', userId);

    if (error || !attempts || attempts.length === 0) {
      return result;
    }

    result.totalAttempts = attempts.length;
    result.isNewUser = false;

    // Aggregate attempts by topic
    const counts: Record<'history' | 'culture' | 'geography', { total: number; correct: number }> = {
      history: { total: 0, correct: 0 },
      culture: { total: 0, correct: 0 },
      geography: { total: 0, correct: 0 }
    };

    attempts.forEach(a => {
      let t: 'history' | 'culture' | 'geography' = QUEST_TOPIC_MAP[a.quest_id] || 'history';
      if (a.quest_id.includes('explore') || a.quest_id.includes('river')) t = 'geography';
      else if (a.quest_id.includes('culture') || a.quest_id.includes('tradition')) t = 'culture';

      counts[t].total++;
      if (a.is_correct) counts[t].correct++;
    });

    const evaluateTopic = (
      topicKey: 'history' | 'culture' | 'geography',
      name: string,
      icon: string
    ): TopicMetric => {
      const data = counts[topicKey];
      const total = data.total;
      const correct = data.correct;

      if (total === 0) {
        return createDefaultMetric(topicKey, name, icon);
      }

      const accuracy = Math.round((correct / total) * 100);

      if (total < 3) {
        return {
          topic: topicKey,
          name,
          icon,
          totalAttempts: total,
          correctAttempts: correct,
          accuracy,
          status: 'Not enough data',
          label: 'NOT ENOUGH DATA',
          statusClass: 'not-enough',
          gradient: 'linear-gradient(90deg, #EAB308, #CA8A04)',
          hasEnoughData: false
        };
      }

      if (accuracy < 50) {
        return {
          topic: topicKey,
          name,
          icon,
          totalAttempts: total,
          correctAttempts: correct,
          accuracy,
          status: 'Needs Practice',
          label: 'NEEDS PRACTICE',
          statusClass: 'needs-practice',
          gradient: 'linear-gradient(90deg, #EF4444, #DC2626)',
          hasEnoughData: true
        };
      }

      if (accuracy < 75) {
        return {
          topic: topicKey,
          name,
          icon,
          totalAttempts: total,
          correctAttempts: correct,
          accuracy,
          status: 'Keep Improving',
          label: 'KEEP IMPROVING',
          statusClass: 'developing',
          gradient: 'linear-gradient(90deg, #F97316, #EA580C)',
          hasEnoughData: true
        };
      }

      if (accuracy < 90) {
        return {
          topic: topicKey,
          name,
          icon,
          totalAttempts: total,
          correctAttempts: correct,
          accuracy,
          status: 'Strong',
          label: 'STRONG',
          statusClass: 'good',
          gradient: 'linear-gradient(90deg, #22C55E, #16A34A)',
          hasEnoughData: true
        };
      }

      return {
        topic: topicKey,
        name,
        icon,
        totalAttempts: total,
        correctAttempts: correct,
        accuracy,
        status: 'Mastered',
        label: 'MASTERED',
        statusClass: 'mastered',
        gradient: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
        hasEnoughData: true
      };
    };

    const histMetric = evaluateTopic('history', 'History', '📜');
    const cultMetric = evaluateTopic('culture', 'Culture', '🎭');
    const geoMetric = evaluateTopic('geography', 'Geography', '🗺️');

    result.topics.history = histMetric;
    result.topics.culture = cultMetric;
    result.topics.geography = geoMetric;
    result.history = histMetric;
    result.culture = cultMetric;
    result.geography = geoMetric;

    // Determine Weakest Topic (lowest accuracy among topics with enough data)
    const topicsWithData = [histMetric, cultMetric, geoMetric].filter(t => t.totalAttempts > 0);
    const topicsWithEnoughData = topicsWithData.filter(t => t.hasEnoughData);
    const allThree = [histMetric, cultMetric, geoMetric];

    // Strongest: highest accuracy among ALL attempted topics
    if (topicsWithData.length > 0) {
      const sorted = [...topicsWithData].sort((a, b) => b.accuracy - a.accuracy || b.totalAttempts - a.totalAttempts);
      result.strongestTopic = sorted[0];
    }

    // Weakest: prefer topics with NO data yet (encourage exploration),
    // then topics with enough data but low accuracy,
    // finally fall back to lowest-accuracy attempted topic
    const notAttempted = allThree.filter(t => t.totalAttempts === 0);
    if (notAttempted.length > 0) {
      // Show "No Data Yet" topics as the area to strengthen
      result.weakestTopic = notAttempted[0]; // e.g. Culture or Geography not yet explored
    } else if (topicsWithEnoughData.length > 0) {
      // All topics have data — pick lowest accuracy
      const sortedByWeak = [...topicsWithEnoughData].sort((a, b) => a.accuracy - b.accuracy);
      result.weakestTopic = sortedByWeak[0];
    } else {
      // All topics attempted but none meet 3-attempt threshold
      const sortedByWeak = [...topicsWithData].sort((a, b) => a.accuracy - b.accuracy);
      result.weakestTopic = sortedByWeak[0];
    }

    // Prevent strongest === weakest (same topic in both cards)
    if (
      result.strongestTopic &&
      result.weakestTopic &&
      result.strongestTopic.topic === result.weakestTopic.topic
    ) {
      // Find a different topic for weakest
      const others = allThree.filter(t => t.topic !== result.strongestTopic!.topic);
      if (others.length > 0) {
        // Prefer not-attempted, then lowest-accuracy
        const notAttemptedOthers = others.filter(t => t.totalAttempts === 0);
        result.weakestTopic = notAttemptedOthers.length > 0
          ? notAttemptedOthers[0]
          : others.sort((a, b) => a.accuracy - b.accuracy)[0];
      }
    }

    result.hasEnoughData = topicsWithEnoughData.length > 0 || topicsWithData.length > 0;

    return result;

  } catch (err) {
    console.error('[recommendationService] Error computing topic performance:', err);
    return result;
  }
}

/**
 * Generate a genuinely personalized quest recommendation based on the user's
 * real database attempts, topic weaknesses, and completion history.
 */
export async function getPersonalizedRecommendations(userId: string): Promise<QuestRecommendation> {
  const perf = await getUserTopicPerformance(userId);
  const allQuests = await getQuests();
  const completions = userId ? await fetchUserCompletionsFromDb(userId) : [];

  // 1. New User with 0 attempts: Recommend the starter quest
  if (perf.isNewUser || perf.totalAttempts === 0) {
    const starterQuest = allQuests.find(q => q.id === 'ancient-india-01') || allQuests[0] || null;
    return {
      recommendedQuest: starterQuest,
      reason: 'Start exploring ancient history to establish your archaeological skill baseline.',
      weakestTopic: null,
      strongestTopic: null,
      isNewUser: true,
      insightMessage: 'Welcome, Explorer! No quiz attempts recorded yet. Embark on your first quest to unlock live topic analytics and adaptive recommendations.',
      progressionNotice: 'Starter Mission: Decipher the artifacts and cities of the Indus Valley to begin your journey.'
    };
  }

  // 2. Existing User: Identify target topic from weakest performance
  const targetTopicKey = perf.weakestTopic?.topic || 'history';
  const completedIds = new Set(completions.map(c => c.id));
  const lastCompletedId = completions.length > 0 ? completions[0].id : null;

  // Filter candidate quests matching the target topic
  let candidates = allQuests.filter(q => {
    const qTopic = QUEST_TOPIC_MAP[q.id] || 'history';
    return qTopic === targetTopicKey;
  });

  // Exclude the quest the user just completed to avoid immediate repetition
  let eligible = candidates.filter(q => q.id !== lastCompletedId);

  // Prefer quests that have not yet been completed
  const uncompletedEligible = eligible.filter(q => !completedIds.has(q.id));
  if (uncompletedEligible.length > 0) {
    eligible = uncompletedEligible;
  }

  // If no candidates in target topic, look at uncompleted quests across all topics
  if (eligible.length === 0) {
    const uncompletedOther = allQuests.filter(q => !completedIds.has(q.id) && q.id !== lastCompletedId);
    if (uncompletedOther.length > 0) {
      eligible = uncompletedOther;
    } else {
      eligible = allQuests.filter(q => q.id !== lastCompletedId);
      if (eligible.length === 0) eligible = allQuests;
    }
  }

  const recommendedQuest = eligible[0] || allQuests[0] || null;

  const strongest = perf.strongestTopic;
  const weakest = perf.weakestTopic;

  let insightMessage = '';
  if (strongest && weakest && strongest.topic !== weakest.topic) {
    const weakAcc = weakest.totalAttempts === 0 ? 'No attempts yet' : (weakest.accuracy + '%');
    const weakStatus = weakest.totalAttempts === 0 ? 'not yet explored' : weakest.status.toLowerCase();
    insightMessage = `Based on your ${perf.totalAttempts} answered questions, your mastery in ${strongest.name} (${strongest.accuracy}%) is ${strongest.status.toLowerCase()}. The adaptive engine recommends exploring ${weakest.name} (${weakAcc} — ${weakStatus}) to build a well-rounded scholar profile.`;
  } else if (strongest && weakest && strongest.topic === weakest.topic) {
    // Only one topic attempted so far
    insightMessage = `You've answered ${perf.totalAttempts} questions in ${strongest.name} (${strongest.accuracy}%). Try exploring Culture and Geography quests to unlock comprehensive mastery across all topics!`;
  } else if (weakest) {
    insightMessage = `Based on your ${perf.totalAttempts} answered questions, targeting ${weakest.name} (${weakest.accuracy}%) will help balance your explorer mastery.`;
  } else {
    insightMessage = `You have completed ${perf.totalAttempts} questions. Keep exploring diverse historical chronicles to unlock deeper mastery rankings.`;
  }

  const progressionNotice = recommendedQuest
    ? `Adaptive Recommendation: Target ${recommendedQuest.displayTitle} to reinforce ${weakest ? weakest.name : 'knowledge'} and advance immediately.`
    : 'Select any active quest to continue your journey.';

  return {
    recommendedQuest,
    reason: weakest ? (`Strengthen ${weakest.name} (${weakest.status})`) : 'Continue historical exploration',
    weakestTopic: weakest,
    strongestTopic: strongest,
    isNewUser: false,
    insightMessage,
    progressionNotice
  };
}

