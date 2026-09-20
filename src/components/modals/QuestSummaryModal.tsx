import { ModalOverlay } from './ModalOverlay';
import { CompletedQuest } from '../../types';

interface QuestSummaryModalProps {
  isOpen: boolean;
  quest: CompletedQuest | null;
  onClose: () => void;
  onReplay: (questId: string) => void;
}

export const QuestSummaryModal: React.FC<QuestSummaryModalProps> = ({
  isOpen,
  quest,
  onClose,
  onReplay
}) => {
  if (!quest) return null;

  const isExplore = quest.id.includes('explore');
  const icon = isExplore ? '🌊' : '🏺';
  const desc = isExplore
    ? 'You navigated the sacred and lifeline river networks of India: identifying the Gaumukh glacier headwater of the Ganga, the Yarlung Tsangpo in Tibet, and the Godavari in Peninsular India.'
    : 'You decoded archaeological artifacts of the Indus Valley Civilization, identifying Harappan urban planning, standardized drainage systems, the Indus script, and Dholavira’s water architecture.';
  const qCount = isExplore ? '3 / 3' : '5 / 5';

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-header-icon" style={{ fontSize: '2.5rem' }}>{icon}</div>
        <div>
          <h3 className="modal-title">{quest.name}</h3>
          <div className="modal-subtitle">{quest.badge} &middot; Mission Summary</div>
        </div>
      </div>
      <p className="modal-desc">{desc}</p>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="mii-label">Questions</span>
          <span className="mii-val">{qCount}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Accuracy</span>
          <span className="mii-val">{quest.accuracy}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Reward</span>
          <span className="mii-val">{quest.xp}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">Time</span>
          <span className="mii-val">{quest.time || '~3 min'}</span>
        </div>
      </div>
      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={() => {
            onClose();
            onReplay(quest.id);
          }}
        >
          🔄 REPLAY MISSION
        </button>
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};