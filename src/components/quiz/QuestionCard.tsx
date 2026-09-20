import React from 'react';
import { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  total: number;
  categoryTag: string;
  isClueUnlocked: boolean;
  onRequestClue: () => void;
  difficultyTier?: string;
  playerLevel?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  total,
  categoryTag,
  isClueUnlocked,
  onRequestClue,
  difficultyTier = 'Basic',
  playerLevel = 1
}) => {
  return (
    <>
      <div className="challenge-storyline-bar">
        <span className="cs-badge">ARCHAEOLOGICAL INVESTIGATION</span>
        <span className="cs-text">OBSERVE &rarr; INSPECT &rarr; IDENTIFY &rarr; LEARN</span>
      </div>

      <div
        className={`challenge-clue-box ${isClueUnlocked ? 'unlocked' : 'locked'}`}
        id="challenge-clue-box"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isClueUnlocked ? 'center' : 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {isClueUnlocked ? (
          <>
            <span className="clue-icon">📜</span>
            <span className="clue-text" id="challenge-clue-text">
              <strong style={{ color: 'var(--gold)', marginRight: '6px' }}>[UNLOCKED CLUE]:</strong>
              {question.clue}
            </span>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="clue-icon">🔒</span>
              <span className="clue-text" style={{ fontStyle: 'normal' }}>
                Encrypted Archaeological Inscription
              </span>
            </div>
            <button
              type="button"
              className="btn-unlock-clue"
              id="btn-unlock-clue"
              onClick={onRequestClue}
              style={{
                background: 'linear-gradient(135deg, rgba(232, 176, 66, 0.2), rgba(255, 153, 51, 0.25))',
                border: '1px solid rgba(232, 176, 66, 0.5)',
                color: 'var(--gold)',
                borderRadius: '20px',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📜</span> Unlock Clue (-25 XP)
            </button>
          </>
        )}
      </div>

      <div className="challenge-category-tag" id="challenge-category-tag">
        {categoryTag} &middot; Question {currentIndex + 1} of {total} &middot; Tier: {difficultyTier} &middot; Explorer Level {playerLevel}
      </div>
      <h2 className="challenge-question" id="challenge-question">{question.question}</h2>
      <p className="challenge-sub" id="challenge-sub">{question.sub}</p>
    </>
  );
};