import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
const ACCENT = '#10b981'

const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
}

function buildCharset(opts) {
  let s = ''
  if (opts.upper)   s += CHARS.upper
  if (opts.lower)   s += CHARS.lower
  if (opts.digits)  s += CHARS.digits
  if (opts.symbols) s += CHARS.symbols
  return s
}

function generatePassword(length, opts) {
  const charset = buildCharset(opts)
  if (!charset) return ''
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(v => charset[v % charset.length]).join('')
}

function calcEntropy(length, opts) {
  const poolSize = buildCharset(opts).length
  if (!poolSize) return 0
  return Math.floor(length * Math.log2(poolSize))
}

function entropyToStrength(bits) {
  if (bits < 28) return { label: 'Very Weak', color: '#ef4444', pct: 10 }
  if (bits < 40) return { label: 'Weak',      color: '#f97316', pct: 28 }
  if (bits < 60) return { label: 'Fair',      color: '#f59e0b', pct: 52 }
  if (bits < 80) return { label: 'Strong',    color: '#06b6d4', pct: 75 }
  return             { label: 'Very Strong', color: ACCENT,    pct: 100 }
}

function calcCrackTime(bits) {
  // Assume 1 billion guesses per second (modern GPU)
  const totalCombinations = Math.pow(2, bits)
  const seconds = totalCombinations / 1e9 / 2 // average half

  if (seconds < 1)       return 'Instantly'
  if (seconds < 60)      return `${Math.round(seconds)} seconds`
  if (seconds < 3600)    return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400)   return `${Math.round(seconds / 3600)} hours`
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 31536000)return `${Math.round(seconds / 2592000)} months`
  if (seconds < 3.15e10) return `${Math.round(seconds / 31536000)} years`
  if (seconds < 3.15e13) return `${(seconds / 31536000 / 1000).toFixed(1)}K years`
  return 'Millions of years'
}

function analyzePassword(pwd) {
  if (!pwd) return null
  let pool = 0
  if (/[a-z]/.test(pwd)) pool += 26
  if (/[A-Z]/.test(pwd)) pool += 26
  if (/[0-9]/.test(pwd)) pool += 10
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32
  const bits = pool ? Math.floor(pwd.length * Math.log2(pool)) : 0
  return { bits, strength: entropyToStrength(bits), crack: calcCrackTime(bits) }
}

export default function PasswordGenerator() {
  const { isDark, colors } = useTheme()
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true })
  const [password, setPassword] = useState(() => generatePassword(16, { upper: true, lower: true, digits: true, symbols: true }))
  const [copied, setCopied] = useState(false)
  const [testPwd, setTestPwd] = useState('')
  const [showTest, setShowTest] = useState(false)

  const entropy = calcEntropy(length, opts)
  const strength = entropyToStrength(entropy)
  const crackTime = calcCrackTime(entropy)

  const testAnalysis = analyzePassword(testPwd)

  function regenerate() {
    setPassword(generatePassword(length, opts))
    setCopied(false)
  }

  function handleOpt(key) {
    const next = { ...opts, [key]: !opts[key] }
    const anyOn = Object.values(next).some(Boolean)
    if (!anyOn) return
    setOpts(next)
    setPassword(generatePassword(length, next))
  }

  function handleLength(v) {
    setLength(v)
    setPassword(generatePassword(v, opts))
  }

  function copyPwd(pwd) {
    navigator.clipboard.writeText(pwd).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const toggle = (active) => ({
    padding: '0.4rem 0.9rem',
    borderRadius: '0.4rem',
    border: `1px solid ${active ? ACCENT : colors.border}`,
    background: active ? `${ACCENT}20` : 'transparent',
    color: active ? ACCENT : colors.textSecondary,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: FONT,
    transition: 'all 0.15s',
  })

  return (
    <ToolLayout toolId="password-generator">
      <div style={{ fontFamily: FONT, maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT, margin: '0 0 0.25rem' }}>🔐 Password Generator</h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Generate strong passwords + check yours</p>

        {/* Generated password display */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            flex: 1,
            fontFamily: 'monospace',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: colors.text,
            wordBreak: 'break-all',
            letterSpacing: '0.05em',
          }}>{password || '—'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
            <button onClick={() => copyPwd(password)} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '0.4rem',
              border: 'none',
              background: copied ? '#10b981' : ACCENT,
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FONT,
              whiteSpace: 'nowrap',
            }}>{copied ? '✅ Copied' : '📋 Copy'}</button>
            <button onClick={regenerate} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '0.4rem',
              border: `1px solid ${colors.border}`,
              background: 'transparent',
              color: colors.textSecondary,
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: FONT,
            }}>🔄 New</button>
          </div>
        </div>

        {/* Strength bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
            <span style={{ color: colors.textSecondary }}>{entropy} bits • Crack time: <strong style={{ color: colors.text }}>{crackTime}</strong></span>
          </div>
          <div style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 4 }}>
            <div style={{
              height: '100%',
              width: `${strength.pct}%`,
              background: strength.color,
              borderRadius: 4,
              transition: 'width 0.3s, background 0.3s',
            }} />
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1.1rem 1.25rem',
          marginBottom: '1rem',
        }}>
          {/* Length */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Length</span>
              <span style={{ fontWeight: 800, color: ACCENT }}>{length}</span>
            </div>
            <input type="range" min={6} max={64} value={length}
              onChange={e => handleLength(Number(e.target.value))}
              style={{ width: '100%', accentColor: ACCENT }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: colors.textSecondary }}>
              <span>6</span><span>64</span>
            </div>
          </div>

          {/* Character types */}
          <div style={{ fontSize: '0.82rem', color: colors.textSecondary, fontWeight: 600, marginBottom: '0.5rem' }}>Include</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { key: 'upper',   label: 'A–Z Uppercase' },
              { key: 'lower',   label: 'a–z Lowercase' },
              { key: 'digits',  label: '0–9 Numbers' },
              { key: 'symbols', label: '!@# Symbols' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => handleOpt(key)} style={toggle(opts[key])}>{label}</button>
            ))}
          </div>
        </div>

        {/* Test your own */}
        <div style={{
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setShowTest(v => !v)}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: 'none',
              color: colors.text,
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            🔍 Test your own password strength
            <span style={{ color: colors.textSecondary }}>{showTest ? '▲' : '▼'}</span>
          </button>

          {showTest && (
            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: '0.78rem', color: colors.textSecondary, margin: '0 0 0.75rem' }}>
                Typed locally — never sent anywhere.
              </p>
              <input
                type="password"
                value={testPwd}
                onChange={e => setTestPwd(e.target.value)}
                placeholder="Type your password here…"
                style={{
                  width: '100%',
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  color: colors.text,
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '0.75rem',
                }}
              />
              {testAnalysis && testPwd && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: testAnalysis.strength.color, fontWeight: 700 }}>{testAnalysis.strength.label}</span>
                    <span style={{ color: colors.textSecondary }}>{testAnalysis.bits} bits • {testAnalysis.crack}</span>
                  </div>
                  <div style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 4 }}>
                    <div style={{
                      height: '100%',
                      width: `${testAnalysis.strength.pct}%`,
                      background: testAnalysis.strength.color,
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
