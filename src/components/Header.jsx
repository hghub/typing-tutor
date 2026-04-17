import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LANGUAGES } from '../constants/languages'
import { usePreferences } from '../hooks/usePreferences'

function SettingsPopover({ colors, isDark, onClose }) {
  const { prefs, togglePref } = usePreferences()
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const rows = [
    { key: 'cloudSync',    icon: prefs.cloudSync ? '☁️' : '📴', label: 'Cloud Sync',       desc: prefs.cloudSync ? 'Data saved to cloud' : 'Local only',       color: '#06b6d4' },
    { key: 'showPkTools',  icon: '🇵🇰',                          label: 'Pakistan Tools',   desc: prefs.showPkTools ? 'Visible' : 'Hidden',                     color: '#10b981' },
    { key: 'urduLabels',   icon: 'اردو',                          label: 'Urdu Labels',      desc: prefs.urduLabels ? 'Tool cards in Urdu' : 'English labels',    color: '#f59e0b' },
  ]

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
        background: isDark ? '#1e293b' : '#fff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: '0.75rem',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
        padding: '0.75rem',
        minWidth: '230px',
        zIndex: 1000,
      }}
    >
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
        ⚙️ Preferences
      </div>
      {rows.map(({ key, icon, label, desc, color }) => (
        <div
          key={key}
          onClick={() => togglePref(key)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.55rem 0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
            transition: 'background 0.15s ease',
            background: prefs[key] ? `${color}12` : 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = prefs[key] ? `${color}20` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') }}
          onMouseLeave={(e) => { e.currentTarget.style.background = prefs[key] ? `${color}12` : 'transparent' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.83rem', fontWeight: 600, color: colors.text, lineHeight: 1.2 }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: '0.1rem' }}>{desc}</div>
            </div>
          </div>
          {/* Toggle pill */}
          <div style={{
            width: '36px', height: '20px', borderRadius: '10px',
            background: prefs[key] ? color : (isDark ? '#334155' : '#cbd5e1'),
            position: 'relative', flexShrink: 0, transition: 'background 0.2s ease',
          }}>
            <div style={{
              position: 'absolute', top: '2px',
              left: prefs[key] ? '18px' : '2px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Header({ language, onLanguageChange, isDark, onToggleTheme, colors, isMobile }) {
  const [showSettings, setShowSettings] = useState(false)
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.2rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Rafiqy ⚡
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.82rem', fontWeight: 400, margin: '0.25rem 0 0 0' }}>
          Your Smart Typing System
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Tools hub link */}
        <Link
          to="/tools"
          style={{
            background: colors.difficulty,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: '#06b6d4',
            padding: '0.5rem 0.85rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0' }}
        >
          🛠 Tools
        </Link>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            background: colors.difficulty,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'border-color 0.2s ease',
          }}
        >
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <option key={key} value={key}>{lang.flag} {lang.name}</option>
          ))}
        </select>

        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: colors.difficulty,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s ease',
            boxShadow: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0' }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Settings gear */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(s => !s)}
            title="Preferences"
            style={{
              background: showSettings ? (isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)') : colors.difficulty,
              border: `1px solid ${showSettings ? '#06b6d4' : (isDark ? '#334155' : '#e2e8f0')}`,
              color: showSettings ? '#06b6d4' : colors.text,
              width: '36px', height: '36px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', boxShadow: 'none',
            }}
            onMouseEnter={(e) => { if (!showSettings) e.currentTarget.style.borderColor = '#06b6d4' }}
            onMouseLeave={(e) => { if (!showSettings) e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0' }}
          >
            ⚙️
          </button>
          {showSettings && (
            <SettingsPopover colors={colors} isDark={isDark} onClose={() => setShowSettings(false)} />
          )}
        </div>
      </div>
    </div>
  )
}
