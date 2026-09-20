import React from 'react';

interface QuizFeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  fact: string;
}

export const QuizFeedback: React.FC<QuizFeedbackProps> = ({ isCorrect, correctAnswer, fact }) => {
  return (
    <div className="challenge-feedback" id="challenge-feedback">
      <div className={`feedback-content ${isCorrect ? 'success' : 'error'}`}>
        {isCorrect ? (
          <>
            ✅ <strong>Correct!</strong> {fact}
          </>
        ) : (
          <>
            ❌ <strong>Incorrect!</strong> {correctAnswer ? (
              <span>The correct answer was: <strong>{correctAnswer}</strong>. </span>
            ) : null}
            {fact}
          </>
        )}
      </div>
    </div>
  );
};