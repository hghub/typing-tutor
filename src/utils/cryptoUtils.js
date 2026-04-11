/**
 * AES-256-GCM encryption using Web Crypto API.
 * - No external dependencies
 * - All operations are async/await
 * - Data never leaves the browser
 */

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES  = 16
const IV_BYTES    = 12

function buf2hex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hex2buf(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes.buffer
}

async function deriveKey(password, saltBuf) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuf, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt plaintext with a password.
 * Returns a hex string: salt(32) + iv(24) + ciphertext(variable)
 */
export async function encryptText(plaintext, password) {
  const enc  = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv   = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key  = await deriveKey(password, salt.buffer)
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  )
  return buf2hex(salt.buffer) + buf2hex(iv.buffer) + buf2hex(cipherBuf)
}

/**
 * Decrypt a hex-encoded ciphertext with a password.
 * Returns the original plaintext string, or throws on wrong password / tampered data.
 */
export async function decryptText(hexCipher, password) {
  if (hexCipher.length < (SALT_BYTES + IV_BYTES) * 2) {
    throw new Error('Invalid encrypted text')
  }
  const saltHex   = hexCipher.slice(0, SALT_BYTES * 2)
  const ivHex     = hexCipher.slice(SALT_BYTES * 2, (SALT_BYTES + IV_BYTES) * 2)
  const cipherHex = hexCipher.slice((SALT_BYTES + IV_BYTES) * 2)

  const key     = await deriveKey(password, hex2buf(saltHex))
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(hex2buf(ivHex)) },
    key,
    hex2buf(cipherHex),
  )
  return new TextDecoder().decode(plainBuf)
}
