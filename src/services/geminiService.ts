/**
 * geminiService.ts
 * BharatQuest — Gemini AI Integration
 * Uses @google/genai SDK (Gemini 2.0 Flash)
 *
 * Features:
 *  1. explainWrongAnswer()      — Galat answer pe historical context explanation (Quiz)
 *  2. generateAIClue()          — Smart contextual hint for a question (Quiz)
 *  3. getAIStudyPlan()          — Personalized study plan (Recommendations)
 *  4. generateAIQuestion()      — AI-generated question on a given topic
 *  5. generateRapidFireQuestions() — Fresh MCQ questions for RapidFire arcade
 *  6. getEpochFunFact()         — Fun fact when TimeTravel epoch is placed correctly
 *  7. explainCultureMatch()     — Explanation for CultureMatch wrong pair
 *  8. explainArtifact()         — Archaeological context when ArtifactPuzzle is solved
 *  9. explainMemoryMonument()   — Heritage info when HeritageMemory pair is matched
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

const MODEL = 'gemini-2.0-flash';

// ─────────────────────────────────────────────────────────
// 1. WRONG ANSWER EXPLANATION
//    Galat jawab dene ke baad Gemini historical context batata hai
// ─────────────────────────────────────────────────────────
export interface WrongAnswerExplanation {
  explanation: string;   // Why correct answer is right
  context: string;       // Historical background
  funFact: string;       // Interesting related fact
}

export async function explainWrongAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  topic: string
): Promise<WrongAnswerExplanation> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian history, culture, and geography.

A student answered a quiz question incorrectly. Help them learn!

Question: "${question}"
Student's wrong answer: "${userAnswer}"
Correct answer: "${correctAnswer}"
Topic: ${topic}

Respond ONLY with valid JSON in this exact format:
{
  "explanation": "2-3 sentence explanation of why '${correctAnswer}' is the correct answer",
  "context": "1-2 sentences of historical context or background about this topic",
  "funFact": "One surprising or interesting fact related to this topic"
}

Keep language simple, engaging, and educational. Do not use markdown. Only JSON.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as WrongAnswerExplanation;
    }
    throw new Error('No JSON in response');
  } catch (err) {
    console.error('Gemini explainWrongAnswer error:', err);
    return {
      explanation: `The correct answer is "${correctAnswer}". Review this topic to strengthen your knowledge.`,
      context: `This question is related to ${topic} in Indian heritage.`,
      funFact: 'India has one of the richest and most diverse historical legacies in the world!'
    };
  }
}

// ─────────────────────────────────────────────────────────
// 2. AI DYNAMIC CLUE
//    Question ke liye Gemini smart contextual hint generate karta hai
// ─────────────────────────────────────────────────────────
export async function generateAIClue(
  question: string,
  options: string[],
  correctAnswer: string,
  topic: string
): Promise<string> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian history, culture, and geography.

Generate a helpful hint for this quiz question WITHOUT revealing the answer directly.

Question: "${question}"
Options: ${options.join(', ')}
Topic: ${topic}

Write ONE sentence hint that:
- Narrows down the answer without giving it away
- Uses a historical clue, date range, or associated concept
- Is engaging and educational
- Does NOT mention the correct answer "${correctAnswer}" directly

Respond with ONLY the hint text. No JSON, no markdown, no extra text.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const hint = response.text?.trim() || '';
    return hint || `Think about the historical significance of ${topic} in ancient India.`;
  } catch (err) {
    console.error('Gemini generateAIClue error:', err);
    return `Think carefully about the historical context of ${topic}.`;
  }
}

// ─────────────────────────────────────────────────────────
// 3. AI STUDY PLAN
//    User ke weak topics ke basis par personalized study plan
// ─────────────────────────────────────────────────────────
export interface AIStudyPlan {
  summary: string;
  recommendations: string[];
  motivationMessage: string;
}

export async function getAIStudyPlan(
  weakTopics: { name: string; accuracy: number; attempts: number }[],
  strongTopics: { name: string; accuracy: number }[],
  playerName: string
): Promise<AIStudyPlan> {
  try {
    const weakList = weakTopics.map(t => `${t.name} (${t.accuracy}% accuracy, ${t.attempts} attempts)`).join(', ');
    const strongList = strongTopics.map(t => `${t.name} (${t.accuracy}%)`).join(', ') || 'None yet';

    const prompt = `You are BharatGuru — an expert on Indian history, culture, and geography and an encouraging tutor.

Create a personalized study plan for a student named "${playerName}".

Their performance:
- Weak areas (needs practice): ${weakList || 'No data yet'}
- Strong areas: ${strongList}

Respond ONLY with valid JSON:
{
  "summary": "1-2 sentence personal overview of their learning journey",
  "recommendations": [
    "Specific tip 1 for improvement",
    "Specific tip 2 for improvement",
    "Specific tip 3 for improvement"
  ],
  "motivationMessage": "One encouraging sentence to keep them going"
}

Be specific, warm, and encouraging. Mention Indian history topics by name. Only JSON.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIStudyPlan;
    }
    throw new Error('No JSON in response');
  } catch (err) {
    console.error('Gemini getAIStudyPlan error:', err);
    return {
      summary: `Keep exploring Indian history, ${playerName}! Every quest builds your knowledge.`,
      recommendations: [
        'Practice history topics — focus on ancient Indian dynasties and empires.',
        'Explore cultural traditions and festivals to boost your Culture score.',
        'Review India\'s geography — rivers, mountains, and ancient trade routes.'
      ],
      motivationMessage: 'Great explorers are made through consistent practice — you\'re on the right path! 🏛️'
    };
  }
}

// ─────────────────────────────────────────────────────────
// 4. AI QUESTION GENERATOR
//    Naye topic pe Gemini instant question generate karta hai
// ─────────────────────────────────────────────────────────
export interface AIGeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export async function generateAIQuestion(
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): Promise<AIGeneratedQuestion | null> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian history, culture, and geography.

Generate a ${difficulty} multiple-choice quiz question about: "${topic}"

Respond ONLY with valid JSON:
{
  "question": "The quiz question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact correct option text (must match one of the options)",
  "explanation": "Brief explanation of why this is the correct answer",
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}

Rules:
- Question must be factual and about Indian history/culture/geography
- All 4 options must be plausible
- correctAnswer must exactly match one of the 4 options
- Only JSON. No markdown.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as AIGeneratedQuestion;
      // Validate correctAnswer is in options
      if (parsed.options.includes(parsed.correctAnswer)) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.error('Gemini generateAIQuestion error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// 5. RAPID FIRE — AI-GENERATED QUESTIONS
//    Fresh MCQ questions for every RapidFire game session
// ─────────────────────────────────────────────────────────
export interface RapidFireQuestion {
  q: string;
  options: string[];
  ans: string;
}

export async function generateRapidFireQuestions(count: number = 8): Promise<RapidFireQuestion[]> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian history, culture, and geography.

Generate ${count} unique, fast-paced multiple-choice quiz questions about Indian history, culture, geography, or famous personalities. These are for a 60-second rapid-fire game!

Respond ONLY with valid JSON array:
[
  {
    "q": "Short, punchy question (max 12 words)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "ans": "Exact text of correct option (must match one of options)"
  }
]

Rules:
- All questions must be different topics (no repeats)
- Questions must be factual about India
- Keep questions SHORT (max 12 words for fast reading)
- All 4 options must be plausible
- ans must exactly match one of the 4 options
- Cover mix of: monuments, rivers, history, festivals, geography, leaders
- Only JSON array. No markdown, no extra text.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as RapidFireQuestion[];
      // Validate each question
      const valid = parsed.filter(q =>
        q.q && q.options?.length === 4 && q.ans && q.options.includes(q.ans)
      );
      if (valid.length >= 4) return valid;
    }
    return [];
  } catch (err) {
    console.error('Gemini generateRapidFireQuestions error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────
// 6. TIME TRAVEL — EPOCH FUN FACT
//    Jab koi epoch sahi jagah pe rakhe, Gemini ek fun fact batata hai
// ─────────────────────────────────────────────────────────
export async function getEpochFunFact(epochName: string, period: string): Promise<string> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian history.

Give ONE fascinating, surprising fun fact about this historical era that most people don't know.

Era: "${epochName}" (${period})

Rules:
- Exactly 1-2 sentences
- Must be surprising or little-known
- Factual and specific (include numbers, names, or records if possible)
- Do NOT start with "Did you know"
- Only plain text. No markdown, no JSON.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text?.trim() || `${epochName} left a profound legacy on Indian civilization!`;
  } catch (err) {
    console.error('Gemini getEpochFunFact error:', err);
    return `${epochName} was a pivotal era that shaped the course of Indian history.`;
  }
}

// ─────────────────────────────────────────────────────────
// 7. CULTURE MATCH — WRONG PAIR EXPLANATION
//    Galat match pe Gemini batata hai sahi connection kya hai
// ─────────────────────────────────────────────────────────
export async function explainCultureMatch(
  item: string,
  correctTarget: string,
  wrongTarget: string
): Promise<string> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian culture and heritage.

A student incorrectly matched a cultural tradition to the wrong state.

Cultural Item: "${item}"
Student guessed: "${wrongTarget}" (WRONG)
Correct answer: "${correctTarget}"

Write ONE sentence explaining WHY "${item}" belongs to "${correctTarget}" specifically.
Be specific, mention historical or cultural reasons.
Only plain text. No markdown, no JSON. Max 20 words.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text?.trim() || `${item} originates from ${correctTarget}!`;
  } catch (err) {
    console.error('Gemini explainCultureMatch error:', err);
    return `${item} belongs to ${correctTarget}.`;
  }
}

// ─────────────────────────────────────────────────────────
// 8. ARTIFACT PUZZLE — SOLVED EXPLANATION
//    Puzzle complete hone pe Gemini artifact ka historical context batata hai
// ─────────────────────────────────────────────────────────
export async function explainArtifact(
  artifactName: string,
  period: string
): Promise<string> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian archaeology and history.

The student has just restored the "${artifactName}" from ${period}.

Write 2 sentences about this artifact:
1. What it tells us about the civilization that made it
2. One surprising or remarkable fact about it

Only plain text. No markdown, no JSON.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text?.trim() || `The ${artifactName} is a remarkable piece of Indian heritage from ${period}.`;
  } catch (err) {
    console.error('Gemini explainArtifact error:', err);
    return `The ${artifactName} from ${period} reveals the sophistication of ancient Indian civilization.`;
  }
}

// ─────────────────────────────────────────────────────────
// 9. HERITAGE MEMORY — MONUMENT FACT
//    Matching pair milne ke baad Gemini monument ke baare mein batata hai
// ─────────────────────────────────────────────────────────
export async function explainMemoryMonument(
  monumentName: string,
  location: string
): Promise<string> {
  try {
    const prompt = `You are BharatGuru — an expert on Indian heritage and monuments.

The student just matched "${monumentName}" located in "${location}".

Write ONE fascinating sentence about this monument — something specific, surprising, or little-known.
Max 20 words. Only plain text. No markdown, no JSON.`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text?.trim() || `${monumentName} in ${location} is one of India's greatest heritage treasures!`;
  } catch (err) {
    console.error('Gemini explainMemoryMonument error:', err);
    return `${monumentName} in ${location} stands as a testament to India's rich cultural legacy.`;
  }
}

