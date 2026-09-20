import React from 'react';
import { PlayerData, ScreenType } from '../../types';
import { getCurrentLevelBaseXp, getNextLevelXp } from '../../utils/levelEngine';

interface PlayerHUDProps {
  player: PlayerData;
  onNavigate: (screen: ScreenType) => void;
  onOpenProfile: () => void;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
  player,
  onNavigate,
  onOpenProfile
}) => {
  const baseXp = getCurrentLevelBaseXp(player.level);
  const nextXp = getNextLevelXp(player.level);
  const span = nextXp - baseXp;
  const inLevel = Math.max(0, player.xp - baseXp);
  const pct = Math.min(100, Math.max(0, Math.round((inLevel / span) * 100)));

  const earnedBadges = player.badges.filter(b => b.earned).length;

  const getRankTitle = (lvl: number) => {
    if (lvl <= 1) return 'Novice Antiquarian';
    if (lvl === 2) return 'Heritage Seeker';
    if (lvl === 3) return 'Archaeological Scout';
    if (lvl === 4) return 'Expedition Master';
    return 'Grand Vedic Scholar';
  };

  return (
    <div className="player-hud-card rpg-player-dossier" id="player-hud-card">
      {/* Decorative Ornate Golden Filigree Corners */}
      <div className="hud-corner-accent tl" />
      <div className="hud-corner-accent tr" />
      <div className="hud-corner-accent bl" />
      <div className="hud-corner-accent br" />

      {/* Dossier Top Banner */}
      <div className="dossier-top-banner">
        <div className="dossier-avatar-block">
          <div
            className="hud-avatar-frame"
            onClick={onOpenProfile}
            title="Click to customize avatar and inspect character codex"
            style={{ cursor: 'pointer' }}
          >
            <div className="hud-avatar-aura" />
            <span className="hud-avatar-icon">{player.avatarIcon || '🦁'}</span>
            <span className="hud-edit-badge" title="Edit Avatar">✎</span>
          </div>
          <div className="hud-identity">
            <div className="hud-rank-label">EXPLORER DOSSIER</div>
            <h3 className="hud-player-name">{player.name}</h3>
            <div className="hud-title-tag">{getRankTitle(player.level)}</div>
          </div>
        </div>

        <div className="dossier-meta-actions">
          <button
            type="button"
            className="btn-dossier-inspect"
            onClick={onOpenProfile}
            title="Open Character Profile & Codex"
          >
            <span>📜</span> VIEW CODEX
          </button>
        </div>
      </div>

      {/* 4 AAA RPG STATS CARDS */}
      <div className="rpg-stats-grid">
        {/* Card 1: 🏆 Badges */}
        <div
          className="rpg-stat-card card-badges"
          onClick={() => onNavigate('progress')}
          role="button"
          tabIndex={0}
          title="Inspect unlocked Heritage Badges"
        >
          <div className="rpg-card-glow" />
          <div className="rpg-card-header">
            <span className="rpg-card-icon">🏆</span>
            <span className="rpg-card-tag">ACHIEVEMENTS</span>
          </div>
          <div className="rpg-card-body">
            <div className="rpg-card-value">{earnedBadges} <span className="rpg-unit">Earned</span></div>
            <div className="rpg-card-label">Badges</div>
          </div>
          <div className="rpg-card-footer">
            <span>Tap to inspect achievements &rarr;</span>
          </div>
        </div>

        {/* Card 2: 🔥 Streak */}
        <div
          className="rpg-stat-card card-streak"
          title="Daily Heritage Exploration Streak"
        >
          <div className="rpg-card-glow" />
          <div className="rpg-card-header">
            <span className="rpg-card-icon">🔥</span>
            <span className="rpg-card-tag">MOMENTUM</span>
          </div>
          <div className="rpg-card-body">
            <div className="rpg-card-value">7 <span className="rpg-unit">Days Active</span></div>
            <div className="rpg-card-label">Streak</div>
          </div>
          <div className="rpg-card-footer">
            <span>Daily exploration bonus active</span>
          </div>
        </div>

        {/* Card 3: 📜 Expeditions */}
        <div
          className="rpg-stat-card card-expeditions"
          onClick={() => onNavigate('quests')}
          role="button"
          tabIndex={0}
          title="View all Expedition Missions"
        >
          <div className="rpg-card-glow" />
          <div className="rpg-card-header">
            <span className="rpg-card-icon">📜</span>
            <span className="rpg-card-tag">CAMPAIGN</span>
          </div>
          <div className="rpg-card-body">
            <div className="rpg-card-value">{player.completedQuests.length || player.questsDone} <span className="rpg-unit">Completed</span></div>
            <div className="rpg-card-label">Expeditions</div>
          </div>
          <div className="rpg-card-footer">
            <span>{Math.max(0, 6 - (player.completedQuests.length || player.questsDone))} Expeditions remaining</span>
          </div>
        </div>

        {/* Card 4: 📈 Level & XP */}
        <div
          className="rpg-stat-card card-level-xp"
          onClick={() => onNavigate('progress')}
          role="button"
          tabIndex={0}
          title="Inspect XP progression"
        >
          <div className="rpg-card-glow" />
          <div className="rpg-card-header">
            <span className="rpg-card-icon">📈</span>
            <span className="hud-level-badge">LEVEL {player.level}</span>
          </div>
          <div className="rpg-card-body">
            <div className="hud-xp-ratio">{player.xp.toLocaleString()} / {nextXp.toLocaleString()} XP</div>
            <div className="rpg-xp-track">
              <div className="hud-progress-fill" style={{ width: `${pct}%` }}>
                <div className="hud-progress-glint" />
              </div>
            </div>
            <div className="rpg-xp-sub">
              <span>{Math.max(0, nextXp - player.xp)} XP to Level {player.level + 1}</span>
              <span className="rpg-xp-pct">{pct}%</span>
            </div>
          </div>
          <div className="rpg-card-footer">
            <span>Rank Progression &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
