import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { TOOLS } from '../tools/registry'

const FEATURED_IDS = [
  'word-counter', 'text-cleaner', 'urdu-keyboard',
  'compress-pdf', 'merge-pdf', 'doc-composer',
  'tax-calculator', 'expense-analyzer',
]

export default function Landing() {
  const { theme, toggleTheme } = useTheme()
  const featured = TOOLS.filter(t => FEATURED_IDS.includes(t.id))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>⌨ Typely</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/tools" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>All Tools</Link>
          <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
          <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
          📵 Files never leave your browser · 100% Private
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
          40+ Free Privacy-First<br />
          <span style={{ color: 'var(--color-primary)' }}>Browser Tools</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 2rem' }}>
          PDF tools, writing helpers, calculators and more — all run in your browser. Zero uploads. Zero tracking.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/tools" style={{ background: 'var(--color-primary)', color: '#0f172a', padding: '0.75rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
            Explore All Tools →
          </Link>
          <Link to="/tools/typing-tutor" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.75rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
            ⌨ Typing Tutor
          </Link>
        </div>
      </section>

      {/* Featured Tools */}
      <section style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Featured Tools
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {featured.map(tool => (
            <Link key={tool.id} to={tool.path} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem', transition: 'border-color .2s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tool.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{tool.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/tools" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            View all 40+ tools →
          </Link>
        </div>
      </section>

      {/* Privacy strip */}
      <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '2rem', marginTop: '3rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['🔒', 'Zero Uploads', 'All processing happens in your browser'],
            ['📵', 'No Tracking', 'No analytics, no fingerprinting on tool pages'],
            ['⚡', 'Instant', 'No server round-trips — results in milliseconds'],
            ['🌐', 'Works Offline', 'Once loaded, most tools work without internet'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: '1.75rem' }}>{icon}</div>
              <div style={{ fontWeight: 600, marginTop: '0.4rem' }}>{title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <Link to="/tools" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>Tools</Link>
        <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>About</Link>
        <span>© {new Date().getFullYear()} Typely — Privacy-First Browser Tools</span>
      </footer>
    </div>
  )
}
