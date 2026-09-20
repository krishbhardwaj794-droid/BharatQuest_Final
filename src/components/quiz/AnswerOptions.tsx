import React from 'react';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (option: string) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  isAnswered,
  onSelect
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="options-grid" id="options-grid">
      {options.map((opt, idx) => {
        let btnClass = 'option-btn';
        if (selectedAnswer === opt) {
          btnClass += opt === correctAnswer ? ' correct' : ' wrong';
        } else if (isAnswered && opt === correctAnswer) {
          btnClass += ' correct';
        }

        return (
          <button
            key={opt}
            type="button"
            className={btnClass}
            disabled={isAnswered || selectedAnswer !== null}
            onClick={() => onSelect(opt)}
          >
            <span className="option-label">{letters[idx] || (idx + 1)}</span>
            <span className="option-text">{opt}</span>
          </button>
        );
      })}
    </div>
  );
};