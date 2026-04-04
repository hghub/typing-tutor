import { useState, useEffect } from 'react'

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🌈', '🦋']

export default function EmojiPopup({ trigger }) {
  const [popups, setPopups] = useState([])

  useEffect(() => {
    if (!trigger) return
    const id = Date.now()
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    const x = 40 + Math.random() * 60
    setPopups(prev => [...prev.slice(-8), { id, emoji, x }])
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1000)
  }, [trigger])

  if (!popups.length) return null

  return (
    <div style={{ position: 'relative', height: 0, overflow: 'visible' }}>
      {popups.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            fontSize: '1.5rem',
            animation: 'kidsFloatUp 1s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
