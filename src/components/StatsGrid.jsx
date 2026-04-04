import { getAccuracyColor } from '../utils/typing'

const STAT_CARDS = [
  {
    key: 'wpm',
    label: 'WPM',
    accentColor: '#06b6d4',
  },
  {
    key: 'cpm',
    label: 'CPM',
    accentColor: '#3b82f6',
  },
  {
    key: 'accuracy',
    label: 'Accuracy',
    accentColor: null, // dynamic via getAccuracyColor
  },
  {
    key: 'progress',
    label: 'Progress',
    accentColor: '#94a3b8',
  },
]

export default function StatsGrid({ wpm, cpm, accuracy, typed, passage, isTimerMode, timeLeft, colors, isDark, isMobile }) {
  const progressValue = isTimerMode ? `${timeLeft}s` : `${typed.length}/${passage.length}`
  const progressLabel = isTimerMode ? 'Time Left' : 'Progress'
  const values = { wpm, cpm, accuracy, progress: progressValue }
  const labels = { wpm: 'WPM', cpm: 'CPM', accuracy: 'Accuracy', progress: progressLabel }

  const cardBg = colors?.card || (isDark ? '#1e293b' : '#ffffff')
  const cardBorder = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.6)'
  const labelColor = colors?.textSecondary || '#94a3b8'
  const textColor = colors?.text || '#e2e8f0'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {STAT_CARDS.map(({ key, label, accentColor }) => {
        const valueColor = key === 'accuracy' ? getAccuracyColor(accuracy) : (accentColor || textColor)
        return (
          <div
            key={key}
            style={{
              background: cardBg,
              borderRadius: '0.75rem',
              padding: isMobile ? '0.875rem' : '1.25rem',
              border: `1px solid ${cardBorder}`,
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <p style={{ color: labelColor, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>{labels[key]}</p>
            <p style={{ fontSize: key === 'progress' ? '1.5rem' : '2rem', fontWeight: 700, color: valueColor, margin: 0, lineHeight: 1.1 }}>{values[key]}</p>
          </div>
        )
      })}
    </div>
  )
}
