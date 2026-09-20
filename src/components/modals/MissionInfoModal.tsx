import { ModalOverlay } from './ModalOverlay';
import { MissionInfoType } from '../../types';

interface MissionInfoModalProps {
  isOpen: boolean;
  type: MissionInfoType | null;
  onClose: () => void;
  onStartMission: () => void;
}

export const MissionInfoModal: React.FC<MissionInfoModalProps> = ({
  isOpen,
  type,
  onClose,
  onStartMission
}) => {
  if (!type) return null;

  let icon = 'ℹ️';
  let title = 'Mission Information';
  let subtitle = 'Ancient India · Mission 01';
  let desc = '';
  let label1 = 'Category';
  let val1 = '';
  let label2 = 'Mission';
  let val2 = 'The Lost Artifact';

  if (type === 'difficulty') {
    icon = '⚔️';
    title = 'Mission Difficulty';
    subtitle = 'Indus Valley Civilization · Mission 01';
    label1 = 'Difficulty';
    val1 = 'Easy';
    label2 = 'Target Audience';
    val2 = 'Beginners & Explorers';
    desc = 'Designed for beginners. Questions focus on identifying key facts and recognizing important features of the Indus Valley Civilization.';
  } else if (type === 'time') {
    icon = '⏱';
    title = 'Estimated Mission Time';
    subtitle = 'Indus Valley Civilization · Mission 01';
    label1 = 'Estimated Time';
    val1 = '~5 min';
    label2 = 'Question Count';
    val2 = '5 Questions';
    desc = 'Your five-question mission has a total time limit of 5 minutes. Take your time to study the clues, artifacts, and options carefully.';
  } else if (type === 'reward') {
    icon = '⚡';
    title = 'Mission Reward';
    subtitle = 'Indus Valley Civilization · Mission 01';
    label1 = 'Reward';
    val1 = '+50 XP / Question';
    label2 = 'Maximum XP';
    val2 = '+250 XP (First Attempt)';
    desc = 'Earn up to +250 XP by answering all five questions correctly on your first attempt. Bonus XP may be awarded for high accuracy and fast completion.';
  } else if (type === 'badge') {
    icon = '🎖';
    title = 'Mission Badge';
    subtitle = 'Indus Valley Civilization · Mission 01';
    label1 = 'Badge';
    val1 = 'Heritage Explorer';
    label2 = 'Requirement';
    val2 = 'Complete all 5 questions';
    desc = 'Earned by successfully completing the Lost Artifact mission. Unlocking this badge demonstrates foundational mastery of Ancient Indian heritage.';
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-header-icon" style={{ fontSize: '2.8rem' }}>{icon}</div>
        <div>
          <h3 className="modal-title">{title}</h3>
          <div className="modal-subtitle">{subtitle}</div>
        </div>
      </div>
      <p className="modal-desc" style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '16px 0 20px' }}>
        {desc}
      </p>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="mii-label">{label1}</span>
          <span className="mii-val" style={{ color: 'var(--saffron)', fontWeight: 700 }}>{val1}</span>
        </div>
        <div className="modal-info-item">
          <span className="mii-label">{label2}</span>
          <span className="mii-val">{val2}</span>
        </div>
      </div>
      <div className="modal-actions">
        <button
          className="btn-primary btn-glow"
          onClick={() => {
            onClose();
            onStartMission();
          }}
        >
          START MISSION (5 QUESTIONS) &rarr;
        </button>
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};