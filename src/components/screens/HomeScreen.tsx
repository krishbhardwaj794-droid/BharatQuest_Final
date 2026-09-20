import React from 'react';
import { PlayerData, ScreenType } from '../../types';
import { PlayerHUD } from '../home/PlayerHUD';
import { QuestWorldMap } from '../home/QuestWorldMap';

interface HomeScreenProps {
  player?: PlayerData;
  onNavigate: (screen: ScreenType) => void;
  onSelectQuest?: (questId: string) => void;
  onOpenProfile?: () => void;
}

const DEFAULT_PLAYER: PlayerData = {
  name: 'Krish Explorer',
  email: 'krish@example.com',
  classYear: 'College 2nd Year',
  avatar: 'K',
  avatarIcon: '🦁',
  xp: 1250,
  level: 3,
  maxXp: 1500,
  questsDone: 1,
  accuracy: 100,
  historyScore: 85,
  cultureScore: 75,
  geographyScore: 45,
  badges: [],
  completedQuests: []
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  player = DEFAULT_PLAYER,
  onNavigate,
  onSelectQuest = () => onNavigate('quests'),
  onOpenProfile = () => onNavigate('progress')
}) => {
  return (
    <section id="screen-landing" className="screen active">
      <div className="landing-content exploration-hub-content">
        {/* 1. Top SIH Header Badge */}
        <div className="landing-badge">
          SMART INDIA HACKATHON 2026 &bull; PS SIH26208 &bull; DOMAIN: TOYS &amp; GAMES
        </div>

        {/* 2. Player Explorer Dossier HUD */}
        <PlayerHUD
          player={player}
          onNavigate={onNavigate}
          onOpenProfile={onOpenProfile}
        />

        {/* 3. Clean Cinematic Hero Section (NO Ashoka Chakra in center) */}
        <div className="cinematic-hero-section" id="cinematic-hero-section">
          <div className="hero-emblem-seal">
            <span className="seal-icon">🏺</span>
          </div>

          <h1 className="cinematic-main-title" id="cinematic-main-title">
            BHARATQUEST
          </h1>

          <p className="cinematic-hero-subtitle">
            The Heritage Exploration &amp; Adventure Realm
          </p>

          <p className="cinematic-hero-description">
            Decode ancient inscriptions, inspect archaeological artifacts, and uncover India&apos;s heritage across historical eras.
          </p>

          {/* Primary & Secondary Hero Action Buttons */}
          <div className="landing-cta cinematic-cta" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn-primary btn-glow btn-cinematic-start"
              id="btn-start-expedition"
              onClick={() => {
                onSelectQuest('ancient-india-01');
                onNavigate('brief');
              }}
            >
              ⚔&nbsp; START EXPEDITION
            </button>
            <button
              type="button"
              className="btn-secondary btn-cinematic-quests"
              id="btn-view-all-quests"
              onClick={() => onNavigate('quests')}
            >
              📖&nbsp; VIEW ALL QUESTS
            </button>
          </div>
        </div>

        {/* 4. Bharat Expedition Campaign & Quest World Realm */}
        <QuestWorldMap
          player={player}
          onNavigate={onNavigate}
          onSelectQuest={(questId) => {
            onSelectQuest(questId);
            onNavigate('brief');
          }}
        />

        {/* 5. Heritage Pillars Features Footer */}
        <div className="landing-feature-row cinematic-feature-row" style={{ marginTop: '48px', marginBottom: '40px' }}>
          <div className="lf-card">
            <div className="lf-icon">🏺</div>
            <div className="lf-label">5,000 Years of Heritage</div>
          </div>
          <div className="lf-card">
            <div className="lf-icon">📜</div>
            <div className="lf-label">Verified Epigraphic Clues</div>
          </div>
          <div className="lf-card">
            <div className="lf-icon">🏆</div>
            <div className="lf-label">Archaeological Badges</div>
          </div>
          <div className="lf-card">
            <div className="lf-icon">🧠</div>
            <div className="lf-label">Adaptive Progression</div>
          </div>
        </div>
      </div>
    </section>
  );
};