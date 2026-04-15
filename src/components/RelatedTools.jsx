import { Link } from 'react-router-dom'
import { getRelatedTools } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'

const pulseKeyframes = `
@keyframes relatedPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}
@keyframes relatedShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes relatedCardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

export default function RelatedTools({ toolId }) {
  const { colors, isDark } = useTheme()
  const related = getRelatedTools(toolId)
  if (!related.length) return null

  const sectionBg = isDark
    ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.06) 100%)'
    : 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.04) 100%)'
  const borderGlow = isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)'

  return (
    <>
      <style>{pulseKeyframes}</style>
      <section style={{
        maxWidth: '1100px',
        margin: '2rem auto 0',
        padding: '1.75rem 1.25rem 1.75rem',
        background: sectionBg,
        border: `1px solid ${borderGlow}`,
        borderRadius: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative glow blob */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '120px', height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
          <span style={{
            fontSize: '1rem',
            animation: 'relatedPulse 2s ease-in-out infinite',
            display: 'inline-block',
          }}>✨</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #6366f1, #10b981, #6366f1)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'relatedShimmer 3s linear infinite',
          }}>
            Also in Typely — explore more tools
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            FREE
          </span>
        </div>

        {/* tool cards */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {related.map((tool, i) => (
            <Link
              key={tool.id}
              to={tool.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                background: isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
                border: `1.5px solid ${colors.border}`,
                borderRadius: '2rem',
                textDecoration: 'none',
                color: colors.text,
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.18s ease',
                backdropFilter: 'blur(6px)',
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.07)',
                animation: `relatedCardIn 0.35s ease ${i * 0.06}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tool.color
                e.currentTarget.style.boxShadow = `0 0 14px ${tool.color}55, 0 2px 8px rgba(0,0,0,0.2)`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.07)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{tool.icon}</span>
              <span>{tool.name}</span>
              <span style={{ fontSize: '0.65rem', color: tool.color, fontWeight: 800, marginLeft: '0.1rem' }}>→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
