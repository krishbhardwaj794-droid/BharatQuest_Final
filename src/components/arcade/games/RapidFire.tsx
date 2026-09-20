import React, { useState, useEffect, useRef } from 'react';
import { generateRapidFireQuestions, RapidFireQuestion } from '../../../services/geminiService';

interface RapidFireProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

// Fallback questions if Gemini is unavailable
const FALLBACK_QUESTIONS: RapidFireQuestion[] = [
  { q: "Where was the ancient Great Bath discovered?", options: ["Mohenjo-daro", "Lothal", "Sanchi", "Varanasi"], ans: "Mohenjo-daro" },
  { q: "Which classical dance originates in Tamil Nadu?", options: ["Bharatanatyam", "Kathakali", "Bihu", "Sattriya"], ans: "Bharatanatyam" },
  { q: "What was the capital of the Mauryan Empire?", options: ["Pataliputra", "Ujjain", "Madurai", "Delhi"], ans: "Pataliputra" },
  { q: "Which sacred river originates from Gangotri Glacier?", options: ["Bhagirathi / Ganga", "Yamuna", "Kaveri", "Narmada"], ans: "Bhagirathi / Ganga" },
  { q: "Who authored the Arthashastra on statecraft?", options: ["Chanakya", "Kalidasa", "Aryabhata", "Varahamihira"], ans: "Chanakya" },
  { q: "Which UNESCO Harappan site is in Gujarat?", options: ["Dholavira", "Kalibangan", "Rakhigarhi", "Harappa"], ans: "Dholavira" },
  { q: "Where did the 1919 Jallianwala Bagh tragedy occur?", options: ["Amritsar", "Lahore", "Delhi", "Meerut"], ans: "Amritsar" },
  { q: "Which river is known as 'Dakshin Ganga'?", options: ["Godavari", "Krishna", "Kaveri", "Mahanadi"], ans: "Godavari" },
  { q: "Who is known as the 'Iron Man of India'?", options: ["Sardar Patel", "Subhas Bose", "Bhagat Singh", "Bal Tilak"], ans: "Sardar Patel" },
  { q: "What is the world's largest inhabited river island?", options: ["Majuli", "Sundarbans", "Diu", "Munroe"], ans: "Majuli" },
  { q: "Which classical dance features elaborate green face makeup?", options: ["Kathakali", "Kathak", "Manipuri", "Odissi"], ans: "Kathakali" },
  { q: "Who led the historic 1930 Salt March to Dandi?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. Ambedkar", "Sarojini Naidu"], ans: "Mahatma Gandhi" },
];

export const RapidFire: React.FC<RapidFireProps> = ({ onComplete, onExit }) => {
  const [questions, setQuestions] = useState<RapidFireQuestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiLoaded, setAiLoaded] = useState(false);

  const [qIndex, setQIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredTotal, setAnsweredTotal] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [feedbackState, setFeedbackState] = useState<{ selected: string; isCorrect: boolean } | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerActiveRef = useRef<boolean>(true);

  // 🤖 Load AI questions on mount
  useEffect(() => {
    setIsLoadingAI(true);
    generateRapidFireQuestions(12).then(aiQuestions => {
      if (aiQuestions.length >= 4) {
        setQuestions(aiQuestions);
        setAiLoaded(true);
      } else {
        // Fallback to hardcoded
        setQuestions(FALLBACK_QUESTIONS);
        setAiLoaded(false);
      }
      setIsLoadingAI(false);
      startTimeRef.current = Date.now();
    });
  }, []);

  const currentQ = questions[qIndex % Math.max(1, questions.length)];

  // 60-Second countdown — only starts after questions loaded
  useEffect(() => {
    if (isLoadingAI || questions.length === 0) return;
    if (timeLeft <= 0) {
      timerActiveRef.current = false;
      finishGame();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoadingAI, questions.length]);

  const handleSelectOption = (chosen: string) => {
    if (feedbackState !== null || timeLeft <= 0 || !currentQ) return;

    const isCorrect = chosen === currentQ.ans;
    setFeedbackState({ selected: chosen, isCorrect });
    setAnsweredTotal((prev) => prev + 1);

    if (isCorrect) {
      const added = 100 * combo;
      setScore((s) => s + added);
      setCombo((c) => Math.min(5, c + 1));
      setCorrectCount((c) => c + 1);
    } else {
      setCombo(1);
    }

    // Fast advance (240ms flash)
    setTimeout(() => {
      setFeedbackState(null);
      setQIndex((idx) => idx + 1);
    }, 240);
  };

  const finishGame = () => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = answeredTotal > 0 ? Math.round((correctCount / answeredTotal) * 100) : 0;
    const finalScore = score + correctCount * 50;

    onComplete({
      score: Math.max(300, finalScore),
      accuracyPct: accuracy || 70,
      timeTakenSeconds: Math.min(60, elapsed)
    });
  };

  // 🤖 AI Loading Screen
  if (isLoadingAI) {
    return (
      <div className="arcade-game-container rapid-fire-game" id="game-rapid-fire">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '3rem' }}>🤖</div>
          <h2 style={{ color: '#E8B042', fontFamily: 'var(--font-display)', margin: 0 }}>
            BharatGuru AI Loading...
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '280px', margin: 0 }}>
            Generating fresh questions just for you with Gemini AI!
          </p>
          <div style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: '10px',
            padding: '10px 20px',
            color: '#A78BFA',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            ✨ Powered by Gemini 2.0 Flash
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="arcade-game-container rapid-fire-game" id="game-rapid-fire">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 10 ? 'critical' : ''}`}>⚡ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">ANSWERED</span>
          <span className="hud-metric-val gold">{correctCount} / {answeredTotal}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">SCORE</span>
          <span className="hud-metric-val score" id="rapid-score">{score.toLocaleString()}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">COMBO</span>
          <span className="hud-metric-val combo">{combo}x 🔥</span>
        </div>
      </div>

      <div className="rapid-fire-stage">
        {/* 🤖 AI badge */}
        {aiLoaded && (
          <div style={{
            textAlign: 'center',
            marginBottom: '6px'
          }}>
            <span style={{
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#A78BFA',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              letterSpacing: '0.05em'
            }}>
              🤖 AI-Generated Questions
            </span>
          </div>
        )}

        <div className="rapid-timer-bar">
          <div className="rapid-timer-fill" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
        </div>

        <div className="rapid-question-card">
          <span className="rapid-q-num">QUESTION #{qIndex + 1}</span>
          <h2 className="rapid-q-text">{currentQ.q}</h2>
        </div>

        <div className="rapid-options-grid">
          {currentQ.options.map((opt, idx) => {
            let stateClass = '';
            if (feedbackState) {
              if (opt === currentQ.ans) stateClass = 'correct';
              else if (opt === feedbackState.selected && !feedbackState.isCorrect) stateClass = 'wrong';
            }

            return (
              <button
                key={opt}
                type="button"
                className={`btn-rapid-option ${stateClass}`}
                disabled={feedbackState !== null || timeLeft <= 0}
                onClick={() => handleSelectOption(opt)}
              >
                <span className="rapid-opt-label">{String.fromCharCode(65 + idx)}</span>
                <span className="rapid-opt-text">{opt}</span>
              </button>
            );
          })}
        </div>

        <p className="touch-hint">Answer as many questions as you can before the 60-second timer expires!</p>
      </div>
    </div>
  );
};
