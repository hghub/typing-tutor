import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const CONNECTION_STATES = {
  idle: null,
  connecting: { color: '#f59e0b', icon: '🔄', text: 'Connecting to server...' },
  connected: { color: '#10b981', icon: '🟢', text: 'Connected' },
  error: { color: '#ef4444', icon: '❌', text: 'Server unavailable' },
  disconnected: { color: '#ef4444', icon: '💔', text: 'Connection lost' },
}

export default function BattleModal({
  show, onClose,
  // battle state controlled by App
  battleStep, setBattleStep,
  activeBattle, setActiveBattle,
  // live typing state from App
  myProgress, myWpm, finished, passage,
  // current session info (for creating room)
  currentPassage, currentLanguage, currentDifficulty,
  // callbacks to App
  onBattleStart, onBattleEnd,
  userId, isDark, colors,
}) {
  const [nickname, setNickname] = useState(() => localStorage.getItem('typingNickname') || '')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connStatus, setConnStatus] = useState('idle')
  const [opponentNickname, setOpponentNickname] = useState('')
  const [opponentProgress, setOpponentProgress] = useState(0)
  const [opponentWpm, setOpponentWpm] = useState(0)
  const [opponentFinished, setOpponentFinished] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const channelRef = useRef(null)
  const countdownRef = useRef(null)
  const expireTimerRef = useRef(null)
  const myWpmRef = useRef(myWpm)
  const stepRef = useRef(battleStep)
  const opponentNicknameRef = useRef(opponentNickname)

  // Keep refs in sync
  useEffect(() => { myWpmRef.current = myWpm }, [myWpm])
  useEffect(() => { stepRef.current = battleStep }, [battleStep])
  useEffect(() => { opponentNicknameRef.current = opponentNickname }, [opponentNickname])

  // Send live progress to opponent (throttle: every 3% change or so)
  const lastSentProgress = useRef(-1)
  useEffect(() => {
    if (!channelRef.current || battleStep !== 'typing') return
    if (Math.abs(myProgress - lastSentProgress.current) < 2 && myProgress < 98) return
    lastSentProgress.current = myProgress
    channelRef.current.send({
      type: 'broadcast', event: 'progress',
      payload: { progress: myProgress, userId },
    }).catch(() => {})
  }, [myProgress, battleStep])

  // When I finish typing, broadcast result
  useEffect(() => {
    if (!finished || battleStep !== 'typing' || !channelRef.current) return
    channelRef.current.send({
      type: 'broadcast', event: 'finished',
      payload: { wpm: myWpm, userId, nickname: activeBattle?.nickname },
    }).catch(() => {})
    // If opponent already finished before me
    if (opponentFinished) resolveResult(myWpm, opponentWpm, false)
  }, [finished, battleStep])

  // When opponent finishes
  useEffect(() => {
    if (!opponentFinished || battleStep !== 'typing') return
    setOpponentProgress(100)
    // I'm still going — show their bar at 100% but don't end yet
    // If I've also finished, resolve now
    if (finished) resolveResult(myWpmRef.current, opponentWpm, false)
  }, [opponentFinished])

  function resolveResult(myW, oppW, disconnected = false) {
    clearInterval(countdownRef.current)
    setResult({
      won: disconnected || myW >= oppW,
      tied: !disconnected && myW === oppW,
      myWpm: myW, opponentWpm: oppW,
      opponentNickname: opponentNicknameRef.current,
      disconnected,
    })
    setBattleStep('result')
  }

  function setupChannel(code, nick) {
    setConnStatus('connecting')
    setError('')

    const channel = supabase.channel(`battle:${code}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        if (users.length >= 2 && (stepRef.current === 'waiting')) {
          const opp = users.find(u => u.userId !== userId)
          if (opp?.nickname) setOpponentNickname(opp.nickname)
          clearTimeout(expireTimerRef.current)
          doCountdown(code)
        }
      })
      .on('presence', { event: 'leave' }, () => {
        if (stepRef.current === 'typing' || stepRef.current === 'countdown') {
          resolveResult(myWpmRef.current, 0, true)
        } else if (stepRef.current === 'waiting') {
          // Another player left waiting room — ignore, keep waiting
        }
      })
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        if (payload.userId !== userId) setOpponentProgress(payload.progress)
      })
      .on('broadcast', { event: 'finished' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setOpponentWpm(payload.wpm)
          if (payload.nickname) setOpponentNickname(payload.nickname)
          setOpponentFinished(true)
        }
      })
      .on('broadcast', { event: 'countdown_tick' }, ({ payload }) => {
        // Non-creator syncs countdown from creator's broadcasts
        setCountdown(payload.count)
        if (payload.count === 0) {
          clearInterval(countdownRef.current)
          setBattleStep('typing')
          onBattleStart()
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnStatus('connected')
          await channel.track({ userId, nickname: nick }).catch(() => {})
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnStatus('error')
          setError('Could not connect to battle server. The server may be busy — please try again in a moment.')
          setBattleStep('menu')
        } else if (status === 'CLOSED') {
          if (stepRef.current === 'typing' || stepRef.current === 'countdown') {
            setConnStatus('disconnected')
            setError('Connection lost. Trying to reconnect...')
          }
        }
      })

    channelRef.current = channel
  }

  function doCountdown(code) {
    setBattleStep('countdown')
    let count = 3
    setCountdown(count)
    countdownRef.current = setInterval(() => {
      count--
      setCountdown(count)
      // Broadcast each tick so both sides stay in sync
      channelRef.current?.send({
        type: 'broadcast', event: 'countdown_tick', payload: { count },
      }).catch(() => {})
      if (count <= 0) {
        clearInterval(countdownRef.current)
        setBattleStep('typing')
        onBattleStart()
      }
    }, 1000)
  }

  function cleanup() {
    clearInterval(countdownRef.current)
    clearTimeout(expireTimerRef.current)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current).catch(() => {})
      channelRef.current = null
    }
  }

  async function handleCreate() {
    if (!nickname.trim()) { setError('Enter your nickname first'); return }
    if (!currentPassage) { setError('Please start a typing test first, then create a battle.'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const { error: err } = await supabase.from('battles').insert({
      id: code,
      passage_text: currentPassage,
      language: currentLanguage,
      difficulty: currentDifficulty,
      created_by: userId,
    })
    setLoading(false)
    if (err) { setError('Could not create battle room. Try again.'); return }

    const nick = nickname.trim()
    setActiveBattle({ code, isCreator: true, nickname: nick, language: currentLanguage, difficulty: currentDifficulty })
    setupChannel(code, nick)
    setBattleStep('waiting')

    // Auto-expire after 5 minutes if no opponent joins
    expireTimerRef.current = setTimeout(() => {
      if (stepRef.current === 'waiting') {
        setError('No opponent joined within 5 minutes. The room has expired.')
        cleanup()
        setBattleStep('menu')
        setActiveBattle(null)
        onBattleEnd()
      }
    }, 5 * 60 * 1000)
  }

  async function handleJoin() {
    if (!nickname.trim()) { setError('Enter your nickname first'); return }
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) { setError('Enter the full 6-character room code'); return }
    setLoading(true); setError('')

    const { data, error: err } = await supabase.from('battles').select('*').eq('id', code).single()
    setLoading(false)
    if (err || !data) { setError('Battle room not found. Double-check the code.'); return }
    if (new Date(data.expires_at) < new Date()) {
      setError('This battle room has expired. Ask your opponent to create a new one.')
      return
    }

    const nick = nickname.trim()
    setActiveBattle({ code, isCreator: false, nickname: nick, passage_text: data.passage_text, language: data.language, difficulty: data.difficulty })
    setupChannel(code, nick)
    setBattleStep('waiting')
  }

  function handleLeave() {
    cleanup()
    setBattleStep('menu')
    setActiveBattle(null)
    setOpponentProgress(0)
    setOpponentWpm(0)
    setOpponentFinished(false)
    setResult(null)
    setError('')
    setConnStatus('idle')
    setJoinCode('')
    lastSentProgress.current = -1
    onBattleEnd()
  }

  function copyCode() {
    if (!activeBattle?.code) return
    navigator.clipboard.writeText(activeBattle.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Shared styles ────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }
  const card = {
    background: colors.card, borderRadius: '1.5rem', padding: '2rem',
    maxWidth: '460px', width: '100%', direction: 'ltr',
    border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.5)'}`,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    maxHeight: '90vh', overflowY: 'auto',
  }
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.9rem', boxSizing: 'border-box',
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.7)'}`,
    borderRadius: '0.6rem', color: colors.text, fontSize: '0.95rem', outline: 'none',
  }
  const btnPrimary = (bg = 'linear-gradient(to right, #ef4444, #f97316)') => ({
    background: bg, color: 'white', border: 'none', borderRadius: '0.75rem',
    padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
  })
  const closeBtn = { background: 'none', border: 'none', color: colors.textSecondary, fontSize: '1.5rem', cursor: 'pointer' }

  // ─── CONNECTION STATUS PILL ───────────────────────────────
  const connInfo = CONNECTION_STATES[connStatus]

  // ─── PROGRESS BAR OVERLAY (visible during typing even if modal closed) ───
  if (battleStep === 'typing' || battleStep === 'countdown') {
    const prog = (val, color) => (
      <div style={{ flex: 1 }}>
        <div style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${val}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.3s ease' }} />
        </div>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: colors.textSecondary, textAlign: 'center' }}>{val}%</p>
      </div>
    )

    return (
      <div style={{
        position: 'fixed', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
        background: colors.card, borderRadius: '1rem', padding: '0.85rem 1.25rem',
        border: '2px solid rgba(239,68,68,0.5)', boxShadow: '0 8px 32px rgba(239,68,68,0.25)',
        zIndex: 999, direction: 'ltr', minWidth: '320px', maxWidth: '500px', width: '90vw',
      }}>
        {battleStep === 'countdown' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#ef4444', fontSize: '0.82rem' }}>⚔️ Battle starting in...</p>
            <p style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>{countdown}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ef4444' }}>⚔️ LIVE BATTLE</span>
              <span style={{ fontSize: '0.68rem', color: colors.textSecondary, fontFamily: 'monospace' }}>{activeBattle?.code}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.68rem', fontWeight: 700, color: '#06b6d4' }}>
                  YOU ({activeBattle?.nickname})
                </p>
                {prog(Math.min(myProgress, 100), '#06b6d4')}
              </div>
              <div style={{ alignSelf: 'center', fontWeight: 900, color: colors.textSecondary, fontSize: '0.9rem' }}>vs</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.68rem', fontWeight: 700, color: '#f97316' }}>
                  {opponentNickname || 'Opponent'}{opponentFinished ? ' ✅' : ''}
                </p>
                {prog(Math.min(opponentProgress, 100), '#f97316')}
              </div>
            </div>
            {connStatus === 'disconnected' && (
              <p style={{ margin: '0.5rem 0 0', color: '#ef4444', fontSize: '0.72rem', textAlign: 'center' }}>
                🔄 Connection lost — trying to reconnect...
              </p>
            )}
          </>
        )}
      </div>
    )
  }

  // ─── RESULT ────────────────────────────────────────────────
  if (battleStep === 'result' && result) {
    return (
      <div style={overlay}>
        <div style={{ ...card, textAlign: 'center', border: `2px solid ${result.won && !result.tied ? 'rgba(16,185,129,0.6)' : result.tied ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.6)'}` }}>
          <p style={{
            fontSize: '2.5rem', margin: '0 0 0.5rem', fontWeight: 900,
            background: result.disconnected
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : result.tied
                ? 'linear-gradient(to right, #f59e0b, #f97316)'
                : result.won
                  ? 'linear-gradient(to right, #10b981, #06b6d4)'
                  : 'linear-gradient(to right, #ef4444, #f97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {result.disconnected ? '🏆 Opponent Left!' : result.tied ? '🤝 Tie!' : result.won ? '🏆 You Win!' : '💪 You Lost'}
          </p>
          {result.disconnected && (
            <p style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 1rem' }}>
              Opponent disconnected — you win by default!
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '1.25rem 0' }}>
            <div>
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>YOU</p>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '2rem', color: result.won || result.tied ? '#10b981' : '#ef4444' }}>{result.myWpm}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary }}>WPM</p>
            </div>
            <div style={{ alignSelf: 'center', color: colors.textSecondary, fontWeight: 700, fontSize: '1.2rem' }}>vs</div>
            <div>
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>{result.opponentNickname || 'OPPONENT'}</p>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '2rem', color: result.won && !result.tied ? '#ef4444' : '#10b981' }}>
                {result.disconnected ? '—' : result.opponentWpm}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary }}>{result.disconnected ? 'left' : 'WPM'}</p>
            </div>
          </div>
          {!result.disconnected && !result.tied && (
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              {result.won
                ? `You were ${result.myWpm - result.opponentWpm} WPM faster! 🔥`
                : `${result.opponentWpm - result.myWpm} WPM behind — try again!`}
            </p>
          )}
          <button onClick={handleLeave} style={btnPrimary('linear-gradient(to right, #06b6d4, #3b82f6)')}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // ─── WAITING FOR OPPONENT ────────────────────────────────
  if (battleStep === 'waiting') {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text, margin: '0 0 0.5rem' }}>⚔️ Waiting for Opponent</p>

            {/* Connection status */}
            {connInfo && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: `rgba(${connStatus === 'connected' ? '16,185,129' : connStatus === 'error' ? '239,68,68' : '245,158,11'},0.15)`, border: `1px solid ${connInfo.color}40`, borderRadius: '1rem', padding: '0.25rem 0.75rem', marginBottom: '1rem', fontSize: '0.78rem', fontWeight: 700, color: connInfo.color }}>
                <span>{connInfo.icon}</span><span>{connInfo.text}</span>
              </div>
            )}

            {/* Room code */}
            <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.1em' }}>SHARE THIS CODE WITH YOUR OPPONENT</p>
              <p style={{ margin: '0.25rem 0', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.3em', color: '#ef4444', fontFamily: 'monospace' }}>
                {activeBattle?.code}
              </p>
              <button onClick={copyCode} style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)', border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '0.5rem', padding: '0.35rem 1rem', color: copied ? '#10b981' : '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </button>
            </div>

            {/* Animated dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite` }} />
              ))}
            </div>

            <p style={{ color: colors.textSecondary, fontSize: '0.82rem', margin: '0 0 1.25rem' }}>
              Room expires in <strong>5 minutes</strong> if no one joins
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
              </div>
            )}

            <button onClick={handleLeave} style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: `1px solid ${isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.7)'}`, borderRadius: '0.65rem', padding: '0.55rem 1.5rem', color: colors.textSecondary, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── MENU ────────────────────────────────────────────────
  if (!show) return null

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>⚔️ 1v1 Live Battle</h2>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>
        <p style={{ color: colors.textSecondary, fontSize: '0.87rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
          Race against a friend in real-time. Both type the same passage — live progress bars, instant result.
        </p>

        {/* Nickname */}
        <label style={{ display: 'block', fontWeight: 700, color: colors.text, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Your Nickname</label>
        <input value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('typingNickname', e.target.value) }} placeholder="Enter nickname..." maxLength={20} style={{ ...inputStyle, marginBottom: '1.25rem' }} />

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
          </div>
        )}

        {/* Create Battle */}
        <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.12))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '1rem', padding: '1.1rem', marginBottom: '0.9rem' }}>
          <h3 style={{ margin: '0 0 0.4rem', color: '#ef4444', fontWeight: 800, fontSize: '1rem' }}>🏠 Create Battle Room</h3>
          <p style={{ margin: '0 0 0.75rem', color: colors.textSecondary, fontSize: '0.8rem' }}>
            Uses the current passage. Share the code — opponent joins and the race starts automatically.
          </p>
          <button onClick={handleCreate} disabled={loading} style={{ background: 'linear-gradient(to right, #ef4444, #f97316)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {loading ? 'Creating…' : '+ Create Room'}
          </button>
        </div>

        {/* Join Battle */}
        <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '1rem', padding: '1.1rem' }}>
          <h3 style={{ margin: '0 0 0.6rem', color: '#06b6d4', fontWeight: 800, fontSize: '1rem' }}>🔑 Join Battle Room</h3>
          <input
            value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="A B C 1 2 3" maxLength={6}
            style={{ ...inputStyle, letterSpacing: '0.25em', fontWeight: 800, fontSize: '1.2rem', textAlign: 'center', marginBottom: '0.6rem' }}
          />
          <button onClick={handleJoin} disabled={loading} style={{ ...btnPrimary('linear-gradient(to right, #06b6d4, #3b82f6)'), width: '100%' }}>
            {loading ? 'Joining…' : '→ Join Battle'}
          </button>
        </div>
      </div>
    </div>
  )
}

