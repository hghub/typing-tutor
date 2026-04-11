const MODES = ['easy', 'medium', 'hard', 'timer', 'custom']
const MODE_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', timer: '⏱ 60s', custom: '✏️ Custom' }

const PACKS = ['emails', 'coding', 'islamic', 'poetry', 'freelance', 'study']
const PACK_LABELS = {
  emails: '📧 Emails',
  coding: '💻 Coding',
  islamic: '🕌 Islamic',
  poetry: '📜 Poetry',
  freelance: '✍️ Freelance Writing',
  study: '📚 Study',
}

const DRILLS = ['numbers', 'symbols']
const DRILL_LABELS = {
  numbers: '🔢 Numbers',
  symbols: '#@ Symbols',
}

function PillButton({ id, label, isActive, disabled, colors, onClick }) {
  return (
    <button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      title={disabled ? 'Not available for this language' : undefined}
      style={{
        padding: '0.55rem 1.1rem',
        borderRadius: '0.5rem',
        fontWeight: 600,
        border: `1px solid ${isActive ? '#06b6d4' : colors.difficultyBorder}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        background: isActive ? '#06b6d4' : colors.difficulty,
        color: isActive ? 'white' : disabled ? (colors.textSecondary + '55') : colors.textSecondary,
        fontSize: '0.85rem',
        opacity: disabled ? 0.4 : 1,
        textDecoration: disabled ? 'line-through' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) {
          e.currentTarget.style.borderColor = '#06b6d4'
          e.currentTarget.style.color = '#06b6d4'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !disabled) {
          e.currentTarget.style.borderColor = colors.difficultyBorder
          e.currentTarget.style.color = colors.textSecondary
        }
      }}
    >
      {label}
    </button>
  )
}

export default function DifficultySelector({ difficulty, onSelect, availablePacks = [], colors }) {
  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.textSecondary,
    marginRight: '0.75rem',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={labelStyle}>Mode</span>
        {MODES.map((level) => (
          <PillButton key={level} id={level} label={MODE_LABELS[level]} isActive={difficulty === level} colors={colors} onClick={onSelect} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={labelStyle}>Topic Packs</span>
        {PACKS.map((pack) => (
          <PillButton key={pack} id={pack} label={PACK_LABELS[pack]} isActive={difficulty === pack} disabled={!availablePacks.includes(pack)} colors={colors} onClick={onSelect} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={labelStyle}>Drills</span>
        {DRILLS.map((drill) => (
          <PillButton key={drill} id={drill} label={DRILL_LABELS[drill]} isActive={difficulty === drill} colors={colors} onClick={onSelect} />
        ))}
      </div>
    </div>
  )
}
