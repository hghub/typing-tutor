import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function getWeekId() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now - startOfYear) / 86400000)
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function TournamentModal({ show, onClose, userId, displayName, lastWpm, lastAccuracy, lastLanguage, isDark, colors }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userEntry, setUserEntry] = useState(null)
  const [error, setError] = useState(null)

  const weekId = getWeekId()

  const loadEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('tournaments')
        .select('*')
        .eq('week_id', weekId)
        .order('wpm', { ascending: false })
        .limit(50)
      if (err) throw err
      setEntries(data || [])
      const mine = (data || []).find(e => e.user_id === userId)
      if (mine) { setUserEntry(mine); setSubmitted(true) }
    } catch (err) {
      setError('Tournament table not set up yet. Run the SQL migration in your Supabase dashboard.')
      console.error('Tournament load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!show) return
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const handleSubmit = async () => {
    if (!userId || !lastWpm) return
    setSubmitting(true)
    try {
      const { error: err } = await supabase.from('tournaments').upsert({
        week_id: weekId,
        user_id: userId,
        display_name: displayName || userId,
        wpm: lastWpm,
        accuracy: lastAccuracy || 0,
        language: lastLanguage || 'english',
      }, { onConflict: 'week_id,user_id' })
      if (err) throw err
      setSubmitted(true)
      await loadEntries()
    } catch (err) {
      setError('Failed to submit score. Please try again.')
      console.error('Tournament submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!show) return null

  const userRank = entries.findIndex(e => e.user_id === userId) + 1

  const rankBadge = (i) => {
    if (i === 0) return { icon: '🥇', color: '#f59e0b' }
    if (i === 1) return { icon: '🥈', color: '#94a3b8' }
    if (i === 2) return { icon: '🥉', color: '#f97316' }
    return { icon: `${i + 1}`, color: colors.textSecondary }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.18s ease',
    }}>
      <div style={{
        background: colors.card, borderRadius: '1.5rem', padding: '2rem',
        maxWidth: '500px', width: '100%', maxHeight: '88vh', overflowY: 'auto',
        border: '1px solid rgba(245,158,11,0.4)',
        boxShadow: '0 25px 50px -12px rgba(245,158,11,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{
              margin: 0, fontWeight: 900, fontSize: '1.5rem',
              background: 'linear-gradient(to right, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>🎯 Weekly Tournament</h2>
            <p style={{ margin: '0.25rem 0 0', color: colors.textSecondary, fontSize: '0.8rem' }}>{weekId} · Top 50 players</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.textSecondary,
            cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem',
          }}>×</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1rem',
            color: '#ef4444', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit entry */}
        {!submitted && !error && lastWpm > 0 && userId && (
          <div style={{
            background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.35)', borderRadius: '1rem',
            padding: '1rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: colors.text, fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
              Submit your score: <strong style={{ color: '#f59e0b' }}>{lastWpm} WPM</strong>
              {' '}/ <strong style={{ color: '#10b981' }}>{lastAccuracy}%</strong> accuracy
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: 'linear-gradient(to right, #f59e0b, #ef4444)',
                color: 'white', border: 'none', borderRadius: '0.75rem',
                padding: '0.6rem 1.5rem', fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1, fontSize: '0.9rem',
              }}
            >
              {submitting ? 'Submitting…' : '🎯 Enter Tournament'}
            </button>
          </div>
        )}

        {/* No score yet */}
        {!submitted && !error && !lastWpm && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem',
            color: colors.textSecondary, fontSize: '0.875rem', textAlign: 'center',
          }}>
            Complete a typing test first to enter the tournament!
          </div>
        )}

        {/* User rank badge */}
        {submitted && userRank > 0 && userEntry && (
          <div style={{
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '1rem', padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'center',
          }}>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem' }}>
              You're #{userRank} this week · {userEntry.wpm} WPM · {userEntry.accuracy}% accuracy
            </span>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
            Loading tournament…
          </div>
        ) : !error && (
          <div>
            <p style={{ color: colors.textSecondary, fontSize: '0.78rem', margin: '0 0 0.6rem', fontWeight: 600 }}>
              LEADERBOARD · {entries.length} entrants
            </p>
            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
                No entries yet. Be the first this week! 🚀
              </div>
            )}
            {entries.map((entry, i) => {
              const isMe = entry.user_id === userId
              const { icon, color } = rankBadge(i)
              return (
                <div key={entry.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.875rem', marginBottom: '0.35rem',
                  background: isMe
                    ? 'rgba(245,158,11,0.12)'
                    : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '0.75rem',
                  border: `1px solid ${isMe ? 'rgba(245,158,11,0.5)' : 'transparent'}`,
                }}>
                  <span style={{
                    minWidth: '2rem', textAlign: 'center', fontWeight: 800,
                    fontSize: i < 3 ? '1.25rem' : '0.85rem', color,
                  }}>{icon}</span>
                  <span style={{
                    flex: 1, color: colors.text, fontSize: '0.9rem',
                    fontWeight: isMe ? 700 : 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{entry.display_name || entry.user_id}</span>
                  <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem' }}>{entry.wpm} WPM</span>
                  <span style={{ color: '#10b981', fontSize: '0.8rem', minWidth: '3rem', textAlign: 'right' }}>{entry.accuracy}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
