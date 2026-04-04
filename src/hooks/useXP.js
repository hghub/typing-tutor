import { useState } from 'react'

const LEVELS = [
  { name: 'Beginner',   emoji: '🐣', min: 0 },
  { name: 'Apprentice', emoji: '📝', min: 500 },
  { name: 'Skilled',    emoji: '⌨️', min: 1500 },
  { name: 'Expert',     emoji: '🚀', min: 3500 },
  { name: 'Master',     emoji: '🏆', min: 7000 },
  { name: 'Legend',     emoji: '👑', min: 12000 },
]

const DIFFICULTY_MULTIPLIER = {
  easy: 1.0, medium: 1.5, hard: 2.0, timer: 2.0, custom: 1.2,
  emails: 1.5, coding: 1.5, islamic: 1.5, poetry: 1.5, freelance: 1.5, study: 1.5,
}

const ACHIEVEMENTS = [
  { id: 'first-test',    label: 'First Steps',      emoji: '🎯', desc: 'Complete your first test' },
  { id: 'speed-40',      label: 'Getting Fast',     emoji: '💨', desc: 'Reach 40 WPM' },
  { id: 'speed-60',      label: 'Speed Typist',     emoji: '⚡', desc: 'Reach 60 WPM' },
  { id: 'speed-80',      label: 'Speed Demon',      emoji: '🔥', desc: 'Reach 80 WPM' },
  { id: 'speed-100',     label: 'Century Club',     emoji: '💯', desc: 'Reach 100 WPM' },
  { id: 'accuracy-100',  label: 'Perfectionist',    emoji: '🎖️', desc: '100% accuracy' },
  { id: 'accuracy-98',   label: 'Sharp Shooter',    emoji: '🏹', desc: '98%+ accuracy' },
  { id: 'streak-3',      label: 'On a Roll',        emoji: '🔥', desc: '3-day streak' },
  { id: 'streak-7',      label: 'Week Warrior',     emoji: '📅', desc: '7-day streak' },
  { id: 'streak-30',     label: 'Monthly Master',   emoji: '🗓️', desc: '30-day streak' },
  { id: 'tests-10',      label: 'Dedicated',        emoji: '📚', desc: 'Complete 10 tests' },
  { id: 'tests-50',      label: 'Veteran',          emoji: '🎗️', desc: 'Complete 50 tests' },
  { id: 'legend',        label: 'Living Legend',    emoji: '👑', desc: 'Reach Legend level' },
  { id: 'multilang',     label: 'Polyglot Typist',  emoji: '🌍', desc: 'Type in 3+ languages' },
  { id: 'hard-mode',     label: 'No Fear',          emoji: '💪', desc: 'Complete a Hard test' },
  { id: 'islamic-pack',  label: 'Spiritual Typist', emoji: '🕌', desc: 'Complete an Islamic pack test' },
]

function getLevelForXP(xpValue) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xpValue >= lvl.min) current = lvl
    else break
  }
  return current
}

export function useXP() {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('typingXP') || 0))
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('typingStreak') || 0))
  const [achievements, setAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('typingAchievements') || '[]') } catch { return [] }
  })
  const [newLevelUp, setNewLevelUp] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])

  const level = getLevelForXP(xp)

  function getLevelInfo(xpValue) {
    const idx = LEVELS.findIndex(l => l === getLevelForXP(xpValue))
    const current = LEVELS[idx]
    const nextLevel = LEVELS[idx + 1] || null
    const xpInLevel = xpValue - current.min
    const xpNeeded = nextLevel ? nextLevel.min - current.min : 1
    const progress = nextLevel ? Math.min(xpInLevel / xpNeeded, 1) : 1
    const xpToNext = nextLevel ? nextLevel.min - xpValue : 0
    return { level: current, nextLevel, progress, xpToNext }
  }

  function addXP(wpm, accuracy, difficulty) {
    const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0
    const earned = Math.round(wpm * (accuracy / 100) * multiplier)
    const prevXP = Number(localStorage.getItem('typingXP') || 0)
    const newTotal = prevXP + earned

    // Streak logic
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const lastPlayed = localStorage.getItem('typingLastPlayed')
    let newStreak = Number(localStorage.getItem('typingStreak') || 0)
    if (lastPlayed === today) {
      // already played today, no change
    } else if (lastPlayed === yesterday) {
      newStreak += 1
    } else {
      newStreak = 1
    }

    // Level up check
    const prevLevel = getLevelForXP(prevXP)
    const nextLevelInfo = getLevelForXP(newTotal)
    let levelUpData = null
    if (nextLevelInfo.name !== prevLevel.name) {
      levelUpData = nextLevelInfo
    }

    // Achievement check
    const scores = (() => { try { return JSON.parse(localStorage.getItem('typingScores') || '[]') } catch { return [] } })()
    const totalTests = scores.length
    const earned_achievements = JSON.parse(localStorage.getItem('typingAchievements') || '[]')
    const uniqueLangs = new Set(scores.map(s => s.language).filter(Boolean))

    const toUnlock = []
    const check = (id, condition) => {
      if (condition && !earned_achievements.includes(id)) {
        toUnlock.push(id)
        earned_achievements.push(id)
      }
    }

    check('first-test', totalTests >= 1)
    check('speed-40', wpm >= 40)
    check('speed-60', wpm >= 60)
    check('speed-80', wpm >= 80)
    check('speed-100', wpm >= 100)
    check('accuracy-100', accuracy === 100)
    check('accuracy-98', accuracy >= 98)
    check('streak-3', newStreak >= 3)
    check('streak-7', newStreak >= 7)
    check('streak-30', newStreak >= 30)
    check('tests-10', totalTests >= 10)
    check('tests-50', totalTests >= 50)
    check('legend', newTotal >= 12000)
    check('multilang', uniqueLangs.size >= 3)
    check('hard-mode', difficulty === 'hard')
    check('islamic-pack', difficulty === 'islamic')

    // Persist
    localStorage.setItem('typingXP', newTotal)
    localStorage.setItem('typingStreak', newStreak)
    localStorage.setItem('typingLastPlayed', today)
    localStorage.setItem('typingAchievements', JSON.stringify(earned_achievements))

    // Update state
    setXp(newTotal)
    setStreak(newStreak)
    setAchievements(earned_achievements)

    if (levelUpData) setNewLevelUp(levelUpData)

    if (toUnlock.length > 0) {
      const unlocked = ACHIEVEMENTS.filter(a => toUnlock.includes(a.id))
      setNewAchievements(unlocked)
    }

    return { earned, newTotal }
  }

  function clearLevelUp() { setNewLevelUp(null) }
  function clearNewAchievements() { setNewAchievements([]) }

  return {
    xp, level, streak, achievements, newLevelUp, newAchievements,
    addXP, getLevelInfo, clearLevelUp, clearNewAchievements,
    LEVELS, ACHIEVEMENTS,
  }
}
