import React, { useState, useEffect } from 'react';
import { PlayerData, ScreenType, LeaderboardEntry } from '../../types';
import { getLeaderboardFromDb } from '../../services/leaderboardService';

interface LeaderboardScreenProps {
  player: PlayerData;
  currentUserId?: string;
  onNavigate: (screen: ScreenType) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  player,
  currentUserId,
  onNavigate
}) => {
  const [boardData, setBoardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLeaderboardFromDb(currentUserId).then(dbEntries => {
      if (mounted) {
        setBoardData(dbEntries);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  // Sync current player name/avatar if isMe is set
  const data = boardData.map(entry => {
    if (entry.isMe) {
      return {
        ...entry,
        name: player.name || entry.name,
        avatar: player.avatarIcon || player.avatar || entry.avatar
      };
    }
    return entry;
  });

  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  return (
    <section id="screen-leaderboard" className="screen active">
      <div className="inner-page">
        <div className="back-row">
          <button className="btn-back" onClick={() => onNavigate('home')}>&#8592; Home</button>
        </div>
        <div className="page-header">
          <h2 className="page-title">BharatQuest Leaderboard</h2>
          <p className="page-sub">The greatest heritage explorers of all time &middot; Ranked by total earned XP in Supabase</p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🏛️</div>
            <h3 style={{ color: 'var(--gold)', marginBottom: '8px' }}>Loading Real-Time Rankings...</h3>
            <p>Fetching explorer scores directly from the BharatQuest database...</p>
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', margin: '20px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🏛️</div>
            <h3 style={{ color: 'var(--gold)', marginBottom: '8px' }}>Hall of Heritage Explorers</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No other explorers have joined the leaderboard yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>Complete missions and earn XP to establish your place in the national records!</p>
            <button className="btn-primary btn-glow" style={{ marginTop: '20px' }} onClick={() => onNavigate('quests')}>
              START A QUEST &rarr;
            </button>
          </div>
        ) : (
          <>
            {/* Top Podium */}
            <div className="podium-wrap" id="podium-wrap">
              {top2 && (
                <div className="podium-place second">
                  <div className="podium-avatar pa-2">{top2.avatar}</div>
                  <div className="podium-name">{top2.name} {top2.isMe ? '(YOU)' : ''}</div>
                  <div className="podium-block pb-2">
                    <span className="podium-rank-num">2</span>
                    <span className="podium-xp">{top2.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}
              {top1 && (
                <div className="podium-place first">
                  <div className="podium-crown">👑</div>
                  <div className="podium-avatar pa-1">{top1.avatar}</div>
                  <div className="podium-name">{top1.name} {top1.isMe ? '(YOU)' : ''}</div>
                  <div className="podium-block pb-1">
                    <span className="podium-rank-num">1</span>
                    <span className="podium-xp">{top1.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}
              {top3 && (
                <div className="podium-place third">
                  <div className="podium-avatar pa-3">{top3.avatar}</div>
                  <div className="podium-name">{top3.name} {top3.isMe ? '(YOU)' : ''}</div>
                  <div className="podium-block pb-3">
                    <span className="podium-rank-num">3</span>
                    <span className="podium-xp">{top3.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}
            </div>

            {/* If only 1 real user exists, show status banner */}
            {data.length === 1 && (
              <div style={{ textAlign: 'center', marginBottom: '24px', padding: '12px 20px', background: 'rgba(255,153,51,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,153,51,0.25)', color: 'var(--saffron)' }}>
                🌟 <strong>Rank #1 Champion:</strong> You are currently the sole explorer on the national leaderboard! No fake users are shown.
              </div>
            )}

            {/* Full Ranked List */}
            <div className="lb-list" id="lb-full-list">
              {data.map(p => (
                <div key={p.rank} className={`lb-row ${p.isMe ? 'me' : ''}`}>
                  <div className="lb-rank">#{p.rank}</div>
                  <div className="lb-avatar">{p.avatar}</div>
                  <div className="lb-name">
                    {p.name}
                    {p.isMe && <span className="lb-you-tag">YOU</span>}
                  </div>
                  <div className="lb-badge">{p.badge}</div>
                  <div className="lb-xp">{p.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="lb-cta">
          <p>Complete more missions and solve challenges to climb the leaderboard!</p>
          <button className="btn-primary btn-glow" onClick={() => onNavigate('quests')}>
            START A QUEST &#8594;
          </button>
        </div>
      </div>
    </section>
  );
};