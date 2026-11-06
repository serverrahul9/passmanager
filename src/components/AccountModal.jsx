import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Globe, 
  User, 
  Lock, 
  Star, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { PLATFORM_PRESETS, PLATFORM_CATEGORIES } from '../utils/platforms';
import { PlatformIcon } from './PlatformIcon';
import { evaluatePasswordStrength } from '../utils/crypto';

export function AccountModal({
  isOpen,
  onClose,
  onSave,
  onOpenGenerator,
  editingAccount = null,
}) {
  const [title, setTitle] = useState('');
  const [platformId, setPlatformId] = useState('google');
  const [category, setCategory] = useState('google');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAccount) {
      setTitle(editingAccount.title || '');
      setPlatformId(editingAccount.platformId || 'custom');
      setCategory(editingAccount.category || 'other');
      setUrl(editingAccount.url || '');
      setUsername(editingAccount.username || '');
      setPassword(editingAccount.password || '');
      setNotes(editingAccount.notes || '');
      setIsFavorite(!!editingAccount.isFavorite);
    } else {
      const defaultPreset = PLATFORM_PRESETS[0];
      setTitle(defaultPreset.name);
      setPlatformId(defaultPreset.id);
      setCategory(defaultPreset.category);
      setUrl(defaultPreset.domain ? `https://${defaultPreset.domain}` : '');
      setUsername('');
      setPassword('');
      setNotes('');
      setIsFavorite(false);
    }
    setErrors({});
  }, [editingAccount, isOpen]);

  const handleSelectPreset = (preset) => {
    setPlatformId(preset.id);
    if (!editingAccount || title === '') {
      setTitle(preset.name);
    }
    setCategory(preset.category);
    if (preset.domain) {
      setUrl(`https://${preset.domain}`);
    }
  };

  const handleGeneratedPassword = (newPassword) => {
    setPassword(newPassword);
  };

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Account title is required';
    if (!username.trim()) newErrors.username = 'Username or email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: editingAccount?.id || null,
      title: title.trim(),
      platformId,
      category,
      url: url.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      isFavorite,
      updatedAt: new Date().toISOString(),
      createdAt: editingAccount?.createdAt || new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col liquid-glass-modal rounded-2xl sm:rounded-3xl text-slate-100 shadow-2xl border border-sky-400/30 overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-900/50 shrink-0 bg-[#071d33]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <PlatformIcon type={platformId} className="w-6 h-6" url={url} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base sm:text-xl text-white">
                {editingAccount ? 'Edit Account' : 'Save New Account'}
              </h3>
              <p className="text-[11px] sm:text-xs text-sky-300/70">Client-Side AES-256 Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-sky-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="account-form" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Quick Platform Presets */}
          <div>
            <label className="block text-xs font-medium text-sky-200 mb-1.5">
              Choose Platform Preset:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {PLATFORM_PRESETS.map((p) => {
                const isSelected = platformId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-glass-glow'
                        : 'bg-sky-950/40 text-slate-300 hover:bg-sky-900/50 border border-sky-900/50'
                    }`}
                  >
                    <PlatformIcon type={p.iconType} className="w-3.5 h-3.5" color={isSelected ? '#082f49' : p.color} />
                    <span>{p.name.replace(' Account', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">
                Account Label / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Instagram"
                className={`w-full px-3.5 py-2.5 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500 ${
                  errors.title ? 'border-rose-500' : ''
                }`}
              />
              {errors.title && <span className="text-[11px] text-rose-400">{errors.title}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl liquid-input text-base sm:text-sm text-white bg-slate-900"
              >
                {PLATFORM_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-200">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Username / ID / Email */}
          <div>
            <label className="block text-xs font-medium text-sky-200 mb-1">
              Username, Email or Account ID *
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500 ${
                  errors.username ? 'border-rose-500' : ''
                }`}
              />
              <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.username && <span className="text-[11px] text-rose-400">{errors.username}</span>}
          </div>

          {/* Password & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-sky-200">
                Password *
              </label>
              <button
                type="button"
                onClick={() => onOpenGenerator(handleGeneratedPassword)}
                className="text-xs text-sky-300 hover:text-white flex items-center gap-1 hover:underline font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Generate Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl liquid-input text-base sm:text-sm font-mono text-white placeholder-slate-500 ${
                  errors.password ? 'border-rose-500' : ''
                }`}
              />
              <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-300 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[11px] text-rose-400">{errors.password}</span>}

            {/* Strength Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" /> Strength: <strong className={strength.text}>{strength.label}</strong>
                  </span>
                  <span className="text-slate-400">{strength.crackTime}</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${Math.max(strength.score, 15)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Website / Login URL */}
          <div>
            <label className="block text-xs font-medium text-sky-200 mb-1">
              Website / Login URL (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500"
              />
              <Globe className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Secure Notes / 2FA Recovery Codes */}
          <div>
            <label className="block text-xs font-medium text-sky-200 mb-1">
              Encrypted Notes / 2FA Backup Codes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recovery email, PIN, security answers..."
              className="w-full px-3.5 py-2.5 rounded-xl liquid-input text-base sm:text-sm text-white placeholder-slate-500 resize-none"
            />
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/30 border border-sky-900/40">
            <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
              <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              Star as Favorite Account
            </span>
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-sky-400/40 focus:ring-sky-400 cursor-pointer"
            />
          </div>
        </form>

        {/* Footer - Sticky at bottom */}
        <div className="p-3 sm:p-4 border-t border-sky-900/50 bg-[#071d33]/95 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white liquid-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="account-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 liquid-btn-primary shadow-glass-glow flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{editingAccount ? 'Update Account' : 'Save Securely'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
