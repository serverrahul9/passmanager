import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  LogOut, 
  Download, 
  Plus, 
  User,
  Menu,
  X
} from 'lucide-react';

export function Navbar({
  user,
  onOpenAddModal,
  onOpenGenerator,
  onOpenAudit,
  onOpenBackup,
  onSignOut,
  accountsCount = 0,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-sky-400/20 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-glass-glow border border-white/40 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-black text-lg sm:text-2xl text-white tracking-tight">
                Liquid<span className="text-sky-400">Vault</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                AES-256
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-sky-200/60 leading-none">
              Cloud ID & Password Manager
            </p>
          </div>
        </div>

        {/* Center / Action Buttons (Desktop & Tablet >= 768px) */}
        {user && (
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Password Generator */}
            <button
              onClick={onOpenGenerator}
              className="px-3 py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Password Generator"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Generator</span>
            </button>

            {/* Health Audit */}
            <button
              onClick={onOpenAudit}
              className="px-3 py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Vault Health Audit"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Health Audit</span>
            </button>

            {/* Export / Backup */}
            <button
              onClick={onOpenBackup}
              className="px-3 py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Backup & Export"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Backup</span>
            </button>

            {/* Add Account Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 liquid-btn-primary shadow-glass-glow flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Account</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-sky-900/40">
              <div
                className="w-8 h-8 rounded-xl bg-sky-900/50 border border-sky-400/30 flex items-center justify-center text-sky-200 text-xs font-bold"
                title={user.email}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <button
                onClick={onSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Top Controls (< 768px) */}
        {user && (
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 liquid-btn-primary flex items-center gap-1 shadow-glass-glow"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-sky-900/50 bg-[#06182c]/95 backdrop-blur-2xl px-4 py-3 space-y-2 animate-fadeIn">
          {/* User info bar */}
          <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/20 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 text-xs font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs text-sky-200 truncate">{user.email}</span>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); onSignOut(); }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenGenerator(); }}
            className="w-full p-2.5 rounded-xl liquid-btn-secondary text-left text-xs font-semibold text-slate-200 flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Password Generator</span>
          </button>

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenAudit(); }}
            className="w-full p-2.5 rounded-xl liquid-btn-secondary text-left text-xs font-semibold text-slate-200 flex items-center gap-2.5"
          >
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Vault Health Audit</span>
          </button>

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenBackup(); }}
            className="w-full p-2.5 rounded-xl liquid-btn-secondary text-left text-xs font-semibold text-slate-200 flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Backup & Export JSON</span>
          </button>
        </div>
      )}
    </header>
  );
}
