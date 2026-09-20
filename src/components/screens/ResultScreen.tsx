import React from 'react';
import { PlayerData, ScreenType } from '../../types';
import { QuizMissionResult } from './QuizScreen';

interface ResultScreenProps {
  player: PlayerData;
  result: QuizMissionResult | null;
  onNavigate: (screen: ScreenType) => void;
  onInspectBadge: (badgeName: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  player,
  result,
  onNavigate,
  onInspectBadge
}) => {
  const earnedXp = result ? result.earnedXp : 250;
  const correctCount = result ? result.correctCount : 5;
  const totalQuestions = result ? result.totalQuestions : 5;
  const accuracyPct = result ? result.accuracyPct : 100;
  const badgeName = result ? result.badgeName : 'Heritage Explorer';

  const mins = result ? Math.floor(result.timeTakenSeconds / 60) : 3;
  const secs = result ? result.timeTakenSeconds % 60 : 42;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <section id="screen-result" className="screen active">
      <div className="result-wrap">
        <div className="result-celebration" id="result-celebration"></div>
        <div className="result-content">
          <div className="result-avatar-display" id="result-avatar-display" style={{ fontSize: '3rem', marginBottom: '6px' }}>
            {player.avatarIcon || '🦁'}
          </div>
          <div className="result-icon">🎉</div>
          <h2 className="result-title">Quest Completed!</h2>
          <p className="result-sub" id="result-sub-text">
            {result?.timeExpired
              ? 'Time expired! Here is your performance summary for this archaeological exploration.'
              : 'You have successfully decoded the archaeological secrets of this mission!'}
          </p>

          <div className="result-xp-display">
            <div className="result-xp-ring">
              <span className="result-xp-num" id="result-earned-xp">+{earnedXp}</span>
              <span className="result-xp-label">XP EARNED</span>
            </div>
            {result?.cluesUsed && result.cluesUsed > 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '8px' }}>
                Net XP reflects -{result.cluesUsed * 25} XP deduction for {result.cluesUsed} clue{result.cluesUsed > 1 ? 's' : ''} used.
              </div>
            ) : null}
          </div>

          <div className="result-badge-reveal">
            <div
              className="badge-unlock-anim"
              onClick={() => onInspectBadge(badgeName)}
              title="Click to view badge details"
              style={{ cursor: 'pointer' }}
            >
              <div className="badge-glow-pulse"></div>
              <div className="badge-icon-large">🏺</div>
              <div className="badge-unlock-text">Badge Unlocked! &middot; Click to inspect</div>
              <div className="badge-name">{badgeName}</div>
            </div>
          </div>

          <div className="result-progress-section">
            <div className="rp-label">Ancient India Questline Progress</div>
            <div className="rp-bar-wrap">
              <div className="rp-bar">
                <div className="rp-fill" style={{ width: '33%' }}></div>
              </div>
              <span className="rp-count" id="rp-count-text">1 / 3 Missions</span>
            </div>
          </div>

          <div className="result-stats-row">
            <div className="rs-item">
              <span className="rs-icon">✅</span>
              <span className="rs-val" id="rs-correct-count">{correctCount} / {totalQuestions}</span>
              <span className="rs-label">Correct Answers</span>
            </div>
            <div className="rs-item">
              <span className="rs-icon">🎯</span>
              <span className="rs-val" id="rs-accuracy">{accuracyPct}%</span>
              <span className="rs-label">Accuracy</span>
            </div>
            <div className="rs-item">
              <span className="rs-icon">📜</span>
              <span className="rs-val" id="rs-clues-used">{result?.cluesUsed ?? 0}</span>
              <span className="rs-label">Clues Used</span>
            </div>
            <div className="rs-item">
              <span className="rs-icon">⏱</span>
              <span className="rs-val" id="rs-time-stat">{formattedTime}</span>
              <span className="rs-label" id="rs-time-label">Time</span>
            </div>
            <div className="rs-item">
              <span className="rs-icon">⚡</span>
              <span className="rs-val" id="rs-total-xp">{player.xp.toLocaleString()} XP</span>
              <span className="rs-label">Total XP</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary btn-glow"
            onClick={() => onNavigate('recommendation')}
          >
            VIEW PERSONALIZED RECOMMENDATION &#8594;
          </button>
        </div>
      </div>
    </section>
  );
};