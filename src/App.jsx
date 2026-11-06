import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Download, 
  Star, 
  Layers, 
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  FolderLock
} from 'lucide-react';

import { 
  auth, 
  database, 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  update, 
  onValue, 
  off, 
  signOut, 
  onAuthStateChanged 
} from './firebase';

import { 
  encryptData, 
  decryptData, 
  evaluatePasswordStrength 
} from './utils/crypto';

import { Navbar } from './components/Navbar';
import { AccountCard } from './components/AccountCard';
import { AccountModal } from './components/AccountModal';
import { MasterPasswordModal } from './components/MasterPasswordModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { ExportImportModal } from './components/ExportImportModal';
import { CategoryFilter } from './components/CategoryFilter';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('liquidvault_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Vault Encryption & Master Key State
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterError, setMasterError] = useState('');

  // Accounts Data State
  const [rawAccounts, setRawAccounts] = useState([]); // from Firebase
  const [decryptedAccounts, setDecryptedAccounts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // UI / Modals State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [generatorCallback, setGeneratorCallback] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If logged in via standard Firebase (Google or Email/Password)
        setCurrentUser((prev) => {
          if (prev?.authMethod === 'email-otp') return prev; // Keep OTP session
          return {
            uid: user.uid,
            email: user.email || 'user@liquidvault.local',
            displayName: user.displayName || user.email?.split('@')[0] || 'Vault User',
            photoURL: user.photoURL,
            authMethod: 'firebase',
          };
        });
      } else {
        // If no user and not OTP user
        setCurrentUser((prev) => (prev?.authMethod === 'email-otp' ? prev : null));
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Check if user has an existing Master Password Canary in Firebase RTDB
  useEffect(() => {
    if (!currentUser?.uid) {
      setRawAccounts([]);
      setDecryptedAccounts([]);
      setIsUnlocked(false);
      setMasterPassword('');
      return;
    }

    const checkVaultProfile = async () => {
      try {
        const canaryRef = ref(database, `users/${currentUser.uid}/profile/vaultCanary`);
        const snapshot = await get(canaryRef);
        if (snapshot.exists()) {
          setVaultExists(true);
          setShowMasterModal(true); // Prompt to unlock
        } else {
          setVaultExists(false);
          setShowMasterModal(true); // Prompt first-time master password setup
        }
      } catch (err) {
        console.warn('Error reading vault profile from RTDB:', err);
        setVaultExists(false);
        setShowMasterModal(true);
      }
    };

    checkVaultProfile();
  }, [currentUser]);

  // 3. Listen for Accounts in Firebase Realtime Database
  useEffect(() => {
    if (!currentUser?.uid) return;

    const accountsRef = ref(database, `users/${currentUser.uid}/accounts`);
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setRawAccounts(list);
      } else {
        setRawAccounts([]);
      }
    });

    return () => off(accountsRef);
  }, [currentUser]);

  // 4. Decrypt accounts whenever rawAccounts or masterPassword changes
  useEffect(() => {
    if (!isUnlocked || !masterPassword) {
      setDecryptedAccounts([]);
      return;
    }

    const decryptAll = async () => {
      setDataLoading(true);
      try {
        const decryptedList = await Promise.all(
          rawAccounts.map(async (acc) => {
            if (!acc.encryptedPayload) {
              // Backward compatibility or unencrypted entry
              return acc;
            }
            try {
              const decryptedSecret = await decryptData(acc.encryptedPayload, masterPassword);
              return {
                ...acc,
                username: decryptedSecret.username || '',
                password: decryptedSecret.password || '',
                notes: decryptedSecret.notes || '',
                url: decryptedSecret.url || acc.url || '',
              };
            } catch (err) {
              console.error(`Failed to decrypt account ${acc.id}:`, err);
              return {
                ...acc,
                username: '[Decryption Error]',
                password: '',
                notes: 'Decryption failed for this entry',
              };
            }
          })
        );
        setDecryptedAccounts(decryptedList);
      } catch (err) {
        console.error('Error during batch decryption:', err);
      } finally {
        setDataLoading(false);
      }
    };

    decryptAll();
  }, [rawAccounts, isUnlocked, masterPassword]);

  // Handle Setup Master Password (First time)
  const handleSetupMasterPassword = async (newPassword) => {
    if (!currentUser?.uid) return;

    // Encrypt a canary token to verify password later
    const canaryToken = 'LIQUID_VAULT_AES256_ACTIVE_' + Date.now();
    const encryptedCanary = await encryptData(canaryToken, newPassword);

    await set(ref(database, `users/${currentUser.uid}/profile`), {
      email: currentUser.email,
      vaultCanary: encryptedCanary,
      createdAt: new Date().toISOString(),
      encryptionVersion: 'AES-GCM-256',
    });

    setMasterPassword(newPassword);
    setIsUnlocked(true);
    setVaultExists(true);
    setShowMasterModal(false);
    showToast('Vault created & AES-256 Master Key activated!');
  };

  // Handle Unlock Master Password
  const handleUnlockMasterPassword = async (enteredPassword) => {
    if (!currentUser?.uid) return;

    const canaryRef = ref(database, `users/${currentUser.uid}/profile/vaultCanary`);
    const snapshot = await get(canaryRef);

    if (snapshot.exists()) {
      const encryptedCanary = snapshot.val();
      try {
        const decryptedToken = await decryptData(encryptedCanary, enteredPassword);
        if (!decryptedToken.startsWith('LIQUID_VAULT_AES256_ACTIVE_')) {
          throw new Error('Master Password token mismatch');
        }
      } catch (err) {
        throw new Error('Incorrect Master Password. Please try again.');
      }
    }

    setMasterPassword(enteredPassword);
    setIsUnlocked(true);
    setShowMasterModal(false);
    showToast('Vault unlocked successfully!');
  };

  // Lock Vault (Purges master key from browser memory)
  const handleLockVault = () => {
    setMasterPassword('');
    setIsUnlocked(false);
    setDecryptedAccounts([]);
    showToast('Vault locked. Credentials secured.');
  };

  // Save / Update Account in Firebase
  const handleSaveAccount = async (accountData) => {
    if (!currentUser?.uid || !masterPassword) return;

    try {
      // 1. Encrypt secrets client-side
      const secretsToEncrypt = {
        username: accountData.username,
        password: accountData.password,
        notes: accountData.notes,
        url: accountData.url,
      };

      const encryptedPayload = await encryptData(secretsToEncrypt, masterPassword);

      // 2. Prepare database payload (sensitive data is encrypted)
      const dbPayload = {
        title: accountData.title,
        platformId: accountData.platformId,
        category: accountData.category,
        url: accountData.url,
        isFavorite: !!accountData.isFavorite,
        encryptedPayload,
        updatedAt: new Date().toISOString(),
        createdAt: accountData.createdAt || new Date().toISOString(),
      };

      if (accountData.id) {
        // Update existing
        await update(ref(database, `users/${currentUser.uid}/accounts/${accountData.id}`), dbPayload);
        showToast(`Updated "${accountData.title}" securely!`);
      } else {
        // Create new
        const newRef = push(ref(database, `users/${currentUser.uid}/accounts`));
        await set(newRef, dbPayload);
        showToast(`Saved "${accountData.title}" to cloud vault!`);
      }
      setEditingAccount(null);
    } catch (err) {
      console.error('Error saving account to Firebase:', err);
      showToast('Error saving account: ' + err.message);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (account) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${account.title}"?`)) return;
    try {
      await remove(ref(database, `users/${currentUser.uid}/accounts/${account.id}`));
      showToast(`Deleted "${account.title}" from vault.`);
    } catch (err) {
      console.error('Failed to delete account:', err);
      showToast('Failed to delete: ' + err.message);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (account) => {
    try {
      await update(ref(database, `users/${currentUser.uid}/accounts/${account.id}`), {
        isFavorite: !account.isFavorite,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Import Accounts
  const handleImportAccounts = async (importedList) => {
    if (!currentUser?.uid || !masterPassword) return;

    for (const acc of importedList) {
      const secrets = {
        username: acc.username || '',
        password: acc.password || '',
        notes: acc.notes || '',
        url: acc.url || '',
      };
      const encryptedPayload = await encryptData(secrets, masterPassword);
      const newRef = push(ref(database, `users/${currentUser.uid}/accounts`));
      await set(newRef, {
        title: acc.title || 'Imported Account',
        platformId: acc.platformId || 'custom',
        category: acc.category || 'other',
        url: acc.url || '',
        isFavorite: !!acc.isFavorite,
        encryptedPayload,
        createdAt: acc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Handle Quick Load Demo Sample Accounts
  const handleLoadSampleAccounts = async () => {
    if (!currentUser?.uid || !masterPassword) return;

    const sampleData = [
      {
        title: 'Google Personal Account',
        platformId: 'google',
        category: 'google',
        url: 'https://accounts.google.com',
        username: 'rahul.personal@gmail.com',
        password: 'Google#Pass2026!SecureKey',
        notes: '2FA Backup Key: 8492-4912-3019\nRecovery Phone: +91 98765 43210',
        isFavorite: true,
      },
      {
        title: 'Instagram Photography',
        platformId: 'instagram',
        category: 'social',
        url: 'https://instagram.com',
        username: '@rahul_captures',
        password: 'Insta!Vibrant99#SkyBlue',
        notes: 'Linked to personal Facebook page\nBackup security code: 492019',
        isFavorite: true,
      },
      {
        title: 'GitHub Developer',
        platformId: 'github',
        category: 'work',
        url: 'https://github.com',
        username: 'rahul-codespace',
        password: 'Git#Commit2026!Vault998',
        notes: 'Personal Access Token (classic): ghp_sampletokenforliquidvault99281',
        isFavorite: false,
      },
      {
        title: 'Netflix Family HD',
        platformId: 'netflix',
        category: 'entertainment',
        url: 'https://netflix.com',
        username: 'family.stream@liquidpass.app',
        password: 'Net!Flix4KUltra#Pass',
        notes: 'Profile 1: Rahul (PIN: 1492)\nProfile 2: Family',
        isFavorite: false,
      },
    ];

    setDataLoading(true);
    try {
      await handleImportAccounts(sampleData);
      showToast('Loaded 4 sample platform accounts encrypted with AES-256!');
    } catch (err) {
      showToast('Error loading samples: ' + err.message);
    } finally {
      setDataLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // Ignored
    }
    try {
      localStorage.removeItem('liquidvault_session');
    } catch {}
    setCurrentUser(null);
    setIsUnlocked(false);
    setMasterPassword('');
    setRawAccounts([]);
    setDecryptedAccounts([]);
    showToast('Signed out of LiquidVault.');
  };

  // Filtered & Sorted Accounts
  const filteredAccounts = decryptedAccounts.filter((acc) => {
    const matchesCategory = selectedCategory === 'all' || acc.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      acc.title?.toLowerCase().includes(query) ||
      acc.username?.toLowerCase().includes(query) ||
      acc.platformId?.toLowerCase().includes(query) ||
      acc.notes?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Favorites first, then newest
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  return (
    <div className="min-h-screen relative flex flex-col bg-[#051321] text-slate-100 overflow-x-hidden">
      
      {/* Liquid Glass Fluid Background Orbs */}
      <div className="liquid-orb-1" />
      <div className="liquid-orb-2" />
      <div className="liquid-orb-3" />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-bounce duration-300">
          <div className="px-4 py-3 rounded-2xl liquid-glass border border-sky-400/50 shadow-glass-glow flex items-center gap-2.5 text-xs font-semibold text-sky-200">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={currentUser}
        isUnlocked={isUnlocked}
        onLockVault={handleLockVault}
        onUnlockVault={() => setShowMasterModal(true)}
        onOpenAddModal={() => { setEditingAccount(null); setShowAddModal(true); }}
        onOpenGenerator={() => { setGeneratorCallback(null); setShowGeneratorModal(true); }}
        onOpenAudit={() => setShowAuditModal(true)}
        onOpenBackup={() => setShowBackupModal(true)}
        onSignOut={handleSignOut}
        accountsCount={decryptedAccounts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 pb-24 sm:pb-12">
        
        {authLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-xs text-sky-300/70 font-medium">Securing connection to LiquidVault...</p>
          </div>
        ) : !currentUser ? (
          /* Authentication Screen */
          <AuthModal onLoginSuccess={(user) => setCurrentUser(user)} />
        ) : !isUnlocked ? (
          /* Vault Locked State Screen */
          <div className="max-w-md mx-auto my-12 text-center liquid-glass-card rounded-3xl p-8 border border-sky-400/30 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 mx-auto mb-4 shadow-glass-glow">
              <FolderLock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-white">Your Vault is Locked</h2>
            <p className="text-xs text-sky-200/70 mt-2 max-w-xs mx-auto">
              {vaultExists
                ? 'Your stored Google, Instagram, and web credentials are fully encrypted on Firebase. Enter your Master Password to decrypt.'
                : 'Initialize your zero-knowledge Master Encryption Key to begin storing encrypted credentials.'}
            </p>
            <button
              onClick={() => setShowMasterModal(true)}
              className="mt-6 w-full py-3.5 rounded-xl text-sm font-semibold text-slate-900 liquid-btn-primary shadow-glass-glow flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{vaultExists ? 'Unlock Vault' : 'Set Up Master Key'}</span>
            </button>
          </div>
        ) : (
          /* Unlocked Vault Dashboard */
          <div className="space-y-6">
            
            {/* Top Hero / Search & Filters Bar */}
            <div className="liquid-glass-card rounded-3xl p-4 sm:p-6 border border-sky-400/20 shadow-xl">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts by Google, Instagram, username, tags..."
                    className="w-full px-4 py-3 pl-11 rounded-2xl liquid-input text-sm text-white placeholder-slate-400 shadow-sm"
                  />
                  <Search className="w-4 h-4 text-sky-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick Add Button (Desktop) */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => { setEditingAccount(null); setShowAddModal(true); }}
                    className="flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 liquid-btn-primary shadow-glass-glow flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Save New Account</span>
                  </button>
                </div>
              </div>

              {/* Category Pills Filter */}
              <div className="mt-4 pt-3 border-t border-sky-900/30">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  accounts={decryptedAccounts}
                />
              </div>
            </div>

            {/* Accounts Count / Quick Stats */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs text-sky-200/80">
                <span className="font-semibold text-white">{filteredAccounts.length}</span>
                <span>{filteredAccounts.length === 1 ? 'account found' : 'accounts found'}</span>
                {selectedCategory !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 text-[10px] border border-sky-500/20">
                    Category: {selectedCategory}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-sky-300/60 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero-Knowledge AES-256</span>
              </div>
            </div>

            {/* Accounts Cards Grid */}
            {dataLoading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-sky-300/70">Decrypting stored platform credentials...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="py-16 text-center liquid-glass-card rounded-3xl p-8 border border-sky-400/20">
                <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-300 mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white">
                  {searchQuery ? 'No matching accounts found' : 'No accounts saved yet'}
                </h3>
                <p className="text-xs text-sky-200/70 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No credentials found matching "${searchQuery}". Clear your search query or try a different term.`
                    : 'Start by saving your Google, Instagram, social media, or website logins. Everything is encrypted before leaving your browser.'}
                </p>
                {!searchQuery && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => { setEditingAccount(null); setShowAddModal(true); }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 liquid-btn-primary shadow-glass-glow inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Save Your First Account</span>
                    </button>
                    <button
                      onClick={handleLoadSampleAccounts}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-sky-300 liquid-btn-secondary hover:text-white inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Load Sample Accounts (Google, Instagram...)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => { setEditingAccount(acc); setShowAddModal(true); }}
                    onDelete={handleDeleteAccount}
                    onToggleFavorite={handleToggleFavorite}
                    onCopyNotice={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for Mobile */}
      {currentUser && isUnlocked && (
        <button
          onClick={() => { setEditingAccount(null); setShowAddModal(true); }}
          className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl liquid-btn-primary shadow-glass-glow flex items-center justify-center text-slate-950 active:scale-95 transition-all"
          title="Add Account"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      )}

      {/* Modals */}
      <MasterPasswordModal
        isOpen={showMasterModal && !!currentUser}
        isFirstTime={!vaultExists}
        onSetup={handleSetupMasterPassword}
        onUnlock={handleUnlockMasterPassword}
        error={masterError}
      />

      <AccountModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingAccount(null); }}
        onSave={handleSaveAccount}
        onOpenGenerator={(callback) => {
          setGeneratorCallback(() => callback);
          setShowGeneratorModal(true);
        }}
        editingAccount={editingAccount}
      />

      <PasswordGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onSelectPassword={(pwd) => {
          if (generatorCallback) generatorCallback(pwd);
        }}
      />

      <SecurityAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        accounts={decryptedAccounts}
        onEditAccount={(acc) => {
          setEditingAccount(acc);
          setShowAddModal(true);
        }}
      />

      <ExportImportModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        accounts={decryptedAccounts}
        onImportAccounts={handleImportAccounts}
        onNotice={showToast}
      />
    </div>
  );
}

