import { ModalOverlay } from './ModalOverlay';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemo
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-header-icon" style={{ fontSize: '2.5rem' }}>⚙️</div>
        <div>
          <h3 className="modal-title">Explorer Settings</h3>
          <div className="modal-subtitle">Prototype Preferences &middot; React Edition</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '18px 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sound Effects & Audio
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Quiz chime and feedback sounds
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--saffron)', width: '18px', height: '18px', cursor: 'pointer' }} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text-primary)' }}>
              3D Chakra Background Motion
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Interactive 24-spoke Three.js wheel
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--saffron)', width: '18px', height: '18px', cursor: 'pointer' }} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Reset Demo Account
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Reset XP, badges, and progress state to defaults
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            onClick={() => {
              onResetDemo();
              onClose();
            }}
          >
            RESET DATA
          </button>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>CLOSE</button>
      </div>
    </ModalOverlay>
  );
};