import React from 'react';

interface QuizHintProps {
  hint: string;
}

export const QuizHint: React.FC<QuizHintProps> = ({ hint }) => {
  return (
    <div className="hint-area" id="hint-area">
      <div className="hint-card">
        <span className="hint-icon">💡</span>
        <div>
          <div className="hint-title">Archaeological Hint</div>
          <p className="hint-text" id="hint-text">{hint}</p>
        </div>
      </div>
    </div>
  );
};