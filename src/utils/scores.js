const STORAGE_KEY = 'typingScores'

export function saveScore(score) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  existing.push(score)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function getScoreStats() {
  const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  if (scores.length === 0) return null
  return {
    totalSessions: scores.length,
    avgWpm: Math.round(scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length),
    bestWpm: Math.max(...scores.map((s) => s.wpm)),
    avgAccuracy: Math.round(scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length),
    scores,
  }
}
