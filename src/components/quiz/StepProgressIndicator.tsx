import React from 'react';

interface StepProgressIndicatorProps {
  currentIndex: number;
  total: number;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentIndex,
  total
}) => {
  const steps = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="challenge-progress-info">
      <div className="challenge-step-title" id="challenge-step-title">
        QUESTION {currentIndex + 1} OF {total}
      </div>
      <div className="mission-step-indicator" id="mission-step-indicator">
        {steps.map((idx) => {
          let dotClass = 'step-dot';
          if (idx === currentIndex) dotClass += ' active';
          else if (idx < currentIndex) dotClass += ' done';

          return (
            <React.Fragment key={idx}>
              <div className={dotClass}>{idx + 1}</div>
              {idx < total - 1 && <div className={`step-line ${idx < currentIndex ? 'done' : ''}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};