import React, { useState, useEffect, useRef } from 'react';

interface ArtifactPuzzleProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
  label: string;
  icon: string;
}

const ARTIFACT_PRESETS = [
  {
    name: 'Pashupati Seal of Mohenjo-daro',
    period: 'c. 2500 BCE · Indus Valley Civilization',
    icon: '🐂',
    piecesCount: 6, // 3 columns x 2 rows
    tiles: [
      { id: 0, label: 'Horned Crown & Glyph', icon: '🪶' },
      { id: 1, label: 'Central Yogic Deity', icon: '🧘' },
      { id: 2, label: 'Right Glyphs & Tiger', icon: '🐅' },
      { id: 3, label: 'Rhinoceros & Buffalo', icon: '🦏' },
      { id: 4, label: 'Lotus Seat & Pedestal', icon: '🪷' },
      { id: 5, label: 'Antelope Herd Below', icon: '🦌' }
    ]
  },
  {
    name: 'Harappan Terracotta Storage Vessel',
    period: 'c. 2400 BCE · Lothal Excavation',
    icon: '🏺',
    piecesCount: 6,
    tiles: [
      { id: 0, label: 'Flanged Jar Rim', icon: '🏺' },
      { id: 1, label: 'Geometric Chevron Band', icon: '⚡' },
      { id: 2, label: 'Intersecting Circles', icon: '⭕' },
      { id: 3, label: 'Peacock Motif Shard', icon: '🦚' },
      { id: 4, label: 'Fish Scale Glaze Band', icon: '🐟' },
      { id: 5, label: 'Heavy Ring Base', icon: '🔘' }
    ]
  }
];

export const ArtifactPuzzle: React.FC<ArtifactPuzzleProps> = ({ onComplete, onExit }) => {
  const [selectedArtifactIndex, setSelectedArtifactIndex] = useState<number>(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const startTimeRef = useRef<number>(Date.now());

  const currentArtifact = ARTIFACT_PRESETS[selectedArtifactIndex];

  // Initialize and shuffle tiles
  useEffect(() => {
    initializePuzzle();
  }, [selectedArtifactIndex]);

  const initializePuzzle = () => {
    const raw = currentArtifact.tiles.map((t, idx) => ({
      id: t.id,
      currentPos: idx,
      correctPos: idx,
      label: t.label,
      icon: t.icon
    }));

    // Fisher-Yates shuffle that ensures it doesn't start already solved
    let shuffled = [...raw];
    let isSame = true;
    while (isSame) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      isSame = shuffled.every((t, idx) => t.id === idx);
    }

    setTiles(shuffled.map((t, idx) => ({ ...t, currentPos: idx })));
    setSelectedTileId(null);
    setMoves(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  };

  // Timer countdown
  useEffect(() => {
    if (isCompleted) return;
    if (timeLeft <= 0) {
      handleFinish(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  // Click / Tap tile handler
  const handleTileClick = (clickedId: number) => {
    if (isCompleted) return;

    if (selectedTileId === null) {
      setSelectedTileId(clickedId);
    } else {
      if (selectedTileId === clickedId) {
        setSelectedTileId(null);
        return;
      }
      // Swap positions
      swapTiles(selectedTileId, clickedId);
      setSelectedTileId(null);
    }
  };

  const swapTiles = (id1: number, id2: number) => {
    setMoves((m) => m + 1);
    setTiles((prev) => {
      const idx1 = prev.findIndex((t) => t.id === id1);
      const idx2 = prev.findIndex((t) => t.id === id2);
      if (idx1 === -1 || idx2 === -1) return prev;

      const updated = [...prev];
      const temp = updated[idx1];
      updated[idx1] = updated[idx2];
      updated[idx2] = temp;

      // Update currentPos
      const finalTiles = updated.map((t, idx) => ({ ...t, currentPos: idx }));

      // Check if all tiles match correctPos
      const solved = finalTiles.every((t, idx) => t.id === idx);
      if (solved) {
        setIsCompleted(true);
        setTimeout(() => handleFinish(true), 1200);
      }
      return finalTiles;
    });
  };

  const handleFinish = (success: boolean) => {
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const base = success ? 2500 : 800;
    const speedBonus = Math.max(0, timeLeft * 25);
    const movePenalty = Math.max(0, (moves - 6) * 40);
    const score = Math.max(500, base + speedBonus - movePenalty);
    const accuracy = success ? Math.max(70, 100 - (moves - 6) * 5) : 40;

    onComplete({
      score,
      accuracyPct: Math.min(100, accuracy),
      timeTakenSeconds: elapsed
    });
  };

  return (
    <div className="arcade-game-container artifact-puzzle-game" id="game-artifact-puzzle">
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
          <span className="hud-metric-label">ARTIFACT</span>
          <span className="hud-metric-val score">{currentArtifact.icon} #{selectedArtifactIndex + 1}</span>
        </div>
      </div>

      <div className="artifact-stage">
        {isCompleted && (
          <div className="artifact-restored-banner" id="artifact-restored-banner">
            ✨ ARTIFACT RESTORED! ARCHAEOLOGICAL MASTERPIECE ✨
          </div>
        )}

        <div className="artifact-info-card">
          <h3 className="artifact-title">{currentArtifact.name}</h3>
          <span className="artifact-period">{currentArtifact.period}</span>
        </div>

        <div className="puzzle-board-container">
          <div className={`puzzle-tiles-grid cols-3 ${isCompleted ? 'completed' : ''}`}>
            {tiles.map((tile, gridIdx) => {
              const isCorrect = tile.id === gridIdx;
              const isSelected = selectedTileId === tile.id;

              return (
                <div
                  key={tile.id}
                  className={`puzzle-shard-slot ${isCorrect ? 'snapped' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTileClick(tile.id)}
                  role="button"
                  tabIndex={0}
                  title={`Piece: ${tile.label}. Click to select and swap.`}
                >
                  <div className="shard-inner">
                    <span className="shard-icon">{tile.icon}</span>
                    <span className="shard-label">{tile.label}</span>
                    {isCorrect && <span className="snap-indicator">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="puzzle-controls-bottom">
          <button
            type="button"
            className="btn-switch-artifact"
            onClick={() => {
              setSelectedArtifactIndex((idx) => (idx + 1) % ARTIFACT_PRESETS.length);
            }}
          >
            🔄 Next Artifact Relic
          </button>
          <button
            type="button"
            className="btn-restart-puzzle"
            onClick={initializePuzzle}
          >
            ↺ Reshuffle Shards
          </button>
        </div>

        <p className="touch-hint">Tap any shard, then tap another shard to swap positions until all pieces snap into place.</p>
      </div>
    </div>
  );
};
