import React, { useState, useEffect } from 'react';
import { MissionInfoType, ScreenType } from '../../types';
import { HeritageArtifact3D } from '../artifact/HeritageArtifact3D';
import { getQuestDetails, DbQuestDetails } from '../../services/questService';

interface MissionBriefScreenProps {
  questId?: string;
  onNavigate: (screen: ScreenType) => void;
  onOpenInfoModal: (type: MissionInfoType) => void;
  onStartChallenge: () => void;
  onArtifactReset?: () => void;
}

export const MissionBriefScreen: React.FC<MissionBriefScreenProps> = ({
  questId = 'ancient-india-01',
  onNavigate,
  onOpenInfoModal,
  onStartChallenge,
  onArtifactReset
}) => {
  const [quest, setQuest] = useState<DbQuestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getQuestDetails(questId).then(details => {
      if (mounted) {
        if (details) setQuest(details);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [questId]);

  const displayTitle = quest?.displayTitle || 'Ancient India';
  const subtitle = quest?.subtitle || 'The Lost Artifact';
  const description = quest?.description ||
    'Journey back to the dawn of civilization. Unravel mysteries of the Indus Valley, Vedic age, and mighty empires through archaeological clues.';
  const difficulty = quest?.difficulty || 'Easy';
  const estimatedTime = quest?.estimatedTime || '~5 min';
  const xpReward = quest?.xpReward || '+250 XP Max';
  const badgeName = quest?.badgeName || 'Heritage Explorer';
  const questionCount = quest?.questionCount || 5;

  return (
    <section id="screen-mission-brief" className="screen active">
      <div className="inner-page">
        <div className="back-row">
          <button className="btn-back" type="button" onClick={() => onNavigate('quests')}>
            &#8592; Back to Quests
          </button>
        </div>
        <div className="mission-brief-wrap">
          <div className="mission-left">
            <div className="mission-number-tag">
              {isLoading ? 'LOADING PARAMETERS...' : `EXPEDITION · ${questionCount} QUESTIONS`}
            </div>
            <h2 className="mission-title">{displayTitle} {subtitle ? `· ${subtitle}` : ''}</h2>
            <p className="mission-desc">{description}</p>
            <div className="mission-info-grid">
              <div
                className="mission-info-card"
                onClick={() => onOpenInfoModal('difficulty')}
                title="Click for Difficulty details"
                tabIndex={0}
                role="button"
              >
                <span className="mi-icon">⚔️</span>
                <span className="mi-label">Difficulty</span>
                <span className="mi-val">{difficulty}</span>
                <span className="mi-tap-hint">ℹ️ Tap for info</span>
              </div>
              <div
                className="mission-info-card"
                onClick={() => onOpenInfoModal('time')}
                title="Click for Time details"
                tabIndex={0}
                role="button"
              >
                <span className="mi-icon">⏱</span>
                <span className="mi-label">Estimated Time</span>
                <span className="mi-val">{estimatedTime}</span>
                <span className="mi-tap-hint">ℹ️ Tap for info</span>
              </div>
              <div
                className="mission-info-card highlight"
                onClick={() => onOpenInfoModal('reward')}
                title="Click for Reward details"
                tabIndex={0}
                role="button"
              >
                <span className="mi-icon">⚡</span>
                <span className="mi-label">Reward</span>
                <span className="mi-val">{xpReward}</span>
                <span className="mi-tap-hint">ℹ️ Tap for info</span>
              </div>
              <div
                className="mission-info-card"
                onClick={() => onOpenInfoModal('badge')}
                title="Click for Badge details"
                tabIndex={0}
                role="button"
              >
                <span className="mi-icon">🎖</span>
                <span className="mi-label">Badge</span>
                <span className="mi-val">{badgeName}</span>
                <span className="mi-tap-hint">ℹ️ Tap for info</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-primary btn-glow"
              style={{ fontSize: '1.05rem', padding: '16px 44px' }}
              onClick={onStartChallenge}
            >
              START MISSION ({questionCount} QUESTIONS) &#8594;
            </button>
          </div>

          <div className="mission-right">
            <HeritageArtifact3D onReset={onArtifactReset} />
          </div>
        </div>
      </div>
    </section>
  );
};