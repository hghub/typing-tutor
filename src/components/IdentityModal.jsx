import { useState, useEffect } from 'react'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Azerbaijan',
  'Bangladesh','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria',
  'Cambodia','Canada','Chile','China','Colombia','Croatia','Czech Republic',
  'Denmark','Ecuador','Egypt','Ethiopia','Finland','France','Georgia','Germany',
  'Ghana','Greece','Guatemala','Hungary','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Lebanon','Libya','Malaysia','Mexico','Morocco','Myanmar','Nepal','Netherlands',
  'New Zealand','Nigeria','Norway','Pakistan','Palestine','Panama','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia',
  'Serbia','Singapore','Somalia','South Africa','South Korea','Spain','Sri Lanka',
  'Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
]

export default function IdentityModal({ show, onCreate, onResume, loading, error, detectedCountry, detectedCity, newCode, isDark, colors }) {
  const [mode, setMode] = useState('new')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (detectedCountry) setCountry(detectedCountry)
    if (detectedCity) setCity(detectedCity)
  }, [detectedCountry, detectedCity])

  if (!show) return null

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: colors.input,
    border: `1.5px solid ${colors.inputBorder}`,
    borderRadius: '0.625rem',
    color: colors.text,
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const btnStyle = (active) => ({
    flex: 1,
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    background: active ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : (isDark ? '#1e293b' : '#e2e8f0'),
    color: active ? 'white' : colors.textSecondary,
    transition: 'all 0.2s',
  })

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      animation: 'fadeIn 0.18s ease-out',
    }}>
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(248, 250, 252, 0.98)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '1.25rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        direction: 'ltr',
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: colors.text, textAlign: 'center' }}>
          ⌨️ Typing Tutor
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', color: colors.textSecondary, textAlign: 'center', fontSize: '0.9rem' }}>
          Join the leaderboard — it's free!
        </p>

        {/* Success state: show code */}
        {newCode ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.75rem' }}>✅ Profile created!</p>
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Your unique code — save it to resume on other devices:</p>
            <div style={{
              background: isDark ? '#0f172a' : '#f1f5f9',
              border: '2px solid #06b6d4',
              borderRadius: '0.75rem',
              padding: '0.875rem 1.25rem',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#06b6d4',
              letterSpacing: '0.05em',
              userSelect: 'all',
              marginBottom: '0.75rem',
            }}>
              {newCode}
            </div>
            <p style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>This modal closes automatically in a few seconds…</p>
          </div>
        ) : (<>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button style={btnStyle(mode === 'new')} onClick={() => setMode('new')}>New Player</button>
          <button style={btnStyle(mode === 'resume')} onClick={() => setMode('resume')}>I have a code</button>
        </div>

        {mode === 'new' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.4rem' }}>
                Your display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Haider"
                maxLength={20}
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.4rem' }}>
                Your country {detectedCountry && <span style={{ color: '#22c55e', fontWeight: 400 }}>✓ auto-detected</span>}
              </label>
              {detectedCountry ? (
                <div style={{ ...inputStyle, color: colors.textSecondary, cursor: 'default' }}>{detectedCountry}</div>
              ) : (
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.4rem' }}>
                Your city {detectedCity && <span style={{ color: '#22c55e', fontWeight: 400 }}>✓ auto-detected</span>}
              </label>
              {detectedCity ? (
                <div style={{ ...inputStyle, color: colors.textSecondary, cursor: 'default' }}>{detectedCity}</div>
              ) : (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Karachi"
                  maxLength={50}
                  style={inputStyle}
                />
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary }}>
              You'll get a unique code like <strong style={{ color: '#06b6d4' }}>Haider#4821</strong> — save it to resume on other devices.
            </p>
            <button
              disabled={!name.trim() || !country || loading}
              onClick={() => onCreate(name, country, city)}
              style={{
                padding: '0.75rem',
                background: name.trim() && country && !loading ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : (isDark ? '#334155' : '#e2e8f0'),
                color: name.trim() && country && !loading ? 'white' : colors.textSecondary,
                borderRadius: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: name.trim() && country && !loading ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
              }}
            >
              {loading ? 'Creating...' : 'Get Started →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.4rem' }}>
                Enter your code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && code.trim() && onResume(code)}
                placeholder="e.g. Haider#4821"
                style={inputStyle}
                autoFocus
              />
            </div>
            <button
              disabled={!code.trim() || loading}
              onClick={() => onResume(code)}
              style={{
                padding: '0.75rem',
                background: code.trim() && !loading ? 'linear-gradient(to right, #a855f7, #ec4899)' : (isDark ? '#334155' : '#e2e8f0'),
                color: code.trim() && !loading ? 'white' : colors.textSecondary,
                borderRadius: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: code.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
              }}
            >
              {loading ? 'Resuming...' : 'Resume →'}
            </button>
          </div>
        )}

        {error && (
          <p style={{ margin: '0.75rem 0 0 0', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
        )}
        </>)}
      </div>
    </div>
  )
}
