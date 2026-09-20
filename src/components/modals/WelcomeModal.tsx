import { ModalOverlay } from './ModalOverlay';

interface WelcomeModalProps {
  isOpen: boolean;
  userName: string;
  avatarIcon: string;
  onClose: () => void;
  onStartExploring: () => void;
}

export const WelcomeModal = ({
  isOpen,
  userName,
  avatarIcon,
  onClose,
  onStartExploring
}: WelcomeModalProps) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header" style={{ textAlign: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div className="modal-header-icon" style={{ fontSize: '3.5rem', margin: '0 auto', filter: 'drop-shadow(0 0 20px rgba(255,153,51,0.6))' }}>
          {avatarIcon || '🏛️'}
        </div>
        <div>
          <h3 className="modal-title" style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
            Welcome to BharatQuest, {userName}!
          </h3>
          <div className="modal-subtitle" style={{ color: 'var(--gold)', fontSize: '1rem', marginTop: '6px' }}>
            ✦ Explorer Profile Created Successfully ✦
          </div>
        </div>
      </div>
      <p className="modal-desc" style={{ textAlign: 'center', fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '18px 0 24px' }}>
        Your journey begins now. Step into the ancient past, decode archaeological mysteries of the Indus Valley, earn sacred badges, and climb the leaderboard!
      </p>
      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        <button
          type="button"
          className="btn-primary btn-glow"
          style={{ padding: '14px 38px', fontSize: '1.05rem' }}
          onClick={() => {
            onClose();
            onStartExploring();
          }}
        >
          START EXPLORING &rarr;
        </button>
      </div>
    </ModalOverlay>
  );
};