import { ModalOverlay } from './ModalOverlay';
import { Badge } from '../../types';

interface BadgeModalProps {
  isOpen: boolean;
  badge: Badge | null;
  onClose: () => void;
  onExploreQuests: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  badge,
  onClose,
  onExploreQuests
}) => {
  if (!badge) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-header-icon" style={{ fontSize: '2.8rem' }}>{badge.icon}</div>
        <div>
          <h3 className="modal-title">{badge.name}</h3>
          <div
            className="modal-subtitle"
            style={{ color: badge.earned ? 'var(--accent-success)' : 'var(--text-muted)' }}
          >
            {badge.earned ? '✓ Unlocked & Earned' : '🔒 Locked Achievement'}
          </div>
        </div>
      </div>
      <p className="modal-desc">{badge.desc}</p>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="mii-label">Requirement</span>
          <span className="mii-val" style={{ fontSize: '0.85rem' }}>{badge.criteria}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Status</span>
          <span
            className="mii-val"
            style={{ color: badge.earned ? 'var(--accent-success)' : 'var(--saffron)' }}
          >
            {badge.earned ? 'Achieved' : 'In Progress'}
          </span>
        </div>
      </div>
      <div className="modal-actions">
        {!badge.earned && (
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              onExploreQuests();
            }}
          >
            EXPLORE QUESTS &rarr;
          </button>
        )}
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};