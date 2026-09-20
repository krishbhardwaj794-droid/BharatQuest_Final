import React, { useState, useEffect, useRef } from 'react';
import { explainCultureMatch } from '../../../services/geminiService';


interface CultureMatchProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

interface MatchPair {
  id: number;
  item: string;
  category: string;
  target: string;
  icon: string;
}

const CULTURE_PAIRS: MatchPair[] = [
  { id: 1, item: 'Bharatanatyam', category: 'Classical Dance', target: 'Tamil Nadu', icon: '💃' },
  { id: 2, item: 'Kathakali', category: 'Dance Drama', target: 'Kerala', icon: '🎭' },
  { id: 3, item: 'Rongali Bihu', category: 'Harvest Festival', target: 'Assam', icon: '🌾' },
  { id: 4, item: 'Madhubani Painting', category: 'Mithila Folk Art', target: 'Bihar', icon: '🎨' },
  { id: 5, item: 'Warli Art', category: 'Tribal Painting', target: 'Maharashtra', icon: '🖌️' },
  { id: 6, item: 'Garba & Dandiya', category: 'Folk Celebration', target: 'Gujarat', icon: '🪘' }
];

export const CultureMatch: React.FC<CultureMatchProps> = ({ onComplete, onExit }) => {
  const [selectedItem, setSelectedItem] = useState<MatchPair | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [shuffledTargets, setShuffledTargets] = useState<{ id: number; target: string }[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [wrongTargetId, setWrongTargetId] = useState<number | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiTipItem, setAiTipItem] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());


  // Setup targets in shuffled order
  useEffect(() => {
    const targets = CULTURE_PAIRS.map((p) => ({ id: p.id, target: p.target }));
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    setShuffledTargets(targets);
  }, []);

  // Timer
  useEffect(() => {
    if (matchedIds.length === CULTURE_PAIRS.length) return;
    if (timeLeft <= 0) {
      finishGame(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, matchedIds.length]);

  const handleSelectLeft = (pair: MatchPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedItem(pair);
  };

  const handleSelectRight = (targetObj: { id: number; target: string }) => {
    if (!selectedItem) return;
    if (matchedIds.includes(targetObj.id)) return;

    if (selectedItem.id === targetObj.id) {
      // Correct match!
      const earned = 500 * combo;
      setScore((s) => s + earned);
      setCombo((c) => c + 1);
      const newMatched = [...matchedIds, targetObj.id];
      setMatchedIds(newMatched);
      setSelectedItem(null);

      if (newMatched.length === CULTURE_PAIRS.length) {
        setTimeout(() => finishGame(true), 800);
      }
    } else {
      // Wrong match — get AI explanation
      const wrongTargetObj = shuffledTargets.find(t => t.id === targetObj.id);
      const correctPair = CULTURE_PAIRS.find(p => p.id === selectedItem.id);
      setWrongTargetId(targetObj.id);
      setCombo(1);
      setAiTip(null);
      setAiTipItem(null);

      // 🤖 Fetch AI explanation for wrong match
      if (correctPair && wrongTargetObj) {
        explainCultureMatch(selectedItem.item, correctPair.target, wrongTargetObj.target).then(tip => {
          setAiTip(tip);
          setAiTipItem(selectedItem.item);
        });
      }

      setTimeout(() => {
        setWrongTargetId(null);
        setSelectedItem(null);
      }, 500);
    }

  };

  const finishGame = (success: boolean) => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.round((matchedIds.length / CULTURE_PAIRS.length) * 100);
    const finalScore = score + (success ? timeLeft * 25 : 0);

    onComplete({
      score: Math.max(350, finalScore),
      accuracyPct: success ? 100 : accuracy || 60,
      timeTakenSeconds: elapsed
    });
  };

  return (
    <div className="arcade-game-container culture-match-game" id="game-culture-match">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 10 ? 'critical' : ''}`}>⏱️ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">PAIRED</span>
          <span className="hud-metric-val gold">{matchedIds.length} / {CULTURE_PAIRS.length}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">SCORE</span>
          <span className="hud-metric-val score" id="culture-score">{score.toLocaleString()}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">COMBO</span>
          <span className="hud-metric-val combo">{combo}x 🔥</span>
        </div>
      </div>

      <div className="culture-match-stage">
        {matchedIds.length === CULTURE_PAIRS.length && (
          <div className="culture-restored-banner">
            ✨ ALL CULTURAL TRADITIONS CONNECTED! ✨
          </div>
        )}

        <div className="culture-instruction">
          Select a heritage tradition on the left, then tap its home state on the right!
        </div>

        <div className="culture-columns-row">
          {/* Left: Heritage Items */}
          <div className="culture-col">
            <h4 className="col-header">HERITAGE TRADITIONS</h4>
            <div className="items-list">
              {CULTURE_PAIRS.map((pair) => {
                const isMatched = matchedIds.includes(pair.id);
                const isSelected = selectedItem?.id === pair.id;

                return (
                  <button
                    key={pair.id}
                    type="button"
                    className={`btn-culture-item ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                    disabled={isMatched}
                    onClick={() => handleSelectLeft(pair)}
                  >
                    <span className="item-icon">{pair.icon}</span>
                    <div className="item-details">
                      <span className="item-name">{pair.item}</span>
                      <span className="item-cat">{pair.category}</span>
                    </div>
                    {isMatched && <span className="matched-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="culture-bridge-divider">⚡</div>

          {/* Right: States */}
          <div className="culture-col">
            <h4 className="col-header">HOME STATES / REGIONS</h4>
            <div className="items-list">
              {shuffledTargets.map((targetObj) => {
                const isMatched = matchedIds.includes(targetObj.id);
                const isWrong = wrongTargetId === targetObj.id;

                return (
                  <button
                    key={targetObj.id}
                    type="button"
                    className={`btn-culture-target ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''}`}
                    disabled={isMatched}
                    onClick={() => handleSelectRight(targetObj)}
                  >
                    <span className="target-state">{targetObj.target}</span>
                    {isMatched && <span className="matched-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🤖 Gemini AI Culture Explanation */}
        {aiTip && (
          <div style={{
            margin: '16px auto',
            maxWidth: '650px',
            padding: '12px 18px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
            border: '1.5px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '12px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>🤖</span>
              <span style={{ color: '#A78BFA', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                BharatGuru Cultural Insight: {aiTipItem}
              </span>
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(139, 92, 246, 0.25)',
                color: '#C4B5FD',
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 600
              }}>Gemini 2.0 Flash</span>
            </div>
            <p style={{ margin: 0, color: '#F1F5F9', fontSize: '0.88rem', lineHeight: '1.45' }}>
              {aiTip}
            </p>
          </div>
        )}

        <p className="touch-hint">Tap a cultural tradition then tap its originating Indian state to link them.</p>
      </div>
    </div>
  );
};
