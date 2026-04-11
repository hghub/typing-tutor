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
  const active = isActive
  const show = !disabled

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
        gap: '0.2rem',
        padding: '0.6rem 0.75rem',
        minWidth: '76px',
        borderRadius: '0.625rem',
        border: `1.5px solid ${active ? '#06b6d4' : hovered ? '#38bdf8' : (isDark ? '#1e293b' : '#e2e8f0')}`,
        background: active
          ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)')
          : hovered
            ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')
            : (isDark ? '#0f172a' : '#f8fafc'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        boxShadow: active ? '0 0 0 2px rgba(6,182,212,0.25)' : 'none',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{item.icon}</span>
      <span style={{
        fontSize: '0.78rem', fontWeight: active ? 700 : 600,
        color: active ? '#06b6d4' : (hovered ? (isDark ? '#e2e8f0' : '#1e293b') : colors.text),
        whiteSpace: 'nowrap',
      }}>{item.label}</span>
      {show && (
        <span style={{ fontSize: '0.68rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>{item.sub}</span>
      )}
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
