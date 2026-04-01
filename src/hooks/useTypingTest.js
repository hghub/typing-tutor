import { useState, useEffect, useRef } from 'react'
import { PASSAGES } from '../constants/passages'
import { saveScore } from '../utils/scores'

export function useTypingTest({ difficulty, language }) {
  const [passage, setPassage] = useState('')
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef(null)

  const pickPassage = (diff = difficulty, lang = language) => {
    const pool = (PASSAGES[lang]?.[diff] ?? PASSAGES[lang]?.easy) || []
    if (pool.length) setPassage(pool[Math.floor(Math.random() * pool.length)])
  }

  const resetTest = () => {
    pickPassage()
    setTyped('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setFinished(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    pickPassage()
    setTyped('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setFinished(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language])

  useEffect(() => {
    if (typed.length === 0) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const wordsTyped = typed.trim().split(/\s+/).length

    if (timeElapsed > 0) {
      setWpm(Math.max(0, Math.round(wordsTyped / timeElapsed)))
    }

    let correct = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correct++
    }
    const calculatedAccuracy = Math.round((correct / typed.length) * 100)
    setAccuracy(calculatedAccuracy)

    if (typed.length === passage.length && !finished) {
      setFinished(true)
      try {
        saveScore({
          wpm: Math.round(wordsTyped / (timeElapsed || 0.1)),
          accuracy: calculatedAccuracy,
          difficulty,
          language,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        console.error('Error saving score:', err)
      }
    }
  }, [typed, startTime, passage, difficulty, language, finished])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); return }
    if (!startTime && e.key !== 'Backspace') setStartTime(Date.now())
    if (typed.length >= passage.length && e.key !== 'Backspace') e.preventDefault()
  }

  const handleChange = (e) => setTyped(e.target.value)

  return { passage, typed, wpm, accuracy, finished, inputRef, handleKeyDown, handleChange, resetTest }
}
