import { getCharColor } from '../utils/typing'

const RAINBOW_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899']

export default function PassageDisplay({ passage, typed, isDark, currentLangDir, colors, isKidsMode }) {
  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.6)'}`,
      direction: currentLangDir,
      textAlign: currentLangDir === 'rtl' ? 'right' : 'left',
    }}>
      <div style={{
        fontSize: isKidsMode ? '2rem' : '1.125rem',
        lineHeight: isKidsMode ? '2.5' : '1.75',
        fontFamily: isKidsMode ? 'Arial, sans-serif' : 'monospace',
        color: colors.passageText,
        letterSpacing: '0.05em',
        wordBreak: 'break-word',
      }}>
        {passage.split('').map((char, index) => {
          const color = getCharColor(index, typed, passage, isDark)
          const isCursor = index === typed.length
          const isUntyped = index >= typed.length
          const rainbowColor = isKidsMode && isUntyped ? RAINBOW_COLORS[index % RAINBOW_COLORS.length] : null
          return (
            <span
              key={index}
              style={{
                color: isCursor ? '#fff' : (rainbowColor || color),
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
