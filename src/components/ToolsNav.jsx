import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'
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
    { key: 'cloudSync',   icon: prefs.cloudSync ? '☁️' : '📴', label: 'Cloud Sync',     desc: prefs.cloudSync ? 'Data saved to cloud' : 'Local only',    color: '#06b6d4' },
    { key: 'showPkTools', icon: '🇵🇰',                          label: 'Pakistan Tools', desc: prefs.showPkTools ? 'Visible' : 'Hidden',                  color: '#10b981' },
    { key: 'urduLabels',  icon: 'اردو',                          label: 'Urdu Labels',   desc: prefs.urduLabels ? 'Tool cards in Urdu' : 'English labels', color: '#f59e0b' },
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
        zIndex: 200,
      }}
    >
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
        Preferences
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

export default function ToolsNav({ rightExtras }) {
  const { isDark, toggleTheme, colors } = useTheme()
  const { pathname } = useLocation()
  const [showSettings, setShowSettings] = useState(false)

  const navStyle = {
    background: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }
  const innerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  }
  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: 800,
    fontSize: '1rem',
    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    padding: '0.75rem 0.5rem',
    whiteSpace: 'nowrap',
    marginRight: '0.5rem',
    flexShrink: 0,
  }
  const dividerStyle = {
    width: '1px',
    height: '20px',
    background: colors.border,
    flexShrink: 0,
    marginRight: '0.5rem',
  }

  return (
    <nav style={navStyle} aria-label="Typely tools navigation">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>

        {/* Brand — always visible left */}
        <Link to="/tools" style={brandStyle}>⚡ Typely</Link>
        <div style={dividerStyle} />

        {/* Scrollable tool links — takes all remaining space */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TOOLS.map((tool) => {
            const isActive = tool.isHome
              ? pathname === '/'
              : pathname === tool.path || pathname.startsWith(tool.path + '/')
            return (
              <Link
                key={tool.id}
                to={tool.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.75rem 0.6rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? tool.color : colors.textSecondary,
                  background: isActive ? `${tool.color}18` : 'transparent',
                  borderBottom: isActive ? `2px solid ${tool.color}` : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = colors.text
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = colors.textSecondary
                }}
              >
                <span>{tool.icon}</span>
                <span>{tool.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Right controls — always visible */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem', paddingLeft: '0.5rem' }}>
          {rightExtras && (
            <>
              {rightExtras}
              <div style={{ width: '1px', height: '20px', background: colors.border, margin: '0 0.25rem' }} />
            </>
          )}
          <Link
            to="/about"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 0.8rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: pathname === '/about' ? 700 : 500,
              color: pathname === '/about' ? '#06b6d4' : colors.textSecondary,
              whiteSpace: 'nowrap',
            }}
          >
            About
          </Link>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'border-color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* ⚙️ Settings gear */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowSettings(s => !s)}
              title="Preferences"
              style={{
                background: showSettings ? (isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                border: `1px solid ${showSettings ? '#06b6d4' : colors.border}`,
                color: showSettings ? '#06b6d4' : colors.text,
                width: '32px', height: '32px',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!showSettings) { e.currentTarget.style.borderColor = '#06b6d4' } }}
              onMouseLeave={(e) => { if (!showSettings) { e.currentTarget.style.borderColor = colors.border } }}
            >
              ⚙️
            </button>
            {showSettings && (
              <SettingsPopover colors={colors} isDark={isDark} onClose={() => setShowSettings(false)} />
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}
