import { useState, useEffect, useRef } from 'react'
import './App.css'

// Multilingual passages - easy to extend
const PASSAGES = {
  english: {
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
  },
  urdu: {
    easy: [
      "تیز رفتار اور درست ٹائپنگ ایک قیمتی مہارت ہے۔",
      "یہ ایپلیکیشن آپ کو ٹائپنگ کی رفتار بڑھانے میں مدد دے گی۔",
      "روزانہ مشق کرنے سے آپ بہتر ہو جائیں گے۔",
    ],
    medium: [
      "کمپیوٹر کی سائنس میں ٹائپنگ کی رفتار بہت اہم ہے۔",
      "اردو میں ٹائپنگ سیکھنا آجکل بہت آسان ہو گیا ہے۔",
      "اچھی ٹائپنگ کی مہارت کام کی دنیا میں بہت مفید ہے۔",
    ],
    hard: [
      "جدید تکنالوجی کے دور میں ڈیجیٹل مہارتیں انتہائی ضروری ہو گئی ہیں۔",
      "پروگرامنگ اور سفٹ ویئر ڈیولپمنٹ میں ٹائپنگ کی رفتار کامیابی کی کلید ہے۔",
      "مختلف زبانوں میں ٹائپنگ کی مشق سے آپ کی لکھنے کی صلاحیت میں اضافہ ہوتا ہے۔",
    ]
  },
  arabic: {
    easy: [
      "الكتابة السريعة مهارة قيمة جداً في العصر الحديث.",
      "هذا التطبيق سيساعدك على تحسين مهارات الكتابة لديك.",
      "الممارسة اليومية ستجعلك أفضل وأسرع في الكتابة.",
    ],
    medium: [
      "في علوم الحاسوب، سرعة الكتابة مهمة جداً للمبرمجين.",
      "تعلم الكتابة بسرعة في اللغة العربية أصبح أسهل من ذي قبل.",
      "مهارات الكتابة الجيدة مفيدة جداً في عالم العمل الحديث.",
    ],
    hard: [
      "في العصر الرقمي الحالي، أصبحت المهارات الرقمية ضرورية للجميع.",
      "البرمجة وتطوير البرامج يتطلبان سرعة وكفاءة عالية في الكتابة.",
      "ممارسة الكتابة في لغات مختلفة تحسن من قدرتك على التعبير والتواصل.",
    ]
  },
  persian: {
    easy: [
      "نوشتن سریع یک مهارت بسیار ارزشمند است.",
      "این برنامه به شما کمک خواهد کرد تا سرعت تایپ خود را بهبود بخشید.",
      "تمرین روزانه شما را در تایپ بهتر و سریعتر می کند.",
    ],
    medium: [
      "در علوم کامپیوتر، سرعت تایپ برای برنامه نویسان بسیار مهم است.",
      "یادگیری تایپ سریع در زبان فارسی امروزه بسیار ساده شده است.",
      "مهارات خوب در تایپ در دنیای کار امروزی بسیار مفید است.",
    ],
    hard: [
      "در عصر دیجیتال امروزی، مهارات دیجیتالی برای همه ضروری شده اند.",
      "برنامه نویسی و توسعه نرم افزار نیاز به سرعت و دقت بالایی دارد.",
      "تمرین تایپ در زبان های مختلف مهارت ارتباطی شما را بهبود می بخشد.",
    ]
  }
}

