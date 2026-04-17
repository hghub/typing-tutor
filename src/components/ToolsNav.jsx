import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'

const DATA_KEYS = [
  'typely_diary','typely_driving_fines','typely_expense_history',
  'typely_freelancer_assessments','typely_goal','typely_gold_rates',
  'typely_habits','typely_leak_log','typely_loans','typely_measurements',
  'typely_palettes','typely_planner','typely_pomodoro_sessions',
  'typely_symptoms','typely_warranties','typely_worldtime_pins',
]

function SettingsPopover({ colors, isDark, onClose }) {
  const { prefs, togglePref } = usePreferences()
  const ref = useRef(null)
  const importRef = useRef(null)

  const handleExportAll = () => {
    const backup = { version: 1, exported: new Date().toISOString(), data: {} }
    DATA_KEYS.forEach(key => {
      const val = localStorage.getItem(key)
      if (val) backup.data[key] = JSON.parse(val)
    })
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `typely-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  const handleImportAll = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const data = parsed.data || parsed
        Object.entries(data).forEach(([key, val]) => {
          if (DATA_KEYS.includes(key)) localStorage.setItem(key, JSON.stringify(val))
        })
        alert('✅ Backup restored! Reload the page to see your data.')
      } catch { alert('❌ Invalid backup file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

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
    <div ref={ref} style={{
      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
      background: isDark ? '#1e293b' : '#fff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: '0.75rem',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
      padding: '0.75rem', minWidth: '230px', zIndex: 200,
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
        Preferences
      </div>
      {rows.map(({ key, icon, label, desc, color }) => (
        <div key={key} onClick={() => togglePref(key)} style={{
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
              position: 'absolute', top: '2px', left: prefs[key] ? '18px' : '2px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
      ))}

      {/* ── Data Backup ── */}
      <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, marginTop: '0.5rem', paddingTop: '0.6rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
          Data Backup
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleExportAll} style={{
            flex: 1, padding: '0.45rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text,
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
          }}>⬇️ Export All</button>
          <button onClick={() => importRef.current?.click()} style={{
            flex: 1, padding: '0.45rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text,
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
          }}>⬆️ Import</button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImportAll} style={{ display: 'none' }} />
        </div>
        <div style={{ fontSize: '0.68rem', color: colors.textSecondary, marginTop: '0.4rem', padding: '0 0.25rem', lineHeight: 1.4 }}>
          Move all your data to another device
        </div>
      </div>
    </div>
  )
}

export default function ToolsNav({ rightExtras }) {
  const { isDark, toggleTheme, colors } = useTheme()
  const { pathname } = useLocation()
  const [showSettings, setShowSettings] = useState(false)

  // Find the active tool based on current path (for breadcrumb)
  const currentTool = TOOLS.find(t =>
    pathname !== '/tools' && (pathname === t.path || pathname.startsWith(t.path + '/'))
  )

  const btnStyle = (active = false) => ({
    background: active ? (isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
    border: `1px solid ${active ? '#06b6d4' : colors.border}`,
    color: active ? '#06b6d4' : colors.text,
    width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.2s ease',
  })

  return (
    <nav
      aria-label="Typely navigation"
      style={{
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}
    >
      <div style={{
        maxWidth: '1140px', margin: '0 auto', padding: '0 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem', height: '52px',
      }}>

        {/* ── Brand ── */}
        <Link to="/tools" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', flexShrink: 0,
        }}>
          ⚡ Typely
        </Link>

        {/* ── Breadcrumb (on individual tool pages) ── */}
        {currentTool && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.25rem' }}>
            <span style={{ color: colors.border, fontSize: '1.1rem', lineHeight: 1 }}>/</span>
            <Link to="/tools" style={{
              fontSize: '0.8rem', color: colors.textSecondary, textDecoration: 'none',
              padding: '0.3rem 0.5rem', borderRadius: '0.4rem', transition: 'color 0.15s',
              fontWeight: 500,
            }}
              onMouseEnter={e => e.currentTarget.style.color = colors.text}
              onMouseLeave={e => e.currentTarget.style.color = colors.textSecondary}
            >All Tools</Link>
            <span style={{ color: colors.border, fontSize: '1.1rem', lineHeight: 1 }}>/</span>
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: colors.text,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <span>{currentTool.icon}</span>
              <span>{currentTool.name}</span>
            </span>
          </div>
        )}

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Right Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {rightExtras && (
            <>
              {rightExtras}
              <div style={{ width: '1px', height: '20px', background: colors.border, margin: '0 0.1rem' }} />
            </>
          )}

          <Link to="/help" style={{
            fontSize: '0.82rem', fontWeight: pathname === '/help' ? 700 : 500,
            color: pathname === '/help' ? '#06b6d4' : colors.textSecondary,
            textDecoration: 'none', padding: '0.4rem 0.65rem', borderRadius: '0.4rem',
            transition: 'color 0.15s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (pathname !== '/help') e.currentTarget.style.color = colors.text }}
            onMouseLeave={e => { if (pathname !== '/help') e.currentTarget.style.color = colors.textSecondary }}
          >Help</Link>

          <Link to="/about" style={{
            fontSize: '0.82rem', fontWeight: pathname === '/about' ? 700 : 500,
            color: pathname === '/about' ? '#06b6d4' : colors.textSecondary,
            textDecoration: 'none', padding: '0.4rem 0.65rem', borderRadius: '0.4rem',
            transition: 'color 0.15s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (pathname !== '/about') e.currentTarget.style.color = colors.text }}
            onMouseLeave={e => { if (pathname !== '/about') e.currentTarget.style.color = colors.textSecondary }}
          >About</Link>

          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={btnStyle()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border }}
          >{isDark ? '☀️' : '🌙'}</button>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowSettings(s => !s)}
              title="Preferences"
              style={btnStyle(showSettings)}
              onMouseEnter={e => { if (!showSettings) e.currentTarget.style.borderColor = '#06b6d4' }}
              onMouseLeave={e => { if (!showSettings) e.currentTarget.style.borderColor = colors.border }}
            >⚙️</button>
            {showSettings && (
              <SettingsPopover colors={colors} isDark={isDark} onClose={() => setShowSettings(false)} />
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}
