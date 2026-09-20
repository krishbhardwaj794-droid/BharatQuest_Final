import React, { useState, useEffect, useRef } from 'react';

interface DecipherScriptProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

interface ScriptRound {
  id: number;
  clueTitle: string;
  clueHint: string;
  sequence: { symbol: string; meaning: string }[];
  missingIndex: number;
  options: { symbol: string; meaning: string; isCorrect: boolean }[];
}

const PUZZLE_ROUNDS: ScriptRound[] = [
  {
    id: 1,
    clueTitle: 'Solar Cycles & Celestial Progression',
    clueHint: 'Each glyph advances by solar intensity: Dawn → Morning Ray → Zenith Sun → Sunset.',
    missingIndex: 2,
    sequence: [
      { symbol: '🌅', meaning: 'Dawn' },
      { symbol: '🌤️', meaning: 'Morning Ray' },
      { symbol: '❓', meaning: 'Missing Glyph' },
      { symbol: '🌇', meaning: 'Sunset' }
    ],
    options: [
      { symbol: '☀️', meaning: 'Zenith Sun', isCorrect: true },
      { symbol: '🌙', meaning: 'Crescent Moon', isCorrect: false },
      { symbol: '🌧️', meaning: 'Monsoon Rain', isCorrect: false }
    ]
  },
  {
    id: 2,
    clueTitle: 'The River Network Confluence',
    clueHint: 'Flowing from mountain snowmelt to ocean delta: Glacier → Mountain Spring → River Course → Delta.',
    missingIndex: 1,
    sequence: [
      { symbol: '🏔️', meaning: 'Glacial Peak' },
      { symbol: '❓', meaning: 'Missing Glyph' },
      { symbol: '🌊', meaning: 'River Course' },
      { symbol: '🏝️', meaning: 'Ocean Delta' }
    ],
    options: [
      { symbol: '🌋', meaning: 'Volcano', isCorrect: false },
      { symbol: '💧', meaning: 'Mountain Spring', isCorrect: true },
      { symbol: '🏜️', meaning: 'Arid Dune', isCorrect: false }
    ]
  },
  {
    id: 3,
    clueTitle: 'Sanskrit Dramatic Expression (Rasa)',
    clueHint: 'Ascending emotional harmony in Natya Shastra: Wonder → Joy → Peace.',
    missingIndex: 2,
    sequence: [
      { symbol: '✨', meaning: 'Adbhuta (Wonder)' },
      { symbol: '🌺', meaning: 'Hasya (Joy)' },
      { symbol: '❓', meaning: 'Missing Glyph' }
    ],
    options: [
      { symbol: '🕊️', meaning: 'Shanta (Tranquil Peace)', isCorrect: true },
      { symbol: '⚔️', meaning: 'Raudra (Fury)', isCorrect: false },
      { symbol: '🌪️', meaning: 'Bhayanaka (Terror)', isCorrect: false }
    ]
  }
];

export const DecipherScript: React.FC<DecipherScriptProps> = ({ onComplete, onExit }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRoundSolved, setIsRoundSolved] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentRound = PUZZLE_ROUNDS[currentRoundIndex];

  useEffect(() => {
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (idx: number, isCorrect: boolean) => {
    if (selectedOption !== null || isRoundSolved) return;
    setSelectedOption(idx);

    if (isCorrect) {
      setIsRoundSolved(true);
      setScore((s) => s + 800);

      setTimeout(() => {
        if (currentRoundIndex + 1 < PUZZLE_ROUNDS.length) {
          setCurrentRoundIndex((r) => r + 1);
          setSelectedOption(null);
          setIsRoundSolved(false);
        } else {
          finishGame();
        }
      }, 900);
    } else {
      setTimeout(() => {
        setSelectedOption(null);
      }, 600);
    }
  };

  const finishGame = () => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.round(((currentRoundIndex + (isRoundSolved ? 1 : 0)) / PUZZLE_ROUNDS.length) * 100);
    const finalScore = score + (isRoundSolved ? timeLeft * 20 : 0);

    onComplete({
      score: Math.max(400, finalScore),
      accuracyPct: accuracy || 70,
      timeTakenSeconds: elapsed
    });
  };

  return (
    <div className="arcade-game-container decipher-script-game" id="game-decipher-script">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 10 ? 'critical' : ''}`}>⏱️ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">ROUND</span>
          <span className="hud-metric-val gold">{currentRoundIndex + 1} / {PUZZLE_ROUNDS.length}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">SCORE</span>
          <span className="hud-metric-val score" id="decipher-score">{score.toLocaleString()}</span>
        </div>
      </div>

      <div className="decipher-stage">
        <div className="disclaimer-badge">
          <span>📜 HERITAGE-INSPIRED REASONING PUZZLE</span>
        </div>

        <div className="cipher-tablet">
          <h3 className="cipher-title">{currentRound.clueTitle}</h3>
          <p className="cipher-hint">{currentRound.clueHint}</p>

          <div className="cipher-sequence-row">
            {currentRound.sequence.map((item, idx) => {
              const isMissing = idx === currentRound.missingIndex && !isRoundSolved;
              const displaySymbol = isRoundSolved && idx === currentRound.missingIndex
                ? currentRound.options.find((o) => o.isCorrect)?.symbol
                : item.symbol;

              return (
                <div key={idx} className={`cipher-glyph-box ${isMissing ? 'missing-slot' : ''} ${isRoundSolved && idx === currentRound.missingIndex ? 'solved' : ''}`}>
                  <span className="glyph-symbol">{displaySymbol}</span>
                  <span className="glyph-meaning">{item.meaning}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="options-selection-area">
          <h4 className="options-prompt">DEDUCE THE SACRED MISSING GLYPH:</h4>
          <div className="decipher-options-grid">
            {currentRound.options.map((opt, idx) => {
              let stateClass = '';
              if (selectedOption === idx) {
                stateClass = opt.isCorrect ? 'correct' : 'wrong';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={`btn-glyph-choice ${stateClass}`}
                  disabled={selectedOption !== null && selectedOption !== idx}
                  onClick={() => handleSelectOption(idx, opt.isCorrect)}
                >
                  <span className="choice-symbol">{opt.symbol}</span>
                  <span className="choice-meaning">{opt.meaning}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="touch-hint">Analyze the harmonic sequence pattern and choose the glyph that completes the inscription.</p>
      </div>
    </div>
  );
};
