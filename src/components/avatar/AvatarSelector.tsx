import React from 'react';

export interface AvatarOption {
  icon: string;
  label: string;
  description: string;
}

export const CULTURAL_AVATARS: AvatarOption[] = [
  { icon: '🦁', label: 'Ashoka Lion', description: 'Symbol of Courage & the Sarnath Lion Capital' },
  { icon: '🦚', label: 'Royal Peacock', description: 'National Pride & Classical Heritage' },
  { icon: '🏛️', label: 'Heritage Temple', description: 'Architectural Genius of Ancient Civilizations' },
  { icon: '⚔️', label: 'Vedic Warrior', description: 'Honor, Valour & Archaeological Protection' },
  { icon: '📜', label: 'Ancient Scholar', description: 'Knowledge of Manuscripts, Shastras & History' },
  { icon: '🏺', label: 'Harappan Potter', description: 'Bronze Age Redware Artisan of Mohenjo-daro' },
  { icon: '🐅', label: 'Royal Tiger', description: 'Stealth, Might & Sovereign Wildlife' },
  { icon: '🪷', label: 'Sacred Lotus', description: 'Purity, Classical Art & Spiritual Renewal' },
  { icon: '🐘', label: 'Imperial Elephant', description: 'Grandeur, Wisdom & Royal Processions' },
  { icon: '☀️', label: 'Konark Sun Wheel', description: 'Cosmic Chariot & Astronomy of Odisha' }
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (icon: string) => void;
  compact?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelect,
  compact = false
}) => {
  return (
    <div className={`avatar-selector-container ${compact ? 'compact' : ''}`}>
      <div className="avatar-select-grid" id="avatar-select-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {CULTURAL_AVATARS.map((av) => {
          const isSelected = selectedAvatar === av.icon;
          return (
            <button
              key={av.icon}
              type="button"
              className={`avatar-opt-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(av.icon)}
              title={`${av.label} — ${av.description}`}
              aria-label={`Select ${av.label}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: compact ? '1.5rem' : '1.75rem',
                width: compact ? '44px' : '52px',
                height: compact ? '44px' : '52px',
                borderRadius: '50%',
                border: isSelected ? '2px solid var(--gold, #FFD700)' : '1px solid rgba(255,255,255,0.15)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(255,153,51,0.35), rgba(212,175,55,0.35))'
                  : 'rgba(255,255,255,0.05)',
                boxShadow: isSelected ? '0 0 14px rgba(255,215,0,0.45)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {av.icon}
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-3px',
                    right: '-3px',
                    background: 'var(--gold, #FFD700)',
                    color: '#000',
                    fontSize: '0.65rem',
                    borderRadius: '50%',
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!compact && (
        <div className="avatar-selection-caption" style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted, #94A3B8)', textAlign: 'center' }}>
          {CULTURAL_AVATARS.find(a => a.icon === selectedAvatar)?.label || 'Selected Avatar'}:{' '}
          <span style={{ color: 'var(--gold, #FFD700)' }}>
            {CULTURAL_AVATARS.find(a => a.icon === selectedAvatar)?.description || ''}
          </span>
        </div>
      )}
    </div>
  );
};
