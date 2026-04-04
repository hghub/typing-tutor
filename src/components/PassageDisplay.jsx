import { getCharColor } from '../utils/typing'

export default function PassageDisplay({ passage, typed, isDark, currentLangDir, colors }) {
  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)'}`,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      direction: currentLangDir,
      textAlign: currentLangDir === 'rtl' ? 'right' : 'left',
    }}>
      <div style={{
        fontSize: '1.125rem',
        lineHeight: '1.75',
        fontFamily: 'monospace',
        color: colors.passageText,
        letterSpacing: '0.05em',
        wordBreak: 'break-word',
      }}>
        {passage.split('').map((char, index) => {
          const color = getCharColor(index, typed, passage, isDark)
          const isCursor = index === typed.length
          return (
            <span
              key={index}
              style={{
                color: isCursor ? '#fff' : color,
                transition: 'color 75ms',
                backgroundColor: isCursor ? '#06b6d4' : 'transparent',
                borderRadius: isCursor ? '2px' : '0',
                padding: isCursor ? '0 2px' : '0',
              }}
            >
              {char}
            </span>
          )
        })}
      </div>
    </div>
  )
}
