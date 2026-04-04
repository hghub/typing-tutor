import { getAccuracyColor } from '../utils/typing'

export default function CompletionCard({ wpm, cpm, accuracy, currentLangDir, isNewBest, colors }) {
  return (
    <div style={{
      background: colors?.card || 'linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      border: '2px solid rgba(16, 185, 129, 0.5)',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.2)',
      animation: 'pulse-slow 3s ease-in-out infinite',
      direction: currentLangDir,
    }}>
      <p style={{
        fontSize: '2rem',
        fontWeight: 900,
        background: 'linear-gradient(to right, #10b981, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem',
      }}>
        🎉 Complete!
      </p>
      {isNewBest && (
        <p style={{
          display: 'inline-block',
          background: 'linear-gradient(to right, #f59e0b, #f97316)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.85rem',
          borderRadius: '2rem',
          padding: '0.25rem 0.875rem',
          marginBottom: '1rem',
        }}>
          🏅 New Personal Best WPM!
        </p>
      )}
      <p style={{ color: colors?.text || '#e2e8f0', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
        Final WPM: <span style={{ fontWeight: 900, color: '#10b981' }}>{wpm}</span>
      </p>
      <p style={{ color: colors?.text || '#e2e8f0', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
        CPM: <span style={{ fontWeight: 900, color: '#34d399' }}>{cpm}</span>
      </p>
      <p style={{ color: colors?.text || '#e2e8f0', fontSize: '1.125rem' }}>
        Accuracy: <span style={{ fontWeight: 900, color: getAccuracyColor(accuracy) }}>{accuracy}%</span>
      </p>
    </div>
  )
}
