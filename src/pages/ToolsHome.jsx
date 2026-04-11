import { Link } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import TrustBadge from '../components/TrustBadge'
import { useTheme } from '../hooks/useTheme'

export default function ToolsHome() {
  const { isDark, colors } = useTheme()

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: '100vh',
        color: colors.text,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      data-theme={isDark ? 'dark' : 'light'}
    >
      <ToolsNav />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1rem 2rem' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 0.75rem',
            letterSpacing: '-0.02em',
          }}>
            All Tools
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Free writing and productivity tools — all processing happens in your browser.
            No signup, no tracking, no uploads.
          </p>
        </div>

        {/* Tools grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tool.color
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${tool.color}22`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{tool.icon}</div>
                <h2 style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: colors.text,
                  margin: '0 0 0.35rem',
                }}>
                  {tool.name}
                </h2>
                <p style={{
                  fontSize: '0.82rem',
                  color: tool.color,
                  fontWeight: 600,
                  margin: '0 0 0.5rem',
                }}>
                  {tool.tagline}
                </p>
                <p style={{ fontSize: '0.82rem', color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <TrustBadge />

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: colors.textSecondary,
        fontSize: '0.75rem',
        borderTop: `1px solid ${colors.border}`,
      }}>
        © {new Date().getFullYear()} Typely · Your Smart Typing System
      </footer>
    </div>
  )
}
