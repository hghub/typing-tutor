import { useState } from 'react'

const SECTIONS = [
  {
    id: 'modes',
    label: 'Mode',
    items: [
      { id: 'easy',   icon: '🟢', label: 'Easy',    sub: 'Simple words' },
      { id: 'medium', icon: '🟡', label: 'Medium',  sub: 'Mixed vocab' },
      { id: 'hard',   icon: '🔴', label: 'Hard',    sub: 'Complex text' },
      { id: 'timer',  icon: '⏱',  label: '60s Mode', sub: 'Race the clock' },
      { id: 'custom', icon: '✏️', label: 'Custom',  sub: 'Your own text' },
    ],
  },
  {
    id: 'packs',
    label: 'Topic Packs',
    items: [
      { id: 'emails',    icon: '📧', label: 'Emails',           sub: 'Real email copy' },
      { id: 'coding',    icon: '💻', label: 'Coding',           sub: 'Code snippets' },
      { id: 'islamic',   icon: '🕌', label: 'Islamic',          sub: 'Duas & hadith' },
      { id: 'poetry',    icon: '📜', label: 'Poetry',           sub: 'Classic verse' },
      { id: 'freelance', icon: '✍️', label: 'Freelance',        sub: 'Client messages' },
      { id: 'study',     icon: '📚', label: 'Study',            sub: 'Academic text' },
    ],
  },
  {
    id: 'drills',
    label: 'Drills',
    items: [
      { id: 'numbers', icon: '🔢', label: 'Numbers', sub: 'Digits & stats' },
      { id: 'symbols', icon: '#@', label: 'Symbols',  sub: '& ^ % $ # @' },
    ],
  },
]

function Card({ item, isActive, disabled, colors, isDark, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => !disabled && onClick(item.id)}
      disabled={disabled}
      title={disabled ? 'Not available for this language' : undefined}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        padding: 0,
        minWidth: '82px',
        borderRadius: '0.75rem',
        border: `1px solid ${isActive ? '#06b6d4' : hovered ? '#38bdf8' : (isDark ? 'rgba(71,85,105,0.9)' : 'rgba(203,213,225,0.8)')}`,
        background: isActive
          ? isDark
            ? 'linear-gradient(145deg, #1e293b, rgba(6,182,212,0.12))'
            : 'linear-gradient(145deg, #f0fdff, rgba(6,182,212,0.08))'
          : hovered
            ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'
            : colors.card,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        boxShadow: isActive
          ? '0 4px 16px rgba(6,182,212,0.22), 0 0 0 1px rgba(6,182,212,0.25)'
          : hovered ? (isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.1)') : 'none',
        transform: hovered && !isActive ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Colored top accent bar */}
      <div style={{
        height: '2.5px',
        width: '100%',
        background: isActive
          ? 'linear-gradient(to right, #06b6d4, #3b82f6)'
          : hovered
            ? 'linear-gradient(to right, rgba(6,182,212,0.5), rgba(59,130,246,0.5))'
            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
        transition: 'background 0.15s ease',
      }} />
      <div style={{ padding: '0.55rem 0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item.icon}</span>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: isActive ? 700 : 600,
          color: isActive ? '#06b6d4' : hovered ? (isDark ? '#e2e8f0' : '#1e293b') : colors.text,
          whiteSpace: 'nowrap',
          transition: 'color 0.15s',
        }}>{item.label}</span>
        <span style={{ fontSize: '0.67rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>{item.sub}</span>
      </div>
    </button>
  )
}

export default function DifficultySelector({ difficulty, onSelect, availablePacks = [], colors, isDark }) {
  const sectionLabelStyle = {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.textSecondary,
    marginBottom: '0.4rem',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {SECTIONS.map(section => (
        <div key={section.id}>
          <p style={sectionLabelStyle}>{section.label}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {section.items.map(item => {
              const disabled = section.id === 'packs' && !availablePacks.includes(item.id)
              return (
                <Card
                  key={item.id}
                  item={item}
                  isActive={difficulty === item.id}
                  disabled={disabled}
                  colors={colors}
                  isDark={isDark}
                  onClick={onSelect}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
