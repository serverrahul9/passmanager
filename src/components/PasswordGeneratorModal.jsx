import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Check, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { generatePassword, evaluatePasswordStrength } from '../utils/crypto';

export function PasswordGeneratorModal({ isOpen, onClose, onSelectPassword }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const pwd = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeAmbiguous,
    });
    setPassword(pwd);
  };

  useEffect(() => {
    if (isOpen) {
      generate();
      setCopied(false);
    }
  }, [isOpen, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePassword = () => {
    if (onSelectPassword) {
      onSelectPassword(password);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col liquid-glass-modal rounded-2xl sm:rounded-3xl text-slate-100 shadow-2xl border border-sky-400/30 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-900/50 shrink-0 bg-[#071d33]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base sm:text-lg text-white">Password Generator</h3>
              <p className="text-[11px] text-sky-300/70">Cryptographically strong & entropy-tested</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-sky-900/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-sky-200 break-all select-all">
              {password}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={generate}
                className="p-2.5 rounded-xl bg-sky-900/40 hover:bg-sky-800/60 border border-sky-500/30 text-sky-300 hover:text-white transition-all active:scale-95"
                title="Generate New Password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  copied
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                    : 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-400/40 text-sky-300'
                }`}
                title="Copy Password"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength bar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Strength: <strong className={strength.text}>{strength.label}</strong>
            </span>
            <span className="text-slate-400">Crack Time: {strength.crackTime}</span>
          </div>
          <div className="w-full bg-slate-800/70 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${Math.max(strength.score, 15)}%` }}
            />
          </div>
        </div>

        {/* Sliders & Options */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm font-medium text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-400" /> Length
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-mono text-xs border border-sky-400/30 font-semibold">
                {length} chars
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-950/20 border border-sky-900/40 cursor-pointer hover:border-sky-500/30 transition-colors">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-300">ABC Uppercase</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-950/20 border border-sky-900/40 cursor-pointer hover:border-sky-500/30 transition-colors">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-300">abc Lowercase</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-950/20 border border-sky-900/40 cursor-pointer hover:border-sky-500/30 transition-colors">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => setNumbers(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-300">123 Numbers</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-950/20 border border-sky-900/40 cursor-pointer hover:border-sky-500/30 transition-colors">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-300">#$& Symbols</span>
            </label>
          </div>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-sky-950/10 border border-sky-900/30 cursor-pointer hover:border-sky-500/20">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400"
            />
            <span className="text-xs text-slate-400">Avoid ambiguous characters (e.g. 0, O, 1, l, I)</span>
          </label>
        </div>

        {/* Action Buttons - Sticky */}
        <div className="p-3 sm:p-4 border-t border-sky-900/50 bg-[#071d33]/95 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white liquid-btn-secondary"
          >
            Close
          </button>
          {onSelectPassword && (
            <button
              type="button"
              onClick={handleUsePassword}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 liquid-btn-primary shadow-glass-glow"
            >
              Use This Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

