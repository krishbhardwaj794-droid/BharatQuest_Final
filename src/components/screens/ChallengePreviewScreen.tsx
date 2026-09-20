import { useState } from 'react';
import { ScreenType } from '../../types';

interface ChallengePreviewScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onFinishQuiz: (earnedXp: number, accuracy: number) => void;
}

export const ChallengePreviewScreen = ({
  onNavigate,
  onFinishQuiz
}: ChallengePreviewScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const options = [
    { label: 'A', text: 'Indus Valley Civilization', correct: true },
    { label: 'B', text: 'Mesopotamian Civilization', correct: false },
    { label: 'C', text: 'Ancient Egyptian Civilization', correct: false },
    { label: 'D', text: 'Mayan Civilization', correct: false }
  ];

  const handleFinish = () => {
    const isCorrect = selectedOption === 'Indus Valley Civilization';
    const earnedXp = isCorrect ? 250 : 50;
    const accuracy = isCorrect ? 100 : 80;
    onFinishQuiz(earnedXp, accuracy);
  };

  return (
    <section id="screen-challenge" className="screen active">
      <div className="challenge-wrap">
        <div className="challenge-header">
          <button className="btn-back-sm" onClick={() => onNavigate('brief')}>&#8592; Exit</button>

          {/* Visual Step Progress Indicator: ●━━━━○━━━━○━━━━○━━━━○ */}
          <div className="challenge-progress-info">
            <div className="challenge-step-title" id="challenge-step-title">QUESTION 1 OF 5</div>
            <div className="mission-step-indicator" id="mission-step-indicator">
              <div className="step-dot active">1</div>
              <div className="step-line"></div>
              <div className="step-dot">2</div>
              <div className="step-line"></div>
              <div className="step-dot">3</div>
              <div className="step-line"></div>
              <div className="step-dot">4</div>
              <div className="step-line"></div>
              <div className="step-dot">5</div>
            </div>
          </div>

          <div className="challenge-timer normal" id="challenge-timer" title="Mission Time Remaining">
            <span className="timer-icon">⏱</span>
            <span className="timer-val" id="challenge-timer-val">04:52</span>
          </div>

          <div className="challenge-xp-indicator">
            <span>⚡</span>
            <span id="challenge-xp-display">+250 XP Max</span>
          </div>
        </div>

        <div className="challenge-body">
          <div className="challenge-storyline-bar">
            <span className="cs-badge">ARCHAEOLOGICAL INVESTIGATION</span>
            <span className="cs-text">OBSERVE &rarr; INSPECT &rarr; IDENTIFY &rarr; LEARN</span>
          </div>

          <div className="challenge-clue-box" id="challenge-clue-box">
            <span className="clue-icon">📜</span>
            <span className="clue-text" id="challenge-clue-text">
              Inspect the terracotta vessel and geometric markings. Study the clues before answering.
            </span>
          </div>

          <div className="challenge-category-tag" id="challenge-category-tag">
            🏺 Ancient India &middot; Mission 01 &middot; Question 1 of 5 &middot; Easy
          </div>
          <h2 className="challenge-question" id="challenge-question">Identify the Civilization</h2>
          <p className="challenge-sub" id="challenge-sub">This archaeological vessel is associated with which ancient Bronze Age civilization?</p>

          <div className="options-grid" id="options-grid">
            {options.map((opt) => {
              let btnClass = 'option-btn';
              if (selectedOption === opt.text) {
                btnClass += opt.correct ? ' correct' : ' wrong';
              }
              return (
                <button
                  key={opt.label}
                  className={btnClass}
                  onClick={() => setSelectedOption(opt.text)}
                >
                  <span className="option-label">{opt.label}</span>
                  <span className="option-text">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="challenge-feedback" id="challenge-feedback">
              <div className={`feedback-content ${selectedOption === 'Indus Valley Civilization' ? 'success' : 'error'}`}>
                {selectedOption === 'Indus Valley Civilization' ? (
                  <>✅ <strong>Correct!</strong> Harappan terracotta vessels were turned on potter's wheels and painted with distinctive black geometric and animal motifs.</>
                ) : (
                  <>❌ <strong>Not Quite!</strong> Study the urban and river valley clues or inspect the hint.</>
                )}
              </div>
            </div>
          )}

          {showHint && (
            <div className="hint-area" id="hint-area">
              <div className="hint-card">
                <span className="hint-icon">💡</span>
                <div>
                  <div className="hint-title">Archaeological Hint</div>
                  <p className="hint-text" id="hint-text">
                    Think about one of the earliest urban civilizations of the Indian subcontinent, flourishing along the Indus river basin around 3300–1300 BCE.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="challenge-actions" id="challenge-actions">
            {!showHint && (
              <button className="btn-hint" onClick={() => setShowHint(true)}>
                💡 Get Hint
              </button>
            )}
            <button className="btn-continue" onClick={handleFinish}>
              VIEW MISSION RESULTS &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};