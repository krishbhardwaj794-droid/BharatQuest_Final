import React, { useState, useEffect } from 'react';
import { Badge, CompletedQuest, PlayerData, ScreenType } from '../../types';
import { getCurrentLevelBaseXp, getNextLevelXp, levelTitles } from '../../utils/levelEngine';
import { getUserTopicPerformance, TopicPerformanceResult, TopicMetric } from '../../services/recommendationService';

interface ProgressScreenProps {
  player: PlayerData;
  currentUserId?: string;
  onNavigate: (screen: ScreenType) => void;
  onBadgeClick: (badge: Badge) => void;
  onQuestClick: (quest: CompletedQuest) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  player,
  currentUserId,
  onNavigate,
  onBadgeClick,
  onQuestClick
}) => {
  const [topicPerf, setTopicPerf] = useState<TopicPerformanceResult | null>(null);

  useEffect(() => {
    let mounted = true;
    if (currentUserId) {
      getUserTopicPerformance(currentUserId).then(perf => {
        if (mounted) {
          setTopicPerf(perf);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  const earnedBadgesCount = player.badges.filter(b => b.earned).length;

  const baseLevelXp = getCurrentLevelBaseXp(player.level);
  const nextLevelXp = getNextLevelXp(player.level);
  const xpInLevel = Math.max(0, player.xp - baseLevelXp);
  const xpSpan = nextLevelXp - baseLevelXp;
  const xpPct = Math.min(100, Math.max(0, Math.round((xpInLevel / xpSpan) * 100)));

  const defaultMetric = (topic: 'history' | 'culture' | 'geography', name: string, icon: string, score: number): TopicMetric => {
    if (!score || score === 0) {
      return {
        topic,
        name,
        icon,
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        status: 'No Data Yet',
        label: 'NO DATA YET',
        statusClass: 'no-data',
        gradient: 'linear-gradient(90deg, #64748B, #475569)',
        hasEnoughData: false
      };
    }
    if (score >= 85) return { topic, name, icon, totalAttempts: 5, correctAttempts: 5, accuracy: score, status: 'Strong', label: 'STRONG', statusClass: 'good', gradient: 'linear-gradient(90deg,#22C55E,#16A34A)', hasEnoughData: true };
    if (score >= 70) return { topic, name, icon, totalAttempts: 5, correctAttempts: 4, accuracy: score, status: 'Keep Improving', label: 'KEEP IMPROVING', statusClass: 'developing', gradient: 'linear-gradient(90deg,#F59E0B,#D97706)', hasEnoughData: true };
    if (score >= 50) return { topic, name, icon, totalAttempts: 5, correctAttempts: 3, accuracy: score, status: 'Keep Improving', label: 'KEEP IMPROVING', statusClass: 'developing', gradient: 'linear-gradient(90deg,#F97316,#EA580C)', hasEnoughData: true };
    return { topic, name, icon, totalAttempts: 5, correctAttempts: 2, accuracy: score, status: 'Needs Practice', label: 'NEEDS PRACTICE', statusClass: 'needs-practice', gradient: 'linear-gradient(90deg,#EF4444,#DC2626)', hasEnoughData: true };
  };

  const hist = topicPerf?.history || defaultMetric('history', 'History', '📜', player.historyScore);
  const cult = topicPerf?.culture || defaultMetric('culture', 'Culture', '🎭', player.cultureScore);
  const geo = topicPerf?.geography || defaultMetric('geography', 'Geography', '🗺️', player.geographyScore);

  return (
    <section id="screen-progress" className="screen active">
      <div className="inner-page">
        <div className="back-row">
          <button className="btn-back" onClick={() => onNavigate('home')}>&#8592; Home</button>
        </div>
        <div className="page-header">
          <h2 className="page-title" id="progress-page-title">{player.name}'s Journey</h2>
          <p className="page-sub">Track your heritage exploration progress &middot; Click badges or completed quests for details</p>
        </div>

        <div className="progress-hero">
          <div className="ph-avatar" id="ph-avatar">{player.avatarIcon || player.avatar}</div>
          <div className="ph-info">
            <h3 className="ph-name" id="ph-name">{player.name}</h3>
            <div className="ph-rank" id="ph-rank-text">{levelTitles[player.level] || 'Explorer'}</div>
            <div className="ph-xp-row">
              <span className="ph-level" id="ph-level">Level {player.level}</span>
              <div className="ph-xp-bar-wrap">
                <div className="ph-xp-bar">
                  <div className="ph-xp-fill" style={{ width: `${xpPct}%` }}></div>
                </div>
              </div>
              <span className="ph-xp-text" id="ph-xp-text">{player.xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="ph-badge-count">
            <span className="pbc-num" id="ph-badges">{earnedBadgesCount}</span>
            <span className="pbc-label">Badges<br />Earned</span>
          </div>
        </div>

        <div className="progress-stats-row">
          <div className="psr-card">
            <div className="psr-icon">⚔️</div>
            <div className="psr-val" id="psr-quests">{player.questsDone}</div>
            <div className="psr-label">Quests Done</div>
          </div>
          <div className="psr-card">
            <div className="psr-icon">🎯</div>
            <div className="psr-val" id="psr-accuracy">{player.accuracy > 0 ? `${player.accuracy}%` : '—'}</div>
            <div className="psr-label">Accuracy</div>
          </div>
          <div className="psr-card">
            <div className="psr-icon">⚡</div>
            <div className="psr-val" id="psr-xp">{player.xp.toLocaleString()}</div>
            <div className="psr-label">Total XP</div>
          </div>
          <div className="psr-card">
            <div className="psr-icon">🔥</div>
            <div className="psr-val">3</div>
            <div className="psr-label">Day Streak</div>
          </div>
        </div>

        {/* Topic Performance Grid */}
        <div className="progress-section-title">Topic Performance</div>
        <div className="topic-performance-grid" id="topic-performance-grid">
          <div className="tp-card">
            <div className="tp-header">
              <span className="tp-icon">{hist.icon}</span>
              <span className="tp-name">{hist.name}</span>
              <span className="tp-pct">{hist.totalAttempts === 0 ? '—' : `${hist.accuracy}%`}</span>
              <span className={`tp-badge ${hist.statusClass}`}>{hist.label}</span>
            </div>
            <div className="tp-bar">
              <div
                className="tp-fill"
                style={{
                  width: `${hist.totalAttempts === 0 ? 0 : hist.accuracy}%`,
                  background: hist.gradient
                }}
              ></div>
            </div>
            <div className="tp-detail">
              {hist.totalAttempts === 0
                ? 'No attempts recorded yet'
                : hist.totalAttempts < 3
                ? `${hist.totalAttempts} attempt${hist.totalAttempts === 1 ? '' : 's'} (${hist.correctAttempts} correct) · Min 3 for rating`
                : `${hist.correctAttempts} of ${hist.totalAttempts} correct (${hist.accuracy}%)`}
            </div>
          </div>
          <div className="tp-card">
            <div className="tp-header">
              <span className="tp-icon">{cult.icon}</span>
              <span className="tp-name">{cult.name}</span>
              <span className="tp-pct">{cult.totalAttempts === 0 ? '—' : `${cult.accuracy}%`}</span>
              <span className={`tp-badge ${cult.statusClass}`}>{cult.label}</span>
            </div>
            <div className="tp-bar">
              <div
                className="tp-fill"
                style={{
                  width: `${cult.totalAttempts === 0 ? 0 : cult.accuracy}%`,
                  background: cult.gradient
                }}
              ></div>
            </div>
            <div className="tp-detail">
              {cult.totalAttempts === 0
                ? 'No attempts recorded yet'
                : cult.totalAttempts < 3
                ? `${cult.totalAttempts} attempt${cult.totalAttempts === 1 ? '' : 's'} (${cult.correctAttempts} correct) · Min 3 for rating`
                : `${cult.correctAttempts} of ${cult.totalAttempts} correct (${cult.accuracy}%)`}
            </div>
          </div>
          <div className="tp-card">
            <div className="tp-header">
              <span className="tp-icon">{geo.icon}</span>
              <span className="tp-name">{geo.name}</span>
              <span className="tp-pct">{geo.totalAttempts === 0 ? '—' : `${geo.accuracy}%`}</span>
              <span className={`tp-badge ${geo.statusClass}`}>{geo.label}</span>
            </div>
            <div className="tp-bar">
              <div
                className="tp-fill"
                style={{
                  width: `${geo.totalAttempts === 0 ? 0 : geo.accuracy}%`,
                  background: geo.gradient
                }}
              ></div>
            </div>
            <div className="tp-detail">
              {geo.totalAttempts === 0
                ? 'No attempts recorded yet'
                : geo.totalAttempts < 3
                ? `${geo.totalAttempts} attempt${geo.totalAttempts === 1 ? '' : 's'} (${geo.correctAttempts} correct) · Min 3 for rating`
                : `${geo.correctAttempts} of ${geo.totalAttempts} correct (${geo.accuracy}%)`}
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="progress-section-title">
          Badges &amp; Achievements <span className="pst-hint">(Click any badge for details)</span>
        </div>
        <div className="badges-grid" id="progress-badges-grid">
          {player.badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
              onClick={() => onBadgeClick(badge)}
              title={badge.earned ? `Unlocked: ${badge.name}` : 'Locked'}
              style={{ cursor: 'pointer' }}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name-sm">{badge.name}</div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: badge.earned ? 'var(--accent-success)' : 'var(--text-muted)',
                  marginTop: '2px'
                }}
              >
                {badge.earned ? '✓ Earned' : '🔒 Locked'}
              </div>
            </div>
          ))}
        </div>

        {/* Completed Quests List */}
        <div className="progress-section-title">
          Completed Quests <span className="pst-hint">(Click to view summary or replay)</span>
        </div>
        <div className="completed-quests" id="completed-quests-list">
          {player.completedQuests.length === 0 ? (
            <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem' }}>🏺</span>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', marginTop: '8px' }}>No quests completed yet.</p>
              <button
                className="btn-primary"
                style={{ marginTop: '12px', padding: '10px 24px', fontSize: '0.85rem' }}
                onClick={() => onNavigate('brief')}
              >
                START ANCIENT INDIA MISSION &rarr;
              </button>
            </div>
          ) : (
            player.completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="cq-item"
                onClick={() => onQuestClick(quest)}
                title="Click to view summary and replay"
                style={{ cursor: 'pointer' }}
              >
                <div className="cq-icon">{quest.id.includes('explore') ? '🌊' : '🏺'}</div>
                <div className="cq-info">
                  <div className="cq-name">{quest.name}</div>
                  <div className="cq-detail">
                    {quest.detail} &middot; Time: {quest.time || '~3 min'} &middot; <strong style={{ color: 'var(--saffron)' }}>Click to inspect/replay</strong>
                  </div>
                </div>
                <div className="cq-xp">{quest.xp}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};