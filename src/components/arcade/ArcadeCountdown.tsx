import React, { useEffect, useState } from 'react';
import { ArcadeGame } from '../../types/arcade';

interface ArcadeCountdownProps {
  game: ArcadeGame;
  onComplete: () => void;
}

export const ArcadeCountdown: React.FC<ArcadeCountdownProps> = ({ game, onComplete }) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 320); // 320ms * 3 ≈ 1 second total transition

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="arcade-countdown-overlay">
      <div className="countdown-box">
        <span className="countdown-game-icon">{game.icon}</span>
        <h2 className="countdown-game-title">{game.title.toUpperCase()}</h2>
        <span className="countdown-game-sub">{game.subtitle}</span>

        <div className="countdown-number-wrap">
          {count > 0 ? (
            <span className="countdown-number" key={count}>{count}</span>
          ) : (
            <span className="countdown-start-text">BATTLE START!</span>
          )}
        </div>

        <p className="countdown-tip">Prepare to solve the ancient challenge...</p>
      </div>
    </div>
  );
};
