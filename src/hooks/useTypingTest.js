import { useState, useEffect, useRef } from 'react'
import { PASSAGES } from '../constants/passages'
import { saveScore } from '../utils/scores'

const TIMER_DURATION = 60

// Maps each key to a finger (0=L-pinky … 7=R-pinky)
const KEY_FINGER = {
  // Left pinky
  q:0,a:0,z:0,'1':0,'`':0,
  // Left ring
  w:1,s:1,x:1,'2':1,
  // Left middle
  e:2,d:2,c:2,'3':2,
  // Left index (covers t,g,b,r,f,v)
  r:3,f:3,v:3,t:3,g:3,b:3,'4':3,'5':3,
  // Right index (covers y,h,n,u,j,m)
  y:4,h:4,n:4,u:4,j:4,m:4,'6':4,'7':4,
  // Right middle
  i:5,k:5,',':5,'8':5,
  // Right ring
  o:6,l:6,'.':6,'9':6,
  // Right pinky
  p:7,';':7,'/':7,'0':7,"'":7,'[':7,']':7,
}

const FINGER_NAMES = [
  'Left Pinky','Left Ring','Left Middle','Left Index',
  'Right Index','Right Middle','Right Ring','Right Pinky',
]

export function useTypingTest({ difficulty, language }) {
  const [passage, setPassage] = useState('')
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [cpm, setCpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [analysis, setAnalysis] = useState(null)
  const [passageIndex, setPassageIndex] = useState(0)

  const timerRef = useRef(null)
  const inputRef = useRef(null)
  // keystroke log: { char, ms, correct, time }
  const keystrokesRef = useRef([])
  const lastKeyTimeRef = useRef(null)

  const isTimerMode = difficulty === 'timer'

  const pickPassage = (diff = difficulty, lang = language) => {
    if (diff === 'custom' || diff === 'timer') return
    const pool = (PASSAGES[lang]?.[diff] ?? PASSAGES[lang]?.easy) || []
    if (pool.length) {
      let idx = Math.floor(Math.random() * pool.length)
      // Avoid repeating the same passage if pool has more than 1 entry
      if (pool.length > 1) {
        while (idx === passageIndex) idx = Math.floor(Math.random() * pool.length)
      }
      setPassageIndex(idx)
      setPassage(pool[idx])
    }
  }

  const buildTimerPassage = (lang = language) => {
    const pool = PASSAGES[lang]?.easy || []
    if (!pool.length) return
    let text = ''
    while (text.length < 500) text += pool[Math.floor(Math.random() * pool.length)] + ' '
    setPassage(text.trim())
  }

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  const computeAnalysis = (keystrokes, wpmFinal) => {
    if (keystrokes.length < 10) return null

    // --- Per-character avg ms ---
    const charMs = {}
    const charCount = {}
    keystrokes.forEach(({ char, ms }) => {
      const c = char.toLowerCase()
      if (!charMs[c]) { charMs[c] = 0; charCount[c] = 0 }
      charMs[c] += ms
      charCount[c]++
    })
    const avgMsPerChar = {}
    Object.keys(charMs).forEach(c => { avgMsPerChar[c] = charMs[c] / charCount[c] })

    const allMs = keystrokes.map(k => k.ms)
    const globalAvg = allMs.reduce((a, b) => a + b, 0) / allMs.length

    // --- Weak keys (>1.6× global avg, seen more than once) ---
    const weakKeysFinal = Object.entries(avgMsPerChar)
      .filter(([c]) => charCount[c] > 1)
      .filter(([, ms]) => ms > globalAvg * 1.6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([char, ms]) => ({ char, ms: Math.round(ms) }))

    // --- Finger scores ---
    const fingerMs = Array(8).fill(0)
    const fingerCount = Array(8).fill(0)
    Object.entries(avgMsPerChar).forEach(([c, ms]) => {
      const f = KEY_FINGER[c]
      if (f !== undefined) { fingerMs[f] += ms * charCount[c]; fingerCount[f] += charCount[c] }
    })
    const fingerAvg = fingerMs.map((ms, i) => fingerCount[i] > 0 ? Math.round(ms / fingerCount[i]) : null)

    // --- Slow digraphs ---
    const digraphMs = {}
    const digraphCount = {}
    for (let i = 0; i < keystrokes.length - 1; i++) {
      const d = keystrokes[i].char.toLowerCase() + keystrokes[i+1].char.toLowerCase()
      if (/^[a-z]{2}$/.test(d)) {
        digraphMs[d] = (digraphMs[d] || 0) + keystrokes[i+1].ms
        digraphCount[d] = (digraphCount[d] || 0) + 1
      }
    }
    const slowDigraphs = Object.entries(digraphMs)
      .filter(([d]) => digraphCount[d] >= 2)
      .map(([d, ms]) => ({ digraph: d, ms: Math.round(ms / digraphCount[d]) }))
      .filter(({ ms }) => ms > globalAvg * 1.4)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)

    // --- Fatigue: compare first 25% vs last 25% of session ---
    const q = Math.floor(keystrokes.length / 4)
    const firstQ = keystrokes.slice(0, q)
    const lastQ = keystrokes.slice(-q)
    const avg = arr => arr.reduce((a, b) => a + b.ms, 0) / arr.length
    const fatigueDrop = q > 3 ? Math.round(((avg(lastQ) - avg(firstQ)) / avg(firstQ)) * 100) : 0

    return { weakKeys: weakKeysFinal, fingerAvg, slowDigraphs, fatigueDrop, globalAvg: Math.round(globalAvg) }
  }

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
    setAnalysis(null)
    keystrokesRef.current = []
    lastKeyTimeRef.current = null
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
    setAnalysis(null)
    keystrokesRef.current = []
    lastKeyTimeRef.current = null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language])

  // Countdown timer
  useEffect(() => {
    if (!isTimerMode || !startTime || finished) return
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setFinished(true); return 0 }
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
      const result = computeAnalysis(keystrokesRef.current, Math.round(wordsTyped / (timeElapsed || 0.1)))
      setAnalysis(result)
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

    // Record keystroke timing
    if (e.key.length === 1 && e.key !== 'Backspace') {
      const now = Date.now()
      const ms = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0
      const pos = typed.length
      keystrokesRef.current.push({ char: e.key, ms, correct: passage[pos] === e.key, time: now })
      lastKeyTimeRef.current = now
    }
  }

  const handleChange = (e) => setTyped(e.target.value)

  return { passage, setPassage, typed, wpm, cpm, accuracy, finished, timeLeft, isTimerMode, inputRef, handleKeyDown, handleChange, resetTest, analysis, passageIndex, FINGER_NAMES }
}
