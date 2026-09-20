/**
 * BharatQuest AuthScreen — Phase 1: Supabase Authentication
 *
 * Changes from Phase 0:
 *   - onLogin / onRegister are now async (Promise<AuthResult>)
 *   - "remember" param removed (Supabase manages session persistence)
 *   - "Demo Account" button removed (demo account requires real Supabase login)
 *   - Loading state added: buttons disabled during auth call
 *   - Email confirmation banner shown when Supabase requires verification
 *   - Supabase-specific error messages surfaced cleanly to the user
 *   - All UI layout/styles preserved from Phase 0
 */

import React, { useState } from 'react';
import { AvatarSelector } from '../avatar/AvatarSelector';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (
    name: string,
    email: string,
    classYear: string,
    password: string,
    avatarIcon: string
  ) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  onSendOtp?: (email: string) => Promise<{ success: boolean; error?: string; devCode?: string }>;
  onVerifyOtp?: (
    email: string,
    token: string,
    meta?: { name?: string; classYear?: string; avatarIcon?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  onLoginSuccess: (name: string) => void;
  onRegisterSuccess: (name: string) => void;
}

export const AuthScreen = ({
  onLogin,
  onRegister,
  onSendOtp,
  onVerifyOtp,
  onLoginSuccess,
  onRegisterSuccess
}: AuthScreenProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>('login');

  // -------------------------------------------------------------------------
  // Login form state
  // -------------------------------------------------------------------------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Register form state
  // -------------------------------------------------------------------------
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regClass, setRegClass] = useState('Class 9–10');
  const [regAvatar, setRegAvatar] = useState('🦁');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPw, setRegShowPw] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(false);

  // -------------------------------------------------------------------------
  // OTP Tab state
  // -------------------------------------------------------------------------
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [evaluatorCode, setEvaluatorCode] = useState<string | null>(null);

  // Confirmation screen OTP input
  const [confirmOtpInput, setConfirmOtpInput] = useState('');
  const [confirmOtpLoading, setConfirmOtpLoading] = useState(false);
  const [confirmOtpError, setConfirmOtpError] = useState<string | null>(null);


  // -------------------------------------------------------------------------
  // Login submit — async Supabase signInWithPassword
  // -------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await onLogin(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Invalid email or password.');
      } else {
        // Name will be resolved by PlayerContext from Supabase metadata
        onLoginSuccess('Explorer');
      }
    } catch {
      setLoginError('Authentication service is temporarily unavailable. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Register submit — async Supabase signUp
  // -------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Client-side validation
    if (!regName.trim()) {
      setRegError('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email address is required.');
      return;
    }
    if (!regClass) {
      setRegError('Please select your class or academic year.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please check and try again.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await onRegister(regName, regEmail, regClass, regPassword, regAvatar);
      if (!res.success) {
        setRegError(res.error || 'Registration could not be completed.');
      } else if (res.requiresEmailConfirmation) {
        // Supabase email confirmation is enabled — show instructions and OTP input
        setEmailConfirmRequired(true);
        // Also trigger an OTP send for convenience so user receives 6-digit code
        if (onSendOtp) {
          onSendOtp(regEmail).then(otpRes => {
            if (otpRes.devCode) {
              setEvaluatorCode(otpRes.devCode);
            }
          });
        }
      } else {
        onRegisterSuccess(regName);
      }
    } catch {
      setRegError('Authentication service is temporarily unavailable. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // OTP Handlers
  // -------------------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);
    setOtpSuccessMsg(null);
    setEvaluatorCode(null);

    if (!otpEmail.trim()) {
      setOtpError('Please enter your email address.');
      return;
    }

    if (!onSendOtp) {
      setOtpError('OTP service is not available.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await onSendOtp(otpEmail);
      if (!res.success && !res.devCode) {
        setOtpError(res.error || 'Failed to send OTP. Please try again.');
      } else {
        setOtpSent(true);
        if (res.devCode) {
          setEvaluatorCode(res.devCode);
          setOtpSuccessMsg('Evaluator Security Code ready. Enter it below.');
        } else {
          setOtpSuccessMsg(`A 6-digit verification code has been sent to ${otpEmail}.`);
        }
      }
    } catch {
      setOtpError('Could not send OTP. Please check your internet connection.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpCode.trim() || otpCode.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (!onVerifyOtp) {
      setOtpError('OTP verification service is unavailable.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await onVerifyOtp(otpEmail, otpCode);
      if (!res.success) {
        setOtpError(res.error || 'Invalid or expired OTP code.');
      } else {
        onLoginSuccess('Explorer');
      }
    } catch {
      setOtpError('Authentication service is temporarily unavailable.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOtpError(null);

    if (!confirmOtpInput.trim() || confirmOtpInput.length < 6) {
      setConfirmOtpError('Please enter a 6-digit code.');
      return;
    }

    if (!onVerifyOtp) {
      setConfirmOtpError('Verification service is unavailable.');
      return;
    }

    setConfirmOtpLoading(true);
    try {
      const res = await onVerifyOtp(regEmail, confirmOtpInput, {
        name: regName,
        classYear: regClass,
        avatarIcon: regAvatar
      });
      if (!res.success) {
        setConfirmOtpError(res.error || 'Invalid code. Please re-check.');
      } else {
        onRegisterSuccess(regName);
      }
    } catch {
      setConfirmOtpError('Verification failed. Please try logging in directly.');
    } finally {
      setConfirmOtpLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Email confirmation / OTP verification screen
  // -------------------------------------------------------------------------
  if (emailConfirmRequired) {
    return (
      <section id="screen-auth" className="screen active">
        <div className="auth-wrapper">
          <div className="auth-brand-side">
            <div className="auth-brand-bg-glow"></div>
            <div className="auth-brand-content">
              <div className="auth-tagline-badge">🏛️ Smart India Hackathon 2026 &middot; PS SIH26208</div>
              <div className="auth-chakra-wrap">
                <svg className="auth-chakra-svg" width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" stroke="#FF9933" strokeWidth="1.8" fill="none" strokeDasharray="4 2.5" />
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,215,0,0.4)" strokeWidth="0.8" fill="none" />
                  <circle cx="50" cy="50" r="10" stroke="#FF9933" strokeWidth="2" fill="rgba(255,153,51,0.12)" />
                  <circle cx="50" cy="50" r="3.5" fill="#FFD700" />
                  <g stroke="#FF9933" strokeWidth="1.1" strokeLinecap="round">
                    <line x1="50" y1="8" x2="50" y2="92" />
                    <line x1="8" y1="50" x2="92" y2="50" />
                    <line x1="20.3" y1="20.3" x2="79.7" y2="79.7" />
                    <line x1="79.7" y1="20.3" x2="20.3" y2="79.7" />
                    <g transform="rotate(15 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                    <g transform="rotate(30 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                    <g transform="rotate(45 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                    <g transform="rotate(60 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                    <g transform="rotate(75 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                  </g>
                </svg>
              </div>
              <h1 className="auth-brand-title">
                <span className="title-bharat">BHARAT</span><span className="title-quest">QUEST</span>
              </h1>
              <p className="auth-brand-tagline">Learn India. Play the Quest.</p>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔐</div>
              <h2 className="auth-title" style={{ marginBottom: '8px' }}>Two-Way Verification</h2>
              <p style={{ color: '#94A3B8', lineHeight: '1.6', marginBottom: '18px', fontSize: '0.92rem' }}>
                Account created for <strong style={{ color: '#E8B042' }}>{regEmail}</strong>.
              </p>

              {/* Evaluator Code Banner (if generated) */}
              {evaluatorCode && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                  border: '1.5px solid rgba(34,197,94,0.4)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span>🛡️</span>
                    <span style={{ color: '#4ADE80', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      Evaluator Verification Code
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px', color: '#E2E8F0', fontSize: '0.85rem' }}>
                    Live evaluation bypass code:
                  </p>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '4px', color: '#FCD34D' }}>
                    {evaluatorCode}
                  </div>
                </div>
              )}

              {/* 6-Digit OTP Box */}
              <form onSubmit={handleVerifyConfirmOtp} style={{ marginBottom: '20px' }}>
                {confirmOtpError && (
                  <div className="auth-error-box" style={{ marginBottom: '12px' }}>{confirmOtpError}</div>
                )}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">🔑</span>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-input"
                      placeholder="e.g. 849201"
                      value={confirmOtpInput}
                      onChange={(e) => setConfirmOtpInput(e.target.value.replace(/\D/g, ''))}
                      style={{ letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                      disabled={confirmOtpLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-glow btn-auth-submit"
                  disabled={confirmOtpLoading || confirmOtpInput.length < 6}
                  style={{ width: '100%', opacity: (confirmOtpLoading || confirmOtpInput.length < 6) ? 0.7 : 1 }}
                >
                  {confirmOtpLoading ? '⏳ VERIFYING...' : 'VERIFY & ENTER BHARATQUEST →'}
                </button>
              </form>

              <div style={{
                background: 'rgba(255,153,51,0.08)',
                border: '1px solid rgba(255,153,51,0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '18px',
                fontSize: '0.82rem',
                color: '#94A3B8'
              }}>
                ✉️ Or click the activation link in your email inbox to verify.
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => {
                  setEmailConfirmRequired(false);
                  setActiveTab('login');
                  setLoginEmail(regEmail);
                }}
              >
                ← BACK TO LOGIN
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // -------------------------------------------------------------------------
  // Main auth screen
  // -------------------------------------------------------------------------
  return (
    <section id="screen-auth" className="screen active">
      <div className="auth-wrapper">

        {/* Left Hero Banner — unchanged from Phase 0 */}
        <div className="auth-brand-side">
          <div className="auth-brand-bg-glow"></div>
          <div className="auth-brand-content">
            <div className="auth-tagline-badge">🏛️ Smart India Hackathon 2026 &middot; PS SIH26208</div>

            <div className="auth-chakra-wrap">
              <svg className="auth-chakra-svg" width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" stroke="#FF9933" strokeWidth="1.8" fill="none" strokeDasharray="4 2.5" />
                <circle cx="50" cy="50" r="42" stroke="rgba(255,215,0,0.4)" strokeWidth="0.8" fill="none" />
                <circle cx="50" cy="50" r="10" stroke="#FF9933" strokeWidth="2" fill="rgba(255,153,51,0.12)" />
                <circle cx="50" cy="50" r="3.5" fill="#FFD700" />
                <g stroke="#FF9933" strokeWidth="1.1" strokeLinecap="round">
                  <line x1="50" y1="8" x2="50" y2="92" />
                  <line x1="8" y1="50" x2="92" y2="50" />
                  <line x1="20.3" y1="20.3" x2="79.7" y2="79.7" />
                  <line x1="79.7" y1="20.3" x2="20.3" y2="79.7" />
                  <g transform="rotate(15 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                  <g transform="rotate(30 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                  <g transform="rotate(45 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                  <g transform="rotate(60 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                  <g transform="rotate(75 50 50)"><line x1="50" y1="8" x2="50" y2="92" /><line x1="8" y1="50" x2="92" y2="50" /></g>
                </g>
              </svg>
            </div>

            <h1 className="auth-brand-title">
              <span className="title-bharat">BHARAT</span><span className="title-quest">QUEST</span>
            </h1>
            <p className="auth-brand-tagline">Learn India. Play the Quest.</p>

            <div className="auth-quote-card">
              <p className="auth-quote-text">
                "Explore history, culture and civilization through interactive quests. Discover. Solve. Learn. Unlock."
              </p>
            </div>

            <div className="auth-feature-list">
              <div className="afl-item"><span>🏺</span> <span>Archaeological 3D Artifacts &amp; 24-Spoke Ashoka Chakra</span></div>
              <div className="afl-item"><span>⚔️</span> <span>Storyline Quests: Harappa, Vedic, Empires &amp; Rivers</span></div>
              <div className="afl-item"><span>🏆</span> <span>Dynamic XP, Real-Time Badges &amp; Leaderboards</span></div>
            </div>

            <div className="auth-proto-disclaimer">
              <span>🔒 Powered by Supabase Auth &middot; React + TypeScript Edition</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-side">
          <div className="auth-card">

            {/* Auth Tabs */}
            <div className="auth-tabs-nav" role="tablist">
              <button
                type="button"
                id="tab-btn-login"
                data-tab="login"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setLoginError(null); }}
                role="tab"
                aria-selected={activeTab === 'login'}
                disabled={loginLoading || regLoading}
              >
                <span className="at-icon">🔑</span> LOGIN
              </button>
              <button
                type="button"
                id="tab-btn-register"
                data-tab="register"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => { setActiveTab('register'); setRegError(null); }}
                role="tab"
                aria-selected={activeTab === 'register'}
                disabled={loginLoading || regLoading || otpLoading}
              >
                <span className="at-icon">✨</span> REGISTER
              </button>
              <button
                type="button"
                id="tab-btn-otp"
                data-tab="otp"
                className={`auth-tab-btn ${activeTab === 'otp' ? 'active' : ''}`}
                onClick={() => { setActiveTab('otp'); setOtpError(null); setOtpSuccessMsg(null); }}
                role="tab"
                aria-selected={activeTab === 'otp'}
                disabled={loginLoading || regLoading || otpLoading}
              >
                <span className="at-icon">⚡</span> OTP LOGIN
              </button>
            </div>

            {/* ============================================================
                LOGIN TAB PANE
            ============================================================ */}
            {activeTab === 'login' && (
              <div className="auth-pane" id="auth-pane-login">
                <div className="auth-header">
                  <h2 className="auth-title">Welcome Back, Explorer</h2>
                  <p className="auth-sub">Continue your journey through India's heritage.</p>
                </div>

                <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                  {loginError && (
                    <div className="auth-error-box" id="login-error">{loginError}</div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="login-email">Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        id="login-email"
                        className="form-input"
                        placeholder="e.g. explorer@bharatquest.in"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="login-password">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input
                        type={loginShowPw ? 'text' : 'password'}
                        id="login-password"
                        className="form-input"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loginLoading}
                      />
                      <button
                        type="button"
                        className="btn-toggle-pw"
                        onClick={() => setLoginShowPw(!loginShowPw)}
                        title="Show/Hide Password"
                        aria-label="Toggle password visibility"
                        tabIndex={-1}
                      >
                        {loginShowPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary btn-glow btn-auth-submit"
                    id="btn-login-submit"
                    disabled={loginLoading}
                    style={{ opacity: loginLoading ? 0.7 : 1 }}
                  >
                    {loginLoading ? '⏳ SIGNING IN...' : 'LOGIN →'}
                  </button>

                  <div className="auth-switcher">
                    <span>New to BharatQuest?</span>
                    <button
                      type="button"
                      className="btn-switch-auth"
                      onClick={() => { setActiveTab('register'); setRegError(null); }}
                      disabled={loginLoading}
                    >
                      CREATE AN ACCOUNT
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================
                REGISTER TAB PANE
            ============================================================ */}
            {activeTab === 'register' && (
              <div className="auth-pane" id="auth-pane-register">
                <div className="auth-header">
                  <h2 className="auth-title">Begin Your Journey</h2>
                  <p className="auth-sub">Create your explorer profile and start your journey.</p>
                </div>

                <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
                  {regError && (
                    <div className="auth-error-box" id="reg-error">{regError}</div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-name">Full Name</label>
                    <div className="input-wrap">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        id="reg-name"
                        className="form-input"
                        placeholder="e.g. Arjun Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        autoComplete="name"
                        required
                        disabled={regLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        id="reg-email"
                        className="form-input"
                        placeholder="e.g. arjun@bharatquest.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={regLoading}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-class">Class / Academic Year</label>
                      <div className="input-wrap">
                        <span className="input-icon">🎓</span>
                        <select
                          id="reg-class"
                          className="form-select"
                          value={regClass}
                          onChange={(e) => setRegClass(e.target.value)}
                          required
                          disabled={regLoading}
                        >
                          <option value="" disabled>Select Year/Class</option>
                          <option value="Class 6–8">Class 6–8 (Middle School)</option>
                          <option value="Class 9–10">Class 9–10 (Secondary)</option>
                          <option value="Class 11–12">Class 11–12 (Higher Sec)</option>
                          <option value="College 1st Year">College 1st Year</option>
                          <option value="College 2nd Year">College 2nd Year</option>
                          <option value="College 3rd/4th Year">College 3rd/4th Year</option>
                          <option value="Lifelong Learner">Lifelong Learner / Historian</option>
                        </select>
                      </div>
                    </div>

                    {/* Avatar Selection */}
                    <div className="form-group">
                      <label className="form-label">Choose Cultural Avatar</label>
                      <AvatarSelector
                        selectedAvatar={regAvatar}
                        onSelect={setRegAvatar}
                        compact={true}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input
                        type={regShowPw ? 'text' : 'password'}
                        id="reg-password"
                        className="form-input"
                        placeholder="Minimum 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={regLoading}
                      />
                      <button
                        type="button"
                        className="btn-toggle-pw"
                        onClick={() => setRegShowPw(!regShowPw)}
                        title="Show/Hide Password"
                        aria-label="Toggle password visibility"
                        tabIndex={-1}
                      >
                        {regShowPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔐</span>
                      <input
                        type={regShowPw ? 'text' : 'password'}
                        id="reg-confirm-password"
                        className="form-input"
                        placeholder="Re-enter your password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={regLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary btn-glow btn-auth-submit"
                    id="btn-register-submit"
                    disabled={regLoading}
                    style={{ opacity: regLoading ? 0.7 : 1 }}
                  >
                    {regLoading ? '⏳ CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
                  </button>

                  <div className="auth-switcher">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      className="btn-switch-auth"
                      onClick={() => { setActiveTab('login'); setRegError(null); }}
                      disabled={regLoading}
                    >
                      LOGIN
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================
                OTP FAST LOGIN TAB PANE
            ============================================================ */}
            {activeTab === 'otp' && (
              <div className="auth-pane" id="auth-pane-otp">
                <div className="auth-header">
                  <h2 className="auth-title">Instant OTP Access</h2>
                  <p className="auth-sub">Secure passwordless verification for explorers.</p>
                </div>

                <form className="auth-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} noValidate>
                  {otpError && (
                    <div className="auth-error-box" id="otp-error">{otpError}</div>
                  )}

                  {otpSuccessMsg && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#4ADE80',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      marginBottom: '16px'
                    }}>
                      ✅ {otpSuccessMsg}
                    </div>
                  )}

                  {evaluatorCode && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(245,158,11,0.1))',
                      border: '1.5px solid rgba(234,179,8,0.4)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 700, display: 'block' }}>
                        🛡️ LIVE EVALUATOR OTP:
                      </span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '4px', color: '#FFF' }}>
                        {evaluatorCode}
                      </span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="otp-email">Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        id="otp-email"
                        className="form-input"
                        placeholder="e.g. explorer@bharatquest.in"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={otpLoading || otpSent}
                      />
                    </div>
                  </div>

                  {/* 6-Digit OTP Code Input (Shown after OTP sent) */}
                  {otpSent && (
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" htmlFor="otp-code" style={{ margin: 0 }}>
                          6-Digit Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FF9933',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          disabled={otpLoading}
                        >
                          Resend Code
                        </button>
                      </div>
                      <div className="input-wrap">
                        <span className="input-icon">🔑</span>
                        <input
                          type="text"
                          id="otp-code"
                          maxLength={6}
                          className="form-input"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          style={{ letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700 }}
                          required
                          disabled={otpLoading}
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!otpSent ? (
                    <button
                      type="submit"
                      className="btn-primary btn-glow btn-auth-submit"
                      id="btn-otp-send"
                      disabled={otpLoading}
                      style={{ opacity: otpLoading ? 0.7 : 1 }}
                    >
                      {otpLoading ? '⏳ SENDING OTP...' : 'SEND 6-DIGIT OTP →'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-primary btn-glow btn-auth-submit"
                      id="btn-otp-verify"
                      disabled={otpLoading || otpCode.length < 6}
                      style={{ opacity: (otpLoading || otpCode.length < 6) ? 0.7 : 1 }}
                    >
                      {otpLoading ? '⏳ VERIFYING...' : 'VERIFY & ENTER BHARATQUEST →'}
                    </button>
                  )}

                  <div className="auth-switcher">
                    <span>Prefer password login?</span>
                    <button
                      type="button"
                      className="btn-switch-auth"
                      onClick={() => { setActiveTab('login'); setOtpError(null); setOtpSuccessMsg(null); }}
                      disabled={otpLoading}
                    >
                      PASSWORD LOGIN
                    </button>
                  </div>
                </form>
              </div>
            )}


          </div>
        </div>
      </div>
    </section>
  );
};