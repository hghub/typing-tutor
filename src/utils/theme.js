export function getThemeColors(isDark) {
  if (isDark) {
    return {
      bg: 'linear-gradient(to bottom right, #0f172a, #4c1d95, #0f172a)',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      card: 'rgba(30, 41, 59, 0.5)',
      cardBg: 'rgba(15, 23, 42, 0.7)',
      passageText: '#f1f5f9',
      input: 'rgba(15, 23, 42, 0.8)',
      inputBorder: '#475569',
      difficulty: '#1e293b',
      difficultyBorder: '#334155',
      buttonShadow: '0 10px 25px rgba(6, 182, 212, 0.1)',
    }
  }
  return {
    bg: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #e2e8f0)',
    text: '#1e293b',
    textSecondary: '#64748b',
    card: 'rgba(248, 250, 252, 0.9)',
    cardBg: 'rgba(241, 245, 249, 0.95)',
    passageText: '#0f172a',
    input: 'rgba(248, 250, 252, 0.95)',
    inputBorder: '#cbd5e1',
    difficulty: '#f1f5f9',
    difficultyBorder: '#e2e8f0',
    buttonShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  }
}
