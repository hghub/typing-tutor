import { useState, useEffect } from 'react'
import { getScoreStats } from '../utils/scores'
import { supabase } from '../utils/supabase'

function SummaryCard({ label, value, gradient, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: '0.875rem',
      padding: '1rem 1.25rem',
      flex: '1 1 120px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

function WpmChart({ scores, isDark }) {
  const last10 = scores.slice(-10)
  const maxWpm = Math.max(...last10.map((s) => s.wpm), 1)

  return (
    <div>
      <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        WPM Trend (last {last10.length} sessions)
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
        {last10.map((s, i) => {
          const heightPct = Math.max((s.wpm / maxWpm) * 100, 6)
          return (
            <div key={i} title={`${s.wpm} WPM`} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{
                width: '100%',
                height: `${heightPct}%`,
                background: 'linear-gradient(to top, #06b6d4, #3b82f6)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s ease',
                minHeight: '4px',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontSize: '0.65rem', color: isDark ? '#475569' : '#94a3b8' }}>oldest</span>
        <span style={{ fontSize: '0.65rem', color: isDark ? '#475569' : '#94a3b8' }}>latest</span>
      </div>
    </div>
  )
}

function HistoryTable({ scores, colors, isDark }) {
  const rows = [...scores].reverse().slice(0, 50)
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

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '220px', borderRadius: '0.625rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead style={{ position: 'sticky', top: 0, background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(248,250,252,0.97)', zIndex: 1 }}>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>WPM</th>
            <th style={thStyle}>CPM</th>
            <th style={thStyle}>Accuracy</th>
            <th style={thStyle}>Difficulty</th>
            <th style={thStyle}>Language</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') }}>
              <td style={{ padding: '0.45rem 0.75rem', color: colors.textSecondary }}>{scores.length - i}</td>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 700, color: '#3b82f6' }}>{s.wpm}</td>
              <td style={{ padding: '0.45rem 0.75rem', color: colors.text }}>{s.cpm}</td>
              <td style={{ padding: '0.45rem 0.75rem', color: s.accuracy >= 95 ? '#22c55e' : s.accuracy >= 80 ? '#f59e0b' : '#ef4444' }}>{s.accuracy}%</td>
              <td style={{ padding: '0.45rem 0.75rem', color: colors.text, textTransform: 'capitalize' }}>{s.difficulty}</td>
              <td style={{ padding: '0.45rem 0.75rem', color: colors.text, textTransform: 'capitalize' }}>{s.language}</td>
              <td style={{ padding: '0.45rem 0.75rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                {new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function StatsModal({ show, onClose, userId, isDark, colors }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!show) return
    async function loadStats() {
      setLoading(true)
      const local = getScoreStats()

      if (userId) {
        const { data } = await supabase
          .from('scores')
          .select('wpm, cpm, accuracy, difficulty, language, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        if (data && data.length > 0) {
          const scores = data.map((s) => ({ ...s, timestamp: s.created_at }))
          setStats({
            totalSessions: scores.length,
            avgWpm: Math.round(scores.reduce((s, r) => s + r.wpm, 0) / scores.length),
            bestWpm: Math.max(...scores.map((r) => r.wpm)),
            avgAccuracy: Math.round(scores.reduce((s, r) => s + r.accuracy, 0) / scores.length),
            scores,
          })
          setLoading(false)
          return
        }
      }

      setStats(local)
      setLoading(false)
    }
    loadStats()
  }, [show, userId])

  if (!show) return null

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
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.97)' : 'rgba(248, 250, 252, 0.97)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '1.25rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        direction: 'ltr',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>
            📊 Your Stats
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {stats && (
              <button
                onClick={() => {
                  const rows = [['#','WPM','CPM','Accuracy','Difficulty','Language','Date']]
                  stats.scores.forEach((s, i) => rows.push([i+1, s.wpm, s.cpm, s.accuracy+'%', s.difficulty, s.language, new Date(s.timestamp).toLocaleString()]))
                  const csv = rows.map((r) => r.join(',')).join('\n')
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                  a.download = 'typing-stats.csv'
                  a.click()
                }}
                style={{ background: 'linear-gradient(to right, #22c55e, #06b6d4)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ⬇ Export CSV
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: colors.textSecondary, lineHeight: 1, padding: '0.25rem' }}>✕</button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: '2rem 0' }}>Loading...</p>
        ) : !stats ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: '2rem 0' }}>
            No sessions yet. Complete a typing test to see your stats!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary cards */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <SummaryCard label="Sessions" value={stats.totalSessions} gradient="linear-gradient(to right, #a855f7, #ec4899)" colors={colors} />
              <SummaryCard label="Best WPM" value={stats.bestWpm} gradient="linear-gradient(to right, #06b6d4, #3b82f6)" colors={colors} />
              <SummaryCard label="Avg WPM" value={stats.avgWpm} gradient="linear-gradient(to right, #3b82f6, #6366f1)" colors={colors} />
              <SummaryCard label="Avg Accuracy" value={`${stats.avgAccuracy}%`} gradient="linear-gradient(to right, #22c55e, #06b6d4)" colors={colors} />
            </div>

            {/* WPM Trend Chart */}
            {stats.scores.length >= 2 && <WpmChart scores={stats.scores} isDark={isDark} />}

            {/* History table */}
            <div>
              <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Session History
              </p>
              <HistoryTable scores={stats.scores} colors={colors} isDark={isDark} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
