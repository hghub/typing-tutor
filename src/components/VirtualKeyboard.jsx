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

const ROW_OFFSETS = ['0', '1.1rem', '2.2rem']

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return '100, 116, 139'
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`
}

export default function VirtualKeyboard({ nextChar, isDark, colors }) {
  const [legendOpen, setLegendOpen] = useState(false)

  const lower = nextChar ? nextChar.toLowerCase() : null
  const isUpper = nextChar ? /[A-Z]/.test(nextChar) : false
  const isSpace = nextChar === ' '
  const finger = lower && FINGER_MAP[lower] ? FINGER_MAP[lower] : null
  const fingerColor = finger ? FINGER_COLORS[finger] : null
  const fingerLabel = finger ? FINGER_LABELS[finger] : null

  const getKeyStyle = (key) => {
    const isNext = !isSpace && lower === key
    const f = FINGER_MAP[key]
    const fc = FINGER_COLORS[f] || '#64748b'
    return {
      width: '2.1rem',
      height: '2.1rem',
      borderRadius: '0.4rem',
      border: `2px solid ${isNext ? fc : 'transparent'}`,
      background: isNext
        ? fc
        : `rgba(${hexToRgb(fc)}, ${isDark ? 0.14 : 0.18})`,
      color: isNext ? 'white' : colors.text,
      fontWeight: isNext ? 800 : 600,
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      cursor: 'default',
      userSelect: 'none',
      transition: 'all 0.1s',
      transform: isNext ? 'scale(1.25)' : 'scale(1)',
      boxShadow: isNext ? `0 0 16px ${fc}, 0 0 4px ${fc}` : 'none',
      zIndex: isNext ? 2 : 1,
      position: 'relative',
    }
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
            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>"{nextChar}"</span>
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
          {row.map(key => (
            <div key={key} style={getKeyStyle(key)}>{key}</div>
          ))}
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
