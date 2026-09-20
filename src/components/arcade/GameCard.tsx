import React from 'react';
import { ArcadeGame } from '../../types/arcade';

interface GameCardProps {
  game: ArcadeGame;
  bestScore?: number;
  onPlay: (game: ArcadeGame) => void;
  onPreview: (game: ArcadeGame) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  bestScore,
  onPlay,
  onPreview
}) => {
  const starsArray = Array.from({ length: 4 }, (_, i) => i < game.stars);

  return (
    <div
      className={`arcade-game-card ${game.playable ? 'playable' : 'coming-soon'}`}
      id={`arcade-card-${game.id}`}
      style={{
        borderTop: `3px solid ${game.themeColor}`
      }}
    >
      <div className="card-top-row">
        <span className="card-category-badge">{game.badgeTag}</span>
        <div className="card-difficulty" title={`Difficulty: ${game.difficulty}`}>
          {starsArray.map((filled, idx) => (
            <span key={idx} className={filled ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>
      </div>

      <div className="card-main-info">
        <div className="card-icon-wrap" style={{ background: `${game.themeColor}22`, borderColor: `${game.themeColor}55` }}>
          <span className="card-icon">{game.icon}</span>
        </div>
        <div className="card-titles">
          <h3 className="card-title">{game.title}</h3>
          <span className="card-subtitle">{game.subtitle}</span>
        </div>
      </div>

      <p className="card-desc">{game.description}</p>

      <div className="card-meta-row">
        <div className="meta-item">
          <span className="meta-label">TIME</span>
          <span className="meta-val">⏱️ {game.estTime}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">REWARD</span>
          <span className="meta-val" style={{ color: '#F5C842' }}>⚡ +{game.baseXp} XP</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">BEST SCORE</span>
          <span className="meta-val" style={{ color: bestScore ? '#22C55E' : '#94A3B8' }}>
            🏆 {bestScore !== undefined && bestScore > 0 ? bestScore.toLocaleString() : '---'}
          </span>
        </div>
      </div>

      <div className="card-action-wrap">
        {game.playable ? (
          <button
            type="button"
            className="btn-arcade-play"
            id={`btn-play-${game.id}`}
            onClick={() => onPlay(game)}
          >
            <span>⚔️ PLAY NOW</span>
            <span className="play-arrow">→</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-arcade-preview"
            id={`btn-preview-${game.id}`}
            onClick={() => onPreview(game)}
          >
            <span>🔒 IN DEVELOPMENT</span>
            <span className="preview-badge">PREVIEW</span>
          </button>
        )}
      </div>
    </div>
  );
};
