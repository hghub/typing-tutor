import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { encryptText, decryptText } from '../utils/cryptoUtils'
import { sanitizeText } from '../utils/sanitize'

const MAX_CHARS = 10000

export default function TextEncryptor() {
  const { isDark, colors } = useTheme()
  const [mode,     setMode]     = useState('encrypt')   // 'encrypt' | 'decrypt'
  const [input,    setInput]    = useState('')
  const [password, setPassword] = useState('')
  const [output,   setOutput]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')
  const [copied,   setCopied]   = useState(false)

  const handleRun = useCallback(async () => {
    setError('')
    setOutput('')
    if (!input.trim())    return setError('Please enter some text.')
    if (!password.trim()) return setError('Please enter a password.')

    setBusy(true)
    try {
      const result = mode === 'encrypt'
        ? await encryptText(input.trim(), password)
        : await decryptText(input.trim(), password)
      setOutput(result)
    } catch {
      setError(mode === 'decrypt'
        ? 'Decryption failed — wrong password or corrupted text.'
        : 'Encryption failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }, [mode, input, password])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [output])

  const inputStyle = {
    width: '100%',
    background: colors.card,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '0.9rem',
    color: colors.text,
    fontSize: '0.9rem',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  const modeColor = mode === 'encrypt' ? '#ef4444' : '#10b981'

  return (
    <ToolLayout toolId="text-encryptor">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: `linear-gradient(to right, #ef4444, #8b5cf6)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          🔒 Text Encryptor
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          AES-256 encryption powered by your browser.
          <span style={{ color: '#ef4444', fontWeight: 600 }}> Your text and password never leave your device.</span>
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'inline-flex',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '0.25rem',
        marginBottom: '1.5rem',
        gap: '0.25rem',
      }}>
        {['encrypt', 'decrypt'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setOutput(''); setError('') }}
            style={{
              background: mode === m ? modeColor : 'none',
              border: 'none',
              color: mode === m ? 'white' : colors.textSecondary,
              borderRadius: '0.5rem',
              padding: '0.45rem 1.1rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {m === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
          </button>
        ))}
      </div>

      {/* Input text */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
          {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Text to Decrypt'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(sanitizeText(e.target.value, MAX_CHARS))}
          placeholder={mode === 'encrypt'
            ? 'Type or paste the message you want to encrypt…'
            : 'Paste the encrypted text here…'}
          rows={6}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = modeColor }}
          onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password (share this separately)"
            style={{
              ...inputStyle,
              resize: 'none',
              fontFamily: 'inherit',
              paddingRight: '3rem',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = modeColor }}
            onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRun() }}
          />
          <button
            onClick={() => setShowPass((s) => !s)}
            tabIndex={-1}
            style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              color: colors.textSecondary, cursor: 'pointer', fontSize: '1rem',
            }}
          >
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={busy}
        style={{
          background: busy ? colors.border : `linear-gradient(to right, ${modeColor}, #8b5cf6)`,
          border: 'none',
          color: 'white',
          borderRadius: '0.75rem',
          padding: '0.75rem 2rem',
          cursor: busy ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          transition: 'opacity 0.15s ease',
          opacity: busy ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {busy
          ? '⚡ Processing…'
          : mode === 'encrypt'
            ? '🔒 Encrypt Text'
            : '🔓 Decrypt Text'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          color: '#ef4444',
          fontSize: '0.88rem',
          marginBottom: '1.25rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {mode === 'encrypt' ? 'Encrypted Result' : 'Decrypted Text'}
            </label>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(16,185,129,0.15)' : 'none',
                border: `1px solid ${copied ? '#10b981' : colors.border}`,
                color: copied ? '#10b981' : colors.textSecondary,
                borderRadius: '0.4rem',
                padding: '0.3rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={6}
            style={{ ...inputStyle, borderColor: '#10b981', fontFamily: mode === 'encrypt' ? 'monospace' : 'inherit' }}
          />
          {mode === 'encrypt' && (
            <p style={{ color: colors.textSecondary, fontSize: '0.78rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
              ⚠️ Save this encrypted text and share your password through a separate channel. Without the password, this text cannot be decrypted.
            </p>
          )}
        </div>
      )}

      {/* Security info */}
      <div style={{
        marginTop: '2rem',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
      }}>
        <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.6rem' }}>🛡️ Security Notes</h2>
        <ul style={{ color: colors.textSecondary, fontSize: '0.82rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
          <li>Uses <strong style={{ color: colors.text }}>AES-256-GCM</strong> via the browser's Web Crypto API</li>
          <li>Password is hashed with <strong style={{ color: colors.text }}>PBKDF2 (100,000 iterations)</strong> before use</li>
          <li>Nothing is stored — this page has <strong style={{ color: colors.text }}>no localStorage, no server</strong></li>
          <li>Refreshing the page clears everything permanently</li>
          <li>Share the encrypted text publicly, but <strong style={{ color: colors.text }}>send your password through a different channel</strong></li>
        </ul>
      </div>
    </ToolLayout>
  )
}
