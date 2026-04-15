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
    background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(15,23,42,0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  }

  const modal = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(51,65,85,0.8)' : 'rgba(203,213,225,0.8)'}`,
    borderRadius: '1.25rem',
    maxWidth: '520px',
    width: '100%',
    boxShadow: isDark
      ? '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(6,182,212,0.08)'
      : '0 25px 60px rgba(0,0,0,0.18)',
    overflow: 'hidden',
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Gradient header bar */}
        <div style={{ height: '3px', background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)' }} />

        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px', height: '52px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))',
              border: '1px solid rgba(6,182,212,0.3)',
              fontSize: '1.6rem',
              marginBottom: '0.75rem',
            }}>⚡</div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
              What do you want to improve?
            </h2>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: colors.textSecondary }}>
              We'll personalise your experience based on your goal.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                    ? isDark ? 'linear-gradient(145deg, #1e293b, rgba(6,182,212,0.1))' : 'linear-gradient(145deg, #f0fdff, rgba(6,182,212,0.06))'
                    : isDark ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${hovered === g.id ? '#06b6d4' : (isDark ? 'rgba(51,65,85,0.7)' : 'rgba(203,213,225,0.8)')}`,
                  borderRadius: '0.75rem',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  transform: hovered === g.id ? 'translateY(-1px)' : 'none',
                  boxShadow: hovered === g.id ? '0 6px 20px rgba(6,182,212,0.18)' : 'none',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Left accent bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                  background: hovered === g.id ? 'linear-gradient(to bottom, #06b6d4, #3b82f6)' : 'transparent',
                  transition: 'background 0.15s ease',
                  borderRadius: '0.75rem 0 0 0.75rem',
                }} />
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{g.emoji}</span>
                <div>
                  <div style={{ color: colors.text, fontWeight: 600, fontSize: '0.93rem' }}>{g.label}</div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.79rem', marginTop: '0.1rem' }}>{g.sub}</div>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  color: hovered === g.id ? '#06b6d4' : colors.textSecondary,
                  fontSize: '1rem',
                  transition: 'transform 0.15s ease, color 0.15s ease',
                  transform: hovered === g.id ? 'translateX(4px)' : 'none',
                  display: 'inline-block',
                }}>→</span>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0, fontSize: '0.78rem', color: colors.textSecondary }}>
            ⚡ Takes 60 seconds · No sign-up required
          </p>
        </div>
      </div>
    </div>
  )
}
