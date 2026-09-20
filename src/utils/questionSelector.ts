import { Question, QuestionHistoryItem } from '../types';
import { shuffleArray } from './shuffle';

export const COOLDOWN_DAYS = 7;
export const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export function getQuestionHistory(email?: string): QuestionHistoryItem[] {
  try {
    const key = email ? `bq_qhist_${email.toLowerCase()}` : 'bq_question_history';
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveQuestionHistory(history: QuestionHistoryItem[], email?: string): void {
  try {
    const key = email ? `bq_qhist_${email.toLowerCase()}` : 'bq_question_history';
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save question history', e);
  }
}

export function selectMissionQuestions(
  questionBank: Question[],
  count: number,
  email?: string,
  difficultyTier?: 'Basic' | 'Intermediate' | 'Advanced' | string
): Question[] {
  const history = getQuestionHistory(email);
  const now = Date.now();

  // Tier-based difficulty preference
  let prioritizedBank = questionBank;
  if (difficultyTier === 'Basic') {
    const easyMed = questionBank.filter(q => q.difficulty === 'Easy' || q.difficulty === 'Medium');
    if (easyMed.length >= count) prioritizedBank = easyMed;
  } else if (difficultyTier === 'Intermediate') {
    const medEasy = questionBank.filter(q => q.difficulty === 'Medium' || q.difficulty === 'Hard');
    if (medEasy.length >= count) prioritizedBank = medEasy;
  } else if (difficultyTier === 'Advanced') {
    const hardMed = questionBank.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Medium');
    if (hardMed.length >= count) prioritizedBank = hardMed;
  }

  // Map questionId -> latest shown timestamp
  const historyMap: Record<string, number> = {};
  history.forEach(item => {
    if (!historyMap[item.questionId] || item.shownAt > historyMap[item.questionId]) {
      historyMap[item.questionId] = item.shownAt;
    }
  });

  const freshPool: Question[] = [];
  const recentPool: { question: Question; shownAt: number }[] = [];

  prioritizedBank.forEach(q => {
    const lastShown = historyMap[q.id];
    if (!lastShown || (now - lastShown) >= COOLDOWN_MS) {
      freshPool.push(q);
    } else {
      recentPool.push({ question: q, shownAt: lastShown });
    }
  });

  let selected: Question[] = [];

  // 1. Fresh pool has enough questions
  if (freshPool.length >= count) {
    selected = shuffleArray(freshPool).slice(0, count);
  } else {
    // 2. Pool exhaustion fallback: take all fresh questions + oldest shown recent questions
    selected = [...freshPool];
    recentPool.sort((a, b) => a.shownAt - b.shownAt);

    for (let i = 0; i < recentPool.length && selected.length < count; i++) {
      selected.push(recentPool[i].question);
    }
  }

  // 3. Fallback safety
  if (selected.length < count) {
    const remaining = questionBank.filter(q => !selected.some(s => s.id === q.id));
    selected = selected.concat(shuffleArray(remaining).slice(0, count - selected.length));
  }

  // Final random shuffle so presentation order is fresh
  selected = shuffleArray(selected);

  // Record selected questions into history
  const newHistory = [...history];
  selected.forEach(q => {
    newHistory.push({ questionId: q.id, shownAt: now });
  });

  if (newHistory.length > 250) {
    newHistory.splice(0, newHistory.length - 250);
  }
  saveQuestionHistory(newHistory, email);

  return selected;
}