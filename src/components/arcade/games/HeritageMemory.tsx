import React, { useState, useEffect, useRef } from 'react';

interface HeritageMemoryProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

interface MemoryCard {
  instanceId: string;
  cardId: number;
  name: string;
  icon: string;
  location: string;
}

const MONUMENTS = [
  { cardId: 1, name: 'Taj Mahal', icon: '🏛️', location: 'Agra' },
  { cardId: 2, name: 'Red Fort', icon: '🏰', location: 'Delhi' },
  { cardId: 3, name: 'Qutub Minar', icon: '🗼', location: 'Delhi' },
  { cardId: 4, name: 'Dholavira', icon: '🏺', location: 'Gujarat' },
  { cardId: 5, name: 'Sanchi Stupa', icon: '☸️', location: 'Madhya Pradesh' },
  { cardId: 6, name: 'Konark Temple', icon: '☀️', location: 'Odisha' }
];

export const HeritageMemory: React.FC<HeritageMemoryProps> = ({ onComplete, onExit }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Setup cards
  useEffect(() => {
    const pairDeck: MemoryCard[] = [];
    MONUMENTS.forEach((mon) => {
      pairDeck.push({
        instanceId: `${mon.cardId}-A`,
        cardId: mon.cardId,
        name: mon.name,
        icon: mon.icon,
        location: mon.location
      });
      pairDeck.push({
        instanceId: `${mon.cardId}-B`,
        cardId: mon.cardId,
        name: mon.name,
        icon: mon.icon,
        location: mon.location
      });
    });

    // Shuffle deck
    for (let i = pairDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairDeck[i], pairDeck[j]] = [pairDeck[j], pairDeck[i]];
    }

    setCards(pairDeck);
  }, []);

  // Timer
  useEffect(() => {
    if (matchedIds.length === MONUMENTS.length) return;
    if (timeLeft <= 0) {
      finishGame(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, matchedIds.length]);

  const handleCardClick = (instanceId: string, cardId: number) => {
    if (isProcessing) return;
    if (flippedIds.includes(instanceId)) return;
    if (matchedIds.includes(cardId)) return;

    const newFlipped = [...flippedIds, instanceId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsProcessing(true);

      const firstCard = cards.find((c) => c.instanceId === newFlipped[0]);
      const secondCard = cards.find((c) => c.instanceId === newFlipped[1]);

      if (firstCard && secondCard && firstCard.cardId === secondCard.cardId) {
        // MATCH!
        const earned = 600 * combo;
        setScore((s) => s + earned);
        setCombo((c) => c + 1);
        const newMatched = [...matchedIds, firstCard.cardId];
        setMatchedIds(newMatched);
        setFlippedIds([]);
        setIsProcessing(false);

        if (newMatched.length === MONUMENTS.length) {
          setTimeout(() => finishGame(true), 1000);
        }
      } else {
        // NO MATCH
        setCombo(1);
        setTimeout(() => {
          setFlippedIds([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const finishGame = (success: boolean) => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = success ? Math.max(60, Math.round((6 / Math.max(6, moves)) * 100)) : 45;
    const finalScore = score + (success ? timeLeft * 20 : 0);

    onComplete({
      score: Math.max(400, finalScore),
      accuracyPct: accuracy,
      timeTakenSeconds: elapsed
    });
  };

  return (
    <div className="arcade-game-container heritage-memory-game" id="game-heritage-memory">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 10 ? 'critical' : ''}`}>⏱️ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">PAIRS</span>
          <span className="hud-metric-val gold">{matchedIds.length} / {MONUMENTS.length}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">SCORE</span>
          <span className="hud-metric-val score" id="memory-score">{score.toLocaleString()}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">COMBO</span>
          <span className="hud-metric-val combo">{combo}x</span>
        </div>
      </div>

      <div className="memory-stage">
        {matchedIds.length === MONUMENTS.length && (
          <div className="memory-restored-banner">
            ✨ ALL HERITAGE MONUMENTS MATCHED! ✨
          </div>
        )}

        <div className="memory-grid">
          {cards.map((card) => {
            const isFlipped = flippedIds.includes(card.instanceId) || matchedIds.includes(card.cardId);
            const isMatched = matchedIds.includes(card.cardId);

            return (
              <div
                key={card.instanceId}
                className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.instanceId, card.cardId)}
                role="button"
                tabIndex={0}
              >
                <div className="memory-card-inner">
                  <div className="card-face card-back">
                    <span className="card-back-pattern">☸️</span>
                    <span className="card-back-text">BHARAT</span>
                  </div>
                  <div className="card-face card-front">
                    <span className="card-front-icon">{card.icon}</span>
                    <span className="card-front-name">{card.name}</span>
                    <span className="card-front-loc">{card.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="touch-hint">Flip matching pairs of Indian heritage landmarks before time runs out!</p>
      </div>
    </div>
  );
};
