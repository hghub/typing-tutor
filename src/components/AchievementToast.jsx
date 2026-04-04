import { useEffect, useState } from 'react'

function Toast({ achievement, index, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // fade in
    const show = setTimeout(() => setVisible(true), 50)
    // fade out then remove
    const hide = setTimeout(() => setVisible(false), 2700)
    const remove = setTimeout(() => onRemove(), 3200)
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(remove) }
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
      border: '1px solid rgba(16,185,129,0.5)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)',
      minWidth: '220px',
      maxWidth: '300px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(24px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      marginTop: index > 0 ? '0.5rem' : 0,
    }}>
      <span style={{ fontSize: '1.5rem' }}>{achievement.emoji}</span>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>Achievement Unlocked!</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{achievement.label}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{achievement.desc}</p>
      </div>
    </div>
  )
}

export default function AchievementToast({ achievements, onClear }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setItems(achievements.map((a, i) => ({ ...a, key: `${a.id}-${Date.now()}-${i}` })))
    }
  }, [achievements])

  if (items.length === 0) return null

  const removeItem = (key) => {
    setItems(prev => {
      const next = prev.filter(a => a.key !== key)
      if (next.length === 0 && onClear) onClear()
      return next
    })
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9998,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      {items.map((a, i) => (
        <Toast key={a.key} achievement={a} index={i} onRemove={() => removeItem(a.key)} />
      ))}
    </div>
  )
}
