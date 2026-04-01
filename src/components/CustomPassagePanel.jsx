import { useState } from 'react'

const MIN_LENGTH = 20

export default function CustomPassagePanel({ colors, isDark, onStart }) {
  const [text, setText] = useState('')

  const isValid = text.trim().length >= MIN_LENGTH

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
      <p style={{ margin: '0 0 0.75rem 0', fontWeight: 600, color: colors.text, fontSize: '0.95rem' }}>
        ✏️ Paste or type your custom passage
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter at least 20 characters..."
        rows={4}
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
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: isValid ? '#10b981' : colors.textSecondary }}>
          {text.trim().length} / {MIN_LENGTH} chars minimum
        </span>
        <button
          disabled={!isValid}
          onClick={() => onStart(text.trim())}
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
