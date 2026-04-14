import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS, TOOL_CATEGORIES } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import FeedbackButton from '../components/FeedbackButton'
import { useTheme } from '../hooks/useTheme'

const FEATURED_IDS = ['expense-analyzer', 'data-leak-detector', 'tax-calculator']

function ToolCard({ tool, colors, isDark, featured = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={tool.path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? isDark ? `linear-gradient(145deg, #1e293b, ${tool.color}12)` : `linear-gradient(145deg, #fff, ${tool.color}0a)`
            : colors.card,
          border: `1px solid ${hovered ? tool.color : colors.border}`,
          borderRadius: '1rem',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? `0 12px 32px ${tool.color}28` : isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Color accent bar */}
        <div style={{ height: '3px', background: `linear-gradient(to right, ${tool.color}, ${tool.color}66)` }} />

        <div style={{ padding: featured ? '1.5rem' : '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: featured ? '2.2rem' : '1.8rem' }}>{tool.icon}</span>
            {featured && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, color: tool.color,
                background: `${tool.color}18`, border: `1px solid ${tool.color}33`,
                borderRadius: '1rem', padding: '0.2rem 0.55rem', letterSpacing: '0.05em',
              }}>⭐ FEATURED</span>
            )}
          </div>
          <h3 style={{
            fontSize: featured ? '1.1rem' : '1rem',
            fontWeight: 700,
            color: colors.text,
            margin: '0 0 0.4rem',
            lineHeight: 1.3,
          }}>
            {tool.name}
          </h3>
          <p style={{
            fontSize: '0.83rem',
            color: tool.color,
            fontWeight: 600,
            margin: '0 0 0.5rem',
            lineHeight: 1.4,
          }}>
            {tool.tagline}
          </p>
          {featured && (
            <p style={{ fontSize: '0.8rem', color: colors.textSecondary, margin: 0, lineHeight: 1.55, flex: 1 }}>
              {tool.description}
            </p>
          )}
          <div style={{
            marginTop: 'auto',
            paddingTop: featured ? '1rem' : '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: tool.color,
            fontSize: '0.8rem',
            fontWeight: 600,
            opacity: hovered ? 1 : 0.6,
            transition: 'opacity 0.2s ease',
          }}>
            Open tool <span style={{ transition: 'transform 0.2s ease', transform: hovered ? 'translateX(4px)' : 'translateX(0)', display: 'inline-block' }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ToolsHome() {
  const { isDark, colors } = useTheme()
  const featuredTools = FEATURED_IDS.map(id => TOOLS.find(t => t.id === id)).filter(Boolean)
  const totalTools = TOOLS.filter(t => !t.isHome).length

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

      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '3rem 1.25rem 2rem' }}>

        {/* ── Hero ── */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3.5rem',
          position: 'relative',
        }}>
          {/* Radial glow behind title */}
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '300px', pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(ellipse at center, #06b6d414 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, #06b6d40a 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

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
            marginBottom: '1.1rem',
          }}>
            🇵🇰 Made for Pakistan
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 0.8rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}>
            Pakistan's Free Productivity Hub
          </h1>

          <p style={{
            color: colors.textSecondary,
            fontSize: '1.05rem',
            maxWidth: '580px',
            margin: '0 auto 0.75rem',
            lineHeight: 1.6,
          }}>
            {totalTools}+ free tools for professionals, students &amp; developers — built with local context.
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: '1.5rem', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '1.75rem',
          }}>
            {[
              { value: `${totalTools}+`, label: 'Free Tools' },
              { value: '11', label: 'Categories' },
              { value: '0', label: 'Signups Needed' },
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
                borderRadius: '2rem',
                padding: '0.35rem 0.9rem',
                fontSize: '0.78rem',
              }}>
                <span>{icon}</span>
                <span style={{ fontWeight: 700, color: colors.text }}>{label}</span>
                <span style={{ color: colors.textSecondary }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* Who it's for chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
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

        {/* ── Featured Tools ── */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            <h2 style={{
              margin: 0, fontSize: '1.1rem', fontWeight: 800,
              color: colors.text, letterSpacing: '-0.01em',
            }}>
              ⭐ Featured Tools
            </h2>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: '#f59e0b',
              background: '#f59e0b18',
              border: '1px solid #f59e0b33',
              borderRadius: '1rem',
              padding: '0.15rem 0.55rem',
            }}>
              Most Popular
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {featuredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} colors={colors} isDark={isDark} featured />
            ))}
          </div>
        </section>

        {/* ── All Tools by Category ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {TOOL_CATEGORIES.map((cat) => {
            const tools = TOOLS.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            return (
              <section key={cat.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: colors.text,
                    letterSpacing: '-0.01em',
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

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}>
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} colors={colors} isDark={isDark} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      {/* ── Trust Strip ── */}
      <div style={{
        borderTop: `1px solid ${colors.border}`,
        marginTop: '3rem',
        padding: '1.5rem 1rem',
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
          justifyContent: 'center', alignItems: 'center',
        }}>
          {[
            { icon: '🔒', text: '100% client-side processing' },
            { icon: '🚫', text: 'No login required' },
            { icon: '💾', text: 'No data stored on servers' },
            { icon: '🎯', text: 'No ads. No tracking.' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 500,
            }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

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
