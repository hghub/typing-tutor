import { useState } from 'react'

const FINGER_MAP = {
  q:'lp', a:'lp', z:'lp',
  w:'lr', s:'lr', x:'lr',
  e:'lm', d:'lm', c:'lm',
  r:'li', f:'li', v:'li', t:'li', g:'li', b:'li',
  y:'ri', h:'ri', n:'ri', u:'ri', j:'ri', m:'ri',
  i:'rm', k:'rm',
  o:'rr', l:'rr',
  p:'rp',
}

const FINGER_COLORS = {
  lp: '#ef4444', lr: '#f97316', lm: '#eab308',
  li: '#22c55e', ri: '#06b6d4', rm: '#3b82f6',
  rr: '#8b5cf6', rp: '#ec4899',
}

const FINGER_LABELS = {
  lp: 'Left Pinky', lr: 'Left Ring', lm: 'Left Middle',
  li: 'Left Index', ri: 'Right Index', rm: 'Right Middle',
  rr: 'Right Ring', rp: 'Right Pinky',
}

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
]

// Urdu Phonetic keyboard layout (most common in Pakistan)
const URDU_LAYOUT = {
  q:'ق', w:'و', e:'ع', r:'ر', t:'ت', y:'ے', u:'ء', i:'ی', o:'ہ', p:'پ',
  a:'ا', s:'س', d:'د', f:'ف', g:'گ', h:'ح', j:'ج', k:'ک', l:'ل',
  z:'ز', x:'ش', c:'چ', v:'ط', b:'ب', n:'ن', m:'م',
}

// Reverse map: Urdu char → English key
const URDU_TO_KEY = Object.fromEntries(
  Object.entries(URDU_LAYOUT).map(([k, v]) => [v, k])
)

