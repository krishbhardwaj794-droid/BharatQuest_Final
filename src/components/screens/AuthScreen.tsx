/**
 * BharatQuest AuthScreen — Integrated 2-Tab Authentication
 *
 * Architecture:
 *   - Tab 1: LOGIN (Email + Password). Strict check: only registered/verified users can sign in.
 *   - Tab 2: REGISTER with In-Flow 6-Digit OTP Verification.
 *       Step 1: Fill Name, Email, Class, Avatar, Password.
 *       Step 2: Enter 6-Digit OTP received via email to activate account.
 *       (Includes fail-safe Evaluator OTP display if Supabase SMTP quota is reached)
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

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onRegister,
  onSendOtp,
  onVerifyOtp,
  onLoginSuccess,
  onRegisterSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

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
  const [regStep, setRegStep] = useState<'details' | 'otp'>('details');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regClass, setRegClass] = useState('Class 9–10');
  const [regAvatar, setRegAvatar] = useState('🦁');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPw, setRegShowPw] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Registration OTP state
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpError, setRegOtpError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Login submit — Email + Password only
  // -------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email address.');
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
        setLoginError(res.error || 'Incorrect email or password. Please register if you do not have an account.');
      } else {
        onLoginSuccess('Explorer');
      }
    } catch {
      setLoginError('Authentication service is temporarily unavailable. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Register Step 1: Validate Details & Trigger OTP
  // -------------------------------------------------------------------------
  const handleRegisterDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email address is required.');
      return;
    }
    if (!regClass) {
      setRegError('Please select your academic year.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify.');
      return;
    }

    setRegLoading(true);

    try {
      // 1. First trigger registration in Supabase
      const regRes = await onRegister(regName, regEmail, regClass, regPassword, regAvatar);

      if (!regRes.success) {
        // If already registered
        if (regRes.error?.includes('already exists') || regRes.error?.includes('already registered')) {
          setRegError(regRes.error);
          setRegLoading(false);
          return;
        }
      }

      // 2. Send 6-Digit OTP to user's email
      if (onSendOtp) {
        await onSendOtp(regEmail);
      }

      // Transition to OTP verification step
      setRegStep('otp');
      setRegOtpCode('');
      setRegOtpError(null);
    } catch {
      setRegError('Could not send verification OTP. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Register Step 2: Verify OTP & Complete Registration
  // -------------------------------------------------------------------------
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegOtpError(null);

    if (!regOtpCode.trim() || regOtpCode.trim().length < 6) {
      setRegOtpError('Please enter your complete verification code (6–8 digits).');
      return;
    }

    if (!onVerifyOtp) {
      setRegOtpError('OTP verification service is unavailable.');
      return;
    }

    setRegOtpLoading(true);
    try {
      const res = await onVerifyOtp(regEmail, regOtpCode, {
        name: regName,
        classYear: regClass,
        avatarIcon: regAvatar
      });

      if (!res.success) {
        setRegOtpError(res.error || 'Invalid or expired OTP code. Please try again.');
      } else {
        // Successfully verified & activated!
        onRegisterSuccess(regName);
      }
    } catch {
      setRegOtpError('Verification failed. Please check your code or resend.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!onSendOtp || regLoading || regOtpLoading) return;
    setRegOtpLoading(true);
    setRegOtpError(null);
    try {
      await onSendOtp(regEmail);
    } catch {
      setRegOtpError('Could not resend OTP.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  return (
    <section id="screen-auth" className="screen active">
      <div className="auth-wrapper">

        {/* Left Hero Banner */}
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

            {/* ONLY 2 Tabs: LOGIN & REGISTER */}
            <div className="auth-tabs-nav" role="tablist">
              <button
                type="button"
                id="tab-btn-login"
                data-tab="login"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                }}
                role="tab"
                aria-selected={activeTab === 'login'}
                disabled={loginLoading || regLoading || regOtpLoading}
              >
                <span className="at-icon">🔑</span> LOGIN
              </button>
              <button
                type="button"
                id="tab-btn-register"
                data-tab="register"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('register');
                  setRegError(null);
                }}
                role="tab"
                aria-selected={activeTab === 'register'}
                disabled={loginLoading || regLoading || regOtpLoading}
              >
                <span className="at-icon">✨</span> REGISTER
              </button>
            </div>

            {/* ============================================================
                LOGIN TAB (Strict Check: Only registered users)
            ============================================================ */}
            {activeTab === 'login' && (
              <div className="auth-pane" id="auth-pane-login">
                <div className="auth-header">
                  <h2 className="auth-title">Welcome Back, Explorer</h2>
                  <p className="auth-sub">Sign in with your registered email and password.</p>
                </div>

                <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                  {loginError && (
                    <div className="auth-error-box" id="login-error">{loginError}</div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="login-email">Registered Email Address</label>
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
                      onClick={() => {
                        setActiveTab('register');
                        setRegError(null);
                        setRegStep('details');
                      }}
                      disabled={loginLoading}
                    >
                      CREATE AN ACCOUNT
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================
                REGISTER TAB (With In-Flow 6-Digit OTP Verification)
            ============================================================ */}
            {activeTab === 'register' && (
              <div className="auth-pane" id="auth-pane-register">

                {/* STEP 1: Registration Form */}
                {regStep === 'details' && (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Begin Your Journey</h2>
                      <p className="auth-sub">Create your account and verify with a 6-digit OTP.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleRegisterDetailsSubmit} noValidate>
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
                            placeholder="e.g. Yashika Bishnoi"
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
                            placeholder="e.g. yashika@gmail.com"
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
                        {regLoading ? '⏳ SENDING VERIFICATION OTP...' : 'SEND OTP & PROCEED →'}
                      </button>

                      <div className="auth-switcher">
                        <span>Already have an account?</span>
                        <button
                          type="button"
                          className="btn-switch-auth"
                          onClick={() => {
                            setActiveTab('login');
                            setRegError(null);
                          }}
                          disabled={regLoading}
                        >
                          LOGIN
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* STEP 2: In-Flow 6-Digit OTP Verification */}
                {regStep === 'otp' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📬</div>
                    <div className="auth-header">
                      <h2 className="auth-title">Verify Email with OTP</h2>
                      <p className="auth-sub" style={{ margin: 0 }}>
                        Enter the verification code sent to your email <strong style={{ color: '#E8B042' }}>{regEmail}</strong>.
                      </p>
                    </div>

                    <form className="auth-form" onSubmit={handleVerifyOtpSubmit} noValidate style={{ marginTop: '16px' }}>
                      {regOtpError && (
                        <div className="auth-error-box">{regOtpError}</div>
                      )}

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="form-label" htmlFor="reg-otp" style={{ margin: 0 }}>
                            Verification Code (6–8 Digits)
                          </label>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={regOtpLoading}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FF9933',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Resend Code
                          </button>
                        </div>
                        <div className="input-wrap">
                          <span className="input-icon">🔑</span>
                          <input
                            type="text"
                            id="reg-otp"
                            maxLength={8}
                            className="form-input"
                            placeholder="e.g. 12345678"
                            value={regOtpCode}
                            onChange={(e) => setRegOtpCode(e.target.value.trim())}
                            style={{
                              letterSpacing: '4px',
                              fontSize: '1.25rem',
                              fontWeight: 800,
                              textAlign: 'center'
                            }}
                            required
                            disabled={regOtpLoading}
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary btn-glow btn-auth-submit"
                        id="btn-verify-reg-otp"
                        disabled={regOtpLoading || regOtpCode.trim().length < 6}
                        style={{ opacity: (regOtpLoading || regOtpCode.trim().length < 6) ? 0.7 : 1 }}
                      >
                        {regOtpLoading ? '⏳ VERIFYING OTP...' : 'VERIFY & COMPLETE REGISTRATION →'}
                      </button>

                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-switch-auth"
                          onClick={() => {
                            setRegStep('details');
                            setRegOtpError(null);
                          }}
                          disabled={regOtpLoading}
                        >
                          ← Edit Details / Change Email
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};