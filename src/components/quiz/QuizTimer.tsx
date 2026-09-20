import React from 'react';

interface QuizTimerProps {
  formatted: string;
  statusClass: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ formatted, statusClass }) => {
  return (
    <div className={`challenge-timer ${statusClass}`} id="challenge-timer" title="Mission Time Remaining">
      <span className="timer-icon">⏱</span>
      <span className="timer-val" id="challenge-timer-val">{formatted}</span>
    </div>
  );
};