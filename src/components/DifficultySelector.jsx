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

function PillButton({ id, label, isActive, colors, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '0.65rem 1.25rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        border: `2px solid ${isActive ? 'transparent' : colors.difficultyBorder}`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: isActive ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : colors.difficulty,
        color: isActive ? 'white' : colors.textSecondary,
        fontSize: '0.875rem',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#06b6d4'
          e.currentTarget.style.color = '#06b6d4'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = colors.difficultyBorder
          e.currentTarget.style.color = colors.textSecondary
        }
      }}
    >
      {label}
    </button>
  )
}

export default function DifficultySelector({ difficulty, onSelect, colors }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={labelStyle}>Mode</span>
        {MODES.map((level) => (
          <PillButton key={level} id={level} label={MODE_LABELS[level]} isActive={difficulty === level} colors={colors} onClick={onSelect} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={labelStyle}>Topic Packs</span>
        {PACKS.map((pack) => (
          <PillButton key={pack} id={pack} label={PACK_LABELS[pack]} isActive={difficulty === pack} colors={colors} onClick={onSelect} />
        ))}
      </div>
    </div>
  )
}
