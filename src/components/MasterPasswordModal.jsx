import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { evaluatePasswordStrength, encryptData, decryptData } from '../utils/crypto';

export function MasterPasswordModal({
  isOpen,
  isFirstTime,
  onUnlock,
  onSetup,
  error,
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError('Please enter your Master Password.');
      return;
    }

    if (isFirstTime) {
      if (password.length < 8) {
        setLocalError('Master Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Master Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        await onSetup(password);
      } catch (err) {
        setLocalError(err.message || 'Failed to setup master key');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await onUnlock(password);
      } catch (err) {
        setLocalError(err.message || 'Incorrect master password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md liquid-glass-modal rounded-3xl p-6 sm:p-8 text-slate-100 overflow-hidden shadow-2xl border border-sky-400/30">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-glass-glow mb-3">
            {isFirstTime ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">
            {isFirstTime ? 'Create Master Encryption Key' : 'Unlock Your Liquid Vault'}
          </h2>
          <p className="text-xs text-sky-200/70 mt-1 max-w-xs">
            {isFirstTime
              ? 'Your Master Password encrypts all stored credentials client-side with AES-256 before uploading to Firebase.'
              : 'Enter your Master Password to decrypt your stored IDs and passwords.'}
          </p>
        </div>

        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-sky-200 mb-1.5">
              {isFirstTime ? 'Master Password' : 'Enter Master Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-3 rounded-xl liquid-input text-sm text-white placeholder-slate-500 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isFirstTime && (
            <>
              {/* Strength meter */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Master Key Strength:</span>
                    <strong className={strength.text}>{strength.label}</strong>
                  </div>
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${Math.max(strength.score, 15)}%` }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-sky-200 mb-1.5">
                  Confirm Master Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat master password"
                  className="w-full px-4 py-3 rounded-xl liquid-input text-sm text-white placeholder-slate-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-300/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Knowledge Promise:</strong> Your Master Password is NEVER sent to our servers or Firebase. If you lose it, encrypted credentials cannot be recovered without a backup.
                </span>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl liquid-btn-primary font-semibold text-slate-900 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Decrypting Vault...</span>
            ) : (
              <>
                <span>{isFirstTime ? 'Encrypt & Initialize Vault' : 'Unlock Liquid Vault'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

