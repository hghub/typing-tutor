const FINGER_NAMES = [
  'Left Pinky', 'Left Ring', 'Left Middle', 'Left Index',
  'Right Index', 'Right Middle', 'Right Ring', 'Right Pinky',
]

const FINGER_EMOJI = ['🤙', '💍', '🖕', '☝️', '☝️', '🖕', '💍', '🤙']

function speedLabel(ms, avg) {
  if (ms === null) return null
  const ratio = ms / avg
  if (ratio < 0.8) return { label: 'Fast', color: '#10b981' }
  if (ratio < 1.2) return { label: 'Good', color: '#06b6d4' }
  if (ratio < 1.6) return { label: 'Avg', color: '#f59e0b' }
  return { label: 'Slow', color: '#ef4444' }
}

export default function TypingAnalysis({ analysis, isDark, colors }) {
  if (!analysis) return null

  const { weakKeys, fingerAvg, slowDigraphs, fatigueDrop, globalAvg } = analysis
  const hasFatigue = fatigueDrop > 15
  const hasWeakKeys = weakKeys.length > 0
  const hasSlowDigraphs = slowDigraphs.length > 0

  const cardStyle = {
    background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '0.875rem',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{
        color: colors.text, fontSize: '1rem', fontWeight: 700,
        marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        ⌨️ Typing Analysis
      </h3>

      {/* Finger heatmap */}
      <div style={cardStyle}>
        <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
          🖐️ Finger Speed
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {fingerAvg.map((ms, i) => {
            const s = ms !== null ? speedLabel(ms, globalAvg) : null
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '0.5rem 0.25rem',
                background: s ? `${s.color}18` : 'transparent',
                borderRadius: '0.5rem',
                border: `1px solid ${s ? s.color + '44' : 'transparent'}`,
                opacity: ms === null ? 0.3 : 1,
              }}>
                <div style={{ fontSize: '1.2rem' }}>{FINGER_EMOJI[i]}</div>
                <div style={{ fontSize: '0.65rem', color: colors.textSecondary, marginTop: '0.2rem' }}>
                  {FINGER_NAMES[i].split(' ')[1]}
                </div>
                {s && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color }}>{s.label}</div>}
                {ms && <div style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms</div>}
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '0.7rem', color: colors.textSecondary, margin: '0.5rem 0 0 0', textAlign: 'center' }}>
          Global avg: {globalAvg}ms/key
        </p>
      </div>

      {/* Weak keys */}
      {hasWeakKeys && (
        <div style={cardStyle}>
          <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            🐌 Slowest Keys — practice these!
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {weakKeys.map(({ char, ms }) => (
              <span key={char} style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: '0.5rem', padding: '0.35rem 0.6rem', minWidth: '2.5rem',
              }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ef4444', fontFamily: 'monospace' }}>
                  {char === ' ' ? '␣' : char}
                </span>
                <span style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Slow digraphs */}
      {hasSlowDigraphs && (
        <div style={cardStyle}>
          <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            🔗 Slow Key Combos
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {slowDigraphs.map(({ digraph, ms }) => (
              <span key={digraph} style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                borderRadius: '0.5rem', padding: '0.35rem 0.75rem',
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                  {digraph}
                </span>
                <span style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms avg</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fatigue */}
      <div style={{ ...cardStyle, border: `1px solid ${hasFatigue ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{hasFatigue ? '😴' : '💪'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: hasFatigue ? '#ef4444' : '#10b981' }}>
              {hasFatigue
                ? `Fatigue detected — speed dropped ${fatigueDrop}% toward the end`
                : 'No fatigue — consistent speed throughout!'}
            </p>
            {hasFatigue && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: colors.textSecondary }}>
                Tip: Take a short break, then practice in shorter bursts to build endurance.
              </p>
            )}
          </div>
        </div>
      </div>

      {!hasWeakKeys && !hasSlowDigraphs && !hasFatigue && (
        <p style={{ textAlign: 'center', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
          🏆 Excellent! No significant weaknesses detected. Keep it up!
        </p>
      )}
    </div>
  )
}
