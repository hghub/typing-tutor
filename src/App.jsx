import { useState, useEffect, useRef } from 'react'
import './App.css'

// Sample passages for typing practice
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

  // Update passage when difficulty changes
  useEffect(() => {
    const newPassages = PASSAGES[difficulty]
    const randomPassage = newPassages[Math.floor(Math.random() * newPassages.length)]
    setPassage(randomPassage)
    resetTest()
  }, [difficulty])

  // Calculate WPM and accuracy in real-time
  useEffect(() => {
    if (typed.length === 0) return

    const currentTime = Date.now()
    const timeElapsed = (currentTime - startTime) / 1000 / 60 // Convert to minutes
    const wordsTyped = typed.trim().split(/\s+/).length
    
    if (timeElapsed > 0) {
      const calculatedWpm = Math.round(wordsTyped / timeElapsed)
      setWpm(Math.max(0, calculatedWpm))
    }

    // Calculate accuracy
    let correct = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === passage[i]) correct++
    }
    const calculatedAccuracy = Math.round((correct / typed.length) * 100)
    setAccuracy(calculatedAccuracy)

    // Check if test is finished
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
    // Prevent Enter key from submitting
    if (e.key === 'Enter') {
      e.preventDefault()
      return
    }

    // Start timer on first keystroke
    if (!startTime && e.key !== 'Backspace') {
      setStartTime(Date.now())
    }

    // Prevent typing beyond passage length
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
      return typed[index] === passage[index] ? 'text-green-500' : 'text-red-500'
    }
    if (index === typed.length) return 'bg-blue-500 text-white'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            ⌨️ Typing Tutor
          </h1>
          <p className="text-gray-600">Practice typing and improve your speed</p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                difficulty === level
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Passage Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-xl md:text-2xl leading-relaxed font-mono text-gray-800 mb-6">
            {passage.split('').map((char, index) => (
              <span key={index} className={getCharColor(index)}>
                {char}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">WPM</p>
              <p className="text-3xl font-bold text-blue-600">{wpm}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Accuracy</p>
              <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Progress</p>
              <p className="text-3xl font-bold text-purple-600">
                {typed.length}/{passage.length}
              </p>
            </div>
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
          placeholder={finished ? "Test completed! Click 'Try Again'" : "Start typing..."}
          disabled={finished}
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 mb-6"
          autoFocus
        />

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetTest}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
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
              alert(`📊 Your Stats:\n\nTotal Sessions: ${scores.length}\nAvg WPM: ${avgWpm}\nAvg Accuracy: ${avgAccuracy}%\n\nCheck console for detailed scores`)
              console.log('All your scores:', scores)
            }}
            className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
          >
            View Stats
          </button>
        </div>

        {/* Finished Message */}
        {finished && (
          <div className="mt-8 p-6 bg-green-50 border-2 border-green-500 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700 mb-2">🎉 Great job!</p>
            <p className="text-gray-700">
              Final WPM: <strong>{wpm}</strong> | Accuracy: <strong>{accuracy}%</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
