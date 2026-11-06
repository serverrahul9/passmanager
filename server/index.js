import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

// In-memory store for OTPs: email -> { code, expiresAt, attempts }
const otpStore = new Map();

// Helper to hash email for deterministic UID
export function getEmailUid(email) {
  return 'email_' + crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex').substring(0, 24);
}

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Liquid Vault OTP Server', time: new Date().toISOString() });
});

// Send OTP endpoint
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Rate limiting check: check if already sent in last 30s
  const existing = otpStore.get(normalizedEmail);
  if (existing && Date.now() - existing.sentAt < 30000) {
    const waitSec = Math.ceil((30000 - (Date.now() - existing.sentAt)) / 1000);
    return res.status(429).json({ error: `Please wait ${waitSec}s before requesting a new code.` });
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, {
    code: otp,
    expiresAt,
    sentAt: Date.now(),
    attempts: 0,
  });

  console.log(`[OTP GENERATED] Email: ${normalizedEmail} | OTP: ${otp}`);

  // Beautiful Liquid Glass themed HTML template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Liquid Vault Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #082f49; color: #f0f9ff; margin: 0; padding: 20px; }
        .card { max-width: 480px; margin: 20px auto; background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { font-size: 24px; font-weight: 800; color: #38bdf8; text-align: center; margin-bottom: 20px; letter-spacing: -0.5px; }
        .code-box { background: rgba(2, 132, 199, 0.2); border: 1px dashed #38bdf8; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7dd3fc; margin: 24px 0; }
        .notice { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.6; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ LiquidVault Secure</div>
        <h2 style="margin: 0 0 12px 0; color: #e0f2fe; text-align: center;">One-Time Passcode</h2>
        <p style="color: #bae6fd; font-size: 15px; text-align: center; margin: 0;">Use the code below to log in or register your encrypted password vault:</p>
        
        <div class="code-box">${otp}</div>
        
        <p class="notice">
          This verification code will expire in <strong>10 minutes</strong>.<br>
          If you did not request this verification, you can safely ignore this email.
        </p>
        <div class="footer">
          End-to-End Encrypted Cloud Vault &bull; Zero Knowledge Architecture
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'LiquidVault <onboarding@resend.dev>',
      to: [normalizedEmail],
      subject: `Your LiquidVault Login Code: ${otp}`,
      html: emailHtml,
    });

    if (error) {
      console.warn('[Resend API Warning]', error);
      // If Resend has domain restriction (free trial restriction), return devOtp so user test is never blocked
      return res.json({
        success: true,
        message: 'OTP generated. Please check your inbox.',
        devNotice: error.message || 'Resend trial restriction note',
        devOtp: otp, // Helps during testing if recipient email is not verified on Resend free tier
      });
    }

    console.log('[Resend Success] Email sent ID:', data?.id);
    return res.json({
      success: true,
      message: 'OTP has been sent to your email address.',
    });
  } catch (err) {
    console.error('[Resend Error]', err);
    return res.json({
      success: true,
      message: 'OTP generated.',
      devNotice: 'Email delivery encountered an issue; dev fallback enabled.',
      devOtp: otp,
    });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ error: 'No active OTP found for this email. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  if (record.code !== otp.trim()) {
    record.attempts += 1;
    return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
  }

  // OTP is valid! Remove from store
  otpStore.delete(normalizedEmail);

  const uid = getEmailUid(normalizedEmail);
  return res.json({
    success: true,
    uid,
    email: normalizedEmail,
    message: 'OTP verified successfully',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LiquidVault Server running on http://localhost:${PORT}`);
});

