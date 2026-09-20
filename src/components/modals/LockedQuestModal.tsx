import { ModalOverlay } from './ModalOverlay';

interface LockedQuestModalProps {
  isOpen: boolean;
  questName: string;
  reqLevel: number;
  description: string;
  currentLevel: number;
  currentXp: number;
  onClose: () => void;
  onPlayAncientIndia: () => void;
}

export const LockedQuestModal: React.FC<LockedQuestModalProps> = ({
  isOpen,
  questName,
  reqLevel,
  description,
  currentLevel,
  currentXp,
  onClose,
  onPlayAncientIndia
}) => {
  const neededXP = Math.max(0, reqLevel * 500 - 500 - currentXp);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-header-icon">🔒</div>
        <div>
          <h3 className="modal-title">{questName}</h3>
          <div className="modal-subtitle">Progression Lock &middot; Requires Level {reqLevel}</div>
        </div>
      </div>
      <p className="modal-desc">{description}</p>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="mii-label">Your Current Level</span>
          <span className="mii-val">Level {currentLevel}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Level Required</span>
          <span className="mii-val">Level {reqLevel}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">XP Needed</span>
          <span className="mii-val">{neededXP} XP</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Status</span>
          <span className="mii-val" style={{ color: 'var(--accent-error)' }}>Locked</span>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        💡 <em>Complete available missions in Ancient India to level up and unlock this journey!</em>
      </p>
      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={() => {
            onClose();
            onPlayAncientIndia();
          }}
        >
          PLAY ANCIENT INDIA &rarr;
        </button>
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};