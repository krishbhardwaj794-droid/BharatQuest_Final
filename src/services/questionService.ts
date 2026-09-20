import { supabase } from './supabase';
import { Question } from '../types';
import { selectMissionQuestions } from '../utils/questionSelector';

interface DbQuestionRow {
  id: string;
  quest_id: string;
  topic: string | null;
  title: string | null;
  question: string;
  sub: string | null;
  clue: string | null;
  correct_answer: string;
  hint: string | null;
  fact: string | null;
  difficulty: string | null;
  image_search_title: string | null;
  image_search_query: string | null;
  order_index: number | null;
  question_options?: {
    id: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }[];
}

export function mapDbQuestionToQuestion(row: DbQuestionRow): Question {
  const options = row.question_options && row.question_options.length > 0
    ? [...row.question_options].sort((a, b) => a.order_index - b.order_index).map(o => o.option_text)
    : [];

  return {
    id: row.id,
    topic: row.topic || '',
    title: row.title || '',
    question: row.question,
    sub: row.sub || '',
    clue: row.clue || '',
    options: options.length > 0 ? options : [row.correct_answer, 'Option B', 'Option C', 'Option D'],
    correctAnswer: row.correct_answer,
    hint: row.hint || '',
    fact: row.fact || '',
    difficulty: (row.difficulty as Question['difficulty']) || 'Medium',
    imageSearch: row.image_search_title && row.image_search_query ? {
      title: row.image_search_title,
      query: row.image_search_query
    } : undefined
  };
}

/**
 * Fetch questions for a quest directly from Supabase PostgreSQL API,
 * applying dynamic anti-repeat history selection and difficulty filtering.
 */
export async function getMissionQuestionsFromDb(
  questId: string,
  count: number = 5,
  userEmail?: string,
  difficultyTier?: 'Basic' | 'Intermediate' | 'Advanced'
): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .eq('quest_id', questId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[questionService] Supabase API query error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn(`[questionService] No questions found in Supabase for quest: ${questId}`);
      return [];
    }

    const allQuestions: Question[] = data.map(mapDbQuestionToQuestion);

    // Apply the anti-repeat selector and difficulty preference
    return selectMissionQuestions(allQuestions, count, userEmail, difficultyTier);
  } catch (err) {
    console.error('[questionService] Exception querying questions via Supabase API:', err);
    return [];
  }
}
