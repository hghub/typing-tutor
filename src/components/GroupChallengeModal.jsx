import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'

const LANG_FLAGS = { english: '🇬🇧', urdu: '🇵🇰', arabic: '🇸🇦', persian: '🇮🇷' }

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1 to avoid confusion
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function GroupChallengeModal({
  show, onClose,
  activeRoom, onRoomJoin, onRoomLeave,
  lastWpm, lastAccuracy, lastPassageIndex, lastLanguage, lastDifficulty,
  userId, isDark, colors,
}) {
  const [step, setStep] = useState('menu') // 'menu' | 'room'
  const [nickname, setNickname] = useState(() => localStorage.getItem('typingNickname') || '')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scores, setScores] = useState([])
  const [roomClosed, setRoomClosed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef(null)

  // Enter room view when modal opens and a room is already active
  useEffect(() => {
    if (show && activeRoom) {
      setStep('room')
      doFetchScores(activeRoom.id)
    }
    if (!show) clearInterval(pollRef.current)
  }, [show, activeRoom])

  // Poll leaderboard every 5s while in room view
  useEffect(() => {
    if (step === 'room' && activeRoom) {
      clearInterval(pollRef.current)
      pollRef.current = setInterval(() => doFetchScores(activeRoom.id), 5000)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [step, activeRoom])

  // Mark as submitted if this user's score already appears in the leaderboard
  useEffect(() => {
    if (userId && scores.some(s => s.user_id === userId)) setSubmitted(true)
  }, [scores, userId])

  async function doFetchScores(roomId) {
    const { data } = await supabase
      .from('room_scores').select('*').eq('room_id', roomId).order('wpm', { ascending: false })
    if (data) setScores(data)
    const { data: room } = await supabase.from('rooms').select('is_closed').eq('id', roomId).single()
    if (room) setRoomClosed(room.is_closed)
  }

  const saveNick = (v) => { setNickname(v); localStorage.setItem('typingNickname', v) }

  async function handleCreate() {
    if (!nickname.trim()) { setError('Enter your nickname first'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const { error: err } = await supabase.from('rooms').insert({
      id: code,
      passage_index: lastPassageIndex ?? 0,
      language: lastLanguage,
      difficulty: lastDifficulty,
      created_by: userId,
    })
    setLoading(false)
    if (err) { setError('Could not create room. Try again.'); return }
    onRoomJoin({ id: code, passage_index: lastPassageIndex ?? 0, language: lastLanguage, difficulty: lastDifficulty, created_by: userId, nickname: nickname.trim(), isCreator: true })
    setStep('room')
    setSubmitted(false)
    setRoomClosed(false)
    doFetchScores(code)
  }

  async function handleJoin() {
    if (!nickname.trim()) { setError('Enter your nickname first'); return }
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) { setError('Room code must be 6 characters'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('rooms').select('*').eq('id', code).single()
    setLoading(false)
    if (err || !data) { setError('Room not found. Check the code and try again.'); return }
    if (data.is_closed) { setError('This room has already ended.'); return }
    onRoomJoin({ ...data, nickname: nickname.trim(), isCreator: false })
    setStep('room')
    setSubmitted(false)
    setRoomClosed(data.is_closed)
    doFetchScores(code)
  }

  async function handleSubmit() {
    if (!activeRoom || !userId) return
    setSubmitting(true); setError('')
    const { error: err } = await supabase.from('room_scores').upsert({
      room_id: activeRoom.id,
      user_id: userId,
      nickname: activeRoom.nickname,
      wpm: lastWpm,
      accuracy: lastAccuracy,
    }, { onConflict: 'room_id,user_id' })
    setSubmitting(false)
    if (err) { setError('Could not submit score. Try again.'); return }
    setSubmitted(true)
    doFetchScores(activeRoom.id)
  }

  async function handleEndRoom() {
    await supabase.from('rooms').update({ is_closed: true }).eq('id', activeRoom.id)
    setRoomClosed(true)
    doFetchScores(activeRoom.id)
  }

  function handleLeave() {
    clearInterval(pollRef.current)
    onRoomLeave()
    setStep('menu')
    setScores([])
    setSubmitted(false)
    setJoinCode('')
    setError('')
    setRoomClosed(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(activeRoom.id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!show) return null

  const isCreator = activeRoom?.created_by === userId
  const hasScore = lastWpm > 0
  const canSubmit = hasScore && !submitted && !roomClosed

  // ─── Shared styles ───────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }
  const card = {
    background: colors.card, borderRadius: '1.5rem', padding: '2rem',
    maxWidth: '480px', width: '100%', direction: 'ltr',
    border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.5)'}`,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    maxHeight: '90vh', overflowY: 'auto',
  }
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.9rem', boxSizing: 'border-box',
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.7)'}`,
    borderRadius: '0.6rem', color: colors.text, fontSize: '0.95rem', outline: 'none',
  }
  const btnPrimary = {
    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    color: 'white', border: 'none', borderRadius: '0.75rem',
    padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
  }
  const closeBtn = {
    background: 'none', border: 'none', color: colors.textSecondary,
    fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
  }

  // ─── MENU VIEW ───────────────────────────────────────────
  if (step === 'menu' || !activeRoom) {
    return (
      <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>👥 Group Challenge</h2>
            <button onClick={onClose} style={closeBtn}>×</button>
          </div>
          <p style={{ color: colors.textSecondary, fontSize: '0.87rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
            Create a room and share the code with friends. Everyone types the same passage — scores appear on a live leaderboard.
          </p>

          {/* Nickname input */}
          <label style={{ display: 'block', fontWeight: 700, color: colors.text, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Your Nickname</label>
          <input
            value={nickname} onChange={e => saveNick(e.target.value)}
            placeholder="Enter nickname..." maxLength={20} style={inputStyle}
          />

          {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0.5rem 0 0' }}>{error}</p>}

          {/* Create Room */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.12))',
            border: '1px solid rgba(6,182,212,0.3)', borderRadius: '1rem', padding: '1.1rem', marginTop: '1.25rem',
          }}>
            <h3 style={{ margin: '0 0 0.4rem', color: '#06b6d4', fontWeight: 800, fontSize: '1rem' }}>🏠 Create Room</h3>
            <p style={{ margin: '0 0 0.75rem', color: colors.textSecondary, fontSize: '0.8rem' }}>
              Uses the current passage ({LANG_FLAGS[lastLanguage] || '🌍'} {lastLanguage} · {lastDifficulty}). Share the 6-letter code with friends.
            </p>
            <button onClick={handleCreate} disabled={loading} style={{ ...btnPrimary, width: 'auto' }}>
              {loading ? 'Creating…' : '+ Create Room'}
            </button>
          </div>

          {/* Join Room */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
            border: '1px solid rgba(168,85,247,0.3)', borderRadius: '1rem', padding: '1.1rem', marginTop: '0.9rem',
          }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#a855f7', fontWeight: 800, fontSize: '1rem' }}>🔑 Join Room</h3>
            <input
              value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="A B C 1 2 3" maxLength={6}
              style={{ ...inputStyle, letterSpacing: '0.25em', fontWeight: 800, fontSize: '1.2rem', textAlign: 'center', marginBottom: '0.6rem' }}
            />
            <button onClick={handleJoin} disabled={loading} style={{ ...btnPrimary, background: 'linear-gradient(to right, #a855f7, #ec4899)' }}>
              {loading ? 'Joining…' : '→ Join Room'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── ROOM VIEW ───────────────────────────────────────────
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.3rem', fontWeight: 800, color: colors.text }}>👥 Group Room</h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.78rem' }}>
              {LANG_FLAGS[activeRoom.language] || '🌍'} {activeRoom.language} · {activeRoom.difficulty}
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        {/* Room Code display */}
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)',
          borderRadius: '1rem', padding: '0.85rem 1.1rem', marginBottom: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.1em' }}>ROOM CODE — share with friends</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '0.3em', color: '#06b6d4', fontFamily: 'monospace' }}>
              {activeRoom.id}
            </p>
          </div>
          <button onClick={copyCode} style={{
            background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.15)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(6,182,212,0.3)'}`,
            borderRadius: '0.6rem', padding: '0.45rem 0.85rem',
            color: copied ? '#10b981' : '#06b6d4', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap',
          }}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>

        {/* Status row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            background: roomClosed ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            color: roomClosed ? '#ef4444' : '#10b981',
            border: `1px solid ${roomClosed ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            borderRadius: '1rem', padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700,
          }}>
            {roomClosed ? '🔒 Room Ended' : '🟢 Live'}
          </span>
          {submitted && (
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '1rem', padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700 }}>
              ✅ Score Submitted
            </span>
          )}
          <span style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: colors.textSecondary, borderRadius: '1rem', padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 600 }}>
            {scores.length} player{scores.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Submit score panel */}
        {canSubmit && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.12))',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.9rem', padding: '0.9rem 1rem', marginBottom: '0.85rem',
          }}>
            <p style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#10b981', fontSize: '0.88rem' }}>🏁 Ready to submit!</p>
            <p style={{ margin: '0 0 0.6rem', color: colors.textSecondary, fontSize: '0.78rem' }}>
              Your score: <strong style={{ color: colors.text }}>{lastWpm} WPM</strong> · {lastAccuracy}% accuracy
            </p>
            <button onClick={handleSubmit} disabled={submitting} style={{ ...btnPrimary, background: 'linear-gradient(to right, #10b981, #06b6d4)', width: '100%' }}>
              {submitting ? 'Submitting…' : '📤 Submit My Score'}
            </button>
          </div>
        )}

        {!hasScore && !submitted && !roomClosed && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px dashed ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.8)'}`,
            borderRadius: '0.9rem', padding: '0.75rem 1rem', marginBottom: '0.85rem',
            color: colors.textSecondary, fontSize: '0.82rem', textAlign: 'center',
          }}>
            ⌨️ Close this modal, type the passage, then come back to submit your score
          </div>
        )}

        {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0 0 0.75rem' }}>{error}</p>}

        {/* Leaderboard */}
        <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: colors.text, fontSize: '0.87rem' }}>🏆 Leaderboard</p>
        {scores.length === 0 ? (
          <p style={{ color: colors.textSecondary, fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
            No scores yet — be the first!
          </p>
        ) : (
          <div style={{ marginBottom: '0.75rem' }}>
            {scores.map((s, i) => {
              const isMe = s.user_id === userId
              return (
                <div key={s.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.55rem 0.75rem', borderRadius: '0.6rem', marginBottom: '0.35rem',
                  background: isMe
                    ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)')
                    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  border: isMe ? '1px solid rgba(6,182,212,0.35)' : '1px solid transparent',
                }}>
                  <span style={{ fontSize: '1.1rem', width: '1.6rem', textAlign: 'center', flexShrink: 0 }}>
                    {medals[i] || `${i + 1}`}
                  </span>
                  <span style={{ flex: 1, fontWeight: isMe ? 800 : 600, color: colors.text, fontSize: '0.87rem' }}>
                    {s.nickname}{isMe ? ' (you)' : ''}
                  </span>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, color: '#06b6d4', fontSize: '1rem' }}>{s.wpm}</span>
                    <span style={{ color: colors.textSecondary, fontSize: '0.72rem', marginLeft: '0.2rem' }}>WPM</span>
                    <span style={{ color: colors.textSecondary, fontSize: '0.72rem', marginLeft: '0.5rem' }}>{s.accuracy}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!roomClosed && (
          <p style={{ color: colors.textSecondary, fontSize: '0.67rem', textAlign: 'center', margin: '0 0 0.75rem' }}>
            ↻ Leaderboard refreshes every 5 seconds
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {isCreator && !roomClosed && (
            <button onClick={handleEndRoom} style={{
              flex: 1, padding: '0.55rem', background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: '0.65rem',
              color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
            }}>🔒 End Room</button>
          )}
          <button onClick={handleLeave} style={{
            flex: 1, padding: '0.55rem',
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.7)'}`,
            borderRadius: '0.65rem', color: colors.textSecondary, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
          }}>← Leave Room</button>
        </div>
      </div>
    </div>
  )
}
