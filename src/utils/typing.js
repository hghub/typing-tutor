export function getCharColor(index, typed, passage, isDark) {
  if (index < typed.length) {
    return typed[index] === passage[index] ? '#10b981' : '#f87171'
  }
  if (index === typed.length) return '#06b6d4'
  return isDark ? '#475569' : '#cbd5e1'
}

export function getAccuracyColor(accuracy) {
  if (accuracy >= 95) return '#10b981'
  if (accuracy >= 85) return '#eab308'
  return '#f87171'
}
