import * as fs from 'fs';
import * as path from 'path';
import { questsData } from '../src/data/quests';
import { missionsData } from '../src/data/missions';
import { allBadges } from '../src/data/badges';
import { ancientIndiaQuestionBank } from '../src/data/questions/ancientIndia';
import { exploreIndiaQuestionBank } from '../src/data/questions/exploreIndia';
import { cultureTraditionsQuestionBank } from '../src/data/questions/cultureTraditions';
import { freedomMovementQuestionBank } from '../src/data/questions/freedomMovement';

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeSqlArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',');
  return `'{${escaped}}'`;
}

let sql = `-- ==============================================================================
-- BHARATQUEST DATABASE MIGRATION 002: SEED DATA
-- Total Quests: 4 | Total Badges: 7 | Total Questions: 70
-- ==============================================================================

-- 1. SEED BADGES
INSERT INTO public.badges (id, icon, name, "desc", criteria, order_index)
VALUES
`;

const badgeRows = allBadges.map((b, idx) => {
  return `  (${escapeSql(b.id)}, ${escapeSql(b.icon)}, ${escapeSql(b.name)}, ${escapeSql(b.desc)}, ${escapeSql(b.criteria)}, ${idx + 1})`;
});
sql += badgeRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "desc" = EXCLUDED."desc", criteria = EXCLUDED.criteria, icon = EXCLUDED.icon;\n\n';

// 2. SEED QUESTS
sql += `-- 2. SEED QUESTS\nINSERT INTO public.quests (id, display_title, subtitle, description, difficulty, estimated_time, xp_reward, required_level, status, icon, badge_id, badge_name, tags, topic, time_limit, question_count, difficulty_tier, completion_message, order_index)\nVALUES\n`;

const questRows = questsData.map((q, idx) => {
  const mission = missionsData[q.id];
  return `  (${escapeSql(q.id)}, ${escapeSql(q.displayTitle)}, ${escapeSql(q.subtitle)}, ${escapeSql(q.description)}, ${escapeSql(q.difficulty)}, ${escapeSql(q.estimatedTime)}, ${escapeSql(q.xpReward)}, ${q.requiredLevel}, ${escapeSql(q.status)}, ${escapeSql(q.icon)}, ${escapeSql(q.badgeId)}, ${escapeSql(q.badgeName)}, ${escapeSqlArray(q.tags)}, ${escapeSql(mission?.topic || 'history')}, ${mission?.timeLimit || 300}, ${mission?.questionCount || 5}, ${escapeSql(mission?.difficultyTier || 'Basic')}, ${escapeSql(mission?.completionMessage || '')}, ${idx + 1})`;
});
sql += questRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET display_title = EXCLUDED.display_title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, estimated_time = EXCLUDED.estimated_time, xp_reward = EXCLUDED.xp_reward, required_level = EXCLUDED.required_level, status = EXCLUDED.status, icon = EXCLUDED.icon, badge_id = EXCLUDED.badge_id, badge_name = EXCLUDED.badge_name, tags = EXCLUDED.tags, topic = EXCLUDED.topic, time_limit = EXCLUDED.time_limit, question_count = EXCLUDED.question_count, difficulty_tier = EXCLUDED.difficulty_tier, completion_message = EXCLUDED.completion_message;\n\n';

// 3. SEED QUESTIONS & OPTIONS
sql += `-- 3. SEED QUESTIONS\nINSERT INTO public.questions (id, quest_id, topic, title, question, sub, clue, correct_answer, hint, fact, difficulty, image_search_title, image_search_query, order_index)\nVALUES\n`;

const allQuestionBanks = [
  { questId: 'ancient-india-01', bank: ancientIndiaQuestionBank },
  { questId: 'explore-india-02', bank: exploreIndiaQuestionBank },
  { questId: 'culture-traditions-03', bank: cultureTraditionsQuestionBank },
  { questId: 'freedom-movement-04', bank: freedomMovementQuestionBank },
];

const questionRows: string[] = [];
const optionRows: string[] = [];
let totalQ = 0;

for (const { questId, bank } of allQuestionBanks) {
  bank.forEach((q, idx) => {
    totalQ++;
    questionRows.push(
      `  (${escapeSql(q.id)}, ${escapeSql(questId)}, ${escapeSql(q.topic)}, ${escapeSql(q.title)}, ${escapeSql(q.question)}, ${escapeSql(q.sub)}, ${escapeSql(q.clue)}, ${escapeSql(q.correctAnswer)}, ${escapeSql(q.hint)}, ${escapeSql(q.fact)}, ${escapeSql(q.difficulty)}, ${escapeSql(q.imageSearch?.title)}, ${escapeSql(q.imageSearch?.query)}, ${idx + 1})`
    );

    q.options.forEach((opt, optIdx) => {
      const isCorrect = opt === q.correctAnswer;
      optionRows.push(
        `  (${escapeSql(q.id)}, ${escapeSql(opt)}, ${isCorrect ? 'TRUE' : 'FALSE'}, ${optIdx})`
      );
    });
  });
}

sql += questionRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET quest_id = EXCLUDED.quest_id, topic = EXCLUDED.topic, title = EXCLUDED.title, question = EXCLUDED.question, sub = EXCLUDED.sub, clue = EXCLUDED.clue, correct_answer = EXCLUDED.correct_answer, hint = EXCLUDED.hint, fact = EXCLUDED.fact, difficulty = EXCLUDED.difficulty, image_search_title = EXCLUDED.image_search_title, image_search_query = EXCLUDED.image_search_query;\n\n';

sql += `-- 4. SEED QUESTION OPTIONS\n`;
sql += `-- First clean up existing options for idempotency\n`;
sql += `DELETE FROM public.question_options;\n\n`;
sql += `INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)\nVALUES\n`;
sql += optionRows.join(',\n') + ';\n';

const outPath = path.resolve('supabase/migrations/002_seed_bharatquest.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Generated ${outPath} with:`);
console.log(`- ${allBadges.length} badges`);
console.log(`- ${questsData.length} quests`);
console.log(`- ${totalQ} questions`);
console.log(`- ${optionRows.length} options`);
