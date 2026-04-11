import { useTheme } from '../hooks/useTheme'

export default function TrustBadge() {
  const { colors } = useTheme()
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.25rem 1rem 2rem',
      color: colors.textSecondary,
      fontSize: '0.78rem',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '2rem',
        padding: '0.35rem 0.9rem',
      }}>
        🔒 All processing is local — your text never leaves your browser
      </span>
    </div>
  )
}
