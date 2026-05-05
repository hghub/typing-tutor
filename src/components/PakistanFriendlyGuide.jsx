import { getAccessibilityNote } from '../lib/pakistanAccessibility'
import { useTheme } from '../hooks/useTheme'

export default function PakistanFriendlyGuide({ toolId }) {
  const { isDark, colors } = useTheme()
  const note = getAccessibilityNote(toolId)
  if (!note) return null

  return (
    <div style={{
      marginBottom: '1rem',
      background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.22)',
      borderRadius: '1rem',
      padding: '1rem 1.05rem',
      display: 'grid',
      gap: '0.65rem',
    }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', marginBottom: '0.3rem' }}>
          Simple explanation
        </div>
        <div style={{ fontSize: '0.88rem', color: colors.text, lineHeight: 1.65 }}>
          {note.commonNeed}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        {note.simple}
      </div>

      {note.romanUrdu?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textSecondary, marginBottom: '0.45rem' }}>
            Common Roman Urdu searches
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {note.romanUrdu.slice(0, 4).map((term) => (
              <span
                key={term}
                style={{
                  fontSize: '0.75rem',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '999px',
                  padding: '0.25rem 0.6rem',
                }}
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
