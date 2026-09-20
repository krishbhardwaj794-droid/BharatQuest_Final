import { useState, useEffect, useRef } from 'react';
import { PlayerData, ScreenType } from '../../types';
import { getCurrentLevelBaseXp, getNextLevelXp } from '../../utils/levelEngine';

interface NavbarProps {
  currentScreen: ScreenType;
  player: PlayerData;
  onNavigate: (screen: ScreenType) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  player,
  onNavigate,
  onOpenProfile,
  onOpenSettings,
  onLogout
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute XP percentage within current level
  const baseLevelXp = getCurrentLevelBaseXp(player.level);
  const nextLevelXp = getNextLevelXp(player.level);
  const levelSpan = nextLevelXp - baseLevelXp;
  const xpInLevel = Math.max(0, player.xp - baseLevelXp);
  const xpPct = Math.min(100, Math.max(0, Math.round((xpInLevel / levelSpan) * 100)));

  // Outside click listener to dismiss profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="topnav" id="topnav">
      <div className="nav-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        <svg className="nav-logo-svg" width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" stroke="#FF9933" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="14" r="3" fill="#FF9933" />
          <line x1="14" y1="3" x2="14" y2="25" stroke="#FF9933" strokeWidth="1.2" />
          <line x1="3" y1="14" x2="25" y2="14" stroke="#FF9933" strokeWidth="1.2" />
          <line x1="6" y1="6" x2="22" y2="22" stroke="#FF9933" strokeWidth="1" />
          <line x1="22" y1="6" x2="6" y2="22" stroke="#FF9933" strokeWidth="1" />
        </svg>
        <span className="nav-brand-text">BHARATQUEST</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${currentScreen === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          HOME
        </button>
        <button
          className={`nav-link ${currentScreen === 'quests' ? 'active' : ''}`}
          onClick={() => onNavigate('quests')}
        >
          QUESTS
        </button>
        <button
          className={`nav-link ${currentScreen === 'progress' ? 'active' : ''}`}
          onClick={() => onNavigate('progress')}
        >
          ACHIEVEMENTS
        </button>
        <button
          className={`nav-link ${currentScreen === 'leaderboard' ? 'active' : ''}`}
          onClick={() => onNavigate('leaderboard')}
        >
          LEADERBOARD
        </button>
        <button
          className={`nav-link ${currentScreen === 'recommendation' ? 'active' : ''}`}
          onClick={() => onNavigate('recommendation')}
        >
          EXPLORE INDIA
        </button>
        <button
          className={`nav-link ${currentScreen === 'arcade' ? 'active' : ''}`}
          id="nav-link-arcade"
          onClick={() => onNavigate('arcade')}
          style={{ color: currentScreen === 'arcade' ? '#F5C842' : undefined }}
        >
          🎮 ARCADE
        </button>
      </div>

      <div className="nav-player">
        <div className="nav-xp-info">
          <span className="nav-level" id="nav-level">LVL {player.level}</span>
          <div className="nav-xp-bar">
            <div className="nav-xp-fill" style={{ width: `${xpPct}%` }}></div>
          </div>
          <span className="nav-xp-text" id="nav-xp-text">{player.xp.toLocaleString()} XP</span>
        </div>

        <div className="nav-avatar-wrap" ref={dropdownRef}>
          <div
            className="nav-explorer-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            title={`${player.name} (Level ${player.level}) · Explorer Profile`}
            tabIndex={0}
            role="button"
          >
            <div className="nav-avatar">
              {player.avatarIcon || player.avatar}
            </div>
            <div className="nav-profile-label">
              <span className="np-title">EXPLORER PROFILE</span>
              <span className="np-name">{player.name}</span>
            </div>
            <span className="np-chevron">▾</span>
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="pd-header">
                <div className="pd-avatar">{player.avatarIcon || player.avatar}</div>
                <div className="pd-user-info">
                  <div className="pd-name">{player.name}</div>
                  <div className="pd-email">{player.email}</div>
                  <div className="pd-badge-row">
                    <span className="pd-level-tag">LVL {player.level}</span>
                    <span className="pd-class-tag">{player.classYear}</span>
                  </div>
                </div>
              </div>
              <div className="pd-divider"></div>
              <button
                type="button"
                className="pd-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenProfile();
                }}
              >
                <span className="pd-icon">👤</span> My Profile
              </button>
              <button
                type="button"
                className="pd-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onNavigate('progress');
                }}
              >
                <span className="pd-icon">📊</span> My Progress
              </button>
              <button
                type="button"
                className="pd-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSettings();
                }}
              >
                <span className="pd-icon">⚙️</span> Settings
              </button>
              <div className="pd-divider"></div>
              <button
                type="button"
                className="pd-item pd-logout"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                <span className="pd-icon">🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};