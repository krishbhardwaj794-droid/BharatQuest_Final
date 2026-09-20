import React, { useState, useEffect } from 'react';
import { PlayerData, ScreenType } from '../../types';
import { getPersonalizedRecommendations, QuestRecommendation } from '../../services/recommendationService';
import { getAIStudyPlan, AIStudyPlan } from '../../services/geminiService';

interface RecommendationScreenProps {
  player: PlayerData;
  currentUserId?: string;
  onNavigate: (screen: ScreenType) => void;
  onStartRecommendedQuest: (questId: string) => void;
}


export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({
  player: _player,
  currentUserId,
  onNavigate,
  onStartRecommendedQuest
}) => {
  const [rec, setRec] = useState<QuestRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState<AIStudyPlan | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (currentUserId) {
      getPersonalizedRecommendations(currentUserId).then(result => {
        if (mounted) {
          setRec(result);
          setIsLoading(false);

          // 🤖 After getting recommendations, fetch AI Study Plan
          if (result) {
            setIsLoadingAI(true);
            const weakTopics = result.weakestTopic
              ? [{ name: result.weakestTopic.name, accuracy: result.weakestTopic.accuracy, attempts: result.weakestTopic.totalAttempts }]
              : [];
            const strongTopics = result.strongestTopic
              ? [{ name: result.strongestTopic.name, accuracy: result.strongestTopic.accuracy }]
              : [];
            getAIStudyPlan(weakTopics, strongTopics, _player?.name || 'Explorer').then(plan => {
              if (mounted) {
                setAiPlan(plan);
                setIsLoadingAI(false);
              }
            });
          }
        }
      });
    } else {
      setIsLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [currentUserId]);


  const strongest = rec?.strongestTopic;
  const weakest = rec?.weakestTopic;
  const quest = rec?.recommendedQuest;
  const isNew = rec?.isNewUser || !strongest;

  return (
    <section id="screen-recommendation" className="screen active">
      <div className="inner-page">
        <div className="back-row">
          <button className="btn-back" onClick={() => onNavigate('quests')}>&#8592; Quests</button>
        </div>
        <div className="rec-wrap">
          <div className="rec-ai-badge">
            <span className="ai-dot"></span>
            <span>Adaptive Recommendation Engine</span>
          </div>
          <h2 className="rec-title">Your Next Quest Recommendation</h2>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧭</div>
              <h3 style={{ color: 'var(--gold)', marginBottom: '6px' }}>Analyzing Historical Mastery...</h3>
              <p>Evaluating your quiz attempts from Supabase to craft custom recommendations...</p>
            </div>
          ) : (
            <>
              <p className="rec-message" id="rec-message-text">
                {rec?.insightMessage || 'Embark on historical chronicles to build and sharpen your mastery across Indian heritage.'}
              </p>

              <div className="rec-insight-row">
                <div className="rec-insight-card">
                  <div className="ric-label">Strongest Mastery Topic</div>
                  <div className="ric-val" id="rec-strong-val">
                    {strongest
                      ? `${strongest.name} — ${strongest.accuracy}% (${strongest.status})`
                      : 'No attempts recorded yet'}
                  </div>
                  <div className="ric-bar">
                    <div
                      className="ric-fill"
                      id="rec-strong-fill"
                      style={{
                        width: `${strongest ? Math.min(100, strongest.accuracy) : 0}%`,
                        background: strongest ? '#22C55E' : '#64748B'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="rec-insight-card">
                  <div className="ric-label">Area Recommended to Strengthen</div>
                  <div className="ric-val" id="rec-weak-val">
                    {weakest
                      ? `${weakest.name} — ${weakest.totalAttempts === 0 ? '0%' : `${weakest.accuracy}%`} (${weakest.status})`
                      : isNew
                      ? 'Start Exploring (No Data Yet)'
                      : 'All Topics Strong!'}
                  </div>
                  <div className="ric-bar">
                    <div
                      className="ric-fill"
                      id="rec-weak-fill"
                      style={{
                        width: `${weakest ? Math.min(100, weakest.accuracy) : 0}%`,
                        background: weakest ? (weakest.accuracy < 50 ? '#EF4444' : '#F97316') : '#64748B'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {quest && (
                <div className="rec-quest-card">
                  <div className="rec-quest-icon-wrap" style={{ overflow: 'hidden', flexShrink: 0 }}>
                    <span className="rec-quest-icon" style={{ fontSize: '2rem', display: 'inline-block' }}>
                      {quest.id === 'freedom-movement-04' ? '🇮🇳' : (quest.icon && !quest.icon.includes('ð') ? quest.icon : '🏺')}
                    </span>
                  </div>
                  <div className="rec-quest-details">
                    <div className="rec-quest-top-row">
                      <span className="rec-quest-tag">
                        {isNew ? 'RECOMMENDED STARTER MISSION' : 'ADAPTIVE SKILL TARGET'}
                      </span>
                      <span className="rec-unlock-badge unlocked" id="rec-unlock-badge">
                        {isNew ? '🚀 STARTER MISSION' : '🎯 ADAPTIVE MATCH'}
                      </span>
                    </div>
                    <h3>{quest.displayTitle}</h3>
                    <p>{quest.description}</p>
                    <div className="quest-meta">
                      <div className="quest-meta-item"><span>⚔️</span><span>{quest.difficulty}</span></div>
                      <div className="quest-meta-item"><span>⏱</span><span>{quest.estimatedTime}</span></div>
                      <div className="quest-meta-item xp-reward"><span>⚡</span><span>{quest.xpReward}</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rec-progression-notice" id="rec-progression-notice">
                <span className="rpn-icon" id="rpn-icon">🚀</span>
                <span className="rpn-text" id="rpn-text">
                  {rec?.progressionNotice || 'Ready to begin your heritage quest.'}
                </span>
              </div>

              {/* 🤖 Gemini AI Study Plan */}
              <div style={{
                margin: '16px 0',
                padding: '18px 20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08))',
                border: '1.5px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🤖</span>
                  <span style={{ color: '#A78BFA', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    BharatGuru AI Study Plan
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(139, 92, 246, 0.25)',
                    color: '#C4B5FD',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>Gemini 2.0 Flash</span>
                </div>

                {isLoadingAI ? (
                  <div style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', padding: '10px 0' }}>
                    ✨ Generating personalized study plan...
                  </div>
                ) : aiPlan ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ color: '#E2E8F0', fontSize: '0.92rem', lineHeight: '1.55', margin: 0 }}>
                      {aiPlan.summary}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {aiPlan.recommendations.map((tip, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          gap: '10px',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          color: '#CBD5E1',
                          lineHeight: '1.4'
                        }}>
                          <span style={{ color: '#A78BFA', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{
                      color: '#FCD34D',
                      fontSize: '0.88rem',
                      margin: 0,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '8px 0 0'
                    }}>
                      {aiPlan.motivationMessage}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                    Complete a quest to get your personalized AI study plan!
                  </p>
                )}
              </div>

              <div className="rec-disclaimer">
                <span>ℹ️</span>
                <span>Recommendations are dynamically generated based on your genuine Supabase quiz attempts and topic accuracy metrics.</span>
              </div>

              <div className="rec-actions" id="rec-actions-container">
                <button
                  type="button"
                  className="btn-primary btn-glow"
                  id="btn-start-recommended"
                  onClick={() => onStartRecommendedQuest(quest?.id || 'ancient-india-01')}
                >
                  START RECOMMENDED QUEST &rarr;
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onNavigate('progress')}
                >
                  VIEW MY PROGRESS
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};