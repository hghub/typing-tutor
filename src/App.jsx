import { useState, useEffect, useRef } from 'react'
import './App.css'

const PASSAGES = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Hello world this is a typing practice app.",
    "Learning to type faster is fun and rewarding.",
  ],
  medium: [
    "JavaScript is a versatile programming language that powers modern web applications.",
    "React makes building user interfaces easier with its component-based architecture.",
    "TypeScript adds static typing to JavaScript for better code quality and maintainability.",
  ],
  hard: [
    "Asynchronous programming allows developers to perform multiple operations concurrently without blocking the main thread.",
    "The philosophy behind RESTful APIs emphasizes stateless communication, resource-oriented design, and uniform interfaces.",
    "Machine learning algorithms process vast amounts of data to identify patterns and make predictions based on historical examples.",
  ]
}

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [passage, setPassage] = useState(PASSAGES.easy[0])
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const newPassages = PASSAGES[difficulty]
    const randomPassage = newPassages[Math.floor(Math.random() * newPassages.length)]
    setPassage(randomPassage)
    resetTest()
  }, [difficulty])

  useEffect(() => {
    if (typed.length === 0) return

    const currentTime = Date.now()
    const timeElapsed = (currentTime - startTime) / 1000 / 60
    const wordsTyped = typed.trim().split(/\s+/).length
    
    if (timeElapsed > 0) {
      const calculatedWpm = Math.round(wordsTyped / timeElapsed)
      setWpm(Math.max(0, calculatedWpm))
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
        const finalWpm = Math.round(wordsTyped / (timeElapsed || 0.1))
        saveScore({
          wpm: finalWpm,
          accuracy: calculatedAccuracy,
          difficulty,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error saving score:', error)
      }
    }
  }, [typed, startTime, passage, difficulty, finished])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      return
    }

    if (!startTime && e.key !== 'Backspace') {
      setStartTime(Date.now())
    }

    if (typed.length >= passage.length && e.key !== 'Backspace') {
      e.preventDefault()
    }
  }

  const handleChange = (e) => {
    setTyped(e.target.value)
  }

  const resetTest = () => {
    setTyped('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setFinished(false)
    inputRef.current?.focus()
  }

  const saveScore = (score) => {
    const existingScores = JSON.parse(localStorage.getItem('typingScores') || '[]')
    existingScores.push(score)
    localStorage.setItem('typingScores', JSON.stringify(existingScores))
  }

  const getCharColor = (index) => {
    if (index < typed.length) {
      return typed[index] === passage[index] ? '#10b981' : '#f87171'
    }
    if (index === typed.length) return '#06b6d4'
    return '#475569'
  }

  const getAccuracyColor = () => {
    if (accuracy >= 95) return '#10b981'
    if (accuracy >= 85) return '#eab308'
    return '#f87171'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #4c1d95, #0f172a)',
      padding: '2rem',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '384px',
          height: '384px',
          backgroundColor: '#a855f7',
          borderRadius: '9999px',
          mixBlendMode: 'multiply',
          filter: 'blur(64px)',
          opacity: 0.2,
          animation: 'blob 7s infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '384px',
          height: '384px',
          backgroundColor: '#3b82f6',
          borderRadius: '9999px',
          mixBlendMode: 'multiply',
          filter: 'blur(64px)',
          opacity: 0.2,
          animation: 'blob 7s infinite',
          animationDelay: '2s',
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        maxWidth: '56rem',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            background: 'linear-gradient(to right, #22d3ee, #60a5fa, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
          }}>
            TypeMaster
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: 300 }}>
            Master your typing speed and accuracy
          </p>
        </div>

        {/* Difficulty Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: difficulty === level 
                  ? 'linear-gradient(to right, #06b6d4, #3b82f6)'
                  : '#1e293b',
                color: difficulty === level ? 'white' : '#cbd5e1',
                borderWidth: '2px',
                borderColor: difficulty === level ? 'transparent' : '#334155',
              }}
              onMouseEnter={(e) => {
                if (difficulty !== level) {
                  e.target.style.borderColor = '#06b6d4'
                  e.target.style.color = '#06b6d4'
                }
              }}
              onMouseLeave={(e) => {
                if (difficulty !== level) {
                  e.target.style.borderColor = '#334155'
                  e.target.style.color = '#cbd5e1'
                }
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '2.5rem',
          marginBottom: '2rem',
        }}>
          {/* Passage Display */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
              fontFamily: 'monospace',
              color: '#f1f5f9',
              letterSpacing: '0.05em',
            }}>
              {passage.split('').map((char, index) => (
                <span key={index} style={{
                  color: getCharColor(index),
                  transition: 'color 75ms',
                  backgroundColor: getCharColor(index) === '#06b6d4' ? '#06b6d4' : 'transparent',
                  padding: getCharColor(index) === '#06b6d4' ? '0 2px' : '0',
                }}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* WPM */}
            <div style={{
              background: 'linear-gradient(to bottom right, #1e40af, #1e3a8a)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>WPM</p>
              <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>{wpm}</p>
            </div>

            {/* Accuracy */}
            <div style={{
              background: 'linear-gradient(to bottom right, #6b21a8, #581c87)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{ color: '#e9d5ff', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Accuracy</p>
              <p style={{ fontSize: '3rem', fontWeight: 900, color: getAccuracyColor() }}>{accuracy}%</p>
            </div>

            {/* Progress */}
            <div style={{
              background: 'linear-gradient(to bottom right, #0e7490, #164e63)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{ color: '#a5f3fc', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Progress</p>
              <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>
                {typed.length}/{passage.length}
              </p>
            </div>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
            placeholder={finished ? "Press 'Try Again' to continue" : "Click here and start typing..."}
            disabled={finished}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '2px solid #475569',
              borderRadius: '0.75rem',
              color: '#f1f5f9',
              fontSize: '1rem',
              fontFamily: 'monospace',
              marginBottom: '2rem',
              outline: 'none',
              opacity: finished ? 0.6 : 1,
              cursor: finished ? 'not-allowed' : 'auto',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => !finished && (e.target.style.borderColor = '#06b6d4')}
            onBlur={(e) => !finished && (e.target.style.borderColor = '#475569')}
            autoFocus
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={resetTest}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 20px 25px -5px rgba(6, 182, 212, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 25px 50px -12px rgba(6, 182, 212, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 20px 25px -5px rgba(6, 182, 212, 0.3)'
              }}
            >
              {finished ? 'Try Again' : 'Reset'}
            </button>
            <button
              onClick={() => {
                const scores = JSON.parse(localStorage.getItem('typingScores') || '[]')
                if (scores.length === 0) {
                  alert('No typing sessions yet! Complete a test to see stats.')
                  return
                }
                const avgWpm = Math.round(scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length)
                const avgAccuracy = Math.round(scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length)
                const bestWpm = Math.max(...scores.map(s => s.wpm))
                alert(`📊 Your Stats\n\nTotal Sessions: ${scores.length}\nAvg WPM: ${avgWpm}\nBest WPM: ${bestWpm}\nAvg Accuracy: ${avgAccuracy}%\n\nCheck console for detailed scores`)
                console.log('All your scores:', scores)
              }}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(to right, #a855f7, #ec4899)',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 25px 50px -12px rgba(168, 85, 247, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 20px 25px -5px rgba(168, 85, 247, 0.3)'
              }}
            >
              View Stats
            </button>
          </div>
        </div>

        {/* Completion Card */}
        {finished && (
          <div style={{
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.2)',
            animation: 'pulse-slow 3s ease-in-out infinite',
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: 900,
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
            }}>
              Perfect!
            </p>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Final WPM: <span style={{ fontWeight: 900, color: '#10b981' }}>{wpm}</span>
            </p>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
              Accuracy: <span style={{ fontWeight: 900, color: getAccuracyColor() }}>{accuracy}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
