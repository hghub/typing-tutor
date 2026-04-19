import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { TOOLS, TOOL_CATEGORIES } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import SmartSearch from '../components/SmartSearch'
import FeedbackButton from '../components/FeedbackButton'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'

const FEATURED_IDS = ['typing-tutor', 'word-counter', 'pomodoro', 'tax-calculator', 'urdu-keyboard']
const LAST_VISIT_KEY = 'typely_last_visit'
const RECENT_KEY = 'typely_recent_tools'
const FAVOURITES_KEY = 'typely_favourites'
const TOP_N = 6

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function addRecent(id) {
  try {
    const prev = getRecent().filter(x => x !== id)
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, 5)))
  } catch {}
}
function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]') } catch { return [] }
}
function toggleFavourite(id) {
  const favs = getFavourites()
  const next = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next))
  return next
}

// Category display order (matches user spec 1–14)
const CATEGORY_ORDER = [
  'typing',       // 1
  'productivity', // 2
  'writing',      // 3
  'language',     // 4
  'pakistan',     // 5
  'travel',       // 6
  'security',     // 7
  'pdf',          // 8
  'finance',      // 9
  'health',       // 10
  'developer',    // 11
  'education',    // 12
  'business',     // 13
  'legal',        // 14
]

// Tool display order within each category
const CATEGORY_TOOL_ORDER = {
  typing:      ['typing-tutor'],
  productivity:['pomodoro','world-time','daily-planner','habit-tracker','voice-diary','kameti','measurement-tracker','resume-builder','whatsapp-tools'],
  writing:     ['word-counter','text-cleaner','doc-composer','image-suite'],
  language:    ['urdu-keyboard','color-palette'],
  pakistan:    ['tax-calculator','pk-id-tax-hub','tax-optimizer','kameti','driving-fines','gold-price','salary-slip'],
  travel:      ['packing-list','budget-splitter'],
  security:    ['text-encryptor','data-leak-detector','doc-redaction'],
  pdf:         ['compress-pdf','merge-pdf','split-pdf','pdf-convert','doc-converter','text-extractor','pdf-search'],
  finance:     ['loan-manager','gold-price','currency-converter','expense-analyzer','freelancer-risk','voice-invoice','loan-emi','position-size-calc'],
  health:      ['drug-checker','symptom-tracker','measurement-tracker'],
  developer:   ['json-formatter','data-transformer','markdown-scraper','log-analyzer','mock-data','schema-mapper','regex-tester','config-converter','trace-correlator'],
  education:   ['student-groups'],
  business:    ['warranty-tracker','property-comp','refrigerant-calc'],
  legal:       ['timeline-builder'],
}

// ── "New" badge logic ─────────────────────────────────────────────────────────
function getLastVisit() {
  try { return new Date(localStorage.getItem(LAST_VISIT_KEY) || '2000-01-01') }
  catch { return new Date('2000-01-01') }
}

function updateLastVisit() {
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
}

function isNewTool(tool, lastVisit) {
  if (!tool.addedOn) return false
  return new Date(tool.addedOn) > lastVisit
}

// ── Toggle Pill ───────────────────────────────────────────────────────────────
function TogglePill({ active, onClick, children, activeColor = '#06b6d4', isDark }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.35rem 0.9rem', borderRadius: '2rem',
      border: `1px solid ${active ? activeColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')}`,
      background: active ? `${activeColor}20` : 'transparent',
      color: active ? activeColor : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease',
      letterSpacing: '0.02em',
    }}>{children}</button>
  )
}

