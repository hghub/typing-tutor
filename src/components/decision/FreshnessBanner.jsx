export default function FreshnessBanner({
  colors,
  accent = '#06b6d4',
  lastUpdated,
  cadence,
  refreshed,
  estimated,
}) {
  return (
    <div style={{
      background: `${accent}12`,
      border: `1px solid ${accent}33`,
      borderRadius: '1rem',
      padding: '0.95rem 1rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: accent,
        marginBottom: '0.45rem',
      }}>
        Data freshness
      </div>
      <div style={{ color: colors.text, fontSize: '0.88rem', lineHeight: 1.65 }}>
        <strong>Last updated:</strong> {lastUpdated} · <strong>Cadence:</strong> {cadence}
      </div>
      {refreshed && (
        <div style={{ color: colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.6, marginTop: '0.25rem' }}>
          <strong>Refreshed:</strong> {refreshed}
        </div>
      )}
      {estimated && (
        <div style={{ color: colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.6, marginTop: '0.25rem' }}>
          <strong>Still estimated:</strong> {estimated}
        </div>
      )}
    </div>
  )
}
