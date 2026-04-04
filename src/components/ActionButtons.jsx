const btnBase = {
  padding: '0.75rem 1.5rem',
  borderRadius: '0.625rem',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  fontSize: '0.875rem',
}

function ActionButton({ style, isPrimary, onClick, children, isMobile }) {
  const padding = isMobile ? '0.55rem 1rem' : '0.75rem 1.5rem'
  const fontSize = isMobile ? '0.8rem' : '0.875rem'
  const hoverShadow = isPrimary
    ? '0 4px 16px rgba(6, 182, 212, 0.35)'
    : '0 4px 16px rgba(0,0,0,0.12)'

  return (
    <button
      onClick={onClick}
      style={{ ...btnBase, padding, fontSize, boxShadow: 'none', ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = hoverShadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

export default function ActionButtons({ finished, onReset, onFeedback, onViewStats, onLeaderboard, soundOn, onToggleSound, showKeyboard, onToggleKeyboard, onTournament, onGroupChallenge, onBattle, isMobile, isKidsMode, onToggleKidsMode, hideMultiplayer, isDark, colors }) {
  const secBg = isDark ? '#1e293b' : '#f1f5f9'
  const secBorder = isDark ? '#334155' : '#e2e8f0'
  const secText = isDark ? '#e2e8f0' : '#1e293b'
  const secStyle = { background: secBg, color: secText, border: `1px solid ${secBorder}` }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Primary CTA — cyan→blue gradient */}
      <ActionButton
        style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6)', color: 'white' }}
        isPrimary
        onClick={onReset}
        isMobile={isMobile}
      >
        {finished ? '↺ Try Again' : '↺ Reset'}
      </ActionButton>

      {/* Keyboard toggle — solid active/inactive */}
      <ActionButton
        style={showKeyboard
          ? { background: '#0e7490', color: 'white' }
          : secStyle}
        onClick={onToggleKeyboard}
        isMobile={isMobile}
      >
        ⌨️ {showKeyboard ? 'Hide Keys' : 'Show Keys'}
      </ActionButton>

      <ActionButton style={secStyle} onClick={onViewStats} isMobile={isMobile}>
        View Stats
      </ActionButton>

      <ActionButton style={secStyle} onClick={onLeaderboard} isMobile={isMobile}>
        🏆 Leaderboard
      </ActionButton>

      {!hideMultiplayer && (
        <ActionButton
          style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}
          onClick={onTournament}
          isMobile={isMobile}
        >
          🎯 Tournament
        </ActionButton>
      )}

      {!hideMultiplayer && (
        <ActionButton style={secStyle} onClick={onGroupChallenge} isMobile={isMobile}>
          👥 Group Challenge
        </ActionButton>
      )}

      {!hideMultiplayer && (
        <ActionButton
          style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}
          onClick={onBattle}
          isMobile={isMobile}
        >
          ⚔️ 1v1 Battle
        </ActionButton>
      )}

      {/* Sound toggle — solid on/off distinction */}
      <ActionButton
        style={soundOn
          ? { background: '#1d4ed8', color: 'white' }
          : secStyle}
        onClick={onToggleSound}
        isMobile={isMobile}
      >
        {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
      </ActionButton>

      {/* Kids Mode — rainbow is intentional fun */}
      <ActionButton
        style={isKidsMode
          ? { background: 'linear-gradient(to right, #f97316, #ec4899, #8b5cf6, #06b6d4)', color: 'white' }
          : secStyle}
        onClick={onToggleKidsMode}
        isMobile={isMobile}
      >
        🧒 {isKidsMode ? 'Kids Mode ON' : 'Kids Mode'}
      </ActionButton>

      <ActionButton style={secStyle} onClick={onFeedback} isMobile={isMobile}>
        💡 Suggest a Feature
      </ActionButton>
    </div>
  )
}
