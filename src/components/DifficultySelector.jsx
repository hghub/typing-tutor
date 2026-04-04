const LEVELS = ['easy', 'medium', 'hard', 'timer', 'custom']

const LEVEL_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', timer: '⏱ 60s', custom: 'Custom' }

export default function DifficultySelector({ difficulty, onSelect, colors }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
      {LEVELS.map((level) => {
        const isActive = difficulty === level
        return (
          <button
            key={level}
            onClick={() => onSelect(level)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              border: `2px solid ${isActive ? 'transparent' : colors.difficultyBorder}`,
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: isActive ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : colors.difficulty,
              color: isActive ? 'white' : colors.textSecondary,
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
          {LEVEL_LABELS[level]}
          </button>
        )
      })}
    </div>
  )
}
