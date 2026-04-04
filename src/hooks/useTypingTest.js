import { useState, useEffect, useRef } from 'react'
import { PASSAGES } from '../constants/passages'
import { saveScore } from '../utils/scores'

const TIMER_DURATION = 60 // seconds

export function useTypingTest({ difficulty, language, customPassage }) {
  const [passage, setPassage] = useState('')
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [cpm, setCpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const timerRef = useRef(null)
  const inputRef = useRef(null)
  const isTimerMode = difficulty === 'timer'

  const pickPassage = (diff = difficulty, lang = language) => {
    if (diff === 'custom' || diff === 'timer') return
    const pool = (PASSAGES[lang]?.[diff] ?? PASSAGES[lang]?.easy) || []
    if (pool.length) setPassage(pool[Math.floor(Math.random() * pool.length)])
  }

  const buildTimerPassage = (lang = language) => {
    const pool = PASSAGES[lang]?.easy || []
    if (!pool.length) return
    let text = ''
    while (text.length < 500) text += pool[Math.floor(Math.random() * pool.length)] + ' '
    setPassage(text.trim())
  }

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  const resetTest = () => {
    clearTimer()
    if (isTimerMode) buildTimerPassage()
    else pickPassage()
    setTyped('')
    setStartTime(null)
    setWpm(0)
    setCpm(0)
    setAccuracy(100)
    setFinished(false)
    setTimeLeft(TIMER_DURATION)
    inputRef.current?.focus()
  }

  useEffect(() => {
    clearTimer()
    if (isTimerMode) buildTimerPassage()
    else pickPassage()
    setTyped('')
    setStartTime(null)
    setWpm(0)
    setCpm(0)
    setAccuracy(100)
    setFinished(false)
    setTimeLeft(TIMER_DURATION)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language])

  // Countdown timer tick
  useEffect(() => {
    if (!isTimerMode || !startTime || finished) return
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clearTimer
  }, [isTimerMode, startTime, finished])

  useEffect(() => {
    if (typed.length === 0) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const wordsTyped = typed.trim().split(/\s+/).length

    if (timeElapsed > 0) {
      setWpm(Math.max(0, Math.round(wordsTyped / timeElapsed)))
      setCpm(Math.max(0, Math.round(typed.length / timeElapsed)))
    }

    let correct = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correct++
    }
    const calculatedAccuracy = Math.round((correct / typed.length) * 100)
    setAccuracy(calculatedAccuracy)

    const isDone = isTimerMode ? timeLeft === 0 : typed.length === passage.length
    if (isDone && !finished) {
      setFinished(true)
      try {
        saveScore({
          wpm: Math.round(wordsTyped / (timeElapsed || 0.1)),
          cpm: Math.round(typed.length / (timeElapsed || 0.1)),
          accuracy: calculatedAccuracy,
          difficulty,
          language,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        console.error('Error saving score:', err)
      }
    }
  }, [typed, startTime, passage, difficulty, language, finished, timeLeft])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); return }
    if (!startTime && e.key !== 'Backspace') setStartTime(Date.now())
    if (!isTimerMode && typed.length >= passage.length && e.key !== 'Backspace') e.preventDefault()
  }

  const handleChange = (e) => setTyped(e.target.value)

  return { passage, setPassage, typed, wpm, cpm, accuracy, finished, timeLeft, isTimerMode, inputRef, handleKeyDown, handleChange, resetTest }
}
