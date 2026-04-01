import { getAccuracyColor } from '../utils/typing'

const STAT_CARDS = [
  {
    key: 'wpm',
    label: 'WPM',
    labelColor: '#93c5fd',
    bg: 'linear-gradient(to bottom right, #1e40af, #1e3a8a)',
    border: 'rgba(59, 130, 246, 0.3)',
    valueColor: () => 'white',
  },
  {
    key: 'cpm',
    label: 'CPM',
    labelColor: '#6ee7b7',
    bg: 'linear-gradient(to bottom right, #065f46, #064e3b)',
    border: 'rgba(16, 185, 129, 0.3)',
    valueColor: () => 'white',
  },
  {
    key: 'accuracy',
    label: 'Accuracy',
    labelColor: '#e9d5ff',
    bg: 'linear-gradient(to bottom right, #6b21a8, #581c87)',
    border: 'rgba(168, 85, 247, 0.3)',
    valueColor: (val) => getAccuracyColor(val),
  },
  {
    key: 'progress',
    label: 'Progress',
    labelColor: '#a5f3fc',
    bg: 'linear-gradient(to bottom right, #0e7490, #164e63)',
    border: 'rgba(34, 211, 238, 0.3)',
    valueColor: () => 'white',
  },
]

export default function StatsGrid({ wpm, cpm, accuracy, typed, passage }) {
  const values = { wpm, cpm, accuracy, progress: `${typed.length}/${passage.length}` }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
      {STAT_CARDS.map(({ key, label, labelColor, bg, border, valueColor }) => (
        <div key={key} style={{ background: bg, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${border}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ color: labelColor, fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, color: valueColor(values[key]), margin: 0 }}>{values[key]}</p>
        </div>
      ))}
    </div>
  )
}
