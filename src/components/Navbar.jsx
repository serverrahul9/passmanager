import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  LogOut, 
  Download, 
  Plus, 
  User
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
  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-sky-400/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-glass-glow border border-white/40 shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                Liquid<span className="text-sky-400">Vault</span>
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                AES-256 Cloud
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-sky-200/60 leading-none">
              Secure Cloud ID & Password Manager
            </p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Password Generator */}
            <button
              onClick={onOpenGenerator}
              className="p-2 sm:px-3 sm:py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              title="Password Generator"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Generator</span>
            </button>

            {/* Health Audit */}
            <button
              onClick={onOpenAudit}
              className="p-2 sm:px-3 sm:py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              title="Vault Health Audit"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Health Audit</span>
            </button>

            {/* Export / Backup */}
            <button
              onClick={onOpenBackup}
              className="p-2 sm:px-3 sm:py-2 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              title="Backup & Export"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Backup</span>
            </button>

            {/* Add Account Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 liquid-btn-primary shadow-glass-glow"
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
      </div>
    </header>
  );
}
