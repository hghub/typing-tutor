import { Link } from 'react-router-dom'
import { getRelatedTools } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'

export default function RelatedTools({ toolId }) {
  const { colors } = useTheme()
  const related = getRelatedTools(toolId)
  if (!related.length) return null

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 0.5rem' }}>
      <p style={{
        color: colors.textSecondary,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '0 0 0.75rem',
      }}>
        Also in Typely
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {related.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '2rem',
              textDecoration: 'none',
              color: colors.text,
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tool.color }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border }}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
