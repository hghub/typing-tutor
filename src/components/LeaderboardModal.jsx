import { useLeaderboard } from '../hooks/useLeaderboard'

const TABS = [
  { id: 'global', label: '🌍 Global' },
  { id: 'country', label: '🏳️ Country' },
  { id: 'city', label: '🏙️ City' },
]

export default function LeaderboardModal({ show, onClose, userId, isDark, colors }) {
  const { tab, changeTab, rows, loading, userLocation } = useLeaderboard(userId, show)

  if (!show) return null

  const thStyle = {
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  }

  const rankColor = (i) => {
    if (i === 0) return '#f59e0b'
    if (i === 1) return '#94a3b8'
    if (i === 2) return '#b45309'
    return colors.textSecondary
  }

  const rankLabel = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  const subtitle = tab === 'country' && userLocation.country && userLocation.country !== 'Unknown'
    ? `Top 20 in ${userLocation.country}`
    : tab === 'city' && userLocation.city && userLocation.city !== 'Unknown'
    ? `Top 20 in ${userLocation.city}`
    : tab === 'global'
    ? 'Top 20 worldwide'
    : 'No location data — update your profile'

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.97)' : 'rgba(248, 250, 252, 0.97)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '1.25rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        direction: 'ltr',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>🏆 Leaderboard</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: colors.textSecondary, padding: '0.25rem' }}>✕</button>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: colors.textSecondary }}>{subtitle} — ranked by average WPM</p>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: tab === t.id ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : (isDark ? '#1e293b' : '#e2e8f0'),
                color: tab === t.id ? 'white' : colors.textSecondary,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowY: 'auto', flex: 1, borderRadius: '0.625rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>Loading...</p>
          ) : rows.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>No scores yet for this region!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(248,250,252,0.97)', zIndex: 1 }}>
                <tr>
                  <th style={thStyle}>Rank</th>
                  <th style={thStyle}>Player</th>
                  <th style={thStyle}>Avg WPM</th>
                  <th style={thStyle}>Best WPM</th>
                  <th style={thStyle}>Accuracy</th>
                  <th style={thStyle}>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isMe = row.id === userId
                  return (
                    <tr key={row.id} style={{
                      background: isMe
                        ? (isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)')
                        : i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      outline: isMe ? `1px solid rgba(6,182,212,0.3)` : 'none',
                    }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: rankColor(i), fontSize: '1rem' }}>{rankLabel(i)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: isMe ? 700 : 400, color: isMe ? '#06b6d4' : colors.text }}>
                        {row.display_name} {isMe && <span style={{ fontSize: '0.7rem', color: '#06b6d4' }}>(you)</span>}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#3b82f6' }}>{row.avg_wpm}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: colors.text }}>{row.best_wpm}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: row.avg_accuracy >= 95 ? '#22c55e' : row.avg_accuracy >= 80 ? '#f59e0b' : '#ef4444' }}>{row.avg_accuracy}%</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: colors.textSecondary }}>{row.total_sessions}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Your code reminder */}
        {userId && (
          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: colors.textSecondary, textAlign: 'center' }}>
            Your code: <strong style={{ color: '#06b6d4', userSelect: 'all' }}>{userId}</strong> — save this to resume on other devices
          </p>
        )}
      </div>
    </div>
  )
}
