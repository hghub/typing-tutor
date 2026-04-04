import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useTheme } from './hooks/useTheme'
import { useTypingTest } from './hooks/useTypingTest'
import { useFeedback } from './hooks/useFeedback'
import { useIdentity } from './hooks/useIdentity'
import { useKeyboardSound } from './hooks/useKeyboardSound'
import { useXP } from './hooks/useXP'
import { supabase } from './utils/supabase'
import { LANGUAGES } from './constants/languages'
import { PASSAGES } from './constants/passages'
import AnimatedBackground from './components/AnimatedBackground'
import Header from './components/Header'
import XPBar from './components/XPBar'
import DifficultySelector from './components/DifficultySelector'
import CustomPassagePanel from './components/CustomPassagePanel'
import PassageDisplay from './components/PassageDisplay'
import StatsGrid from './components/StatsGrid'
import TypingInput from './components/TypingInput'
import ActionButtons from './components/ActionButtons'
import CompletionCard from './components/CompletionCard'
import TypingAnalysis from './components/TypingAnalysis'
import CareerReadiness from './components/CareerReadiness'
import FeedbackModal from './components/FeedbackModal'
import StatsModal from './components/StatsModal'
import IdentityModal from './components/IdentityModal'
import LeaderboardModal from './components/LeaderboardModal'
import LearningPanel from './components/LearningPanel'
import PrivacyPolicy from './components/PrivacyPolicy'
import AchievementToast from './components/AchievementToast'
import LevelUpModal from './components/LevelUpModal'
import VirtualKeyboard from './components/VirtualKeyboard'
import TournamentModal from './components/TournamentModal'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [language, setLanguage] = useState(() => localStorage.getItem('typingTutorLanguage') || 'english')
  const [showStats, setShowStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showTournament, setShowTournament] = useState(false)
  const [challengeData, setChallengeData] = useState(null)
  const challengeApplied = useRef(false)

  const { isDark, toggleTheme, colors } = useTheme()
  const { passage, setPassage, typed, wpm, cpm, accuracy, finished, timeLeft, isTimerMode, inputRef, handleKeyDown, handleChange, resetTest, analysis, passageIndex } = useTypingTest({ difficulty, language })
  const feedback = useFeedback()
  const identity = useIdentity()
  const { soundOn, toggleSound, playClick } = useKeyboardSound()
  const { xp, level, streak, achievements, newLevelUp, newAchievements, addXP, getLevelInfo, clearLevelUp, clearNewAchievements, LEVELS } = useXP()
  const [xpEarned, setXpEarned] = useState(0)

  useEffect(() => {
    localStorage.setItem('typingTutorLanguage', language)
    // If current pack not available for new language, reset to easy
    const available = Object.keys(PASSAGES[language] || {})
    if (!['easy','medium','hard','timer','custom'].includes(difficulty) && !available.includes(difficulty)) {
      setDifficulty('easy')
    }
  }, [language])

  useEffect(() => {
    if (finished && wpm > 0) {
      const { earned } = addXP(wpm, accuracy, difficulty)
      setXpEarned(earned)
    }
  }, [finished])

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
  const [customDir, setCustomDir] = useState('ltr')

  // Detect challenge link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('c')
    if (c) {
      try {
        const data = JSON.parse(atob(c))
        setChallengeData(data)
        if (data.language) setLanguage(data.language)
        if (data.difficulty) setDifficulty(data.difficulty)
      } catch {
        console.warn('Invalid challenge link')
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Apply challenge passage once difficulty/language are set
  useEffect(() => {
    if (!challengeData || challengeApplied.current) return
    const t = setTimeout(() => {
      const pool = (PASSAGES[challengeData.language]?.[challengeData.difficulty] ?? PASSAGES.english?.easy) || []
      const idx = (challengeData.passageIndex ?? 0) % Math.max(pool.length, 1)
      if (pool[idx]) {
        setPassage(pool[idx])
        challengeApplied.current = true
      }
    }, 80)
    return () => clearTimeout(t)
  }, [challengeData, difficulty, language])

  const handleCustomStart = (text, dir) => {
    setCustomDir(dir || 'ltr')
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

  const currentLangDir = difficulty === 'custom' ? customDir : (LANGUAGES[language]?.dir || 'ltr')

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '2rem', transition: 'background 0.3s ease', direction: currentLangDir }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', maxWidth: '56rem', margin: '0 auto' }}>
        <Header language={language} onLanguageChange={setLanguage} isDark={isDark} onToggleTheme={toggleTheme} colors={colors} />
        <XPBar xp={xp} level={level} streak={streak} colors={colors} isDark={isDark} />
        <DifficultySelector difficulty={difficulty} onSelect={(d) => { setDifficulty(d) }} language={language} availablePacks={Object.keys(PASSAGES[language] || {})} colors={colors} />

        {difficulty === 'custom' && (
          <CustomPassagePanel colors={colors} isDark={isDark} onStart={handleCustomStart} />
        )}

        {/* Challenge banner */}
        {challengeData && !finished && (
          <div style={{
            background: 'linear-gradient(to right, rgba(239,68,68,0.15), rgba(249,115,22,0.15))',
            border: '1px solid rgba(239,68,68,0.4)', borderRadius: '1rem',
            padding: '0.875rem 1.25rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚔️</span>
            <div>
              <p style={{ margin: 0, color: '#f97316', fontWeight: 800, fontSize: '0.95rem' }}>You've been challenged!</p>
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.82rem' }}>
                Beat <strong style={{ color: '#ef4444' }}>{challengeData.wpm} WPM</strong> / {challengeData.accuracy}% accuracy
                &nbsp;·&nbsp;{challengeData.difficulty}&nbsp;·&nbsp;{challengeData.language}
              </p>
            </div>
          </div>
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

          {/* Virtual Keyboard */}
          {showKeyboard && !finished && (
            <VirtualKeyboard
              nextChar={passage[typed.length] ?? null}
              isDark={isDark}
              colors={colors}
            />
          )}

          <ActionButtons
            finished={finished}
            onReset={resetTest}
            onFeedback={() => { if (identity.userId && !feedback.feedbackName) feedback.setFeedbackName(identity.userId); feedback.setShowFeedback(true) }}
            onViewStats={() => setShowStats(true)}
            onLeaderboard={() => setShowLeaderboard(true)}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            showKeyboard={showKeyboard}
            onToggleKeyboard={() => setShowKeyboard(v => !v)}
            onTournament={() => setShowTournament(true)}
          />
        </div>

        {finished && <CompletionCard wpm={wpm} cpm={cpm} accuracy={accuracy} currentLangDir={currentLangDir} isNewBest={isNewBest} colors={colors} xpEarned={xpEarned} challengeData={challengeData} onChallenge={() => {
          const data = { wpm, accuracy, difficulty, language, passageIndex }
          const encoded = btoa(JSON.stringify(data))
          const url = `${window.location.origin}${window.location.pathname}?c=${encoded}`
          navigator.clipboard.writeText(url).catch(() => {})
        }} />}
        {finished && <TypingAnalysis analysis={analysis} isDark={isDark} colors={colors} />}
        {finished && <CareerReadiness wpm={wpm} accuracy={accuracy} isDark={isDark} colors={colors} />}
        {finished && ['emails', 'coding', 'islamic', 'poetry', 'freelance', 'study'].includes(difficulty) && (
          <LearningPanel
            language={language}
            difficulty={difficulty}
            passageIndex={passageIndex}
            isDark={isDark}
            colors={colors}
          />
        )}
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
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} isDark={isDark} colors={colors} />}
      <LevelUpModal levelData={newLevelUp} onClose={clearLevelUp} colors={colors} isDark={isDark} />
      <AchievementToast achievements={newAchievements} onClear={clearNewAchievements} />
      <TournamentModal
        show={showTournament}
        onClose={() => setShowTournament(false)}
        userId={identity.userId}
        displayName={identity.userId}
        lastWpm={finished ? wpm : 0}
        lastAccuracy={finished ? accuracy : 0}
        lastLanguage={language}
        lastDifficulty={difficulty}
        isDark={isDark}
        colors={colors}
      />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '1rem' }}>
        <p style={{ color: colors.textSecondary, fontSize: '0.75rem', margin: 0 }}>
          © {new Date().getFullYear()} Typing Master &nbsp;·&nbsp;
          <button onClick={() => setShowPrivacy(true)} style={{
            background: 'none', border: 'none', color: '#06b6d4',
            cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0,
          }}>Privacy Policy</button>
          &nbsp;·&nbsp; Free multilingual typing speed test
        </p>
      </div>
    </div>
  )
}

export default App