const ROW_OFFSETS = ['0', '1.1rem', '2.2rem']

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return '100, 116, 139'
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`
}

export default function VirtualKeyboard({ nextChar, isDark, colors, language }) {
  const [legendOpen, setLegendOpen] = useState(false)

  const isUrdu = language === 'urdu'
  const isSpace = nextChar === ' '

  // For Urdu: map the Urdu char to its physical key; for English: use the char directly
  const targetKey = isSpace ? null
    : isUrdu ? (URDU_TO_KEY[nextChar] || null)
    : (nextChar ? nextChar.toLowerCase() : null)

  const isUpper = !isUrdu && nextChar && /[A-Z]/.test(nextChar)
  const finger = targetKey && FINGER_MAP[targetKey] ? FINGER_MAP[targetKey] : null
  const fingerColor = finger ? FINGER_COLORS[finger] : null
  const fingerLabel = finger ? FINGER_LABELS[finger] : null

  const getKeyStyle = (key) => {
    const isNext = !isSpace && targetKey === key
    const f = FINGER_MAP[key]
    const fc = FINGER_COLORS[f] || '#64748b'
    return {
      width: isUrdu ? '2.3rem' : '2.1rem',
      height: isUrdu ? '2.6rem' : '2.1rem',
      borderRadius: '0.4rem',
      border: `2px solid ${isNext ? fc : 'transparent'}`,
      background: isNext
        ? fc
        : `rgba(${hexToRgb(fc)}, ${isDark ? 0.14 : 0.18})`,
      color: isNext ? 'white' : colors.text,
      fontWeight: isNext ? 800 : 600,
      fontSize: '0.75rem',
      display: 'flex',
      flexDirection: isUrdu ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isUrdu ? '0.05rem' : 0,
      textTransform: isUrdu ? 'none' : 'uppercase',
      cursor: 'default',
      userSelect: 'none',
      transition: 'all 0.1s',
      transform: isNext ? 'scale(1.25)' : 'scale(1)',
      boxShadow: isNext ? `0 0 16px ${fc}, 0 0 4px ${fc}` : 'none',
      zIndex: isNext ? 2 : 1,
      position: 'relative',
    }
  }

  const renderKey = (key) => {
    if (isUrdu) {
      return (
        <div key={key} style={getKeyStyle(key)}>
          <span style={{ fontSize: '0.5rem', opacity: 0.55, lineHeight: 1 }}>{key.toUpperCase()}</span>
          <span style={{ fontSize: '1rem', lineHeight: 1, fontFamily: 'Noto Nastaliq Urdu, Jameel Noori Nastaleeq, serif' }}>
            {URDU_LAYOUT[key] || key}
          </span>
        </div>
      )
    }
    return <div key={key} style={getKeyStyle(key)}>{key}</div>
  }

  return (
    <div style={{
      direction: 'ltr',
      marginTop: '0.75rem',
      padding: '0.875rem 0.5rem 0.75rem',
      background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)',
      borderRadius: '1rem',
      border: `1px solid ${isDark ? 'rgba(71,85,105,0.4)' : 'rgba(203,213,225,0.7)'}`,
    }}>
      {/* Language label */}
      {isUrdu && (
        <div style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa',
            background: 'rgba(167,139,250,0.15)', padding: '0.15rem 0.6rem',
            borderRadius: '1rem', letterSpacing: '0.05em',
          }}>🇵🇰 Urdu Phonetic Layout</span>
        </div>
      )}

      {/* Finger hint */}
      <div style={{ textAlign: 'center', marginBottom: '0.65rem', minHeight: '1.6rem' }}>
        {finger && !isSpace && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.78rem', fontWeight: 700, color: fingerColor,
            background: `rgba(${hexToRgb(fingerColor)}, 0.14)`,
            padding: '0.22rem 0.8rem', borderRadius: '2rem',
          }}>
            {isUpper && <span style={{ opacity: 0.8 }}>⇧ Shift +</span>}
            <span>{fingerLabel}</span>
            <span style={{ opacity: 0.7 }}>→</span>
            {isUrdu
              ? <span style={{ fontFamily: 'Noto Nastaliq Urdu, serif', fontSize: '1.1rem' }}>"{nextChar}"</span>
              : <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>"{nextChar}"</span>
            }
            {isUrdu && targetKey && (
              <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(press {targetKey.toUpperCase()})</span>
            )}
          </span>
        )}
        {isSpace && (
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
            Both Thumbs → <span style={{ fontFamily: 'monospace' }}>Space</span>
          </span>
        )}
        {!finger && !isSpace && nextChar && (
          <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
            Next: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>"{nextChar}"</span>
          </span>
        )}
      </div>

      {/* Key rows */}
      {ROWS.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex', justifyContent: 'center',
          gap: '0.28rem', marginBottom: '0.28rem',
          paddingLeft: ROW_OFFSETS[ri],
        }}>
          {row.map(key => renderKey(key))}
        </div>
      ))}

      {/* Space bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.28rem' }}>
        <div style={{
          width: '9.5rem', height: '1.8rem', borderRadius: '0.4rem',
          border: `2px solid ${isSpace ? '#94a3b8' : 'transparent'}`,
          background: isSpace ? '#94a3b8' : `rgba(148,163,184,${isDark ? 0.14 : 0.18})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.62rem', color: isSpace ? 'white' : colors.textSecondary,
          fontWeight: 600, letterSpacing: '0.08em',
          transform: isSpace ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isSpace ? '0 0 14px rgba(148,163,184,0.7)' : 'none',
          cursor: 'default', userSelect: 'none', transition: 'all 0.1s',
        }}>SPACE</div>
      </div>

      {/* Finger legend toggle */}
      <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
        <button
          onClick={() => setLegendOpen(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: colors.textSecondary, fontSize: '0.65rem',
            textDecoration: 'underline dotted', padding: 0,
          }}
        >
          {legendOpen ? 'hide legend' : 'finger color guide'}
        </button>
      </div>

      {legendOpen && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.4rem',
          flexWrap: 'wrap', marginTop: '0.5rem', padding: '0 0.5rem',
        }}>
          {Object.entries(FINGER_LABELS).map(([f, label]) => (
            <span key={f} style={{
              fontSize: '0.58rem', fontWeight: 600,
              color: FINGER_COLORS[f],
              background: `rgba(${hexToRgb(FINGER_COLORS[f])}, 0.14)`,
              padding: '0.15rem 0.4rem', borderRadius: '0.3rem',
              border: `1px solid rgba(${hexToRgb(FINGER_COLORS[f])}, 0.3)`,
            }}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
