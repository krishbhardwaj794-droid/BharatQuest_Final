import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Question } from '../../types';
import { shuffleArray } from '../../utils/shuffle';
import { useMissionTimer } from '../../hooks/useMissionTimer';
import { StepProgressIndicator } from '../quiz/StepProgressIndicator';
import { QuizTimer } from '../quiz/QuizTimer';
import { QuestionCard } from '../quiz/QuestionCard';
import { AnswerOptions } from '../quiz/AnswerOptions';
import { QuizFeedback } from '../quiz/QuizFeedback';
import { QuizHint } from '../quiz/QuizHint';
import { ExploreImageButton } from '../quiz/ExploreImageButton';
import { Quiz3DEnvironment } from '../quiz3d/Quiz3DEnvironment';
import { getEnvironmentTheme } from '../quiz3d/questEnvironments';

import { getMissionQuestionsFromDb } from '../../services/questionService';
import { recordAttemptToDb } from '../../services/attemptService';
import { getQuestDetails, DbQuestDetails } from '../../services/questService';
import { explainWrongAnswer, generateAIClue, WrongAnswerExplanation } from '../../services/geminiService';


export interface QuizMissionResult {
  missionId: string;
  missionTitle: string;
  badgeId: string;
  badgeName: string;
  earnedXp: number;
  correctCount: number;
  firstTryCorrectCount: number;
  totalQuestions: number;
  accuracyPct: number;
  timeTakenSeconds: number;
  timeExpired: boolean;
  cluesUsed: number;
}

