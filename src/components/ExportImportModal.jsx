import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, AlertTriangle, FileJson, Check } from 'lucide-react';

export function ExportImportModal({
  isOpen,
  onClose,
  accounts,
  onImportAccounts,
  onNotice,
}) {
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  // Export JSON Backup
  const handleExport = (includeDecrypted = true) => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      vaultType: 'LiquidVault_Encrypted_Backup',
      totalAccounts: accounts.length,
      accounts: accounts.map((acc) => ({
        title: acc.title,
        platformId: acc.platformId,
        category: acc.category,
        url: acc.url,
        username: acc.username,
        password: acc.password,
        notes: acc.notes,
        isFavorite: acc.isFavorite,
        createdAt: acc.createdAt,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `liquidvault-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (onNotice) {
      onNotice('Vault backup file downloaded successfully!');
    }
  };

  // Handle File Upload Import
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError('');
    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const importedAccounts = Array.isArray(json) ? json : json.accounts;

        if (!importedAccounts || !Array.isArray(importedAccounts)) {
          throw new Error('Invalid backup file structure: missing accounts array');
        }

        await onImportAccounts(importedAccounts);
        setImportSuccess(true);
        if (onNotice) {
          onNotice(`Successfully imported ${importedAccounts.length} accounts!`);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        setImportError(err.message || 'Failed to parse backup file');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col liquid-glass-modal rounded-2xl sm:rounded-3xl text-slate-100 shadow-2xl border border-sky-400/30 overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-900/50 shrink-0 bg-[#071d33]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base sm:text-lg text-white">Vault Backup & Sync</h3>
              <p className="text-[11px] text-sky-300/70">Export and import credentials</p>
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

        {importError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {importSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Import completed successfully! Refreshing vault...</span>
          </div>
        )}

        {/* Export Section */}
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Vault Backup</span>
            </h4>
            <p className="text-xs text-slate-300/80 mb-3">
              Download a JSON copy of your {accounts.length} saved accounts for offline safekeeping.
            </p>
            <button
              onClick={() => handleExport(true)}
              disabled={accounts.length === 0}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 liquid-btn-primary flex items-center justify-center gap-2 shadow-glass-glow disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup ({accounts.length} Accounts)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import Credentials</span>
            </h4>
            <p className="text-xs text-slate-300/80 mb-3">
              Restore accounts from a previously saved JSON file. New accounts will be encrypted and saved to Firebase.
            </p>
            <label className="w-full py-2.5 px-4 rounded-xl liquid-btn-secondary text-sky-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importing Accounts...' : 'Select Backup JSON File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        </div>

        {/* Footer - Sticky */}
        <div className="p-3 sm:p-4 border-t border-sky-900/50 bg-[#071d33]/95 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white liquid-btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

