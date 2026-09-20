import React from 'react';
import { Question } from '../../types';
import { getQuestionImageSearch } from '../../utils/imageSearch';

interface ExploreImageButtonProps {
  question: Question;
}

export const ExploreImageButton: React.FC<ExploreImageButtonProps> = ({ question }) => {
  const searchInfo = getQuestionImageSearch(question);

  const handleOpenReference = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Purely educational visual exploration (+0 XP, does not affect timer or quiz logic)
    window.open(searchInfo.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="explore-image-wrapper" style={{ margin: '14px 0 18px', textAlign: 'center' }}>
      <button
        type="button"
        className="btn-explore-image"
        id="btn-explore-image"
        onClick={handleOpenReference}
        aria-label={`Visually explore ${searchInfo.title} on Google Images in a new tab`}
        title={`Explore visual references for ${searchInfo.title}`}
      >
        <div className="explore-img-left">
          <span className="explore-img-icon" aria-hidden="true">🖼️</span>
        </div>
        <div className="explore-img-center">
          <span className="explore-img-label" id="explore-img-label">
            EXPLORE {searchInfo.title.toUpperCase()}
          </span>
          <span className="explore-img-subtitle">
            Visually explore this heritage topic &middot; Opens in a new tab
          </span>
        </div>
        <div className="explore-img-right" aria-hidden="true">
          <span className="explore-img-ext-icon">↗</span>
        </div>
      </button>
    </div>
  );
};
