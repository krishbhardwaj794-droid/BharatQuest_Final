import { useState } from 'react';
import { Badge, CompletedQuest, MissionInfoType, Quest, ScreenType } from './types';
import { questsData } from './data/quests';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Navbar } from './components/layout/Navbar';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { QuestSelectionScreen } from './components/screens/QuestSelectionScreen';
import { MissionBriefScreen } from './components/screens/MissionBriefScreen';
import { QuizScreen, QuizMissionResult } from './components/screens/QuizScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { RecommendationScreen } from './components/screens/RecommendationScreen';
import { ProgressScreen } from './components/screens/ProgressScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { ArcadeHub } from './components/arcade/ArcadeHub';
import { MissionInfoModal } from './components/modals/MissionInfoModal';
import { LockedQuestModal } from './components/modals/LockedQuestModal';
import { BadgeModal } from './components/modals/BadgeModal';
import { QuestSummaryModal } from './components/modals/QuestSummaryModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { WelcomeModal } from './components/modals/WelcomeModal';
import { Toast } from './components/ui/Toast';
import { HeritageEnvironment } from './components/common/HeritageEnvironment';

function BharatQuestApp() {
  const {
    player,
    isLoggedIn,
    isLoadingSession,
    login,
    register,
    logout,
    gainXP,
    deductXP,
    updateAvatar,
    awardBadge,
    recordCompletion,
    resetDemo,
    supabaseUser
  } = usePlayer();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeMissionId, setActiveMissionId] = useState<string>('ancient-india-01');
  const [lastQuizResult, setLastQuizResult] = useState<QuizMissionResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [missionInfoType, setMissionInfoType] = useState<MissionInfoType | null>(null);
  const [lockedQuest, setLockedQuest] = useState<Quest | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<CompletedQuest | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuest = (questId: string) => {
    if (questId === 'ancient-india-01') {
      setActiveMissionId('ancient-india-01');
      handleNavigate('brief');
    } else if (questId === 'explore-india-02') {
      if (player.level >= 4) {
        setActiveMissionId('explore-india-02');
        showToast('🌊 Entering Explore India — Level 2');
        handleNavigate('challenge');
      } else {
        const quest = questsData.find(q => q.id === questId);
        if (quest) setLockedQuest(quest);
      }
    }
  };

  const handleFinishMission = (result: QuizMissionResult) => {
    const res = gainXP(result.earnedXp);
    awardBadge(result.badgeId);

    if (result.accuracyPct === 100) {
      awardBadge('scroll-master');
    }

    const mins = Math.floor(result.timeTakenSeconds / 60);
    const secs = result.timeTakenSeconds % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    recordCompletion({
      id: result.missionId,
      name: result.missionTitle,
      detail: `Completed with ${result.accuracyPct}% accuracy`,
      accuracy: `${result.accuracyPct}%`,
      xp: `+${result.earnedXp} XP`,
      date: 'Just now',
      time: formattedTime,
      badge: result.badgeName,
      cluesUsed: result.cluesUsed ?? 0
    }, result.correctCount * 50, result.earnedXp);

    setLastQuizResult(result);

    if (res.leveledUp) {
      showToast(`🏆 LEVEL UP! You reached Level ${res.newLevel}!`);
    } else {
      showToast(`⚡ +${result.earnedXp} XP Earned!`);
    }

    handleNavigate('result');
  };

  const handleLoginSuccess = (_name: string) => {
    // player.name is resolved from Supabase metadata + localStorage profile by PlayerContext
    showToast(`✦ Welcome back, ${player.name || 'Explorer'}!`);
    handleNavigate('home');
  };

  const handleRegisterSuccess = (_name: string) => {
    showToast(`✦ Welcome to BharatQuest, ${player.name || 'Explorer'}! Your journey begins.`);
    setWelcomeModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    showToast('✦ Logged out of BharatQuest. See you again, Explorer!');
    setCurrentScreen('home');
  };

  const handleResetDemo = () => {
    resetDemo();
    showToast('✦ BharatQuest demo state & progress reset successfully.');
  };

  if (isLoadingSession) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main, #0A0E1A)',
        color: 'var(--text-secondary, #94A3B8)',
        fontFamily: 'var(--font-ui, system-ui)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏛️</div>
          <p style={{ color: 'var(--saffron, #FF9933)', fontSize: '1.2rem', fontWeight: 600 }}>Loading BharatQuest...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> show Auth Screen
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
        <AuthScreen
          onLogin={login}
          onRegister={register}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
        <WelcomeModal
          isOpen={welcomeModalOpen}
          userName={player.name}
          avatarIcon={player.avatarIcon}
          onClose={() => setWelcomeModalOpen(false)}
          onStartExploring={() => {
            setWelcomeModalOpen(false);
            handleNavigate('home');
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />

      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        player={player}
        onNavigate={handleNavigate}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Cinematic Layered Heritage Environment */}
      <HeritageEnvironment>
        {/* Main Screen Views */}
        <main>
          {currentScreen === 'home' && (
            <HomeScreen
              player={player}
              onNavigate={handleNavigate}
              onSelectQuest={handleSelectQuest}
              onOpenProfile={() => setProfileModalOpen(true)}
            />
          )}

          {currentScreen === 'quests' && (
            <QuestSelectionScreen
              player={player}
              onNavigate={handleNavigate}
              onSelectQuest={handleSelectQuest}
              onLockedQuestClick={(q) => setLockedQuest(q)}
            />
          )}

          {currentScreen === 'brief' && (
            <MissionBriefScreen
              questId={activeMissionId}
              onNavigate={handleNavigate}
              onOpenInfoModal={(t) => setMissionInfoType(t)}
              onStartChallenge={() => handleNavigate('challenge')}
            />
          )}

          {currentScreen === 'challenge' && (
            <QuizScreen
              missionId={activeMissionId}
              userId={supabaseUser?.id}
              userEmail={player.email}
              playerXp={player.xp}
              playerLevel={player.level}
              onDeductXP={deductXP}
              onExit={() => handleNavigate('brief')}
              onComplete={handleFinishMission}
            />
          )}

          {currentScreen === 'result' && (
            <ResultScreen
              player={player}
              result={lastQuizResult}
              onNavigate={handleNavigate}
              onInspectBadge={(bName) => {
                const b = player.badges.find(x => x.name.toLowerCase() === bName.toLowerCase());
                if (b) setSelectedBadge(b);
              }}
            />
          )}

          {currentScreen === 'recommendation' && (
            <RecommendationScreen
              player={player}
              currentUserId={supabaseUser?.id}
              onNavigate={handleNavigate}
              onStartRecommendedQuest={(questId: string) => {
                setActiveMissionId(questId);
                showToast(`🎯 Starting Recommended Mission: ${questId}`);
                handleNavigate('challenge');
              }}
            />
          )}

          {currentScreen === 'progress' && (
            <ProgressScreen
              player={player}
              currentUserId={supabaseUser?.id}
              onNavigate={handleNavigate}
              onBadgeClick={(badge) => setSelectedBadge(badge)}
              onQuestClick={(quest) => setSelectedQuest(quest)}
            />
          )}

          {currentScreen === 'leaderboard' && (
            <LeaderboardScreen
              player={player}
              currentUserId={supabaseUser?.id}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'arcade' && (
            <ArcadeHub
              playerXp={player.xp}
              playerLevel={player.level}
              playerName={player.name}
              onAddXP={(amount) => {
                gainXP(amount);
                showToast(`⚡ +${amount} XP Earned in Arcade!`);
              }}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}
        </main>
      </HeritageEnvironment>

      {/* Modals */}
      <MissionInfoModal
        isOpen={missionInfoType !== null}
        type={missionInfoType}
        onClose={() => setMissionInfoType(null)}
        onStartMission={() => {
          setMissionInfoType(null);
          handleNavigate('challenge');
        }}
      />

      <LockedQuestModal
        isOpen={lockedQuest !== null}
        questName={lockedQuest?.displayTitle || ''}
        reqLevel={lockedQuest?.requiredLevel || 1}
        description={lockedQuest?.description || ''}
        currentLevel={player.level}
        currentXp={player.xp}
        onClose={() => setLockedQuest(null)}
        onPlayAncientIndia={() => {
          setLockedQuest(null);
          handleNavigate('brief');
        }}
      />

      <BadgeModal
        isOpen={selectedBadge !== null}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
        onExploreQuests={() => {
          setSelectedBadge(null);
          handleNavigate('quests');
        }}
      />

      <QuestSummaryModal
        isOpen={selectedQuest !== null}
        quest={selectedQuest}
        onClose={() => setSelectedQuest(null)}
        onReplay={(questId) => {
          setSelectedQuest(null);
          setActiveMissionId(questId);
          handleNavigate('challenge');
        }}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        player={player}
        onClose={() => setProfileModalOpen(false)}
        onViewProgress={() => {
          setProfileModalOpen(false);
          handleNavigate('progress');
        }}
        onSelectAvatar={(icon) => {
          updateAvatar(icon);
          showToast(`✦ Avatar updated to ${icon}!`);
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onResetDemo={handleResetDemo}
      />

      <WelcomeModal
        isOpen={welcomeModalOpen}
        userName={player.name}
        avatarIcon={player.avatarIcon}
        onClose={() => setWelcomeModalOpen(false)}
        onStartExploring={() => {
          setWelcomeModalOpen(false);
          handleNavigate('home');
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <PlayerProvider>
      <BharatQuestApp />
    </PlayerProvider>
  );
}

export default App;