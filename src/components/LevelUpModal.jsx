import { useEffect, useState } from 'react'

export default function LevelUpModal({ levelData, onClose, colors, isDark }) {
  const [timeLeft, setTimeLeft] = useState(5)

  useEffect(() => {
    if (!levelData) return
    setTimeLeft(5)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); onClose(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [levelData])

  if (!levelData) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)',
        border: '2px solid rgba(16,185,129,0.6)',
        borderRadius: '1.5rem',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        maxWidth: '24rem',
        width: '90%',
        boxShadow: '0 25px 60px rgba(16,185,129,0.3)',
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Big emoji */}
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{levelData.emoji}</div>

        {/* LEVEL UP! heading */}
        <p style={{
          fontSize: '2rem',
          fontWeight: 900,
          background: 'linear-gradient(to right, #10b981, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.5rem',
          letterSpacing: '0.05em',
        }}>
          LEVEL UP!
        </p>

        {/* New level */}
        <p style={{ color: colors.text, fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          You are now <span style={{ color: '#10b981' }}>{levelData.name}</span>
        </p>

        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Keep typing to reach the next level!
        </p>

        {/* Countdown bar */}
        <div style={{ height: '6px', borderRadius: '3px', background: isDark ? 'rgba(71,85,105,0.5)' : 'rgba(203,213,225,0.8)', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(timeLeft / 5) * 100}%`,
            background: 'linear-gradient(to right, #10b981, #06b6d4)',
            borderRadius: '3px',
            transition: 'width 1s linear',
          }} />
        </div>

        <button onClick={onClose} style={{
          background: 'linear-gradient(to right, #10b981, #06b6d4)',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          padding: '0.6rem 1.5rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}>
          Continue ({timeLeft}s)
        </button>
      </div>
    </div>
  )
}
