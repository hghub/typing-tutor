import { useState } from 'react'

const CAREERS = [
  { id: 'admin',         label: 'Office Admin',                  emoji: '📧', wpm: 40, accuracy: 95 },
  { id: 'data-entry',   label: 'Data Entry Operator',            emoji: '📊', wpm: 60, accuracy: 98 },
  { id: 'freelance',    label: 'Freelance / Remote Work',        emoji: '💼', wpm: 55, accuracy: 96 },
  { id: 'developer',    label: 'Software Developer',             emoji: '💻', wpm: 65, accuracy: 94 },
  { id: 'support',      label: 'Customer Support',               emoji: '📞', wpm: 45, accuracy: 95 },
  { id: 'writer',       label: 'Content / Copywriter',           emoji: '📰', wpm: 70, accuracy: 97 },
  { id: 'transcription',label: 'Legal / Medical Transcription',  emoji: '🏛️', wpm: 80, accuracy: 99 },
]

function calcReadiness(userWpm, userAccuracy, reqWpm, reqAccuracy) {
  const wpmScore = Math.min(userWpm / reqWpm, 1)
  const accScore = Math.min(userAccuracy / reqAccuracy, 1)
  return Math.round((wpmScore * 0.7 + accScore * 0.3) * 100)
}

function statusColor(pct) {
  if (pct >= 90) return '#10b981'
  if (pct >= 65) return '#f59e0b'
  return '#ef4444'
}

function statusEmoji(pct) {
  if (pct >= 90) return '✅'
  if (pct >= 65) return '🔶'
  return '❌'
}

export default function CareerReadiness({ wpm, accuracy, colors, isDark }) {
  const [expanded, setExpanded] = useState(true)

  if (!wpm || wpm === 0) return null

  const rows = CAREERS.map(c => ({
    ...c,
    pct: calcReadiness(wpm, accuracy, c.wpm, c.accuracy),
  })).sort((a, b) => b.pct - a.pct)

  const qualified = rows.filter(r => r.pct >= 90)

  return (
    <div style={{
      background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      padding: '1.25rem 1.5rem',
      marginTop: '1rem',
    }}>
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0,
        }}
      >
        <span style={{ color: colors.text, fontWeight: 700, fontSize: '1rem' }}>
          💼 Career Readiness
        </span>
        <span style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
          {expanded ? '▲ hide' : '▼ show'}
        </span>
      </button>

      {expanded && (
        <>
          <p style={{ color: colors.textSecondary, fontSize: '0.78rem', margin: '0.4rem 0 1rem 0' }}>
            Based on your{' '}
            <strong style={{ color: colors.text }}>{wpm} WPM</strong>
            {' · '}
            <strong style={{ color: colors.text }}>{accuracy}% accuracy</strong>
          </p>

          {rows.map(({ id, label, emoji, wpm: reqWpm, accuracy: reqAcc, pct }) => {
            const color = statusColor(pct)
            return (
              <div key={id} style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ color: colors.text, fontSize: '0.85rem', fontWeight: 600 }}>
                    {emoji} {label}
                  </span>
                  <span style={{ color, fontSize: '0.82rem', fontWeight: 700 }}>
                    {statusEmoji(pct)} {pct}%
                  </span>
                </div>
                <div style={{
                  height: '6px', borderRadius: '99px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '99px', width: `${pct}%`,
                    background: pct >= 90
                      ? 'linear-gradient(to right, #10b981, #06b6d4)'
                      : pct >= 65
                        ? 'linear-gradient(to right, #f59e0b, #f97316)'
                        : 'linear-gradient(to right, #ef4444, #f97316)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.68rem', color: colors.textSecondary }}>
                  Requires {reqWpm} WPM · {reqAcc}% accuracy
                  {wpm < reqWpm && ` · need +${reqWpm - wpm} more WPM`}
                </p>
              </div>
            )
          })}

          {/* Summary callout */}
          {qualified.length > 0 ? (
            <div style={{
              marginTop: '0.5rem', padding: '0.75rem 1rem',
              background: 'linear-gradient(to right, rgba(16,185,129,0.12), rgba(6,182,212,0.12))',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.625rem', textAlign: 'center',
            }}>
              <p style={{ margin: 0, color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                🎯 You qualify for {qualified.length} career role{qualified.length > 1 ? 's' : ''}! Keep practicing to unlock more.
              </p>
            </div>
          ) : (
            <div style={{
              marginTop: '0.5rem', padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '0.625rem', textAlign: 'center',
            }}>
              <p style={{ margin: 0, color: '#ef4444', fontWeight: 600, fontSize: '0.82rem' }}>
                💪 Keep practicing — even 10 mins/day adds 5–10 WPM per week!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

