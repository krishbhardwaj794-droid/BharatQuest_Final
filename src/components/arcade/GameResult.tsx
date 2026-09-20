import React from 'react';
import { GameSessionResult } from '../../types/arcade';

interface GameResultProps {
  result: GameSessionResult;
  onPlayAgain: () => void;
  onArcadeHome: () => void;
  onNextGame: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  result,
  onPlayAgain,
  onArcadeHome,
  onNextGame
}) => {
  return (
    <div className="arcade-result-overlay">
      <div className="arcade-result-card" id="arcade-result-card">
        {result.isNewBest && (
          <div className="new-record-badge" id="new-record-badge">
            <span>👑 NEW PERSONAL BEST!</span>
          </div>
        )}

        <div className="result-header">
          <span className="result-game-icon">🏆</span>
          <h2 className="result-title">HERITAGE CHALLENGE COMPLETE!</h2>
          <span className="result-game-name">{result.gameTitle}</span>
        </div>

        <div className="result-stats-grid">
          <div className="stat-box primary">
            <span className="stat-label">FINAL SCORE</span>
            <span className="stat-value" id="result-score">{result.score.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">BEST RECORD</span>
            <span className="stat-value" id="result-best-score">{result.bestScore.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">XP EARNED</span>
            <span className="stat-value xp" id="result-xp-earned">+{result.earnedXp} XP</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">ACCURACY</span>
            <span className="stat-value" id="result-accuracy">{result.accuracyPct}%</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">TIME</span>
            <span className="stat-value" id="result-time">{result.timeTakenSeconds}s</span>
          </div>
        </div>

        <div className="result-actions-row">
          <button
            type="button"
            className="btn-arcade-action secondary"
            id="btn-play-again"
            onClick={onPlayAgain}
          >
            🔄 PLAY AGAIN
          </button>
          <button
            type="button"
            className="btn-arcade-action home"
            id="btn-arcade-home"
            onClick={onArcadeHome}
          >
            🏠 ARCADE HOME
          </button>
          <button
            type="button"
            className="btn-arcade-action primary"
            id="btn-next-game"
            onClick={onNextGame}
          >
            ➡ NEXT GAME
          </button>
        </div>
      </div>
    </div>
  );
};
