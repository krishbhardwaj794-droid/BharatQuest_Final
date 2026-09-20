import React from 'react';
import { PlayerData, ScreenType } from '../../types';

export interface CampaignQuestNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: string;
  stars: string;
  xpReward: string;
  requiredLevel: number;
  tags: string[];
}

export const CAMPAIGN_QUEST_NODES: CampaignQuestNode[] = [
  {
    id: 'ancient-india-01',
    title: 'Ancient India',
    subtitle: 'The Lost Artifact · Indus Valley Civilization',
    icon: '🏺',
    difficulty: 'Basic Tier',
    stars: '★☆☆',
    xpReward: '+250 XP',
    requiredLevel: 1,
    tags: ['Harappa', 'Archaeology']
  },
  {
    id: 'vedic-india-02',
    title: 'Vedic India',
    subtitle: 'Hymns of the Rigveda · Saraswati Valleys',
    icon: '📜',
    difficulty: 'Intermediate Tier',
    stars: '★★☆',
    xpReward: '+200 XP',
    requiredLevel: 2,
    tags: ['Vedas', 'Philosophy']
  },
  {
    id: 'mauryan-empire-03',
    title: 'Mauryan Empire',
    subtitle: 'Pillars of Ashoka · Dhamma Edicts & Governance',
    icon: '🏛️',
    difficulty: 'Medium Tier',
    stars: '★★☆',
    xpReward: '+200 XP',
    requiredLevel: 4,
    tags: ['Ashoka', 'Edicts']
  },
  {
    id: 'medieval-india-04',
    title: 'Medieval India',
    subtitle: 'Chola Maritime Expeditions & Rock-Cut Temples',
    icon: '🛕',
    difficulty: 'Advanced Tier',
    stars: '★★★',
    xpReward: '+250 XP',
    requiredLevel: 5,
    tags: ['Cholas', 'Architecture']
  },
  {
    id: 'freedom-movement-05',
    title: 'Freedom Movement',
    subtitle: 'The Struggle for Swaraj & Independence',
    icon: '🇮🇳',
    difficulty: 'Master Tier',
    stars: '★★★',
    xpReward: '+300 XP',
    requiredLevel: 6,
    tags: ['Swaraj', 'National Movement']
  },
  {
    id: 'modern-india-06',
    title: 'Modern India',
    subtitle: 'Constitutional Democracy & Scientific Space Heritage',
    icon: '🚀',
    difficulty: 'Legendary Tier',
    stars: '★★★★',
    xpReward: '+350 XP',
    requiredLevel: 7,
    tags: ['Republic', 'Space Age']
  }
];

interface QuestWorldMapProps {
  player: PlayerData;
  onNavigate: (screen: ScreenType) => void;
  onSelectQuest: (questId: string) => void;
}

export const QuestWorldMap: React.FC<QuestWorldMapProps> = ({
  player,
  onNavigate,
  onSelectQuest
}) => {
  const isCompleted = (id: string) => {
    return player.completedQuests.some(q => q.id === id) || (id === 'ancient-india-01' && (player.questsDone > 0 || player.completedQuests.length > 0));
  };

  const isUnlocked = (node: CampaignQuestNode) => {
    return player.level >= node.requiredLevel || node.id === 'ancient-india-01' || (node.id === 'vedic-india-02' && player.level >= 2);
  };

  const handleNodeClick = (node: CampaignQuestNode) => {
    if (node.id === 'ancient-india-01') {
      onSelectQuest('ancient-india-01');
    } else if (isUnlocked(node)) {
      onSelectQuest(node.id);
    } else {
      onNavigate('quests');
    }
  };

  return (
    <section className="quest-world-realm" id="quest-world-realm">
      <div className="realm-header">
        <div className="realm-emblem-badge">
          <span className="reb-dot" />
          <span>BHARAT EXPEDITION CAMPAIGN</span>
        </div>
        <h2 className="realm-title">THE HERITAGE QUEST REALM</h2>
        <p className="realm-subtitle">
          Follow the ancient glowing path across 5,000 years of civilization. Solve historical mysteries, examine sacred artifacts, and ascend through legendary eras of Bharat.
        </p>
      </div>

      {/* Interconnected Glowing Journey Path */}
      <div className="quest-pathway-container">
        {/* Visual Glowing SVG Track Behind Nodes on Desktop */}
        <div className="pathway-track-backdrop">
          <div className="glowing-journey-path" />
        </div>

        <div className="pathway-grid">
          {CAMPAIGN_QUEST_NODES.map((node, index) => {
            const completed = isCompleted(node.id);
            const unlocked = isUnlocked(node);

            // Node visual states: Completed (Gold), Available (Orange glow), Locked (Dark grey)
            let nodeState: 'completed' | 'available' | 'locked' = 'locked';
            if (completed) {
              nodeState = 'completed';
            } else if (unlocked) {
              nodeState = 'available';
            }

            return (
              <div key={node.id} className="pathway-node-wrapper">
                {/* Connecting Trail to previous node */}
                {index > 0 && (
                  <div className={`node-connector-line ${completed ? 'completed' : unlocked ? 'available' : 'locked'}`}>
                    <div className="connector-energy-pulse" />
                  </div>
                )}

                <div
                  className={`quest-world-node state-${nodeState} ${completed ? 'completed' : unlocked ? 'active' : 'locked'}`}
                  id={`quest-node-${node.id}`}
                  onClick={() => handleNodeClick(node)}
                  role="button"
                  tabIndex={0}
                  title={unlocked ? `Launch Mission: ${node.title}` : `Locked. Requires Explorer Level ${node.requiredLevel}`}
                >
                  <div className="node-glow-ring" />
                  <div className="node-corner-filigree tl" />
                  <div className="node-corner-filigree tr" />
                  <div className="node-corner-filigree bl" />
                  <div className="node-corner-filigree br" />

                  {/* Top Bar: Mission Number & Difficulty */}
                  <div className="node-top-bar">
                    <span className="node-step-number">MISSION 0{index + 1}</span>
                    <span className="node-difficulty-badge">{node.stars} {node.difficulty}</span>
                  </div>

                  {/* Center Mission Icon with Status Emblem */}
                  <div className="node-center-icon-wrap">
                    <div className="node-icon-backing" />
                    <span className="node-icon">{node.icon}</span>
                    {nodeState === 'completed' && <span className="node-status-badge stamp-completed" title="Completed">✓</span>}
                    {nodeState === 'available' && <span className="node-status-badge pulse-available" title="Available Mission">⚔</span>}
                    {nodeState === 'locked' && <span className="node-status-badge stamp-locked" title="Locked">🔒</span>}
                  </div>

                  {/* Mission Details */}
                  <div className="node-info">
                    <h3 className="node-title">{node.title}</h3>
                    <p className="node-subtitle">{node.subtitle}</p>

                    <div className="node-tags-row">
                      {node.tags.map(t => (
                        <span key={t} className="node-tag">{t}</span>
                      ))}
                    </div>

                    {/* Footer: XP Bounty & Status */}
                    <div className="node-footer-meta">
                      <span className="node-xp-bounty">⚡ {node.xpReward}</span>
                      {nodeState === 'completed' && (
                        <span className="node-status-text completed-label">★ COMPLETED</span>
                      )}
                      {nodeState === 'available' && (
                        <span className="node-status-text available-label">⚔ AVAILABLE &rarr;</span>
                      )}
                      {nodeState === 'locked' && (
                        <span className="node-status-text locked-label">🔒 LOCKED · LVL {node.requiredLevel}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
