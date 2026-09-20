import { ModalOverlay } from './ModalOverlay';
import { PlayerData } from '../../types';
import { levelTitles } from '../../utils/levelEngine';
import { AvatarSelector } from '../avatar/AvatarSelector';

interface ProfileModalProps {
  isOpen: boolean;
  player: PlayerData;
  onClose: () => void;
  onViewProgress: () => void;
  onSelectAvatar?: (icon: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  player,
  onClose,
  onViewProgress,
  onSelectAvatar
}) => {
  const earnedBadgesCount = player.badges.filter(b => b.earned).length;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div
          className="modal-header-icon"
          style={{
            fontSize: '2.8rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#FF6B35,#FF9933)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--gold)'
          }}
        >
          {player.avatarIcon || player.avatar}
        </div>
        <div>
          <h3 className="modal-title">{player.name}</h3>
          <div className="modal-subtitle">
            {player.email} &middot; {player.classYear}
          </div>
        </div>
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="mii-label">Explorer Level</span>
          <span className="mii-val" style={{ color: 'var(--gold)' }}>
            Level {player.level} ({levelTitles[player.level] || 'Explorer'})
          </span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Total Experience</span>
          <span className="mii-val" style={{ color: 'var(--saffron)' }}>
            {player.xp.toLocaleString()} XP
          </span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Quests Completed</span>
          <span className="mii-val">{player.questsDone}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Badges Earned</span>
          <span className="mii-val" style={{ color: 'var(--accent-success)' }}>
            {earnedBadgesCount} of {player.badges.length}
          </span>
        </div>
      </div>

      {/* Avatar Customization Section */}
      <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
          Choose Your Cultural Explorer Avatar
        </div>
        <AvatarSelector
          selectedAvatar={player.avatarIcon || '🦁'}
          onSelect={(icon) => {
            if (onSelectAvatar) onSelectAvatar(icon);
          }}
          compact={true}
        />
      </div>
      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={() => {
            onClose();
            onViewProgress();
          }}
        >
          VIEW FULL PROGRESS &rarr;
        </button>
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};