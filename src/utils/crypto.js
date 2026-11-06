// Web Crypto API Zero-Knowledge Client-Side AES-GCM-256 Encryption

// Convert buffer to Base64 string
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 string to Uint8Array buffer
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive a 256-bit AES-GCM CryptoKey from a Master Password and Salt using PBKDF2 (100,000 iterations)
export async function deriveKey(masterPassword, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: typeof salt === 'string' ? base64ToBuffer(salt) : salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate random salt (16 bytes)
export function generateSalt() {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt);
}

// Encrypt any object or string using AES-GCM 256
export async function encryptData(data, masterPassword, existingSalt = null) {
  const salt = existingSalt || generateSalt();
  const key = await deriveKey(masterPassword, salt);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintextString = typeof data === 'string' ? data : JSON.stringify(data);
  const encodedData = new TextEncoder().encode(plaintextString);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: salt,
    version: 1,
  };
}

// Decrypt ciphertext using AES-GCM 256
export async function decryptData(encryptedPayload, masterPassword) {
  if (!encryptedPayload || !encryptedPayload.ciphertext || !encryptedPayload.iv || !encryptedPayload.salt) {
    throw new Error('Invalid encrypted payload structure');
  }

  const { ciphertext, iv, salt } = encryptedPayload;
  const key = await deriveKey(masterPassword, salt);

  const ciphertextBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );

    const decodedString = new TextDecoder().decode(decryptedBuffer);
    try {
      return JSON.parse(decodedString);
    } catch {
      return decodedString;
    }
  } catch (err) {
    throw new Error('Decryption failed. Incorrect master password or corrupt data.');
  }
}

// Password Generator with custom options
export function generatePassword(options = {}) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
  } = options;

  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (excludeAmbiguous) {
    upperChars = upperChars.replace(/[IO]/g, '');
    lowerChars = lowerChars.replace(/[lo]/g, '');
    numberChars = numberChars.replace(/[01]/g, '');
    symbolChars = symbolChars.replace(/[|`~]/g, '');
  }

  let charset = '';
  const mandatory = [];

  if (uppercase) {
    charset += upperChars;
    mandatory.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
  }
  if (lowercase) {
    charset += lowerChars;
    mandatory.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }
  if (numbers) {
    charset += numberChars;
    mandatory.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (symbols) {
    charset += symbolChars;
    mandatory.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
  }

  if (charset === '') charset = lowerChars + numberChars;

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  const result = [...mandatory];
  for (let i = mandatory.length; i < length; i++) {
    result.push(charset[randomValues[i] % charset.length]);
  }

  // Shuffle array using Fisher-Yates
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

// Password strength evaluator
export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-400', crackTime: 'Instant' };

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 15;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  if (score < 40) {
    return { score, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400', crackTime: 'Minutes' };
  } else if (score < 60) {
    return { score, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400', crackTime: 'Days' };
  } else if (score < 80) {
    return { score, label: 'Good', color: 'bg-sky-400', text: 'text-sky-300', crackTime: 'Years' };
  } else {
    return { score: 100, label: 'Military Grade', color: 'bg-emerald-400', text: 'text-emerald-300', crackTime: 'Centuries' };
  }
}

