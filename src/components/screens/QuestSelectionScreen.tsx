import React, { useState, useEffect } from 'react';
import { PlayerData, Quest, ScreenType } from '../../types';
import { getQuests } from '../../services/questService';

interface QuestSelectionScreenProps {
  player: PlayerData;
  onNavigate: (screen: ScreenType) => void;
  onSelectQuest: (questId: string) => void;
  onLockedQuestClick: (quest: Quest) => void;
}

export const QuestSelectionScreen: React.FC<QuestSelectionScreenProps> = ({
  player,
  onNavigate,
  onSelectQuest,
  onLockedQuestClick
}) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);

  useEffect(() => {
    let mounted = true;
    getQuests().then(loaded => {
      if (mounted) {
        setQuests(loaded);
        setIsLoadingQuests(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="screen-quest-selection" className="screen active">
      <div className="inner-page">
        <div className="back-row">
          <button className="btn-back" onClick={() => onNavigate('home')}>&#8592; Back</button>
        </div>
        <div className="page-header">
          <h2 className="page-title">Choose Your Quest</h2>
          <p className="page-sub">Every quest is a journey through time. Progression unlocks new storylines as you earn XP.</p>
        </div>
        {isLoadingQuests ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📜</div>
            <h3 style={{ color: 'var(--gold)', marginBottom: '8px' }}>Loading Quests from Supabase...</h3>
            <p>Fetching available historical chronicles and mission parameters...</p>
          </div>
        ) : (
        <div className="quest-grid" id="quest-cards-grid">
          {quests.map((quest) => {
            const isUnlocked = player.level >= quest.requiredLevel;
            const gradientBg = quest.id === 'ancient-india-01'
              ? 'linear-gradient(135deg,#FF6B35,#FF9933)'
              : quest.id === 'explore-india-02'
              ? 'linear-gradient(135deg,#0EA5E9,#38BDF8)'
              : quest.id.includes('culture')
              ? 'linear-gradient(135deg,#7C3AED,#A855F7)'
              : 'linear-gradient(135deg,#059669,#10B981)';

            return (
              <div
                key={quest.id}
                className={`quest-card ${isUnlocked ? 'quest-active' : 'quest-coming'}`}
                id={`card-${quest.id}`}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectQuest(quest.id);
                  } else {
                    onLockedQuestClick(quest);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {isUnlocked && quest.id === 'ancient-india-01' && <div className="quest-card-glow"></div>}
                <div className="quest-card-top">
                  <div className="quest-icon-wrap" style={{ background: gradientBg }}>
                    <span className="quest-icon">{quest.icon || '🏺'}</span>
                  </div>
                  <div
                    className={`quest-badge-status ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={!isUnlocked ? { background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' } : undefined}
                  >
                    {isUnlocked ? 'PLAYABLE NOW' : `LVL ${quest.requiredLevel} UNLOCK`}
                  </div>
                </div>
                <div className="quest-card-body">
                  <h3 className="quest-title">{quest.displayTitle}</h3>
                  <p className="quest-desc">{quest.description}</p>
                  <div className="quest-meta">
                    <div className="quest-meta-item"><span>⚔️</span><span>{quest.difficulty}</span></div>
                    <div className="quest-meta-item"><span>⏱</span><span>{quest.estimatedTime}</span></div>
                    <div className="quest-meta-item xp-reward"><span>⚡</span><span>{quest.xpReward}</span></div>
                  </div>
                </div>
                <button
                  className={`btn-quest-action ${isUnlocked ? 'unlocked' : 'locked'}`}
                  style={!isUnlocked ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                >
                  {isUnlocked ? 'ENTER QUEST →' : `🔒 LOCKED (REQ LVL ${quest.requiredLevel})`}
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};