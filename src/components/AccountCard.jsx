import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Star, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  CopyPlus
} from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { PLATFORM_PRESETS } from '../utils/platforms';
import { evaluatePasswordStrength } from '../utils/crypto';

export function AccountCard({
  account,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onCopyNotice,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const preset = PLATFORM_PRESETS.find((p) => p.id === account.platformId) || PLATFORM_PRESETS[PLATFORM_PRESETS.length - 1];
  const strength = evaluatePasswordStrength(account.password);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    if (onCopyNotice) {
      onCopyNotice(`${fieldName === 'id' ? 'Account ID' : 'Password'} copied!`);
    }
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group overflow-hidden border border-sky-400/20 hover:border-sky-400/40 transition-all duration-300 w-full">
      
      {/* Top subtle shine effect */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-sky-400/20 transition-all" />

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl p-2.5 flex items-center justify-center bg-gradient-to-br ${preset.bgGradient || 'from-sky-600 to-blue-700'} shadow-md text-white shrink-0`}>
              <PlatformIcon type={account.platformId} className="w-6 h-6" url={account.url} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-heading font-semibold text-base sm:text-lg text-white leading-tight truncate max-w-[170px] sm:max-w-[220px]">
                  {account.title}
                </h4>
                {account.isFavorite && (
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-500/20 truncate">
                  {preset.name.replace(' Account', '')}
                </span>
                {account.url && (
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] sm:text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-0.5 transition-colors"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card Action icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={() => onToggleFavorite(account)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-sky-950/40 transition-colors"
              title={account.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
              aria-label="Favorite"
            >
              <Star className={`w-4 h-4 ${account.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onDuplicate && onDuplicate(account)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-950/40 transition-colors"
              title="Duplicate Account"
              aria-label="Duplicate"
            >
              <CopyPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(account)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-950/40 transition-colors"
              title="Edit Account"
              aria-label="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(account)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Delete Account"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="mt-4 space-y-2">
          {/* User ID / Email */}
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/15 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-semibold text-sky-300/70 tracking-wider">
                ID / Username / Email
              </span>
              <span className="font-mono text-xs sm:text-sm text-slate-100 truncate block select-all font-medium">
                {account.username}
              </span>
            </div>
            <button
              onClick={() => handleCopy(account.username, 'id')}
              className={`p-2 rounded-lg border transition-all shrink-0 ${
                copiedField === 'id'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-sky-900/40 hover:bg-sky-800/60 border-sky-500/30 text-sky-300 hover:text-white'
              }`}
              title="Copy ID"
            >
              {copiedField === 'id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Password */}
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/15 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-semibold text-sky-300/70 tracking-wider">
                  Password
                </span>
                <span className={`text-[10px] font-semibold ${strength.text}`}>
                  &bull; {strength.label}
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm text-slate-100 truncate block select-all font-medium tracking-wider">
                {showPassword ? account.password : '••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-lg bg-sky-900/40 hover:bg-sky-800/60 border border-sky-500/30 text-slate-300 hover:text-sky-200 transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleCopy(account.password, 'pwd')}
                className={`p-2 rounded-lg border transition-all ${
                  copiedField === 'pwd'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-sky-900/40 hover:bg-sky-800/60 border-sky-500/30 text-sky-300 hover:text-white'
                }`}
                title="Copy Password"
              >
                {copiedField === 'pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes / Drawer (if any) */}
      {account.notes && (
        <div className="mt-3 pt-2 border-t border-sky-900/30">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center justify-between w-full text-xs text-sky-300/80 hover:text-sky-200"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Encrypted Notes & 2FA Codes</span>
            </span>
            {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showNotes && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-950/70 border border-sky-500/20 text-xs text-slate-300 whitespace-pre-wrap font-mono select-all break-all max-h-36 overflow-y-auto">
              {account.notes}
            </div>
          )}
        </div>
      )}

      {/* Footer updated timestamp */}
      <div className="mt-3 pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-sky-900/20">
        <span>Updated {new Date(account.updatedAt || account.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 text-sky-400/70">
          <ShieldCheck className="w-3 h-3" /> AES-256
        </span>
      </div>
    </div>
  );
}
