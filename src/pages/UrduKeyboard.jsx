import { useState, useCallback, useEffect, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { latinToUrdu, getAllMappings } from '../data/urduPhoneticMap'
import { Link } from 'react-router-dom'

const NASTALIQ_URL = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap'

export default function UrduKeyboard() {
  const { isDark, colors } = useTheme()
  const [latin, setLatin]   = useState('')
  const [urdu,  setUrdu]    = useState('')
  const [copied, setCopied] = useState(false)
  const [showRef, setShowRef] = useState(false)
  const inputRef = useRef(null)

  // Voice typing state
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)
  const hasVoiceSupport = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Load Nastaliq font only on this page
  useEffect(() => {
    if (document.querySelector(`link[href="${NASTALIQ_URL}"]`)) return
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = NASTALIQ_URL
    document.head.appendChild(link)
  }, [])

  // Cleanup recognition on unmount
  useEffect(() => () => recognitionRef.current?.abort(), [])

  const handleLatinChange = useCallback((e) => {
    const val = e.target.value
    setLatin(val)
    setUrdu(latinToUrdu(val))
  }, [])

  const handleCopy = useCallback(() => {
    if (!urdu) return
    navigator.clipboard.writeText(urdu).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [urdu])

  const handleClear = useCallback(() => {
    setLatin('')
    setUrdu('')
    setInterimText('')
    inputRef.current?.focus()
  }, [])

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'ur-PK'
    rec.interimResults = true
    rec.continuous = true
    rec.maxAlternatives = 1

    rec.onstart = () => { setVoiceActive(true); setVoiceStatus('listening') }
    rec.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) {
        setUrdu(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + final)
        setLatin('') // voice bypasses phonetic
      }
      setInterimText(interim)
    }
    rec.onerror = (e) => {
      const msg = e.error === 'not-allowed'
        ? 'Microphone access denied — please allow mic in browser settings'
        : e.error === 'network' ? 'Network error — check internet connection'
        : `Error: ${e.error}`
      setVoiceStatus(msg)
      setVoiceActive(false)
      setInterimText('')
    }
    rec.onend = () => {
      setVoiceActive(false)
      setVoiceStatus('')
      setInterimText('')
    }
    recognitionRef.current = rec
    rec.start()
  }, [])

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    setVoiceActive(false)
    setInterimText('')
    setVoiceStatus('')
  }, [])

  const allMappings = getAllMappings()
  const digraphs = allMappings.filter((m) => m.type === 'digraph')
  const singles  = allMappings.filter((m) => m.type === 'single')

  const urduTextStyle = {
    fontFamily: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif',
    direction: 'rtl',
    fontSize: '1.4rem',
    lineHeight: 2,
    letterSpacing: '0.05em',
  }

  return (
    <ToolLayout toolId="urdu-keyboard">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(to right, #f59e0b, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          🌍 Urdu Phonetic Keyboard
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Type Urdu using English phonetics — or speak directly using your microphone.
          <span style={{ color: '#f59e0b', fontWeight: 600 }}> Type "kh" → خ, "sh" → ش, "ch" → چ</span>
        </p>
      </div>

      {/* Voice Typing Panel */}
      {hasVoiceSupport && (
        <div style={{
          background: voiceActive
            ? (isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)')
            : (isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)'),
          border: `1.5px solid ${voiceActive ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: '0.85rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          transition: 'all 0.2s ease',
        }}>
          {/* Mic button */}
          <button
            onClick={voiceActive ? stopVoice : startVoice}
            style={{
              width: '3rem', height: '3rem',
              borderRadius: '50%',
              background: voiceActive ? '#ef4444' : '#f59e0b',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: voiceActive ? '0 0 0 6px rgba(239,68,68,0.2)' : 'none',
              transition: 'all 0.2s ease',
              animation: voiceActive ? 'voicePulse 1.2s ease-in-out infinite' : 'none',
            }}
            title={voiceActive ? 'Stop recording' : 'Start Urdu voice typing'}
          >
            {voiceActive ? '⏹' : '🎤'}
          </button>

          {/* Status & instructions */}
          <div style={{ flex: 1 }}>
            {voiceActive ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{
                    display: 'inline-block', width: '8px', height: '8px',
                    borderRadius: '50%', background: '#ef4444',
                    animation: 'voicePulse 0.8s ease-in-out infinite',
                  }} />
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    Listening… بولیں
                  </span>
                </div>
                {interimText && (
                  <div style={{ ...urduTextStyle, fontSize: '1.1rem', color: colors.textSecondary, opacity: 0.8 }}>
                    {interimText}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: colors.text, marginBottom: '0.15rem' }}>
                  🎤 Voice Typing (Urdu)
                </div>
                <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                  Click the mic, speak in Urdu — text appears automatically. Works best in Chrome / Edge.
                </div>
              </>
            )}
            {voiceStatus && !voiceActive && (
              <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.25rem' }}>
                ⚠️ {voiceStatus}
              </div>
            )}
          </div>

          {voiceActive && (
            <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
              Click ⏹ to stop
            </span>
          )}
        </div>
      )}

      {/* Add pulse animation via style tag */}
      <style>{`
        @keyframes voicePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.92); }
        }
      `}</style>

      {/* Two-panel input / output */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        {/* Latin input */}
        <div>
          <label style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Type phonetically (English)
          </label>
          <textarea
            ref={inputRef}
            value={latin}
            onChange={handleLatinChange}
            placeholder={'Type here using English keys…\nExamples: "pakistan" → پاکستان\n"khubsoorat" → خوبصورت'}
            rows={8}
            autoFocus
            style={{
              width: '100%',
              background: colors.card,
              border: `1.5px solid ${latin ? '#f59e0b' : colors.border}`,
              borderRadius: '0.75rem',
              padding: '0.9rem',
              color: colors.text,
              fontSize: '0.95rem',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = latin ? '#f59e0b' : colors.border }}
          />
        </div>

        {/* Urdu output */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Urdu Output (اردو)
            </label>
            {urdu && (
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(245,158,11,0.15)' : 'none',
                  border: `1px solid ${copied ? '#f59e0b' : colors.border}`,
                  color: copied ? '#f59e0b' : colors.textSecondary,
                  borderRadius: '0.4rem',
                  padding: '0.25rem 0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
          <div
            style={{
              ...urduTextStyle,
              width: '100%',
              background: colors.card,
              border: `1.5px solid ${urdu ? '#f59e0b' : colors.border}`,
              borderRadius: '0.75rem',
              padding: '0.9rem',
              color: colors.text,
              minHeight: '200px',
              wordBreak: 'break-word',
              overflowY: 'auto',
              userSelect: 'text',
            }}
          >
            {urdu || (
              <span style={{ color: colors.textSecondary, fontSize: '0.85rem', fontFamily: 'inherit', direction: 'ltr', fontStyle: 'italic' }}>
                Urdu text will appear here…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(latin || urdu) && (
          <button
            onClick={handleClear}
            style={{
              background: 'none', border: `1px solid ${colors.border}`,
              color: colors.textSecondary, borderRadius: '0.5rem',
              padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem',
            }}
          >
            ✕ Clear
          </button>
        )}
        <button
          onClick={() => setShowRef((s) => !s)}
          style={{
            background: showRef ? 'rgba(245,158,11,0.12)' : 'none',
            border: `1px solid ${showRef ? '#f59e0b' : colors.border}`,
            color: showRef ? '#f59e0b' : colors.textSecondary,
            borderRadius: '0.5rem', padding: '0.4rem 0.9rem',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
        >
          📖 {showRef ? 'Hide' : 'Show'} Reference
        </button>
        {urdu && (
          <Link
            to="/tools/doc-composer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              border: `1px solid ${colors.border}`, color: '#3b82f6',
              padding: '0.4rem 0.9rem', borderRadius: '0.5rem',
              textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            📄 Use in Doc Composer
          </Link>
        )}
      </div>

      {/* Reference table */}
      {showRef && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem' }}>
            Phonetic Reference Chart
          </h2>

          {/* Digraphs */}
          <p style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Two-Letter Combos (digraphs)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {digraphs.map(({ latin: l, urdu: u }) => (
              <span key={l} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '0.4rem', padding: '0.2rem 0.5rem', fontSize: '0.82rem',
              }}>
                <code style={{ color: '#f59e0b', fontWeight: 700 }}>{l}</code>
                <span style={{ color: colors.textSecondary }}>→</span>
                <span style={{ ...urduTextStyle, fontSize: '1rem', lineHeight: 1 }}>{u}</span>
              </span>
            ))}
          </div>

          {/* Singles */}
          <p style={{ color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Single Letters
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {singles.map(({ latin: l, urdu: u }) => (
              <span key={l} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: '0.4rem', padding: '0.2rem 0.5rem', fontSize: '0.82rem',
              }}>
                <code style={{ color: '#06b6d4', fontWeight: 700 }}>{l}</code>
                <span style={{ color: colors.textSecondary }}>→</span>
                <span style={{ ...urduTextStyle, fontSize: '1rem', lineHeight: 1 }}>{u}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Practice examples */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
      }}>
        <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
          Try These Examples
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            ['pakistan', 'پاکستان'],
            ['shukriya', 'شکریا'],
            ['khubsoorat', 'خوبصورت'],
            ['adaab', 'ادب'],
            ['zindagi', 'زندگی'],
            ['mehnat', 'محنت'],
          ].map(([l, u]) => (
            <button
              key={l}
              onClick={() => { setLatin(l); setUrdu(latinToUrdu(l)) }}
              style={{
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                color: colors.text,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border }}
            >
              <code style={{ color: '#f59e0b' }}>{l}</code>
              <span style={{ color: colors.textSecondary }}>→</span>
              <span style={{ ...urduTextStyle, fontSize: '1rem', lineHeight: 1 }}>{u}</span>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
