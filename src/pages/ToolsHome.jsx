import { Link } from 'react-router-dom'
import { TOOLS, TOOL_CATEGORIES } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import TrustBadge from '../components/TrustBadge'
import FeedbackButton from '../components/FeedbackButton'
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
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #06b6d422, #3b82f622)',
            border: '1px solid #06b6d444',
            borderRadius: '2rem',
            padding: '0.3rem 1rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#06b6d4',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            🇵🇰 Made for Pakistan
          </div>
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
            Pakistan's Free Productivity Hub
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '1rem', maxWidth: '560px', margin: '0 auto 1.5rem' }}>
            25+ free tools for professionals, students &amp; developers — built with local context.
            No signup. No tracking. Works offline.
          </p>

          {/* Who it's for chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
            {[
              { label: '🎓 Students', color: '#8b5cf6' },
              { label: '💻 Developers', color: '#06b6d4' },
              { label: '🏫 Teachers', color: '#ec4899' },
              { label: '💼 Freelancers', color: '#f97316' },
              { label: '📊 Finance Pros', color: '#10b981' },
              { label: '🏥 Healthcare', color: '#ef4444' },
              { label: '✈️ Travellers', color: '#3b82f6' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                background: `${color}18`,
                border: `1px solid ${color}44`,
                color: color,
                borderRadius: '2rem',
                padding: '0.3rem 0.8rem',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Tools grouped by category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {TOOL_CATEGORIES.map((cat) => {
            const tools = TOOLS.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            return (
              <section key={cat.id}>
                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.6rem',
                  borderBottom: `1px solid ${colors.border}`,
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}>
                    {cat.label}
                  </h2>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: colors.textSecondary,
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                    borderRadius: '1rem',
                    padding: '0.15rem 0.55rem',
                  }}>
                    {tools.length}
                  </span>
                </div>

                {/* Tools grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {tools.map((tool) => (
                    <Link key={tool.id} to={tool.path} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          background: colors.card,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
                          height: '100%',
                          boxSizing: 'border-box',
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
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.text, margin: '0 0 0.35rem' }}>
                          {tool.name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: tool.color, fontWeight: 600, margin: '0 0 0.5rem' }}>
                          {tool.tagline}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <TrustBadge />
      <FeedbackButton />

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: colors.textSecondary,
        fontSize: '0.75rem',
        borderTop: `1px solid ${colors.border}`,
      }}>
        © {new Date().getFullYear()} Typely · Pakistan's Free Productivity Hub &nbsp;·&nbsp;
        <a href="#/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</a>
      </footer>
    </div>
  )
}
