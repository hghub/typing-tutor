const btnBase = {
  padding: '0.75rem 2rem',
  color: 'white',
  borderRadius: '0.75rem',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
}

function ActionButton({ style, shadowColor, onClick, children, isMobile }) {
  const padding = isMobile ? '0.6rem 1rem' : '0.75rem 2rem'
  const fontSize = isMobile ? '0.82rem' : undefined
  return (
    <button
      onClick={onClick}
      style={{ ...btnBase, padding, fontSize, ...style, boxShadow: `0 20px 25px -5px ${shadowColor}` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 25px 50px -12px ${shadowColor}` }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 20px 25px -5px ${shadowColor}` }}
    >
      {children}
    </button>
  )
}

export default function ActionButtons({ finished, onReset, onFeedback, onViewStats, onLeaderboard, soundOn, onToggleSound, showKeyboard, onToggleKeyboard, onTournament, onGroupChallenge, onBattle, isMobile }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <ActionButton style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6)' }} shadowColor="rgba(6, 182, 212, 0.3)" onClick={onReset} isMobile={isMobile}>
        {finished ? 'Try Again' : 'Reset'}
      </ActionButton>
      <ActionButton
        style={{ background: showKeyboard ? 'linear-gradient(to right, #10b981, #06b6d4)' : 'linear-gradient(to right, #475569, #64748b)' }}
        shadowColor="rgba(16, 185, 129, 0.3)"
        onClick={onToggleKeyboard}
        isMobile={isMobile}
      >
        ⌨️ {showKeyboard ? 'Hide Keys' : 'Show Keys'}
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }} shadowColor="rgba(168, 85, 247, 0.3)" onClick={onViewStats} isMobile={isMobile}>
        View Stats
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #f59e0b, #22c55e)' }} shadowColor="rgba(34, 197, 94, 0.3)" onClick={onLeaderboard} isMobile={isMobile}>
        🏆 Leaderboard
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }} shadowColor="rgba(239, 68, 68, 0.3)" onClick={onTournament} isMobile={isMobile}>
        🎯 Tournament
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #10b981, #06b6d4)' }} shadowColor="rgba(16, 185, 129, 0.3)" onClick={onGroupChallenge} isMobile={isMobile}>
        👥 Group Challenge
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }} shadowColor="rgba(239, 68, 68, 0.3)" onClick={onBattle} isMobile={isMobile}>
        ⚔️ 1v1 Battle
      </ActionButton>
      <ActionButton style={{ background: soundOn ? 'linear-gradient(to right, #6366f1, #a855f7)' : 'linear-gradient(to right, #475569, #64748b)' }} shadowColor="rgba(99, 102, 241, 0.3)" onClick={onToggleSound} isMobile={isMobile}>
        {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
      </ActionButton>
      <ActionButton style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }} shadowColor="rgba(245, 158, 11, 0.3)" onClick={onFeedback} isMobile={isMobile}>
        💡 Suggest a Feature
      </ActionButton>
    </div>
  )
}