// Language metadata
const LANGUAGES = {
  english: { name: 'English', dir: 'ltr', flag: '🇬🇧' },
  urdu: { name: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  arabic: { name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  persian: { name: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
}

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('typingTutorLanguage')
    return saved || 'english'
  })
  const [passage, setPassage] = useState('')
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [finished, setFinished] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('typingTutorTheme')
    return saved !== null ? JSON.parse(saved) : true
  })
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('typingTutorTheme', JSON.stringify(isDark))
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('typingTutorLanguage', language)
  }, [language])

  // Set initial passage when language or difficulty changes
  useEffect(() => {
    const langPassages = PASSAGES[language]
    if (langPassages) {
      const difficultyPassages = langPassages[difficulty] || langPassages.easy
      const randomPassage = difficultyPassages[Math.floor(Math.random() * difficultyPassages.length)]
      setPassage(randomPassage)
      resetTest()
    }
  }, [difficulty, language])

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
          language,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error saving score:', error)
      }
    }
  }, [typed, startTime, passage, difficulty, language, finished])

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
    return isDark ? '#475569' : '#cbd5e1'
  }

  const getAccuracyColor = () => {
    if (accuracy >= 95) return '#10b981'
    if (accuracy >= 85) return '#eab308'
    return '#f87171'
  }

  const getThemeColors = () => {
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

  const colors = getThemeColors()
  const currentLangDir = LANGUAGES[language]?.dir || 'ltr'

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      padding: '2rem',
      transition: 'background 0.3s ease',
      direction: currentLangDir,
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
        {/* Header with Theme & Language Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              background: 'linear-gradient(to right, #22d3ee, #60a5fa, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              TypeMaster
            </h1>
            <p style={{
              color: colors.textSecondary,
              fontSize: '1.125rem',
              fontWeight: 300,
              margin: '0.5rem 0 0 0',
            }}>
              Master your typing speed and accuracy
            </p>
          </div>

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
          }}>
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: colors.difficulty,
                border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: colors.text,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                background: colors.difficulty,
                border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: colors.text,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: colors.buttonShadow,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)'
                e.target.style.borderColor = '#06b6d4'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0'
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
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
                background:
                  difficulty === level
                    ? 'linear-gradient(to right, #06b6d4, #3b82f6)'
                    : colors.difficulty,
                color:
                  difficulty === level ? 'white' : colors.textSecondary,
                borderWidth: '2px',
                borderColor:
                  difficulty === level
                    ? 'transparent'
                    : colors.difficultyBorder,
              }}
              onMouseEnter={(e) => {
                if (difficulty !== level) {
                  e.target.style.borderColor = '#06b6d4'
                  e.target.style.color = '#06b6d4'
                }
              }}
              onMouseLeave={(e) => {
                if (difficulty !== level) {
                  e.target.style.borderColor = colors.difficultyBorder
                  e.target.style.color = colors.textSecondary
                }
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div
          style={{
            background: colors.card,
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '2.5rem',
            marginBottom: '2rem',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Passage Display */}
          <div
            style={{
              background: colors.cardBg,
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)'}`,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              direction: currentLangDir,
              textAlign: currentLangDir === 'rtl' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.75',
                fontFamily: 'monospace',
                color: colors.passageText,
                letterSpacing: '0.05em',
                wordBreak: 'break-word',
              }}
            >
              {passage.split('').map((char, index) => (
                <span
                  key={index}
                  style={{
                    color: getCharColor(index),
                    transition: 'color 75ms',
                    backgroundColor:
                      getCharColor(index) === '#06b6d4'
                        ? '#06b6d4'
                        : 'transparent',
                    padding:
                      getCharColor(index) === '#06b6d4'
                        ? '0 2px'
                        : '0',
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* WPM */}
            <div
              style={{
                background:
                  'linear-gradient(to bottom right, #1e40af, #1e3a8a)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p
                style={{
                  color: '#93c5fd',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                WPM
              </p>
              <p
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'white',
                  margin: 0,
                }}
              >
                {wpm}
              </p>
            </div>

            {/* Accuracy */}
            <div
              style={{
                background:
                  'linear-gradient(to bottom right, #6b21a8, #581c87)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p
                style={{
                  color: '#e9d5ff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                Accuracy
              </p>
              <p
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: getAccuracyColor(),
                  margin: 0,
                }}
              >
                {accuracy}%
              </p>
            </div>

            {/* Progress */}
            <div
              style={{
                background:
                  'linear-gradient(to bottom right, #0e7490, #164e63)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p
                style={{
                  color: '#a5f3fc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                Progress
              </p>
              <p
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'white',
                  margin: 0,
                }}
              >
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
            placeholder={
              finished
                ? "Press 'Try Again' to continue"
                : 'Click here and start typing...'
            }
            disabled={finished}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: colors.input,
              border: `2px solid ${colors.inputBorder}`,
              borderRadius: '0.75rem',
              color: colors.text,
              fontSize: '1rem',
              fontFamily: 'monospace',
              marginBottom: '2rem',
              outline: 'none',
              opacity: finished ? 0.6 : 1,
              cursor: finished ? 'not-allowed' : 'auto',
              transition: 'all 0.2s',
              direction: currentLangDir,
              textAlign: currentLangDir === 'rtl' ? 'right' : 'left',
            }}
            onFocus={(e) =>
              !finished && (e.target.style.borderColor = '#06b6d4')
            }
            onBlur={(e) =>
              !finished && (e.target.style.borderColor = colors.inputBorder)
            }
            autoFocus
          />

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
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
                e.target.style.boxShadow =
                  '0 25px 50px -12px rgba(6, 182, 212, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow =
                  '0 20px 25px -5px rgba(6, 182, 212, 0.3)'
              }}
            >
              {finished ? 'Try Again' : 'Reset'}
            </button>
            <button
              onClick={() => {
                const scores = JSON.parse(
                  localStorage.getItem('typingScores') || '[]'
                )
                if (scores.length === 0) {
                  alert(
                    'No typing sessions yet! Complete a test to see stats.'
                  )
                  return
                }
                const avgWpm = Math.round(
                  scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length
                )
                const avgAccuracy = Math.round(
                  scores.reduce((sum, s) => sum + s.accuracy, 0) /
                    scores.length
                )
                const bestWpm = Math.max(...scores.map((s) => s.wpm))
                alert(
                  `📊 Your Stats\n\nTotal Sessions: ${scores.length}\nAvg WPM: ${avgWpm}\nBest WPM: ${bestWpm}\nAvg Accuracy: ${avgAccuracy}%\n\nCheck console for detailed scores`
                )
                console.log('All your scores:', scores)
              }}
              style={{
                padding: '0.75rem 2rem',
                background:
                  'linear-gradient(to right, #a855f7, #ec4899)',
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
                e.target.style.boxShadow =
                  '0 25px 50px -12px rgba(168, 85, 247, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow =
                  '0 20px 25px -5px rgba(168, 85, 247, 0.3)'
              }}
            >
              View Stats
            </button>
          </div>
        </div>

        {/* Completion Card */}
        {finished && (
          <div
            style={{
              background:
                'linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              backdropFilter: 'blur(12px)',
              borderRadius: '1rem',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow:
                '0 25px 50px -12px rgba(16, 185, 129, 0.2)',
              animation: 'pulse-slow 3s ease-in-out infinite',
              direction: currentLangDir,
            }}
          >
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                background:
                  'linear-gradient(to right, #10b981, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1rem',
              }}
            >
              Perfect!
            </p>
            <p
              style={{
                color: '#e2e8f0',
                fontSize: '1.125rem',
                marginBottom: '0.5rem',
              }}
            >
              Final WPM:{' '}
              <span
                style={{
                  fontWeight: 900,
                  color: '#10b981',
                }}
              >
                {wpm}
              </span>
            </p>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
              Accuracy:{' '}
              <span
                style={{
                  fontWeight: 900,
                  color: getAccuracyColor(),
                }}
              >
                {accuracy}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