interface QuizScreenProps {
  missionId: string;
  userId?: string;
  userEmail?: string;
  playerXp?: number;
  playerLevel?: number;
  onDeductXP?: (amount: number) => void;
  onExit: () => void;
  onComplete: (result: QuizMissionResult) => void;
  onChakraReset?: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  missionId,
  userId,
  userEmail,
  playerXp = 0,
  playerLevel = 1,
  onDeductXP,
  onExit,
  onComplete,
  onChakraReset
}) => {
  const [questInfo, setQuestInfo] = useState<DbQuestDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic API Fetch: Load quest parameters and questions directly from Supabase PostgreSQL API
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([
      getQuestDetails(missionId),
      getMissionQuestionsFromDb(missionId, 5, userEmail)
    ]).then(([details, dbQuestions]) => {
      if (mounted) {
        if (details) setQuestInfo(details);
        if (dbQuestions && dbQuestions.length > 0) {
          setQuestions(dbQuestions);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [missionId, userEmail]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Clue state & XP cost tracking
  const [unlockedClues, setUnlockedClues] = useState<Record<number, boolean>>({});
  const [showClueConfirmModal, setShowClueConfirmModal] = useState(false);
  const [cluesUsedCount, setCluesUsedCount] = useState(0);

  // Security / Anti-Cheat Toast state
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  // 🤖 Gemini AI State
  const [aiExplanation, setAiExplanation] = useState<WrongAnswerExplanation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiClue, setAiClue] = useState<string | null>(null);
  const [isLoadingAIClue, setIsLoadingAIClue] = useState(false);


  // Score tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [missionXP, setMissionXP] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questTitle = questInfo?.displayTitle || 'Ancient India';
  const timeLimit = questInfo?.timeLimit || 300;
  const questionCount = questInfo?.questionCount || 5;
  const badgeId = questInfo?.badgeId || 'heritage-explorer';
  const badgeName = questInfo?.badgeName || 'Heritage Explorer';
  const difficultyTier = questInfo?.difficultyTier || 'Basic';
  const categoryTag = questInfo?.subtitle || `🏺 ${questTitle}`;

  const fallbackQ: Question = {
    id: 'loading',
    topic: 'Ancient India',
    title: 'Loading Quest...',
    question: 'Loading question from Supabase...',
    sub: '',
    clue: '',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    hint: '',
    fact: '',
    difficulty: 'Easy'
  };

  const currentQ: Question = questions[currentIndex] || questions[0] || fallbackQ;

  const currentTheme = useMemo(() => {
    return getEnvironmentTheme(questInfo?.id || missionId, currentIndex, currentQ);
  }, [questInfo?.id, missionId, currentIndex, currentQ]);

  const shuffledOptions = useMemo(() => {
    return currentQ && currentQ.options && currentQ.options.length > 0
      ? shuffleArray(currentQ.options)
      : [];
  }, [currentQ]);

  const finishMission = useCallback((expired: boolean, finalTimeTaken?: number) => {
    if (isFinished) return;
    setIsFinished(true);

    const totalQ = questions.length;
    const accuracy = totalQ > 0 ? Math.round((firstTryCorrectCount / totalQ) * 100) : 0;

    onComplete({
      missionId: questInfo?.id || missionId,
      missionTitle: questTitle,
      badgeId,
      badgeName,
      earnedXp: missionXP,
      correctCount,
      firstTryCorrectCount,
      totalQuestions: totalQ,
      accuracyPct: accuracy,
      timeTakenSeconds: finalTimeTaken || 0,
      timeExpired: expired,
      cluesUsed: cluesUsedCount
    });
  }, [isFinished, questions.length, firstTryCorrectCount, onComplete, questInfo?.id, missionId, questTitle, badgeId, badgeName, missionXP, correctCount, cluesUsedCount]);

  const handleTimeout = useCallback(() => {
    finishMission(true, timeLimit);
  }, [finishMission, timeLimit]);

  const { formatted, statusClass, timeTakenSeconds } = useMissionTimer({
    initialSeconds: timeLimit,
    isRunning: !isFinished && !isLoading,
    onExpire: handleTimeout
  });

  // Security Integrity handlers
  const triggerSecurityAlert = useCallback((action: string) => {
    setSecurityToast(`🛡️ Archaeological Security Protocol: ${action} is disabled during active missions.`);
  }, []);

  useEffect(() => {
    if (!securityToast) return;
    const timer = setTimeout(() => {
      setSecurityToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [securityToast]);

  const handleCopyPrevent = (e: React.ClipboardEvent) => {
    e.preventDefault();
    triggerSecurityAlert('Copying or cutting text');
  };

  const handleContextMenuPrevent = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerSecurityAlert('Right-click context menu');
  };

  // Clue unlock logic (Costs 25 XP)
  const isCurrentClueUnlocked = !!unlockedClues[currentIndex];

  const handleRequestClue = () => {
    if (isCurrentClueUnlocked) return;
    setShowClueConfirmModal(true);
  };

  const handleConfirmClue = () => {
    if (onDeductXP) {
      onDeductXP(25);
    }
    setUnlockedClues(prev => ({ ...prev, [currentIndex]: true }));
    setCluesUsedCount(c => c + 1);
    setShowClueConfirmModal(false);

    // 🤖 Generate AI clue from Gemini (replaces static clue text)
    if (currentQ && !aiClue) {
      setIsLoadingAIClue(true);
      generateAIClue(
        currentQ.question,
        currentQ.options,
        currentQ.correctAnswer,
        currentQ.topic || 'Indian History'
      ).then(clue => {
        setAiClue(clue);
        setIsLoadingAIClue(false);
      });
    }
  };

  // Final Answer Locking logic & Supabase attempt persistence
  const handleSelectAnswer = (option: string) => {
    if (isAnswered || selectedAnswer !== null || !currentQ) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const correct = option === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(c => c + 1);
      setFirstTryCorrectCount(f => f + 1);
      setMissionXP(x => Math.min(questionCount * 50, x + 50));
    } else {
      // 🤖 Galat jawab diya — Gemini se explanation maango
      setIsLoadingAI(true);
      setAiExplanation(null);
      explainWrongAnswer(
        currentQ.question,
        option,
        currentQ.correctAnswer,
        currentQ.topic || 'Indian History'
      ).then(explanation => {
        setAiExplanation(explanation);
        setIsLoadingAI(false);
      });
    }

    // Persist attempt directly to Supabase PostgreSQL via API
    if (userId) {
      recordAttemptToDb({
        userId,
        questId: questInfo?.id || missionId,
        questionId: currentQ.id,
        selectedAnswer: option,
        isCorrect: correct,
        usedHint: !!unlockedClues[currentIndex],
        xpChange: correct ? 50 : 0
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      // Reset AI state for next question
      setAiExplanation(null);
      setIsLoadingAI(false);
      setAiClue(null);
      setIsLoadingAIClue(false);
    } else {
      finishMission(false, timeTakenSeconds);
    }
  };


  // Loading state while questions & quest details load from Supabase API
  if (isLoading || questions.length === 0 || !currentQ) {
    return (
      <section id="screen-challenge" className="screen active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div className="inner-page" style={{ padding: '60px 20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🏺</div>
          <h2 className="page-title" style={{ color: 'var(--gold)', marginBottom: '10px' }}>Loading Quest from Supabase...</h2>
          <p className="page-sub" style={{ color: 'var(--text-secondary)' }}>
            Retrieving archaeological challenges directly from Supabase PostgreSQL API...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="screen-challenge"
      className="screen active"
      onCopy={handleCopyPrevent}
      onCut={handleCopyPrevent}
      onContextMenu={handleContextMenuPrevent}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Immersive 3D Quest Environment (Q1: Ashoka Chakra; Q2+: Quest-Specific 3D Worlds) */}
      <Quiz3DEnvironment
        theme={currentTheme}
        missionId={questInfo?.id || missionId}
        questionIndex={currentIndex}
        onReset={onChakraReset}
      />

      {/* Security Toast Warning */}
      {securityToast && (
        <div
          className="quiz-security-toast"
          id="quiz-security-alert"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 15px rgba(220,38,38,0.5)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.92rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span>🛡️</span>
          <span>{securityToast}</span>
        </div>
      )}

      {/* Clue Cost Confirmation Modal */}
      {showClueConfirmModal && (
        <div
          className="modal-overlay active"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            className="modal-box"
            id="clue-confirm-modal"
            style={{
              maxWidth: '440px',
              width: '90%',
              textAlign: 'center',
              padding: '30px',
              background: '#0F172A',
              border: '1.5px solid #E8B042',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜⚡</div>
            <h3 style={{ color: 'var(--gold, #E8B042)', fontFamily: 'var(--font-display)', marginBottom: '8px', fontSize: '1.3rem' }}>
              Unlock Archaeological Clue?
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '16px' }}>
              Revealing this encrypted Indus Valley inscription requires archaeological resources and will deduct <strong style={{ color: '#E8B042' }}>25 XP</strong> from your score.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '22px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94A3B8' }}>Current XP:</span>
                <strong style={{ color: '#E8B042' }}>{playerXp} XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>XP after deduction:</span>
                <strong style={{ color: '#22C55E' }}>{Math.max(0, playerXp - 25)} XP</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                id="btn-cancel-clue"
                style={{ padding: '10px 22px', borderRadius: '25px', cursor: 'pointer' }}
                onClick={() => setShowClueConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary btn-glow"
                id="btn-confirm-clue"
                style={{ padding: '10px 24px', borderRadius: '25px', cursor: 'pointer' }}
                onClick={handleConfirmClue}
              >
                Confirm &amp; Deduct 25 XP
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="challenge-wrap">
        <div className="challenge-header">
          <button className="btn-back-sm" type="button" onClick={onExit}>&#8592; Exit</button>

          {/* Difficulty Tier vs Player Level Indicator */}
          <div
            className="challenge-tier-indicator"
            id="challenge-tier-indicator"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 153, 51, 0.1)',
              border: '1px solid rgba(255, 153, 51, 0.3)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.8rem'
            }}
          >
            <span style={{ color: 'var(--saffron, #FF9933)', fontWeight: 700 }}>
              🎯 Tier: {difficultyTier}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
            <span style={{ color: 'var(--gold, #E8B042)', fontWeight: 600 }}>
              🎖️ Level: {playerLevel}
            </span>
          </div>

          <StepProgressIndicator
            currentIndex={currentIndex}
            total={questions.length}
          />

          <QuizTimer
            formatted={formatted}
            statusClass={statusClass}
          />

          <div className="challenge-xp-indicator">
            <span>⚡</span>
            <span id="challenge-xp-display">+{missionXP} XP</span>
          </div>
        </div>

        <div className="challenge-body">
          <QuestionCard
            question={currentQ}
            currentIndex={currentIndex}
            total={questions.length}
            categoryTag={categoryTag}
            isClueUnlocked={isCurrentClueUnlocked}
            onRequestClue={handleRequestClue}
            difficultyTier={difficultyTier}
            playerLevel={playerLevel}
          />

          <AnswerOptions
            options={shuffledOptions}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQ.correctAnswer}
            isAnswered={isAnswered}
            onSelect={handleSelectAnswer}
          />

          {/* Question-Specific Image Reference Feature */}
          <ExploreImageButton question={currentQ} />

          {/* Final Answer Locking indicator */}
          {selectedAnswer && (
            <div
              className="answer-locked-banner"
              id="answer-locked-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '8px 0 16px',
                color: '#94A3B8',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <span>🔒</span>
              <span>Your answer is final.</span>
            </div>
          )}

          {selectedAnswer && (
            <QuizFeedback
              isCorrect={isCorrect}
              correctAnswer={currentQ.correctAnswer}
              fact={currentQ.fact}
            />
          )}

          {/* 🤖 Gemini AI Wrong Answer Explanation */}
          {selectedAnswer && !isCorrect && (
            <div style={{
              margin: '12px 0',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
              border: '1.5px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '12px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{ color: '#A78BFA', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  BharatGuru AI Explanation
                </span>
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(139, 92, 246, 0.3)',
                  color: '#C4B5FD',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>Powered by Gemini</span>
              </div>
              {isLoadingAI ? (
                <div style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', padding: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>✨</span>
                  Analyzing historical context...
                </div>
              ) : aiExplanation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ color: '#E2E8F0', fontSize: '0.92rem', lineHeight: '1.55', margin: 0 }}>
                    📖 {aiExplanation.explanation}
                  </p>
                  <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                    🏛️ {aiExplanation.context}
                  </p>
                  <p style={{ color: '#A78BFA', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, background: 'rgba(139,92,246,0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                    💡 <strong>Fun Fact:</strong> {aiExplanation.funFact}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* 🤖 AI Clue Display (replaces static hint) */}
          {showHint && (
            <div>
              {isLoadingAIClue ? (
                <div style={{
                  margin: '12px 0',
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '10px',
                  color: '#FDE68A',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  🤖 Generating AI hint...
                </div>
              ) : aiClue ? (
                <div style={{
                  margin: '12px 0',
                  padding: '14px 18px',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>🤖</span>
                    <span style={{ color: '#FDE68A', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>AI Hint</span>
                  </div>
                  <p style={{ color: '#FEF3C7', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
                    {aiClue}
                  </p>
                </div>
              ) : (
                <QuizHint hint={currentQ.hint} />
              )}
            </div>
          )}


          <div className="challenge-actions" id="challenge-actions">
            {!showHint && !isCurrentClueUnlocked && (
              <button
                type="button"
                className="btn-hint"
                id="btn-hint-clue"
                onClick={handleRequestClue}
              >
                💡 Get Hint / Clue (-25 XP)
              </button>
            )}

            {!showHint && isCurrentClueUnlocked && (
              <button
                type="button"
                className="btn-hint"
                id="btn-show-hint"
                onClick={() => setShowHint(true)}
              >
                💡 View Archaeological Hint
              </button>
            )}

            {/* Advance to next question or complete mission */}
            {selectedAnswer && (
              <button
                type="button"
                className="btn-continue"
                id="btn-continue-next"
                onClick={handleNext}
              >
                {currentIndex < questions.length - 1 ? 'NEXT QUESTION →' : 'FINISH MISSION →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};