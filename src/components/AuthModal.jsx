import React, { useState } from 'react';
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';

export function AuthModal({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('otp'); // 'otp' | 'password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(null);
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Send OTP via Resend API
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok && data.error) {
        throw new Error(data.error);
      }

      setOtpSent(true);
      setSuccessMsg(data.message || 'Verification code sent to your email!');
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }

      // Start 45s countdown
      setCountdown(45);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      const userSession = {
        uid: data.uid,
        email: data.email,
        displayName: data.email.split('@')[0],
        authMethod: 'email-otp',
      };
      try {
        localStorage.setItem('liquidvault_session', JSON.stringify(userSession));
      } catch (e) {}

      onLoginSuccess(userSession);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        authMethod: 'google',
      };
      try {
        localStorage.setItem('liquidvault_session', JSON.stringify(userSession));
      } catch (e) {}

      onLoginSuccess(userSession);
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password Login / Register
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;
      }

      const userSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.email.split('@')[0],
        authMethod: 'password',
      };
      try {
        localStorage.setItem('liquidvault_session', JSON.stringify(userSession));
      } catch (e) {}

      onLoginSuccess(userSession);
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account already exists with this email.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center p-3 sm:p-6 w-full relative z-10">
      
      {/* Liquid Card Container */}
      <div className="w-full max-w-md liquid-glass-modal rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-sky-400/30 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 shadow-glass-glow text-slate-950 mb-2.5 sm:mb-3 border border-white/30">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Liquid<span className="text-sky-400">Vault</span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/70 mt-1">
            Zero-Knowledge Encrypted Password & ID Manager
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-sky-950/60 border border-sky-500/20 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('otp'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'otp'
                ? 'bg-sky-500 text-slate-950 shadow-glass-glow'
                : 'text-sky-300/80 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Email OTP (Resend)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-sky-500 text-slate-950 shadow-glass-glow'
                : 'text-sky-300/80 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OTP Test Helper Hint */}
        {devOtpHint && (
          <div className="mb-4 p-2.5 rounded-xl bg-sky-950/80 border border-sky-400/40 text-sky-200 text-xs flex items-center justify-between">
            <span>Dev Code: <strong className="font-mono text-white text-sm tracking-wider">{devOtpHint}</strong></span>
            <button
              onClick={() => { setOtp(devOtpHint); setDevOtpHint(null); }}
              className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/40 text-sky-300"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* TAB 1: EMAIL OTP AUTH */}
        {activeTab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-sky-200 mb-1">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      required
                      className="w-full px-4 py-3 pl-10 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500"
                    />
                    <Mail className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl liquid-btn-primary font-bold text-slate-950 text-sm flex items-center justify-center gap-2 shadow-glass-glow disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="text-xs text-sky-200/80 mb-1">
                  Sent to <strong className="text-white">{email}</strong>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="ml-2 text-sky-400 underline font-medium"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-sky-200 mb-1">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      required
                      className="w-full px-4 py-3 pl-10 rounded-xl liquid-input text-lg font-mono tracking-widest text-center text-white placeholder-slate-500"
                    />
                    <KeyRound className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-xl liquid-btn-primary font-bold text-slate-950 text-sm flex items-center justify-center gap-2 shadow-glass-glow disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Enter Vault</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend code in <strong className="text-sky-300">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL & PASSWORD AUTH */}
        {activeTab === 'password' && (
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500"
                />
                <Mail className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl liquid-btn-primary font-bold text-slate-950 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isRegistering ? 'Create Free Account' : 'Sign In to Vault'}</span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-sky-300 hover:text-white transition-colors"
              >
                {isRegistering
                  ? 'Already have an account? Sign In'
                  : "Don't have an account yet? Register here"}
              </button>
            </div>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4 sm:my-5 flex items-center justify-center">
          <div className="w-full border-t border-sky-900/40"></div>
          <span className="bg-[#0b2844] px-3 text-[10px] sm:text-[11px] uppercase tracking-wider text-sky-400/70 font-semibold absolute">
            Or Continue With
          </span>
        </div>

        {/* Social / Google Auth */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl liquid-btn-secondary flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-white hover:text-sky-100 disabled:opacity-50 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-5 pt-3 border-t border-sky-900/30 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-sky-300/60">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Client-Side AES-256 &bull; Zero Knowledge Architecture</span>
        </div>
      </div>
    </div>
  );
}
