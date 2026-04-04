import { useState, useEffect } from 'react'
import './App.css'
import { useTheme } from './hooks/useTheme'
import { useTypingTest } from './hooks/useTypingTest'
import { useFeedback } from './hooks/useFeedback'
import { useIdentity } from './hooks/useIdentity'
import { useKeyboardSound } from './hooks/useKeyboardSound'
import { supabase } from './utils/supabase'
import { LANGUAGES } from './constants/languages'
import AnimatedBackground from './components/AnimatedBackground'
import Header from './components/Header'
import DifficultySelector from './components/DifficultySelector'
import CustomPassagePanel from './components/CustomPassagePanel'
import PassageDisplay from './components/PassageDisplay'
import StatsGrid from './components/StatsGrid'
import TypingInput from './components/TypingInput'
import ActionButtons from './components/ActionButtons'
import CompletionCard from './components/CompletionCard'
import FeedbackModal from './components/FeedbackModal'
import StatsModal from './components/StatsModal'
import IdentityModal from './components/IdentityModal'
import LeaderboardModal from './components/LeaderboardModal'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [language, setLanguage] = useState(() => localStorage.getItem('typingTutorLanguage') || 'english')
  const [showStats, setShowStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const { isDark, toggleTheme, colors } = useTheme()
  const { passage, setPassage, typed, wpm, cpm, accuracy, finished, timeLeft, isTimerMode, inputRef, handleKeyDown, handleChange, resetTest } = useTypingTest({ difficulty, language })
  const feedback = useFeedback()
  const identity = useIdentity()
  const { soundOn, toggleSound, playClick } = useKeyboardSound()

  useEffect(() => {
    localStorage.setItem('typingTutorLanguage', language)
  }, [language])

  useEffect(() => {
    if (!finished || !identity.userId) return
    const submitScore = async () => {
      try {
        await supabase.from('scores').insert({
          user_id: identity.userId,
          wpm,
          cpm,
          accuracy,
          difficulty,
          language,
        })
      } catch (err) {
        console.error('Failed to submit score to Supabase:', err)
      }
    }
    submitScore()
  }, [finished])

  const [isNewBest, setIsNewBest] = useState(false)

  const handleCustomStart = (text) => {
    setPassage(text)
    resetTest()
  }

  const handleTypingKeyDown = (e) => {
    if (e.key !== 'Backspace' && e.key !== 'Enter' && e.key.length === 1) {
      const pos = typed.length
      const isError = passage[pos] !== e.key
      playClick(isError)
    }
    handleKeyDown(e)
  }

  useEffect(() => {
    if (!finished) { setIsNewBest(false); return }
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]')
    const prevBest = scores.length > 1 ? Math.max(...scores.slice(0, -1).map((s) => s.wpm)) : 0
    setIsNewBest(wpm > prevBest && scores.length > 0)
  }, [finished, wpm])

  const currentLangDir = LANGUAGES[language]?.dir || 'ltr'

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '2rem', transition: 'background 0.3s ease', direction: currentLangDir }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', maxWidth: '56rem', margin: '0 auto' }}>
        <Header language={language} onLanguageChange={setLanguage} isDark={isDark} onToggleTheme={toggleTheme} colors={colors} />
        <DifficultySelector difficulty={difficulty} onSelect={setDifficulty} colors={colors} />

        {difficulty === 'custom' && (
          <CustomPassagePanel colors={colors} isDark={isDark} onStart={handleCustomStart} />
        )}

        <div style={{
          background: colors.card,
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '2.5rem',
          marginBottom: '2rem',
          transition: 'all 0.3s ease',
        }}>
          {isTimerMode && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: timeLeft <= 10 ? '#ef4444' : '#06b6d4',
                transition: 'color 0.3s',
                minWidth: '4rem',
              }}>
                {timeLeft}s
              </span>
            </div>
          )}
          <PassageDisplay passage={passage} typed={typed} isDark={isDark} currentLangDir={currentLangDir} colors={colors} />
          <StatsGrid wpm={wpm} cpm={cpm} accuracy={accuracy} typed={typed} passage={passage} isTimerMode={isTimerMode} timeLeft={timeLeft} />
          <TypingInput typed={typed} finished={finished} inputRef={inputRef} handleChange={handleChange} handleKeyDown={handleTypingKeyDown} colors={colors} currentLangDir={currentLangDir} />
          <ActionButtons
            finished={finished}
            onReset={resetTest}
            onFeedback={() => { if (identity.userId && !feedback.feedbackName) feedback.setFeedbackName(identity.userId); feedback.setShowFeedback(true) }}
            onViewStats={() => setShowStats(true)}
            onLeaderboard={() => setShowLeaderboard(true)}
            soundOn={soundOn}
            onToggleSound={toggleSound}
          />
        </div>

        {finished && <CompletionCard wpm={wpm} cpm={cpm} accuracy={accuracy} currentLangDir={currentLangDir} isNewBest={isNewBest} colors={colors} />}
      </div>

      <FeedbackModal {...feedback} isDark={isDark} colors={colors} />
      <StatsModal show={showStats} onClose={() => setShowStats(false)} userId={identity.userId} isDark={isDark} colors={colors} />
      <IdentityModal
        show={identity.showIdentityModal}
        onCreate={identity.createUser}
        onResume={identity.resumeUser}
        loading={identity.loading}
        error={identity.error}
        detectedCountry={identity.detectedCountry}
        detectedCity={identity.detectedCity}
        newCode={identity.newCode}
        isDark={isDark}
        colors={colors}
      />
      <LeaderboardModal
        show={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        userId={identity.userId}
        isDark={isDark}
        colors={colors}
      />
    </div>
  )
}

export default App

