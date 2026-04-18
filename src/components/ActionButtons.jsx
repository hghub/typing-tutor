import { useState } from 'react'

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
  const padding = isMobile ? '0.5rem 0.85rem' : '0.65rem 1.25rem'
  const fontSize = isMobile ? '0.78rem' : '0.84rem'
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

function GroupLabel({ children, colors }) {
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: colors?.textSecondary || '#94a3b8',
      alignSelf: 'center', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export default function ActionButtons({ finished, onReset, onFeedback, onViewStats, onLeaderboard, soundOn, onToggleSound, showKeyboard, onToggleKeyboard, onTournament, onGroupChallenge, onBattle, isMobile, isKidsMode, onToggleKidsMode, hideMultiplayer, isDark, colors }) {
  const [showMore, setShowMore] = useState(false)
  const secBg = isDark ? '#1e293b' : '#f1f5f9'
  const secBorder = isDark ? '#334155' : '#e2e8f0'
  const secText = isDark ? '#e2e8f0' : '#1e293b'
  const secStyle = { background: secBg, color: secText, border: `1px solid ${secBorder}` }
  const competeStyle = { background: isDark ? '#450a0a' : '#fef2f2', color: isDark ? '#fca5a5' : '#b91c1c', border: `1px solid ${isDark ? '#991b1b' : '#fca5a5'}` }

  const settingsGroup = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <GroupLabel colors={colors}>⚙️ Settings</GroupLabel>
      <ActionButton
        style={soundOn ? { background: '#1d4ed8', color: 'white' } : secStyle}
        onClick={onToggleSound}
        isMobile={isMobile}
      >
        {soundOn ? '🔊 Sound' : '🔇 Sound'}
      </ActionButton>
      {!isMobile && (
        <ActionButton
          style={showKeyboard ? { background: '#0e7490', color: 'white' } : secStyle}
          onClick={onToggleKeyboard}
          isMobile={isMobile}
        >
          ⌨️ {showKeyboard ? 'Hide Keys' : 'Show Keys'}
        </ActionButton>
      )}
      <ActionButton
        style={isKidsMode
          ? { background: 'linear-gradient(to right, #f97316, #ec4899, #8b5cf6)', color: 'white' }
          : secStyle}
        onClick={onToggleKidsMode}
        isMobile={isMobile}
      >
        🧒 {isKidsMode ? 'Kids ON' : 'Kids'}
      </ActionButton>
    </div>
  )

  const progressGroup = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <GroupLabel colors={colors}>📊 Progress</GroupLabel>
      <ActionButton style={secStyle} onClick={onViewStats} isMobile={isMobile}>
        📊 Stats
      </ActionButton>
      <ActionButton style={secStyle} onClick={onLeaderboard} isMobile={isMobile}>
        🏆 Board
      </ActionButton>
    </div>
  )

  const competeGroup = !hideMultiplayer && (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <GroupLabel colors={colors}>⚔️ Compete</GroupLabel>
      <ActionButton style={competeStyle} onClick={onBattle} isMobile={isMobile}>
        ⚔️ 1v1 Battle
      </ActionButton>
      <ActionButton style={secStyle} onClick={onGroupChallenge} isMobile={isMobile}>
        👥 Group
      </ActionButton>
      <ActionButton style={competeStyle} onClick={onTournament} isMobile={isMobile}>
        🎯 Tournament
      </ActionButton>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center' }}>
      {/* Primary action — always visible */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <ActionButton
          style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6)', color: 'white' }}
          isPrimary
          onClick={onReset}
          isMobile={isMobile}
        >
          {finished ? '↺ Try Again' : '↺ Reset'}
        </ActionButton>
        <ActionButton style={secStyle} onClick={onFeedback} isMobile={isMobile}>
          💡 Suggest
        </ActionButton>
        {/* Mobile: show More toggle */}
        {isMobile && (
          <ActionButton style={secStyle} onClick={() => setShowMore(p => !p)} isMobile={isMobile}>
            {showMore ? 'Less ▲' : 'More ▾'}
          </ActionButton>
        )}
      </div>

      {/* Grouped secondary buttons */}
      {(!isMobile || showMore) && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%',
          padding: '0.75rem', borderRadius: '0.75rem',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        }}>
          {settingsGroup}
          <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          {progressGroup}
          {!hideMultiplayer && <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />}
          {competeGroup}
        </div>
      )}
    </div>
  )
}

