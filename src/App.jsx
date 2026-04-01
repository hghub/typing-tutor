import { useState, useEffect } from 'react'
import './App.css'
import { useTheme } from './hooks/useTheme'
import { useTypingTest } from './hooks/useTypingTest'
import { useFeedback } from './hooks/useFeedback'
import { LANGUAGES } from './constants/languages'
import AnimatedBackground from './components/AnimatedBackground'
import Header from './components/Header'
import DifficultySelector from './components/DifficultySelector'
import PassageDisplay from './components/PassageDisplay'
import StatsGrid from './components/StatsGrid'
import TypingInput from './components/TypingInput'
import ActionButtons from './components/ActionButtons'
import CompletionCard from './components/CompletionCard'
import FeedbackModal from './components/FeedbackModal'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [language, setLanguage] = useState(() => localStorage.getItem('typingTutorLanguage') || 'english')

  const { isDark, toggleTheme, colors } = useTheme()
  const { passage, typed, wpm, accuracy, finished, inputRef, handleKeyDown, handleChange, resetTest } = useTypingTest({ difficulty, language })
  const feedback = useFeedback()

  useEffect(() => {
    localStorage.setItem('typingTutorLanguage', language)
  }, [language])

  const currentLangDir = LANGUAGES[language]?.dir || 'ltr'

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '2rem', transition: 'background 0.3s ease', direction: currentLangDir }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', maxWidth: '56rem', margin: '0 auto' }}>
        <Header language={language} onLanguageChange={setLanguage} isDark={isDark} onToggleTheme={toggleTheme} colors={colors} />
        <DifficultySelector difficulty={difficulty} onSelect={setDifficulty} colors={colors} />

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
          <PassageDisplay passage={passage} typed={typed} isDark={isDark} currentLangDir={currentLangDir} colors={colors} />
          <StatsGrid wpm={wpm} accuracy={accuracy} typed={typed} passage={passage} />
          <TypingInput typed={typed} finished={finished} inputRef={inputRef} handleChange={handleChange} handleKeyDown={handleKeyDown} colors={colors} currentLangDir={currentLangDir} />
          <ActionButtons finished={finished} onReset={resetTest} onFeedback={() => feedback.setShowFeedback(true)} />
        </div>

        {finished && <CompletionCard wpm={wpm} accuracy={accuracy} currentLangDir={currentLangDir} />}
      </div>

      <FeedbackModal {...feedback} isDark={isDark} colors={colors} />
    </div>
  )
}

export default App

