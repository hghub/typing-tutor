export function getThemeColors(isDark) {
  if (isDark) {
    return {
      bg: '#0f172a',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      card: '#1e293b',
      cardBg: '#0f172a',
      passageText: '#e2e8f0',
      input: '#0f172a',
      inputBorder: '#334155',
      difficulty: '#1e293b',
      difficultyBorder: '#334155',
      border: 'rgba(51, 65, 85, 0.5)',
    }
  }
  return {
    bg: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    card: '#ffffff',
    cardBg: '#f8fafc',
    passageText: '#1e293b',
    input: '#ffffff',
    inputBorder: '#e2e8f0',
    difficulty: '#f1f5f9',
    difficultyBorder: '#e2e8f0',
    border: 'rgba(203, 213, 225, 0.6)',
  }
}
