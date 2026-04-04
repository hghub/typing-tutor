import { useState } from 'react'

const MIN_LENGTH = 20

const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFF]/

function detectDir(text) {
  return RTL_REGEX.test(text) ? 'rtl' : 'ltr'
}

export default function CustomPassagePanel({ colors, isDark, onStart }) {
  const [text, setText] = useState('')

  const isValid = text.trim().length >= MIN_LENGTH
  const detectedDir = detectDir(text)

  return (
    <div style={{
      background: colors.card,
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
      padding: '1.5rem',
      marginBottom: '2rem',
      transition: 'all 0.3s ease',
    }}>
      <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: colors.text, fontSize: '0.95rem' }}>
        ✏️ Paste or type your custom passage
      </p>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: colors.textSecondary }}>
        🌍 Works with any language or script — Arabic, Chinese, French, Hindi, Japanese, and more
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter at least 20 characters in any language..."
        rows={4}
        dir={detectedDir}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: colors.input,
          border: `1.5px solid ${isValid ? '#10b981' : colors.inputBorder}`,
          borderRadius: '0.625rem',
          color: colors.text,
          fontSize: '1rem',
          outline: 'none',
          resize: 'vertical',
          fontFamily: "'Noto Sans', system-ui, sans-serif",
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          lineHeight: 1.6,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: isValid ? '#10b981' : colors.textSecondary }}>
            {text.trim().length} / {MIN_LENGTH} chars minimum
          </span>
          {text.length > 0 && (
            <span style={{
              fontSize: '0.72rem',
              padding: '0.1rem 0.5rem',
              borderRadius: '999px',
              background: detectedDir === 'rtl' ? 'rgba(168,85,247,0.15)' : 'rgba(16,185,129,0.12)',
              color: detectedDir === 'rtl' ? '#a855f7' : '#10b981',
              fontWeight: 600,
            }}>
              {detectedDir === 'rtl' ? '← RTL' : 'LTR →'}
            </span>
          )}
        </div>
        <button
          disabled={!isValid}
          onClick={() => onStart(text.trim(), detectedDir)}
          style={{
            padding: '0.5rem 1.5rem',
            background: isValid ? 'linear-gradient(to right, #10b981, #06b6d4)' : (isDark ? '#334155' : '#e2e8f0'),
            color: isValid ? 'white' : colors.textSecondary,
            borderRadius: '0.625rem',
            fontWeight: 700,
            border: 'none',
            cursor: isValid ? 'pointer' : 'not-allowed',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
        >
          Start Test →
        </button>
      </div>
    </div>
  )
}
