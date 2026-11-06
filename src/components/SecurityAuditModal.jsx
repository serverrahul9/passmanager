import React from 'react';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, Key, Repeat, CheckCircle } from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/crypto';
import { PlatformIcon } from './PlatformIcon';

export function SecurityAuditModal({ isOpen, onClose, accounts, onEditAccount }) {
  if (!isOpen) return null;

  // Compute security metrics
  let weakCount = 0;
  let reusedCount = 0;
  const passwordMap = new Map();

  accounts.forEach((acc) => {
    const strength = evaluatePasswordStrength(acc.password);
    if (strength.score < 60) {
      weakCount++;
    }

    const count = passwordMap.get(acc.password) || 0;
    passwordMap.set(acc.password, count + 1);
  });

  const duplicatePasswords = new Set();
  for (const [pwd, count] of passwordMap.entries()) {
    if (count > 1) duplicatePasswords.add(pwd);
  }
  reusedCount = accounts.filter((acc) => duplicatePasswords.has(acc.password)).length;

  let totalScore = 100;
  if (accounts.length > 0) {
    const weakPenalty = (weakCount / accounts.length) * 45;
    const reusePenalty = (reusedCount / accounts.length) * 35;
    totalScore = Math.max(10, Math.round(100 - weakPenalty - reusePenalty));
  }

  const getScoreColor = () => {
    if (totalScore >= 80) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (totalScore >= 50) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col liquid-glass-modal rounded-2xl sm:rounded-3xl text-slate-100 shadow-2xl border border-sky-400/30 overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-900/50 shrink-0 bg-[#071d33]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base sm:text-xl text-white">Vault Health Audit</h3>
              <p className="text-[11px] text-sky-300/70">Security & vulnerability analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-sky-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

        {/* Overall Score Circle */}
        <div className="mt-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-sky-950/30 border border-sky-500/20">
          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor()} shadow-lg mb-2`}>
            <span className="text-3xl font-extrabold font-heading">{totalScore}%</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold">Security</span>
          </div>
          <h4 className="text-sm font-semibold text-white mt-1">
            {totalScore >= 80 ? 'Vault Security is Excellent' : totalScore >= 50 ? 'Moderate Security Attention Needed' : 'Vulnerable Credentials Detected'}
          </h4>
          <p className="text-xs text-sky-300/70 text-center max-w-xs mt-0.5">
            Based on password length, complexity, reuse detection, and encryption standards.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-center">
            <span className="block text-xs text-sky-300/70">Total Vault</span>
            <strong className="text-lg font-bold text-white">{accounts.length}</strong>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-center">
            <span className="block text-xs text-amber-300/80">Weak Passwords</span>
            <strong className="text-lg font-bold text-amber-400">{weakCount}</strong>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-center">
            <span className="block text-xs text-rose-300/80">Reused Passwords</span>
            <strong className="text-lg font-bold text-rose-400">{reusedCount}</strong>
          </div>
        </div>

        {/* Vulnerable Accounts List */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-300/80 mb-2">
            Recommended Actions
          </h4>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {accounts.filter((a) => evaluatePasswordStrength(a.password).score < 60 || duplicatePasswords.has(a.password)).length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>All your accounts are using unique, high-strength passwords! Great job!</span>
              </div>
            ) : (
              accounts
                .filter((a) => evaluatePasswordStrength(a.password).score < 60 || duplicatePasswords.has(a.password))
                .map((acc) => {
                  const isWeak = evaluatePasswordStrength(acc.password).score < 60;
                  const isReused = duplicatePasswords.has(acc.password);
                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/15 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <PlatformIcon type={acc.platformId} className="w-5 h-5 shrink-0" />
                        <div className="truncate">
                          <strong className="text-xs text-white block truncate">{acc.title}</strong>
                          <span className="text-[11px] text-slate-400 truncate block">{acc.username}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isWeak && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Weak
                          </span>
                        )}
                        {isReused && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Reused
                          </span>
                        )}
                        <button
                          onClick={() => {
                            onClose();
                            onEditAccount(acc);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30"
                        >
                          Fix
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        </div>

        {/* Footer - Sticky */}
        <div className="p-3 sm:p-4 border-t border-sky-900/50 bg-[#071d33]/95 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 liquid-btn-primary shadow-glass-glow"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}

