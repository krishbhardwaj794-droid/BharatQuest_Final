import React, { useState, useEffect } from 'react';
import { ArcadeCategory, ArcadeGame, GameSessionResult, ArcadeScoresMap } from '../../types/arcade';
import { ARCADE_GAMES, MOCK_ARCADE_LEADERBOARD } from '../../data/arcadeGames';
import { GameCard } from './GameCard';
import { ArcadeCountdown } from './ArcadeCountdown';
import { GameResult } from './GameResult';
import { ChakraMaster } from './games/ChakraMaster';
import { ArtifactPuzzle } from './games/ArtifactPuzzle';
import { HeritageMemory } from './games/HeritageMemory';
import { TimeTravel } from './games/TimeTravel';
import { RapidFire } from './games/RapidFire';
import { CultureMatch } from './games/CultureMatch';
import { DecipherScript } from './games/DecipherScript';

interface ArcadeHubProps {
  playerXp: number;
  playerLevel: number;
  playerName: string;
  onAddXP: (amount: number) => void;
  onNavigateHome: () => void;
}

const CATEGORIES: ArcadeCategory[] = [
  'ALL',
  'PUZZLES',
  'ACTION',
  'MEMORY',
  'HISTORY',
  'CULTURE',
  'GEOGRAPHY',
  '3D',
  'QUICK PLAY'
];

const STORAGE_KEY = 'bharatquest_arcade_scores';