// ── Marquee Ticker ────────────────────────────────────────────────────────────
function MarqueeTicker({ tools, isDark, colors }) {
  const highlight = tools.filter(t => t.addedOn || ['expense-analyzer','data-leak-detector','warranty-tracker','driving-fines','measurement-tracker','text-encryptor'].includes(t.id))
  const items = [
    ...highlight.filter(t => t.addedOn).map(t => ({ label: `🆕 New · ${t.icon} ${t.name}`, color: '#10b981', path: t.path })),
    { label: '⭐ Featured · 💸 Expense Analyzer', color: '#f59e0b', path: '/tools/expense-analyzer' },
    { label: '🔒 Privacy-first · Zero uploads', color: '#06b6d4', path: '/tools' },
    { label: '⭐ Featured · 🔍 Data Leak Detector', color: '#ef4444', path: '/tools/data-leak-detector' },
    { label: '📏 Track anything · Measurement Tracker', color: '#8b5cf6', path: '/tools/measurement-tracker' },
    { label: '🔒 Encrypt your messages privately', color: '#06b6d4', path: '/tools/text-encryptor' },
    { label: '🚗 Track driving fines & violations', color: '#f97316', path: '/tools/driving-fines' },
    { label: '📊 63 free tools · No signup needed', color: '#3b82f6', path: '/tools' },
  ]
  const doubled = [...items, ...items]

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      padding: '0.55rem 0',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: isDark ? 'linear-gradient(to right, #0f172a, transparent)' : 'linear-gradient(to right, #f8fafc, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: isDark ? 'linear-gradient(to left, #0f172a, transparent)' : 'linear-gradient(to left, #f8fafc, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div style={{
        display: 'flex', gap: 0, width: 'max-content',
        animation: 'typely-ticker 40s linear infinite',
      }}>
        {doubled.map((item, i) => (
          <Link key={i} to={item.path} style={{
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0 2rem', whiteSpace: 'nowrap',
            fontSize: '0.78rem', fontWeight: 600, color: item.color,
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes typely-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="typely-ticker"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

// ── Tool Card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool, colors, isDark, featured = false, urduLabels = false, isNew = false, isFav = false, onFavToggle, onVisit }) {
  const [hovered, setHovered] = useState(false)
  const [favHovered, setFavHovered] = useState(false)
  const displayName    = (urduLabels && tool.nameUrdu)    ? tool.nameUrdu    : tool.name
  const displayTagline = (urduLabels && tool.taglineUrdu) ? tool.taglineUrdu : tool.tagline

  return (
    <Link to={tool.path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onClick={() => onVisit && onVisit(tool.id)}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? isDark ? `linear-gradient(145deg, #1e293b, ${tool.color}12)` : `linear-gradient(145deg, #fff, ${tool.color}0a)`
            : colors.card,
          border: `1px solid ${hovered ? tool.color : colors.border}`,
          borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? `0 12px 32px ${tool.color}28` : isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
          height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Color accent bar */}
        <div style={{ height: '3px', background: `linear-gradient(to right, ${tool.color}, ${tool.color}66)` }} />

        {/* NEW badge */}
        {isNew && (
          <div style={{
            position: 'absolute', top: '0.65rem', right: '0.65rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: '0.6rem', fontWeight: 800,
            padding: '0.15rem 0.45rem', borderRadius: '2rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
            animation: 'typely-pulse 2s ease-in-out infinite',
          }}>NEW</div>
        )}

        {/* Favourite button */}
        {onFavToggle && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onFavToggle(tool.id) }}
            onMouseEnter={() => setFavHovered(true)}
            onMouseLeave={() => setFavHovered(false)}
            title={isFav ? 'Remove from favourites' : 'Add to favourites'}
            style={{
              position: 'absolute', top: '0.6rem', right: isNew ? '3rem' : '0.6rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1rem', padding: '0.25rem',
              opacity: isFav || favHovered ? 1 : 0.35,
              transition: 'opacity 0.15s, transform 0.15s',
              transform: favHovered ? 'scale(1.2)' : 'scale(1)',
              lineHeight: 1,
            }}
          >{isFav ? '❤️' : '🤍'}</button>
        )}

        <div style={{ padding: featured ? '1.5rem' : '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: featured ? '2.2rem' : '1.8rem' }}>{tool.icon}</span>
            {featured && !isNew && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, color: tool.color,
                background: `${tool.color}18`, border: `1px solid ${tool.color}33`,
                borderRadius: '1rem', padding: '0.2rem 0.55rem', letterSpacing: '0.05em',
              }}>⭐ FEATURED</span>
            )}
          </div>
          <h3 style={{
            fontSize: featured ? '1.1rem' : '1rem', fontWeight: 700, color: colors.text,
            margin: '0 0 0.4rem', lineHeight: 1.3,
            direction: (urduLabels && tool.nameUrdu) ? 'rtl' : 'ltr',
          }}>{displayName}</h3>
          <p style={{
            fontSize: '0.83rem', color: tool.color, fontWeight: 600,
            margin: '0 0 0.5rem', lineHeight: 1.4,
            direction: (urduLabels && tool.taglineUrdu) ? 'rtl' : 'ltr',
          }}>{displayTagline}</p>
          {featured && (
            <p style={{ fontSize: '0.8rem', color: colors.textSecondary, margin: 0, lineHeight: 1.55, flex: 1 }}>
              {tool.description}
            </p>
          )}
          <div style={{
            marginTop: 'auto', paddingTop: featured ? '1rem' : '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            color: tool.color, fontSize: '0.8rem', fontWeight: 600,
            opacity: hovered ? 1 : 0.6, transition: 'opacity 0.2s ease',
          }}>
            Open tool <span style={{ transition: 'transform 0.2s ease', transform: hovered ? 'translateX(4px)' : 'translateX(0)', display: 'inline-block' }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ToolsHome() {
  const { isDark, colors } = useTheme()
  const { prefs, togglePref } = usePreferences()
  const [lastVisit] = useState(() => getLastVisit())
  const [expanded, setExpanded] = useState({})
  const [favourites, setFavourites] = useState(() => getFavourites())
  const [recentIds, setRecentIds] = useState(() => getRecent())

  const handleFavToggle = (id) => setFavourites(toggleFavourite(id))
  const handleVisit = (id) => {
    addRecent(id)
    setRecentIds(getRecent())
  }

  const toggleExpanded = (catId) => setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }))

  // Update last visit on load (after a short delay so "new" badges show on first load too)
  useEffect(() => {
    const t = setTimeout(updateLastVisit, 5000)
    return () => clearTimeout(t)
  }, [])

  const visibleTools = TOOLS.filter(t => {
    if (!prefs.showPkTools && t.region === 'pk') return false
    return true
  })

  const featuredTools = FEATURED_IDS
    .map(id => visibleTools.find(t => t.id === id))
    .filter(Boolean)

  const recentTools = recentIds
    .map(id => visibleTools.find(t => t.id === id))
    .filter(Boolean)

  const favouriteTools = favourites
    .map(id => visibleTools.find(t => t.id === id))
    .filter(Boolean)

  const totalTools = visibleTools.length
  const totalCategories = TOOL_CATEGORIES.length

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes typely-pulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(16,185,129,0.4); }
          50%       { box-shadow: 0 2px 16px rgba(16,185,129,0.7); }
        }
        @keyframes typely-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <ToolsNav />

      <Helmet>
        <title>Free Online Tools – Productivity, Finance, PDF & More | Rafiqy</title>
        <meta name="description" content="63 free browser-based tools for everyday digital tasks — typing, PDFs, finance calculators, productivity timers, developer utilities and more. No sign-up, 100% private." />
        <link rel="canonical" href="https://rafiqy.app/tools" />
      </Helmet>

      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '3rem 1.25rem 2rem' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', pointerEvents: 'none', background: isDark ? 'radial-gradient(ellipse at center, #06b6d414 0%, transparent 70%)' : 'radial-gradient(ellipse at center, #06b6d40a 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #06b6d422, #3b82f622)', border: '1px solid #06b6d444', borderRadius: '2rem', padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
            🔒 Privacy-first · Browser-native
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 0.8rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            All Your Daily Tools in One Place
          </h1>

          <p style={{ color: colors.textSecondary, fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Rafiqy tools help you get everyday tasks done faster — from typing and productivity to finance, writing, and file management.
          </p>

          {/* ── Smart Search — primary CTA ── */}
          <div style={{ marginBottom: '2rem' }}>
            <SmartSearch isDark={isDark} colors={colors} />
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.76rem', color: colors.textSecondary, opacity: 0.7 }}>
              Search in English or Roman Urdu · e.g. "typing speed" or "tez typing"
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {[
              { value: `${totalTools}+`, label: 'Free Tools' },
              { value: `${totalCategories}`, label: 'Categories' },
              { value: 'Zero', label: 'Signups Needed' },
              { value: '100%', label: 'Browser-based' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: '0.2rem', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {[
              { icon: '🔒', label: 'No Uploads', desc: 'runs in browser' },
              { icon: '⚡', label: 'Runs Locally', desc: 'works offline' },
              { icon: '🧠', label: 'Fast & Free', desc: 'no hidden fees' },
              { icon: '🚫', label: 'No Login', desc: 'ever' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.78rem',
              }}>
                <span>{icon}</span>
                <span style={{ fontWeight: 700, color: colors.text }}>{label}</span>
                <span style={{ color: colors.textSecondary }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* Who it's for */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {[
              { label: '🎓 Students', color: '#8b5cf6' },
              { label: '💻 Developers', color: '#06b6d4' },
              { label: '🏫 Teachers', color: '#ec4899' },
              { label: '💼 Freelancers', color: '#f97316' },
              { label: '📊 Finance Pros', color: '#10b981' },
              { label: '🏥 Healthcare', color: '#ef4444' },
              { label: '✈️ Travellers', color: '#3b82f6' },
              { label: '🏢 Business', color: '#f59e0b' },
              { label: '🔐 Privacy Advocates', color: '#64748b' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                background: `${color}18`, border: `1px solid ${color}44`, color,
                borderRadius: '2rem', padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
              }}>{label}</span>
            ))}
          </div>

          {/* Filter toggles */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <TogglePill active={prefs.showPkTools} onClick={() => togglePref('showPkTools')} activeColor='#10b981' isDark={isDark}>��🇰 Pakistan Tools</TogglePill>
            <TogglePill active={prefs.urduLabels} onClick={() => togglePref('urduLabels')} activeColor='#f59e0b' isDark={isDark}>اردو</TogglePill>
          </div>
        </div>

        {/* ── Marquee Ticker ── */}
        <div style={{ margin: '0 -1.25rem 3rem' }}>
          <MarqueeTicker tools={visibleTools} isDark={isDark} colors={colors} />
        </div>

        {/* ── My Favourites ── */}
        {favouriteTools.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.01em' }}>❤️ My Favourites</h2>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ef4444', background: '#ef444418', border: '1px solid #ef444433', borderRadius: '1rem', padding: '0.15rem 0.55rem' }}>{favouriteTools.length} saved</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {favouriteTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} colors={colors} isDark={isDark}
                  urduLabels={prefs.urduLabels} isNew={isNewTool(tool, lastVisit)}
                  isFav={true} onFavToggle={handleFavToggle} onVisit={handleVisit} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently Used ── */}
        {recentTools.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.01em' }}>🕐 Recently Used</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {recentTools.map(tool => (
                <Link key={tool.id} to={tool.path} onClick={() => handleVisit(tool.id)} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '0.75rem', padding: '0.6rem 1rem',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = tool.color; e.currentTarget.style.background = isDark ? `${tool.color}15` : `${tool.color}0a` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{tool.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.text, whiteSpace: 'nowrap' }}>{tool.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured Tools ── */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.01em' }}>⭐ Featured Tools</h2>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b', background: '#f59e0b18', border: '1px solid #f59e0b33', borderRadius: '1rem', padding: '0.15rem 0.55rem' }}>Most Popular</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {featuredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} colors={colors} isDark={isDark} featured
                urduLabels={prefs.urduLabels} isNew={isNewTool(tool, lastVisit)}
                isFav={favourites.includes(tool.id)} onFavToggle={handleFavToggle} onVisit={handleVisit} />
            ))}
            {/* PDF Tools — category group card */}
            <a href="#pdf" onClick={e => { e.preventDefault(); document.getElementById('pdf')?.scrollIntoView({ behavior: 'smooth' }) }} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <div style={{
                background: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', height: '100%',
                boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px #f9731628' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ height: '3px', background: 'linear-gradient(to right, #f97316, #f9731666)' }} />
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2.2rem' }}>📄</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f97316', background: '#f9731618', border: '1px solid #f9731633', borderRadius: '1rem', padding: '0.2rem 0.55rem', letterSpacing: '0.05em' }}>⭐ FEATURED</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text, margin: '0 0 0.4rem', lineHeight: 1.3 }}>PDF Tools Suite</h3>
                  <p style={{ fontSize: '0.83rem', color: '#f97316', fontWeight: 600, margin: '0 0 0.5rem', lineHeight: 1.4 }}>7 PDF tools — compress, merge, split, convert & more</p>
                  <p style={{ fontSize: '0.8rem', color: colors.textSecondary, margin: 0, lineHeight: 1.55, flex: 1 }}>
                    Compress, merge, split, convert, extract text (OCR), search, and redact PDFs — all in your browser, nothing uploaded.
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f97316', fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                    View all PDF tools →
                  </div>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ── Category Jump Nav ── */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: '0.25rem' }}>Jump to:</span>
          {TOOL_CATEGORIES.map(cat => {
            const count = visibleTools.filter(t => t.category === cat.id).length
            if (!count) return null
            return (
              <a key={cat.id} href={`#${cat.id}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '2rem', padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem', fontWeight: 600, color: colors.text,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                >
                  {cat.icon} {cat.label} <span style={{ fontSize: '0.68rem', color: colors.textSecondary }}>({count})</span>
                </span>
              </a>
            )
          })}
        </div>

        {/* ── All Tools by Category ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {[...TOOL_CATEGORIES]
            .sort((a, b) => {
              const ai = CATEGORY_ORDER.indexOf(a.id)
              const bi = CATEGORY_ORDER.indexOf(b.id)
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
            })
            .map((cat) => {
            const tools = visibleTools.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            // Sort tools within the category per the defined order
            const catOrder = CATEGORY_TOOL_ORDER[cat.id] || []
            const sortedTools = [...tools].sort((a, b) => {
              const ai = catOrder.indexOf(a.id); const bi = catOrder.indexOf(b.id)
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
            })
            const newCount = sortedTools.filter(t => isNewTool(t, lastVisit)).length
            const isExpanded = !!expanded[cat.id]
            const visibleCatTools = isExpanded ? sortedTools : sortedTools.slice(0, TOP_N)
            const hasMore = sortedTools.length > TOP_N
            return (
              <section key={cat.id} id={cat.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                }}>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.01em' }}>{cat.label}</h2>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: '1rem', padding: '0.15rem 0.55rem' }}>{sortedTools.length}</span>
                  {newCount > 0 && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '1rem', padding: '0.15rem 0.55rem' }}>
                      +{newCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {visibleCatTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} colors={colors} isDark={isDark}
                      urduLabels={prefs.urduLabels} isNew={isNewTool(tool, lastVisit)}
                      isFav={favourites.includes(tool.id)} onFavToggle={handleFavToggle} onVisit={handleVisit} />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button onClick={() => toggleExpanded(cat.id)} style={{
                      background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                      borderRadius: '2rem', padding: '0.4rem 1.25rem',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      color: '#06b6d4', transition: 'border-color .15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
                    >
                      {isExpanded ? `Show less ↑` : `View all ${sortedTools.length} tools ↓`}
                    </button>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </main>

      {/* SEO Paragraph */}
      <div style={{ maxWidth: '700px', margin: '3rem auto 0', textAlign: 'center', padding: '0 1rem' }}>
        <p style={{ color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.75 }}>
          Rafiqy is a simple digital toolbox for everyday online tasks. From productivity timers and finance calculators to PDF utilities and writing tools — everything is built to be fast, free, and accessible from any device. No uploads, no accounts, no distractions.
        </p>
      </div>

      {/* ── Trust Strip ── */}
      <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '3rem', padding: '1.5rem 1rem', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { icon: '🔒', text: '100% client-side processing' },
            { icon: '🚫', text: 'No login required' },
            { icon: '💾', text: 'No data stored on servers' },
            { icon: '🎯', text: 'No ads. No tracking.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 500 }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <FeedbackButton />

      <footer style={{ textAlign: 'center', padding: '1rem', color: colors.textSecondary, fontSize: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
        © {new Date().getFullYear()} Rafiqy · Privacy-first browser tools &nbsp;·&nbsp;
        <Link to="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}>Blog</Link>
        &nbsp;·&nbsp;
        <Link to="/help" style={{ color: 'inherit', textDecoration: 'underline' }}>Help</Link>
        &nbsp;·&nbsp;
        <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</Link>
      </footer>
    </div>
  )
}
