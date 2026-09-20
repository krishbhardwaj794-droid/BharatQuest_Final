import React, { useState, useEffect, useRef } from 'react';

interface TimeTravelProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

interface TimelineEpoch {
  id: number;
  name: string;
  period: string;
  keyFeature: string;
  icon: string;
}

const HISTORICAL_EPOCHS: TimelineEpoch[] = [
  { id: 1, name: 'Indus Valley Civilization', period: 'c. 2600 BCE – 1900 BCE', keyFeature: 'Urban grid cities & Great Bath', icon: '🏺' },
  { id: 2, name: 'Mauryan Empire & Ashoka', period: 'c. 322 BCE – 185 BCE', keyFeature: 'Lion Capital & Dhamma Edicts', icon: '🦁' },
  { id: 3, name: 'Gupta Classical Golden Age', period: 'c. 320 CE – 550 CE', keyFeature: 'Aryabhata astronomy & Sanskrit art', icon: '✨' },
  { id: 4, name: 'Delhi Sultanate Era', period: 'c. 1206 CE – 1526 CE', keyFeature: 'Qutub Minar & Indo-Islamic architecture', icon: '🕌' },
  { id: 5, name: 'Mughal Empire', period: 'c. 1526 CE – 1857 CE', keyFeature: 'Red Fort & Taj Mahal architecture', icon: '🏰' },
  { id: 6, name: 'Swaraj & Indian Independence', period: '1947 CE – Present', keyFeature: 'Freedom struggle & Republic Constitution', icon: '🇮🇳' }
];

export const TimeTravel: React.FC<TimeTravelProps> = ({ onComplete, onExit }) => {
  const [epochs, setEpochs] = useState<TimelineEpoch[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(80);
  const startTimeRef = useRef<number>(Date.now());

  // Shuffle epochs on mount
  useEffect(() => {
    let shuffled = [...HISTORICAL_EPOCHS];
    let isSame = true;
    while (isSame) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      isSame = shuffled.every((item, idx) => item.id === idx + 1);
    }
    setEpochs(shuffled);
  }, []);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    if (timeLeft <= 0) {
      finishGame(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isCompleted) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= epochs.length) return;

    setMoves((m) => m + 1);
    const updated = [...epochs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setEpochs(updated);

    // Check if sorted
    const isSorted = updated.every((item, idx) => item.id === idx + 1);
    if (isSorted) {
      setIsCompleted(true);
      setTimeout(() => finishGame(true), 1200);
    }
  };

  const finishGame = (success: boolean) => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const base = success ? 2800 : 700;
    const timeBonus = Math.max(0, timeLeft * 20);
    const penalty = Math.max(0, (moves - 6) * 35);
    const score = Math.max(450, base + timeBonus - penalty);
    const correctCount = epochs.filter((item, idx) => item.id === idx + 1).length;
    const accuracy = Math.round((correctCount / epochs.length) * 100);

    onComplete({
      score,
      accuracyPct: success ? 100 : accuracy,
      timeTakenSeconds: elapsed
    });
  };

  return (
    <div className="arcade-game-container time-travel-game" id="game-time-travel">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 15 ? 'critical' : ''}`}>⏱️ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">MOVES</span>
          <span className="hud-metric-val gold">{moves}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">ALIGNED</span>
          <span className="hud-metric-val score">
            {epochs.filter((e, idx) => e.id === idx + 1).length} / 6
          </span>
        </div>
      </div>

      <div className="time-travel-stage">
        {isCompleted && (
          <div className="timeline-restored-banner" id="timeline-restored-banner">
            ✨ TIMELINE RESTORED! CHRONOLOGICAL ORDER ACHIEVED ✨
          </div>
        )}

        <div className="timeline-instruction-card">
          <span className="instruction-icon">⌛</span>
          <div>
            <h3>RECONSTRUCT INDIA'S HISTORICAL TIMELINE</h3>
            <p>Move the historical epochs into chronological sequence from ancient roots (top) to modern independence (bottom).</p>
          </div>
        </div>

        <div className="timeline-list">
          {epochs.map((epoch, idx) => {
            const isCorrectPosition = epoch.id === idx + 1;

            return (
              <div
                key={epoch.id}
                className={`timeline-card ${isCorrectPosition ? 'aligned' : 'misaligned'}`}
              >
                <div className="timeline-order-pill">
                  <span>#{idx + 1}</span>
                </div>

                <div className="timeline-epoch-icon">
                  <span>{epoch.icon}</span>
                </div>

                <div className="timeline-epoch-info">
                  <h4 className="epoch-name">{epoch.name}</h4>
                  <span className="epoch-period">{epoch.period}</span>
                  <span className="epoch-feature">{epoch.keyFeature}</span>
                </div>

                <div className="timeline-epoch-controls">
                  <button
                    type="button"
                    className="btn-move-arrow"
                    disabled={idx === 0 || isCompleted}
                    onClick={() => moveItem(idx, 'up')}
                    aria-label={`Move ${epoch.name} up`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn-move-arrow"
                    disabled={idx === epochs.length - 1 || isCompleted}
                    onClick={() => moveItem(idx, 'down')}
                    aria-label={`Move ${epoch.name} down`}
                  >
                    ▼
                  </button>
                </div>

                {isCorrectPosition && (
                  <span className="epoch-check-mark" title="Correct historical position">✓</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="touch-hint">Tap the ▲ and ▼ buttons to shift epochs into their true chronological order.</p>
      </div>
    </div>
  );
};