export const ArcadeHub: React.FC<ArcadeHubProps> = ({
  playerXp,
  playerLevel,
  playerName,
  onAddXP,
  onNavigateHome
}) => {
  const [activeCategory, setActiveCategory] = useState<ArcadeCategory>('ALL');
  const [activeGame, setActiveGame] = useState<ArcadeGame | null>(null);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [sessionResult, setSessionResult] = useState<GameSessionResult | null>(null);
  const [bestScores, setBestScores] = useState<ArcadeScoresMap>({});
  const [previewModalGame, setPreviewModalGame] = useState<ArcadeGame | null>(null);

  // Load scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBestScores(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save scores to localStorage
  const saveScore = (gameId: string, score: number): boolean => {
    try {
      const prevBest = bestScores[gameId] || 0;
      const isNewBest = score > prevBest;
      const updated = { ...bestScores, [gameId]: Math.max(prevBest, score) };
      setBestScores(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return isNewBest;
    } catch {
      return false;
    }
  };

  // Launch a game with 1-second countdown transition
  const handleLaunchGame = (game: ArcadeGame) => {
    setActiveGame(game);
    setSessionResult(null);
    setIsCountingDown(true);
  };

  // Countdown finished -> start playing
  const handleCountdownFinished = () => {
    setIsCountingDown(false);
  };

  // Game completion handler
  const handleGameComplete = (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => {
    if (!activeGame) return;

    const isNewBest = saveScore(activeGame.id, stats.score);
    // Controlled XP reward
    const earnedXp = Math.min(activeGame.maxXp, Math.max(activeGame.baseXp, Math.round(stats.score / 60)));
    onAddXP(earnedXp);

    setSessionResult({
      gameId: activeGame.id,
      gameTitle: activeGame.title,
      score: stats.score,
      bestScore: Math.max(bestScores[activeGame.id] || 0, stats.score),
      isNewBest,
      earnedXp,
      accuracyPct: stats.accuracyPct,
      timeTakenSeconds: stats.timeTakenSeconds
    });
  };

  // Return to hub
  const handleReturnToHub = () => {
    setActiveGame(null);
    setIsCountingDown(false);
    setSessionResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Play Next Game
  const handleNextGame = () => {
    if (!activeGame) return;
    const playableGames = ARCADE_GAMES.filter((g) => g.playable);
    const currentIndex = playableGames.findIndex((g) => g.id === activeGame.id);
    const nextGame = playableGames[(currentIndex + 1) % playableGames.length];
    handleLaunchGame(nextGame);
  };

  // Filter games
  const filteredGames = ARCADE_GAMES.filter((game) => {
    if (activeCategory === 'ALL') return true;
    return game.categories.includes(activeCategory);
  });

  // Calculate Arcade Stats
  const totalArcadeScore = Object.values(bestScores).reduce((a, b) => a + b, 0);
  const gamesPlayedCount = Object.keys(bestScores).length;

  return (
    <section className="screen active screen-arcade" id="screen-arcade">
      {/* Launch Countdown Overlay */}
      {isCountingDown && activeGame && (
        <ArcadeCountdown game={activeGame} onComplete={handleCountdownFinished} />
      )}

      {/* Game Result Screen */}
      {sessionResult && !isCountingDown && (
        <GameResult
          result={sessionResult}
          onPlayAgain={() => activeGame && handleLaunchGame(activeGame)}
          onArcadeHome={handleReturnToHub}
          onNextGame={handleNextGame}
        />
      )}

      {/* Active Game Stage */}
      {activeGame && !isCountingDown && !sessionResult && (
        <div className="active-game-viewport">
          {activeGame.id === 'chakra-master' && (
            <ChakraMaster onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'artifact-puzzle' && (
            <ArtifactPuzzle onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'heritage-memory' && (
            <HeritageMemory onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'time-travel' && (
            <TimeTravel onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'rapid-fire' && (
            <RapidFire onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'culture-match' && (
            <CultureMatch onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
          {activeGame.id === 'decipher-script' && (
            <DecipherScript onComplete={handleGameComplete} onExit={handleReturnToHub} />
          )}
        </div>
      )}

      {/* Arcade Homepage / Hub View */}
      {!activeGame && !sessionResult && (
        <div className="arcade-hub-content">
          {/* Header Banner */}
          <div className="arcade-hero-banner">
            <div className="hero-badge-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                className="btn-back-sm"
                id="btn-arcade-back-home"
                onClick={onNavigateHome}
                style={{ borderRadius: '20px', padding: '4px 14px', fontSize: '0.78rem' }}
              >
                ← Home
              </button>
              <div className="hero-badge-pill" style={{ marginBottom: 0 }}>
                <span>🎮 BHARATQUEST ARENA</span>
              </div>
            </div>
            <h1 className="arcade-hero-title">BHARATQUEST ARCADE</h1>
            <p className="arcade-hero-subtitle">
              PLAY. SOLVE. DISCOVER INDIA.
            </p>
            <p className="arcade-hero-tagline">
              Step into legendary heritage challenges, reconstruct lost artifacts, align sacred cosmic wheels, and conquer ancient puzzles.
            </p>

            {/* Quick Player Arcade Stats */}
            <div className="arcade-stats-bar">
              <div className="stat-pill">
                <span className="sp-icon">🎖️</span>
                <span className="sp-label">EXPLORER</span>
                <span className="sp-val">{playerName} (LVL {playerLevel})</span>
              </div>
              <div className="stat-pill">
                <span className="sp-icon">⚡</span>
                <span className="sp-label">TOTAL XP</span>
                <span className="sp-val gold">{playerXp.toLocaleString()} XP</span>
              </div>
              <div className="stat-pill">
                <span className="sp-icon">🎮</span>
                <span className="sp-label">GAMES MASTERED</span>
                <span className="sp-val">{gamesPlayedCount} / {ARCADE_GAMES.filter((g) => g.playable).length}</span>
              </div>
              <div className="stat-pill">
                <span className="sp-icon">🏆</span>
                <span className="sp-label">ARENA SCORE</span>
                <span className="sp-val green">{totalArcadeScore.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filter Navigation Tabs */}
          <div className="arcade-filters-wrap" id="arcade-filters">
            <div className="filters-scroll">
              {CATEGORIES.map((cat) => {
                const count = ARCADE_GAMES.filter((g) => cat === 'ALL' || g.categories.includes(cat)).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`btn-arcade-filter ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span>{cat}</span>
                    <span className="filter-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="arcade-grid-section">
            <div className="section-header-row">
              <h2 className="section-title">
                {activeCategory === 'ALL' ? 'ALL ARCADE CHALLENGES' : `${activeCategory} GAMES`}
              </h2>
              <span className="games-count-badge">{filteredGames.length} GAMES AVAILABLE</span>
            </div>

            <div className="arcade-games-grid" id="arcade-games-grid">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  bestScore={bestScores[game.id]}
                  onPlay={handleLaunchGame}
                  onPreview={(g) => setPreviewModalGame(g)}
                />
              ))}
            </div>
          </div>

          {/* Arcade Leaderboard Showcase */}
          <div className="arcade-leaderboard-section">
            <div className="leaderboard-card-container">
              <div className="lb-header">
                <div className="lb-title-group">
                  <span className="lb-icon">👑</span>
                  <div>
                    <h3 className="lb-title">ARCADE HALL OF SAGES</h3>
                    <p className="lb-sub">Legendary high scores across all heritage arcade puzzles</p>
                  </div>
                </div>
                <span className="lb-status-badge">SEASON 1 ARENA</span>
              </div>

              <div className="lb-table">
                <div className="lb-row lb-head">
                  <span className="lb-col rank">RANK</span>
                  <span className="lb-col player">PLAYER</span>
                  <span className="lb-col game">TOP GAME</span>
                  <span className="lb-col score">SCORE</span>
                  <span className="lb-col date">DATE</span>
                </div>
                {MOCK_ARCADE_LEADERBOARD.map((item) => (
                  <div key={item.rank} className={`lb-row ${item.rank === 1 ? 'rank-1' : ''}`}>
                    <span className="lb-col rank">
                      {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                    </span>
                    <span className="lb-col player">
                      <span className="player-avatar">{item.avatar}</span>
                      <span className="player-name">{item.name}</span>
                    </span>
                    <span className="lb-col game">{item.game}</span>
                    <span className="lb-col score gold">{item.score.toLocaleString()}</span>
                    <span className="lb-col date">{item.date}</span>
                  </div>
                ))}

                {/* Current Player Status in Leaderboard */}
                {totalArcadeScore > 0 && (
                  <div className="lb-row player-current-row">
                    <span className="lb-col rank">⭐ YOU</span>
                    <span className="lb-col player">
                      <span className="player-avatar">🧭</span>
                      <span className="player-name">{playerName}</span>
                    </span>
                    <span className="lb-col game">Arcade Total</span>
                    <span className="lb-col score gold">{totalArcadeScore.toLocaleString()}</span>
                    <span className="lb-col date">Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for Coming Soon Games */}
      {previewModalGame && (
        <div className="modal-overlay active" onClick={() => setPreviewModalGame(null)}>
          <div className="modal-box arcade-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-icon" style={{ background: `${previewModalGame.themeColor}22` }}>
              <span>{previewModalGame.icon}</span>
            </div>
            <span className="preview-badge-chip">COMING SOON IN EXPANSION</span>
            <h3 className="preview-modal-title">{previewModalGame.title}</h3>
            <span className="preview-modal-sub">{previewModalGame.subtitle}</span>
            <p className="preview-modal-desc">{previewModalGame.description}</p>
            <div className="preview-modal-meta">
              <span>🎯 Difficulty: {previewModalGame.difficulty}</span>
              <span>⚡ Reward: +{previewModalGame.baseXp} XP</span>
              <span>⏱️ Estimated Time: {previewModalGame.estTime}</span>
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => setPreviewModalGame(null)}
            >
              GOT IT, RETURN TO ARENA
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
