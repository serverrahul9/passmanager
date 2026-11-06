# ⚡ LiquidVault — Encrypted Cloud Password & ID Manager

A modern, responsive **Liquid Glass** themed web application with a glowing skyblue aesthetic, designed for securely storing and managing platform credentials (Google, Instagram, X/Twitter, Facebook, GitHub, custom websites, etc.).

All user details, IDs, passwords, and sensitive notes are **client-side end-to-end encrypted with AES-GCM 256** before being saved to **Firebase Realtime Database**.

---

## ✨ Features

- **Liquid Glass Aesthetic & Skyblue Color Theme**:
  - Translucent frosted glass containers with backdrop blur (`backdrop-filter: blur(20px)`).
  - Floating organic glowing skyblue/cyan liquid orbs and animated ambient light.
  - Multi-layered specular highlights, soft neon borders, and smooth micro-interactions.
  - 100% mobile-responsive layout with mobile Floating Action Button (FAB) and touch-friendly controls.

- **Zero-Knowledge Client-Side Encryption**:
  - Uses the native browser **Web Crypto API**.
  - Derives a 256-bit AES-GCM key from the user's Master Password using **PBKDF2 with 100,000 iterations** and SHA-256.
  - Generates a unique 12-byte initialization vector (IV) for every credential saved.
  - Data is encrypted inside the browser before ever touching Firebase Realtime Database.
  - Master Password canary verification prevents unauthorized access or brute-force tampering.
  - Automatic memory purge on Vault Lock.

- **Platform Presets & Custom Credentials**:
  - Pre-configured presets with custom logos and branding: **Google, Instagram, Facebook, X (Twitter), GitHub, Apple ID, Microsoft, Netflix, Spotify, Amazon, PayPal, Discord, LinkedIn**, and **Custom Websites**.
  - Saves Account Label, Category, URL, Username / ID / Email, Password, and Encrypted 2FA / Recovery Notes.
  - Live password strength analyzer (Weak, Fair, Good, Strong, Military Grade) with crack-time calculation.
  - Instant one-click copy for ID and Password with toast confirmation.
  - Star / Favorite accounts for priority sorting.

- **Cryptographic Password Generator**:
  - Customizable character length (8 to 40+ chars).
  - Toggles for Uppercase, Lowercase, Numbers, Special Symbols, and Ambiguous Character exclusion (`0`, `O`, `l`, `1`).
  - Real-time entropy and crack-time display.

- **Vault Health & Vulnerability Audit**:
  - Calculates an overall Vault Security Score (0–100%).
  - Identifies weak passwords and flags reused / duplicate credentials.
  - Provides one-click jump to update vulnerable accounts.

- **Authentication Methods**:
  - **Email OTP Login** powered by **Resend API** with HTML liquid glass email templates.
  - **Google Auth** with single-click Firebase popup.
  - **Email & Password** registration / sign-in.
  - **Instant Guest / Demo Mode** for testing.

- **Backup & Portability**:
  - Export encrypted JSON backup of all accounts for offline safekeeping.
  - Import existing JSON backups with automatic client-side re-encryption.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and provide your Resend API Key:
```env
RESEND_API_KEY=your_resend_api_key_here
PORT=3001

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=rahul-passmanager.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://rahul-passmanager-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=rahul-passmanager
VITE_FIREBASE_STORAGE_BUCKET=rahul-passmanager.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=969534574835
VITE_FIREBASE_APP_ID=1:969534574835:web:99f436b20eced8aaa62786
VITE_FIREBASE_MEASUREMENT_ID=G-NQ18FHHCQL
```

### 3. Run Development Server
```bash
npm run dev
```
- **Vite Web Client**: `http://localhost:5173`
- **Resend OTP Server**: `http://localhost:3001`

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 🔒 Security Architecture

```
User Input (Password / ID / Notes)
               │
               ▼
   [Web Crypto API (AES-GCM 256)]
               │
      Derived with PBKDF2
      (100,000 rounds SHA-256 + 16-byte Salt)
               │
               ▼
   Encrypted Ciphertext + IV + Salt
               │
               ▼
  [Firebase Realtime Database]
  https://rahul-passmanager-default-rtdb.europe-west1.firebasedatabase.app
```
Nobody—not even the database host or network sniffers—can decrypt user credentials without the Master Password.

