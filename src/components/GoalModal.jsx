import { useState } from 'react'

export const GOALS = [
  { id: 'freelancer', emoji: '💼', label: 'Earn faster as a freelancer', sub: 'Practice real client chat & email tasks' },
  { id: 'student', emoji: '🎓', label: 'Complete assignments quicker', sub: 'Study faster with fewer mistakes' },
  { id: 'urdu', emoji: '🌍', label: 'Master Urdu typing', sub: 'Learn layout, improve flow, type naturally' },
  { id: 'general', emoji: '⚡', label: 'Increase speed & accuracy', sub: 'Beat personal records and build daily habits' },
]

export default function GoalModal({ onSelect, isDark, colors }) {
  const [hovered, setHovered] = useState(null)

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: isDark ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.55)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  }

  const modal = {
    background: colors.card,
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    borderRadius: '1.25rem',
    padding: '2rem',
    maxWidth: '520px',
    width: '100%',
    boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.6)' : '0 25px 60px rgba(0,0,0,0.15)',
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>
            What do you want to improve?
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: colors.textSecondary }}>
            We'll personalise your experience based on your goal.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: hovered === g.id
                  ? (isDark ? '#1e3a4c' : '#eff9ff')
                  : (isDark ? '#0f172a' : '#f8fafc'),
                border: `2px solid ${hovered === g.id ? '#06b6d4' : (isDark ? '#1e293b' : '#e2e8f0')}`,
                borderRadius: '0.75rem',
                padding: '0.9rem 1rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{g.emoji}</span>
              <div>
                <div style={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>{g.label}</div>
                <div style={{ color: colors.textSecondary, fontSize: '0.8rem', marginTop: '0.15rem' }}>{g.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0, fontSize: '0.8rem', color: colors.textSecondary }}>
          Takes 60 seconds · No sign-up required
        </p>
      </div>
    </div>
  )
}
