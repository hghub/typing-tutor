import { getScoreStats } from '../utils/scores'

const btnBase = {
  padding: '0.75rem 2rem',
  color: 'white',
  borderRadius: '0.75rem',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
}

function ActionButton({ style, shadowColor, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ ...btnBase, ...style, boxShadow: `0 20px 25px -5px ${shadowColor}` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 25px 50px -12px ${shadowColor}` }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 20px 25px -5px ${shadowColor}` }}
    >
      {children}
    </button>
  )
}

export default function ActionButtons({ finished, onReset, onFeedback }) {
  const handleViewStats = () => {
    const stats = getScoreStats()
    if (!stats) { alert('No typing sessions yet! Complete a test to see stats.'); return }
    alert(`📊 Your Stats\n\nTotal Sessions: ${stats.totalSessions}\nAvg WPM: ${stats.avgWpm}\nBest WPM: ${stats.bestWpm}\nAvg Accuracy: ${stats.avgAccuracy}%\n\nCheck console for detailed scores`)
    console.log('All your scores:', stats.scores)
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <ActionButton
        style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6)' }}
        shadowColor="rgba(6, 182, 212, 0.3)"
        onClick={onReset}
      >
        {finished ? 'Try Again' : 'Reset'}
      </ActionButton>

      <ActionButton
        style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
        shadowColor="rgba(168, 85, 247, 0.3)"
        onClick={handleViewStats}
      >
        View Stats
      </ActionButton>

      <ActionButton
        style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }}
        shadowColor="rgba(245, 158, 11, 0.3)"
        onClick={onFeedback}
      >
        💡 Suggest a Feature
      </ActionButton>
    </div>
  )
}
