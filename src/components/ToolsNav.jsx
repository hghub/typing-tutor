import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import './ToolsNav.css'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)
  const currentTool = TOOLS.find(tool => pathname === tool.path)
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false); setShowSettings(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])
  const links = [
    { path: '/tools', label: 'All tools' },
    { path: '/category/business-tools', label: 'Business' },
    { path: '/blog', label: 'Guides' },
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help' },
    { path: '/privacy', label: 'Privacy' },
  ]
  return <nav className="rafiqy-nav" aria-label="Rafiqy navigation" style={{ '--nav-bg': isDark ? '#0f172af5' : '#fffffff5', '--nav-text': colors.text, '--nav-muted': colors.textSecondary, '--nav-border': colors.border }}>
    <div className="rafiqy-nav-inner">
      <Link className="rafiqy-brand" to="/" onClick={() => setMenuOpen(false)}>Rafiqy<span className="rafiqy-brand-dot" aria-hidden="true">.</span></Link>
      <button className="rafiqy-menu-button" ref={menuButton} aria-expanded={menuOpen} aria-controls="rafiqy-primary-links" onClick={() => { setMenuOpen(!menuOpen); setShowSettings(false) }}>{menuOpen ? 'Close menu' : 'Menu'}</button>
      <div id="rafiqy-primary-links" className={`rafiqy-nav-links ${menuOpen ? 'is-open' : ''}`}>
        {links.map(link => <Link key={link.path} to={link.path} aria-current={pathname === link.path || (link.path === '/blog' && pathname.startsWith('/blog/')) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
      </div>
      <div className="rafiqy-nav-controls">
        {rightExtras}
        <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>{isDark ? '☀' : '☾'}</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowSettings(!showSettings); setMenuOpen(false) }} aria-label="Preferences" aria-expanded={showSettings} title="Preferences">⚙</button>
          {showSettings && <SettingsPopover colors={colors} isDark={isDark} onClose={() => setShowSettings(false)} />}
        </div>
      </div>
    </div>
    {currentTool && <div className="rafiqy-breadcrumb"><Link to="/tools">All tools</Link><span aria-hidden="true">/</span><span>{currentTool.name}</span></div>}
  </nav>
}
