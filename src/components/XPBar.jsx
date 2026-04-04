import { useXP } from '../hooks/useXP'

export default function XPBar({ xp, level, streak, colors, isDark }) {
  const { getLevelInfo } = useXP()
  const { nextLevel, progress, xpToNext } = getLevelInfo(xp)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(241,245,249,0.8)',
      border: `1px solid ${isDark ? 'rgba(71,85,105,0.4)' : 'rgba(203,213,225,0.6)'}`,
      borderRadius: '0.75rem',
      padding: '0.5rem 1rem',
      marginBottom: '1rem',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Level name + emoji */}
      <span style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', minWidth: '7rem', color: colors.text, fontWeight: 700 }}>
        {level.emoji} {level.name}
      </span>

      {/* Progress bar */}
      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.8)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.round(progress * 100)}%`,
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          borderRadius: '4px',
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* XP numbers */}
      <span style={{ fontSize: '0.8rem', color: colors.textSecondary, whiteSpace: 'nowrap', minWidth: '7rem', textAlign: 'right' }}>
        {xp.toLocaleString()}{nextLevel ? `/${nextLevel.min.toLocaleString()} XP` : ' XP (Max)'}
      </span>

      {/* Streak */}
      {streak >= 2 && (
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#f97316',
          whiteSpace: 'nowrap',
          marginLeft: '0.25rem',
        }}>
          🔥 {streak}
        </span>
      )}
    </div>
  )
}
