import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import { useTheme } from './hooks/useTheme'
import { useIsMobile } from './hooks/useIsMobile'
import { useTypingTest } from './hooks/useTypingTest'
import { useFeedback } from './hooks/useFeedback'
import { useIdentity } from './hooks/useIdentity'
import { useKeyboardSound } from './hooks/useKeyboardSound'
import { useXP } from './hooks/useXP'
import { supabase } from './utils/supabase'
import { LANGUAGES } from './constants/languages'
import { PASSAGES } from './constants/passages'
import { KIDS_PASSAGES } from './constants/kidsPassages'
import { playCorrectSound, playWrongSound } from './utils/kidsSounds'
import { latinToUrdu } from './data/urduPhoneticMap'
import { TOOLS } from './tools/registry'
import { GOALS } from './components/GoalModal'
import AnimatedBackground from './components/AnimatedBackground'
import ToolsNav from './components/ToolsNav'
import GoalModal from './components/GoalModal'
import XPBar from './components/XPBar'
import FeedbackButton from './components/FeedbackButton'
import DifficultySelector from './components/DifficultySelector'
import CustomPassagePanel from './components/CustomPassagePanel'
import PassageDisplay from './components/PassageDisplay'
import StatsGrid from './components/StatsGrid'
import TypingInput from './components/TypingInput'
import ActionButtons from './components/ActionButtons'
import CompletionCard from './components/CompletionCard'
import AchievementToast from './components/AchievementToast'
import InstallBanner from './components/InstallBanner'
import EmojiPopup from './components/EmojiPopup'
import ToolSEOFooter from './components/ToolSEOFooter'
import { BLOG_POSTS } from './data/blogPosts'

// Lazy-loaded — only downloaded when user actually opens them
const TypingAnalysis     = lazy(() => import('./components/TypingAnalysis'))
const CareerReadiness    = lazy(() => import('./components/CareerReadiness'))
const LearningPanel      = lazy(() => import('./components/LearningPanel'))
const FeedbackModal      = lazy(() => import('./components/FeedbackModal'))
const StatsModal         = lazy(() => import('./components/StatsModal'))
const IdentityModal      = lazy(() => import('./components/IdentityModal'))
const LeaderboardModal   = lazy(() => import('./components/LeaderboardModal'))
const PrivacyPolicy      = lazy(() => import('./components/PrivacyPolicy'))
const LevelUpModal       = lazy(() => import('./components/LevelUpModal'))
const VirtualKeyboard    = lazy(() => import('./components/VirtualKeyboard'))
const TournamentModal    = lazy(() => import('./components/TournamentModal'))
const GroupChallengeModal = lazy(() => import('./components/GroupChallengeModal'))
const BattleModal        = lazy(() => import('./components/BattleModal'))

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [language, setLanguage] = useState(() => localStorage.getItem('typingTutorLanguage') || 'english')
  const [showStats, setShowStats] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showTournament, setShowTournament] = useState(false)
  const [showGroupChallenge, setShowGroupChallenge] = useState(false)
  const [activeRoom, setActiveRoom] = useState(null)
  // 1v1 battle state
  const [showBattle, setShowBattle] = useState(false)
  const [battleStep, setBattleStep] = useState('menu') // 'menu'|'waiting'|'countdown'|'typing'|'result'
  const [activeBattle, setActiveBattle] = useState(null)
  const [challengeData, setChallengeData] = useState(null)
  const [resultData, setResultData] = useState(null)   // sender sees friend's result
  const [searchParams, setSearchParams] = useSearchParams()
  const challengeApplied = useRef(false)
  const activeRoomApplied = useRef(false)
  const battleApplied = useRef(false)

  const [isKidsMode, setIsKidsMode] = useState(() => localStorage.getItem('typingKidsMode') === 'true')
  const [emojiTrigger, setEmojiTrigger] = useState(0)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(() => localStorage.getItem('typely_goal'))
  const [phoneticMode, setPhoneticMode] = useState(false)
  const [latinBuffer, setLatinBuffer] = useState('')
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem('typely_focusMode') === 'true')

  const { isDark, toggleTheme, colors } = useTheme()
  const { passage, setPassage, typed, setTyped, wpm, cpm, accuracy, finished, timeLeft, isTimerMode, inputRef, handleKeyDown, handleChange, resetTest, analysis, passageIndex } = useTypingTest({ difficulty, language, phoneticMode })
  const feedback = useFeedback()
  const identity = useIdentity()
  const { soundOn, toggleSound, playClick } = useKeyboardSound()
  const { xp, level, streak, achievements, newLevelUp, newAchievements, addXP, getLevelInfo, clearLevelUp, clearNewAchievements, LEVELS } = useXP()
  const [xpEarned, setXpEarned] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    localStorage.setItem('typingTutorLanguage', language)
    // If current pack not available for new language, reset to easy
    // numbers/symbols are English-only drills — keep them if already selected
    const available = Object.keys(PASSAGES[language] || {})
    if (!['easy','medium','hard','timer','custom','numbers','symbols'].includes(difficulty) && !available.includes(difficulty)) {
      setDifficulty('easy')
    }
  }, [language])

  const xpGranted = useRef(false)
  useEffect(() => {
    if (!finished) { xpGranted.current = false; return }
    if (wpm > 0 && !xpGranted.current) {
      xpGranted.current = true
      const { earned } = addXP(wpm, accuracy, difficulty)
      setXpEarned(earned)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  // Show goal modal after first ever session if no goal set
  useEffect(() => {
    if (!finished || selectedGoal) return
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]')
    if (scores.length <= 1) setShowGoalModal(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  // Persist focus mode preference
  useEffect(() => {
    localStorage.setItem('typely_focusMode', String(focusMode))
  }, [focusMode])

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
  }, [finished, identity.userId, wpm, cpm, accuracy, difficulty, language])

  const [isNewBest, setIsNewBest] = useState(false)
  const [customDir, setCustomDir] = useState('ltr')

  // Detect challenge link (?c=) or result link (?r=) on mount
  useEffect(() => {
    const c = searchParams.get('c')
    const r = searchParams.get('r')
    if (c) {
      try {
        const data = JSON.parse(atob(c))
        setChallengeData(data)
        if (data.language) setLanguage(data.language)
        if (data.difficulty) setDifficulty(data.difficulty)
      } catch {
        console.warn('Invalid challenge link')
      }
    }
    if (r) {
      try {
        const data = JSON.parse(atob(r))
        setResultData(data)  // { friendWpm, friendAccuracy, myWpm, myAccuracy }
      } catch {
        console.warn('Invalid result link')
      }
    }
    if (c || r) setSearchParams({}, { replace: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Load the room's specific passage when joining a room (skip for creator who is already on it)
  useEffect(() => {
    if (!activeRoom || activeRoom.isCreator || activeRoomApplied.current) return
    if (activeRoom.language) setLanguage(activeRoom.language)
    if (activeRoom.difficulty) setDifficulty(activeRoom.difficulty)
    // Use a 200ms delay so useTypingTest's [difficulty,language] effect fires first,
    // then we override with the exact passage text from the room
    const t = setTimeout(() => {
      if (activeRoom.passage_text) {
        setPassage(activeRoom.passage_text)
      } else {
        // Old room without passage_text — can't guarantee same passage, show error
        console.warn('Room missing passage_text — created with older app version')
        setPassage('This room was created with an older version. Please ask the host to create a new room.')
      }
      activeRoomApplied.current = true
    }, 200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom]) // only re-run when activeRoom itself changes, not language/difficulty

  // Load battle passage for joiner when countdown ends (battleStep changes to 'typing')
  useEffect(() => {
    if (!activeBattle || activeBattle.isCreator || battleStep !== 'typing' || battleApplied.current) return
    if (activeBattle.language) setLanguage(activeBattle.language)
    if (activeBattle.difficulty) setDifficulty(activeBattle.difficulty)
    // 200ms lets useTypingTest's [difficulty,language] effect fire its random pickPassage() first,
    // then we override with the exact battle passage — do NOT call resetTest() as it re-picks randomly
    const t = setTimeout(() => {
      if (activeBattle.passage_text) {
        setPassage(activeBattle.passage_text)
        battleApplied.current = true
      }
    }, 200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBattle, battleStep])

  const handleCustomStart = (text, dir) => {
    if (!text || text.trim().length < 10) return
    setCustomDir(dir || 'ltr')
    setPassage(text)
    resetTest()
  }

  const handleRoomJoin = (roomData) => {
    activeRoomApplied.current = false
    setActiveRoom(roomData)
  }

  const handleRoomLeave = () => {
    setActiveRoom(null)
    activeRoomApplied.current = false
  }

  const handleBattleStart = () => {
    // Called when countdown hits 0 — reset creator's test state (passage stays the same)
    // For joiner: passage loading useEffect handles it via setPassage
    battleApplied.current = false
    if (activeBattle?.isCreator) {
      // Reset typed/stats without changing passage
      resetTest()
      // Re-apply correct passage after resetTest picks a random one
      setTimeout(() => {
        if (activeBattle?.passage_text) setPassage(activeBattle.passage_text)
      }, 200)
    }
  }

  const handleBattleEnd = () => {
    setActiveBattle(null)
    setBattleStep('menu')
    battleApplied.current = false
  }

  const handleSubmitToRoom = async () => {
    if (!activeRoom || !identity.userId || !finished) return
    try {
      await supabase.from('room_scores').upsert({
        room_id: activeRoom.id,
        user_id: identity.userId,
        nickname: activeRoom.nickname,
        wpm,
        accuracy,
      }, { onConflict: 'room_id,user_id' })
    } catch (err) {
      console.error('Failed to submit room score:', err)
    }
    setShowGroupChallenge(true) // open modal to show updated leaderboard
  }

  const handleSessionReaction = async (reaction, message) => {
    try {
      await supabase.from('session_feedback').insert({
        user_id: identity.userId || null,
        wpm,
        accuracy,
        difficulty,
        language,
        reaction,
        message: message || null,
      })
    } catch (err) {
      console.error('Failed to save session reaction:', err)
    }
  }

  const handleFeedbackSubmit = async ({ name, email, type, message }) => {
    try {
      await supabase.from('app_feedback').insert({
        user_id: identity.userId || null,
        name,
        email: email || null,
        type,
        message,
      })
    } catch (err) {
      console.error('Failed to save feedback:', err)
    }
  }


  const handleStartDrill = (drillText) => {
    setPassage(drillText)
    resetTest()
    // After resetTest picks a random passage, override with drill text
    setTimeout(() => {
      setPassage(drillText)
      inputRef?.current?.focus?.()
    }, 100)
    // Scroll to typing area
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 150)
  }

  const handleGoalSelect = (goalId) => {
    localStorage.setItem('typely_goal', goalId)
    setSelectedGoal(goalId)
    setShowGoalModal(false)
    // Apply goal-specific defaults
    if (goalId === 'urdu') {
      setLanguage('urdu')
    } else if (goalId === 'freelancer') {
      setLanguage('english')
      setDifficulty('freelance')
    } else if (goalId === 'student') {
      setLanguage('english')
      setDifficulty('study')
    }
  }

  // Clear latin buffer when language/difficulty changes (resetTest fires automatically)
  useEffect(() => { setLatinBuffer('') }, [difficulty, language])
  // Turn off phonetic mode when switching away from RTL languages
  useEffect(() => {
    if (!['urdu', 'arabic', 'persian'].includes(language)) setPhoneticMode(false)
  }, [language])

  const handlePhoneticChange = (e) => {
    const latin = e.target.value
    setLatinBuffer(latin)
    setTyped(latinToUrdu(latin))
  }

  const handleResetTest = () => {
    resetTest()
    setLatinBuffer('')
  }

  const handleTypingKeyDown = (e) => {
    if (!phoneticMode && e.key !== 'Backspace' && e.key !== 'Enter' && e.key.length === 1) {
      const pos = typed.length
      const isError = passage[pos] !== e.key
      playClick(isError)
    }
    handleKeyDown(e)
  }

  const toggleKidsMode = () => {
    const next = !isKidsMode
    setIsKidsMode(next)
    localStorage.setItem('typingKidsMode', String(next))
    if (next) {
      resetTest() // clear typed/stats before switching to kids passage
      const pool = KIDS_PASSAGES[language] || KIDS_PASSAGES.english
      const idx = Math.floor(Math.random() * pool.length)
      setTimeout(() => setPassage(pool[idx]), 200)
    } else {
      resetTest()
    }
  }

  // When kids mode is on and language changes, load a kids passage
  useEffect(() => {
    if (!isKidsMode) return
    const pool = KIDS_PASSAGES[language] || KIDS_PASSAGES.english
    const idx = Math.floor(Math.random() * pool.length)
    setPassage(pool[idx])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKidsMode, language])

  const handleChangeWithKids = (e) => {
    if (isKidsMode && !finished) {
      const newVal = e.target.value
      const pos = newVal.length - 1
      if (pos >= 0 && pos < passage.length) {
        if (newVal[pos] === passage[pos]) {
          playCorrectSound()
          setEmojiTrigger(t => t + 1)
        } else {
          playWrongSound()
        }
      }
    }
    if (phoneticMode) handlePhoneticChange(e)
    else handleChange(e)
  }

  useEffect(() => {
    if (!finished) { setIsNewBest(false); return }
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]')
    const prevBest = scores.length > 1 ? Math.max(...scores.slice(0, -1).map((s) => s.wpm)) : 0
    setIsNewBest(wpm > prevBest && scores.length > 0)
  }, [finished, wpm])

  const currentLangDir = difficulty === 'custom' ? customDir : (LANGUAGES[language]?.dir || 'ltr')

  return (
    <Suspense fallback={null}>
    <Helmet>
      <title>Free Online Typing Tutor — Improve Typing Speed | Rafiqy</title>
      <meta name="description" content="Free typing speed test and tutor online. Improve your WPM with targeted drills, accuracy tracking, Urdu support and XP rewards. No sign-up needed." />
      <link rel="canonical" href="https://rafiqy.app/typing-tutor-online-free" />
      <meta property="og:title" content="Free Online Typing Tutor — Improve Typing Speed | Rafiqy" />
      <meta property="og:description" content="Free typing speed test and tutor online. Improve your WPM with targeted drills, accuracy tracking, Urdu support and XP rewards." />
      <meta property="og:url" content="https://rafiqy.app/typing-tutor-online-free" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Free Online Typing Tutor — Improve Typing Speed | Rafiqy" />
      <meta name="twitter:description" content="Free typing speed test and tutor online. Improve your WPM with targeted drills, accuracy tracking and Urdu support." />
    </Helmet>
    <div style={{ minHeight: '100vh', background: colors.bg, transition: 'background 0.3s ease' }}>
      <AnimatedBackground />

      <ToolsNav />

      <div style={{ padding: isMobile ? '1.25rem 0.75rem' : '1.75rem 2rem', direction: currentLangDir }}>
      <div style={{ position: 'relative', maxWidth: '56rem', margin: '0 auto' }}>
        <XPBar xp={xp} level={level} streak={streak} colors={colors} isDark={isDark} />

        {/* Language + Difficulty in one unified row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textSecondary }}>Language</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                height: '2.5rem',
              }}
            >
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textSecondary }}>Mode &amp; Pack</p>
            {!isKidsMode && <DifficultySelector difficulty={difficulty} onSelect={(d) => { setDifficulty(d) }} language={language} availablePacks={Object.keys(PASSAGES[language] || {})} colors={colors} isDark={isDark} />}
          </div>
        </div>

        {/* Phonetic input toggle — only for RTL languages */}
        {['urdu', 'arabic', 'persian'].includes(language) && !isKidsMode && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <button
              onClick={() => { setPhoneticMode(v => !v); setLatinBuffer(''); resetTest() }}
              style={{
                background: phoneticMode ? 'rgba(6,182,212,0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                border: `1px solid ${phoneticMode ? '#06b6d4' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')}`,
                borderRadius: '2rem',
                padding: '0.35rem 1rem',
                color: phoneticMode ? '#06b6d4' : colors.textSecondary,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              ⌨️ {phoneticMode
                ? `Phonetic ON — Roman → ${language === 'urdu' ? 'Urdu' : language === 'arabic' ? 'Arabic' : 'Persian'}`
                : `Type Roman → get ${language === 'urdu' ? 'Urdu اردو' : language === 'arabic' ? 'Arabic عربي' : 'Persian فارسی'}`
              }
            </button>
            {phoneticMode && (
              <span style={{ marginLeft: '0.75rem', alignSelf: 'center', fontSize: '0.76rem', color: colors.textSecondary }}>
                Type in English · letters convert to Urdu automatically
              </span>
            )}
          </div>
        )}

        {/* Inline goal selection — visible when no goal chosen yet */}
        {!selectedGoal && typed.length === 0 && !finished && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ textAlign: 'center', margin: '0 0 0.75rem', fontSize: '0.85rem', color: colors.textSecondary, fontWeight: 600 }}>
              What do you want to improve?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleGoalSelect(g.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '0.3rem', padding: '0.85rem 0.5rem',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    border: `1.5px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = isDark ? '#1e3a4c' : '#eff9ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? '#1e293b' : '#e2e8f0'; e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc' }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{g.emoji}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, lineHeight: 1.3 }}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected goal badge */}
        {selectedGoal && typed.length === 0 && !finished && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
              {GOALS.find(g => g.id === selectedGoal)?.emoji} {GOALS.find(g => g.id === selectedGoal)?.label}
            </span>
            <button
              onClick={() => { localStorage.removeItem('typely_goal'); setSelectedGoal(null); setShowGoalModal(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#06b6d4', fontSize: '0.78rem', padding: '0 0.25rem', textDecoration: 'underline' }}
            >
              Change
            </button>
          </div>
        )}

        {/* How It Works — only shown before typing begins AND for new users (<3 sessions) */}
        {typed.length === 0 && !finished && (() => {
          const sessionCount = JSON.parse(localStorage.getItem('typingScores') || '[]').length
          if (sessionCount >= 3) return null
          return (
          <>
            {/* Feature badges */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.45rem',
              justifyContent: 'center', marginBottom: '1.25rem',
            }}>
              {[
                { icon: '🆓', text: 'Free forever' },
                { icon: '🔒', text: 'No sign-up' },
                { icon: '🌐', text: '4 languages + custom text' },
                { icon: '👧', text: 'Kids Mode' },
                { icon: '⚔️', text: '1v1 Battles' },
                { icon: '📊', text: 'XP & Levels' },
                { icon: '🎯', text: 'Key Analysis' },
              ].map((b) => (
                <span key={b.text} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.25rem 0.65rem',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.07)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.2)'}`,
                  borderRadius: '99px', fontSize: '0.73rem', fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#475569',
                }}>
                  {b.icon} {b.text}
                </span>
              ))}
            </div>

            {/* Returning-user stats teaser */}
            {(() => {
              const scores = JSON.parse(localStorage.getItem('typingScores') || '[]')
              const bestWpm = scores.length ? Math.max(...scores.map((s) => s.wpm)) : 0
              if (!bestWpm) return null
              return (
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap',
                  marginBottom: '1.25rem', padding: '0.85rem 1.25rem',
                  background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)',
                  border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.2)'}`,
                  borderRadius: '0.9rem',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#06b6d4' }}>{bestWpm}</div>
                    <div style={{ fontSize: '0.68rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best WPM</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#06b6d4' }}>{scores.length}</div>
                    <div style={{ fontSize: '0.68rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sessions</div>
                  </div>
                  {streak > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
                      <div style={{ fontSize: '0.68rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day Streak</div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* How It Works cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '0.85rem', marginBottom: '1.25rem',
            }}>
              {[
                { n: '1', icon: '⚡', title: 'Take a 60-second test', sub: 'Type a real passage and measure your WPM & accuracy' },
                { n: '2', icon: '🧠', title: 'Diagnose your weak keys', sub: 'Per-key heatmap reveals exactly where you slow down' },
                { n: '3', icon: '🎯', title: 'Practice targeted drills', sub: 'Focused training on your gaps — not random repetition' },
              ].map((s) => (
                <div key={s.n} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                  padding: '1rem 1.1rem',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                  borderRadius: '0.85rem',
                }}>
                  <div style={{
                    width: '2.1rem', height: '2.1rem', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.1))',
                    border: '1.5px solid rgba(6,182,212,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4',
                  }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: colors.text, marginBottom: '0.2rem' }}>
                      {s.icon} {s.title}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: colors.textSecondary, lineHeight: 1.5 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
          )
        })()}

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

        {/* Active group room banner */}
        {activeRoom && (
          <div style={{
            background: 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
            border: '1px solid rgba(16,185,129,0.4)', borderRadius: '1rem',
            padding: '0.75rem 1.25rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>👥</span>
              <div>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
                  Group Room: <span style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{activeRoom.id}</span>
                </p>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.78rem' }}>
                  {activeRoom.language} · {activeRoom.difficulty} · Playing as <strong>{activeRoom.nickname}</strong>
                </p>
              </div>
            </div>
            <button onClick={() => setShowGroupChallenge(true)} style={{
              background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: '0.5rem', padding: '0.35rem 0.75rem',
              color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem',
            }}>View Room</button>
          </div>
        )}

        <div style={{
          background: colors.card,
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: isMobile ? '1.25rem 1rem' : '2.5rem',
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

          {/* Hero microcopy — only on very first visit before typing begins */}
          {!finished && typed.length === 0 && !isKidsMode && (() => {
            const sessionCount = JSON.parse(localStorage.getItem('typingScores') || '[]').length
            if (sessionCount >= 3) return null
            return (
            <div style={{
              textAlign: 'center',
              marginBottom: '1.25rem',
              padding: '0.85rem 1rem',
              background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.06)',
              border: `1px solid ${isDark ? 'rgba(6,182,212,0.18)' : 'rgba(6,182,212,0.25)'}`,
              borderRadius: '0.75rem',
            }}>
              <p style={{ margin: 0, fontSize: isMobile ? '0.82rem' : '0.88rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                ⚡ <strong style={{ color: colors.text }}>Takes 60 seconds</strong> · We'll detect your weak keys and build a personalised drill · No sign-up required
              </p>
            </div>
            )
          })()}

          <PassageDisplay passage={passage} typed={typed} isDark={isDark} currentLangDir={currentLangDir} colors={colors} isKidsMode={isKidsMode} />
          <EmojiPopup trigger={emojiTrigger} />

          {/* Focus Mode toggle — small, unobtrusive */}
          {!finished && typed.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.4rem', marginTop: '-0.5rem' }}>
              <button
                onClick={() => setFocusMode(v => !v)}
                title={focusMode ? 'Show live stats while typing' : 'Hide live stats for distraction-free practice'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                  color: focusMode ? '#06b6d4' : colors.textSecondary,
                  opacity: 0.7, transition: 'opacity 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
              >
                {focusMode ? '👁 Stats hidden' : '🎯 Focus mode'}
              </button>
            </div>
          )}

          <StatsGrid wpm={wpm} cpm={cpm} accuracy={accuracy} typed={typed} passage={passage} isTimerMode={isTimerMode} timeLeft={timeLeft} colors={colors} isDark={isDark} isMobile={isMobile} hideLive={focusMode && typed.length > 0 && !finished} />
          <TypingInput typed={typed} finished={finished} inputRef={inputRef} handleChange={handleChangeWithKids} handleKeyDown={handleTypingKeyDown} colors={colors} currentLangDir={currentLangDir} phoneticMode={phoneticMode} latinValue={latinBuffer} />

          {/* Virtual Keyboard — hidden on mobile (touch users don't need it) */}
          {showKeyboard && !finished && !isMobile && (
            <VirtualKeyboard
              nextChar={passage[typed.length] ?? null}
              isDark={isDark}
              colors={colors}
              language={language}
              isKidsMode={isKidsMode}
            />
          )}

          <ActionButtons
            finished={finished}
            onReset={handleResetTest}
            onFeedback={() => { if (identity.userId && !feedback.feedbackName) feedback.setFeedbackName(identity.userId); feedback.setShowFeedback(true) }}
            onViewStats={() => setShowStats(true)}
            onLeaderboard={() => setShowLeaderboard(true)}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            showKeyboard={showKeyboard}
            onToggleKeyboard={() => setShowKeyboard(v => !v)}
            onTournament={() => setShowTournament(true)}
            onGroupChallenge={() => setShowGroupChallenge(true)}
            onBattle={() => setShowBattle(true)}
            isMobile={isMobile}
            isKidsMode={isKidsMode}
            onToggleKidsMode={toggleKidsMode}
            hideMultiplayer={isKidsMode}
            isDark={isDark}
            colors={colors}
          />
        </div>

        {finished && <CompletionCard wpm={wpm} cpm={cpm} accuracy={accuracy} currentLangDir={currentLangDir} isNewBest={isNewBest} colors={colors} xpEarned={xpEarned} challengeData={challengeData} activeRoom={activeRoom} onSubmitToRoom={handleSubmitToRoom} isKidsMode={isKidsMode} onReset={handleResetTest} onReaction={handleSessionReaction} onChallenge={() => {
          const data = { wpm, accuracy, difficulty, language, passageIndex }
          const encoded = encodeURIComponent(btoa(JSON.stringify(data)))
          const origin = window.location.origin.replace('://www.', '://')
          const url = `${origin}${window.location.pathname}?c=${encoded}`
          navigator.clipboard.writeText(url).catch(() => {})
        }} onSendResult={() => {
          // Encode both scores so sender can see who won
          const data = { friendWpm: wpm, friendAccuracy: accuracy, myWpm: challengeData?.wpm, myAccuracy: challengeData?.accuracy }
          const encoded = encodeURIComponent(btoa(JSON.stringify(data)))
          const origin = window.location.origin.replace('://www.', '://')
          const url = `${origin}${window.location.pathname}?r=${encoded}`
          navigator.clipboard.writeText(url).catch(() => {})
        }} />}
        {finished && <TypingAnalysis analysis={analysis} isDark={isDark} colors={colors} onStartDrill={handleStartDrill} />}
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

        {/* Sticky Try Again bar — floats at bottom after completion so user never hunts for reset */}
        {finished && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            padding: '0.85rem 1rem',
            background: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            zIndex: 200,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          }}>
            <span style={{ fontSize: '0.82rem', color: colors.textSecondary, fontWeight: 600 }}>
              {wpm} WPM · {accuracy}% accuracy
            </span>
            <button
              onClick={handleResetTest}
              style={{
                background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                color: 'white', border: 'none', borderRadius: '0.75rem',
                padding: '0.55rem 1.5rem', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.9rem', letterSpacing: '0.01em',
                boxShadow: '0 4px 12px rgba(6,182,212,0.35)',
              }}
            >
              ↺ Try Again
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'none', border: `1px solid ${colors.border}`, borderRadius: '0.75rem',
                padding: '0.55rem 1rem', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.82rem', color: colors.textSecondary,
              }}
            >
              ↑ Review
            </button>
          </div>
        )}

        {/* Tools strip — discover the full Rafiqy platform */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: '1rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            More from Rafiqy
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {TOOLS.filter(t => t.id !== 'typing-tutor').map(t => (
              <Link
                key={t.id}
                to={t.path}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '2rem', color: colors.textSecondary,
                  fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = colors.textSecondary }}
              >
                <span>{t.icon}</span><span>{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
        </div>
      </div>

      {showGoalModal && <GoalModal onSelect={handleGoalSelect} isDark={isDark} colors={colors} />}
      <FeedbackModal {...feedback} onSubmit={handleFeedbackSubmit} isDark={isDark} colors={colors} />
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
      <GroupChallengeModal
        show={showGroupChallenge}
        onClose={() => setShowGroupChallenge(false)}
        activeRoom={activeRoom}
        onRoomJoin={handleRoomJoin}
        onRoomLeave={handleRoomLeave}
        lastWpm={finished ? wpm : 0}
        lastAccuracy={finished ? accuracy : 0}
        lastPassageIndex={passageIndex}
        lastPassage={passage}
        lastLanguage={language}
        lastDifficulty={difficulty}
        userId={identity.userId}
        isDark={isDark}
        colors={colors}
      />

      <BattleModal
        show={showBattle}
        onClose={() => setShowBattle(false)}
        battleStep={battleStep}
        setBattleStep={setBattleStep}
        activeBattle={activeBattle}
        setActiveBattle={setActiveBattle}
        myProgress={passage ? Math.min(Math.round((typed.length / passage.length) * 100), 100) : 0}
        myWpm={wpm}
        finished={finished}
        passage={passage}
        currentPassage={passage}
        currentLanguage={language}
        currentDifficulty={difficulty}
        onBattleStart={handleBattleStart}
        onBattleEnd={handleBattleEnd}
        userId={identity.userId}
        isDark={isDark}
        colors={colors}
      />
      {resultData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.18s ease',
        }}>
          <div style={{
            background: colors.card, borderRadius: '1.5rem', padding: '2rem',
            maxWidth: '420px', width: '100%', textAlign: 'center',
            border: `2px solid ${resultData.friendWpm > resultData.myWpm ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.6)'}`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}>
            <p style={{
              fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem',
              background: resultData.friendWpm > resultData.myWpm
                ? 'linear-gradient(to right, #ef4444, #f97316)'
                : 'linear-gradient(to right, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {resultData.friendWpm > resultData.myWpm ? '😅 They Beat You!' : resultData.friendWpm === resultData.myWpm ? '🤝 It\'s a Tie!' : '🏆 You Won!'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', margin: '1.25rem 0' }}>
              <div>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em' }}>YOU</p>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem', color: resultData.friendWpm > resultData.myWpm ? '#ef4444' : '#10b981' }}>{resultData.myWpm}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary }}>{resultData.myAccuracy}% acc</p>
              </div>
              <div style={{ alignSelf: 'center', color: colors.textSecondary, fontSize: '1.2rem', fontWeight: 700 }}>vs</div>
              <div>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em' }}>FRIEND</p>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem', color: resultData.friendWpm > resultData.myWpm ? '#10b981' : '#ef4444' }}>{resultData.friendWpm}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary }}>{resultData.friendAccuracy}% acc</p>
              </div>
            </div>
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              {resultData.friendWpm > resultData.myWpm
                ? `They were ${resultData.friendWpm - resultData.myWpm} WPM faster. Challenge them again?`
                : resultData.friendWpm === resultData.myWpm
                  ? 'Exact same speed — impressive!'
                  : `You were ${resultData.myWpm - resultData.friendWpm} WPM faster. Well done!`}
            </p>
            <button onClick={() => setResultData(null)} style={{
              background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '0.75rem',
              padding: '0.6rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}>Got it!</button>
          </div>
        </div>
      )}

      {/* SEO Footer */}
      <ToolSEOFooter
        heading="Free Online Typing Tutor — Speed Test, 1v1 Battles, Kids Mode & 8 Languages"
        paras={[
          "Typely is a free online typing tutor and speed test that helps you measure and dramatically improve your typing speed in words per minute (WPM). Whether you're a complete beginner learning to touch-type or an experienced typist aiming past 100 WPM, Typely offers a full training environment that adapts to your level. Practice in 8 languages — English, Urdu, Arabic, Persian, Roman Urdu, and more — with curated passages spanning everyday, academic, Islamic, and professional themes.",
          "What sets Typely apart is its complete feature set for every type of learner. Kids Mode provides a safe, encouraging interface with simpler words designed for children. Career Readiness mode uses professional vocabulary and office-style passages to prepare job-seekers and office workers for real workplace typing demands. Per-key Typing Analysis highlights your slowest and most error-prone keys so you can drill exactly where you need improvement. A Virtual Keyboard on screen shows correct finger placement in real time, and optional Sound Effects provide satisfying audio feedback on every keystroke.",
          "Compete and stay motivated with Typely's social features. Challenge a friend by sharing a unique Challenge Link — they type the same passage under the same conditions and you compare WPM side by side. 1v1 Battle mode lets two players race in real time. Group Rooms support team practice sessions. Tournament mode sets up bracket-style typing competitions, perfect for classrooms and office events. A global Leaderboard tracks top WPM scores across all players.",
          "The XP and Levels system rewards consistent practice — earn experience points after every session, level up your profile, and maintain Streaks by practising daily. Set personal Goals (target WPM, daily session count, accuracy threshold) and track them on your dashboard. Full Stats History shows your WPM, accuracy, and session count over any time range. You can also type your own Custom Passage — paste any text you want to practise.",
          "Typely supports Phonetic Input for Urdu, Arabic, and Persian — type Roman characters and they automatically transliterate to the correct script. Difficulty levels range from Beginner through Easy, Medium, Hard, to Islamic. Timer Mode adds a countdown constraint for pressure-based training. Everything runs 100% in your browser, with no account required. Your personal history and XP are stored locally and stay completely private on your device.",
        ]}
        faqs={[
          { q: "What is a good typing speed in WPM?", a: "The average person types at 40 WPM. 60 WPM is considered proficient. 80+ WPM is excellent and suitable for most professional roles. Competitive typists exceed 120 WPM. With consistent daily practice on Typely, most users gain 10–20 WPM within 2–3 weeks." },
          { q: "How long does it take to improve typing speed?", a: "With 20–30 minutes of daily practice, most people improve by 10–15 WPM within 2–3 weeks. The key habit is touch typing — never looking at the keyboard. Use Typely's per-key analysis to identify your weakest keys and drill those specifically." },
          { q: "Does Typely work for kids and beginners?", a: "Yes. Kids Mode provides a simplified, encouraging interface with shorter words and a larger font. Beginner difficulty uses the most common short words. Children as young as 6 can start with Kids Mode and progress naturally through difficulty levels." },
          { q: "What languages does Typely support?", a: "Typely supports 8 languages including English, Urdu, Arabic, Persian, Roman Urdu, and more. For Urdu, Arabic, and Persian, Phonetic Input lets you type in Roman characters which automatically convert to the correct script — no keyboard layout change needed." },
          { q: "How do I challenge a friend to a typing race?", a: "After completing a session, click the Challenge Link button. It generates a unique URL containing the passage, difficulty, and language. Share that link — your friend types the same passage and Typely compares your WPM scores. For live real-time racing, use 1v1 Battle or Group Room mode." },
          { q: "What is the XP and Levels system?", a: "Every completed typing session earns you XP based on your WPM and accuracy. Accumulate enough XP to level up your profile. Maintain a daily Streak by completing at least one session per day. Your level and streak are saved in your browser." },
          { q: "What is Career Readiness mode?", a: "Career Readiness mode uses professional vocabulary and realistic office-style passages — emails, reports, meeting notes. It's designed for job-seekers, office workers, and students who need to demonstrate fast, accurate typing in professional settings." },
          { q: "What does per-key Typing Analysis show?", a: "After each session, Typely shows a heatmap of every key you pressed, highlighting which keys had the most errors and slowest reaction time. This tells you exactly which fingers and keys to focus your practice on." },
          { q: "Can I practise with my own custom text?", a: "Yes. Select Custom Passage in the settings, paste any text you want, and Typely will use it as your typing passage. Useful for practising specific documents, code snippets, or emails relevant to your work." },
          { q: "What is Timer Mode?", a: "Timer Mode adds a countdown clock (1 min, 2 min, 5 min) to your session. You type as much as possible before time runs out, and Typely calculates your WPM and accuracy for the duration — simulating real typing tests." },
          { q: "What difficulty levels are available?", a: "Typely has 5 difficulty levels: Beginner, Easy, Medium, Hard, and Islamic. Beginner uses very common short words. Islamic difficulty features passages from Islamic texts, ideal for students of religious studies." },
          { q: "How does the Leaderboard work?", a: "The global leaderboard shows top WPM scores submitted by all players. When you complete a session, your score (WPM, accuracy, language, difficulty) is submitted anonymously to a shared leaderboard — no name or account required, just a randomly assigned player ID. Your personal history and stats remain stored only on your device." },
          { q: "Is my personal typing data private?", a: "Yes. Your personal data — WPM history, XP, level, streaks, and settings — is stored only in your browser's localStorage and never shared. The only data that leaves your device is your anonymous score submission to the leaderboard (WPM + accuracy only, no personal details)." },
          { q: "Does Typely work without an account or internet?", a: "No account is required — ever. After the first load, Typely works fully offline as a Progressive Web App (PWA). You can install it to your home screen or desktop for instant access without opening a browser." },
        ]}
      />

      {/* Related blog posts */}
      {(() => {
        const related = BLOG_POSTS.filter(p =>
          p.category?.toLowerCase() === 'typing' || p.tags?.some(t => ['typing','urdu','learning','productivity'].includes(t?.toLowerCase()))
        ).slice(0, 3)
        if (!related.length) return null
        return (
          <div style={{ maxWidth: 720, margin: '2rem auto 0', padding: '0 1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#06b6d4', marginBottom: '0.85rem' }}>
              📖 Related Guides
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.75rem' }}>
              {related.map(post => (
                <a key={post.slug} href={`/blog/${post.slug}`} style={{
                  display: 'block', padding: '0.85rem 1rem',
                  background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: '0.75rem', textDecoration: 'none', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#06b6d4'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(6,182,212,0.2)'}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>{post.hero}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', lineHeight: 1.35, marginBottom: '0.25rem' }}>{post.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.8)' }}>{post.readTime}</div>
                </a>
              ))}
            </div>
          </div>
        )
      })()}
      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '1rem' }}>
        <p style={{ color: colors.textSecondary, fontSize: '0.75rem', margin: 0 }}>
          © {new Date().getFullYear()} Rafiqy &nbsp;·&nbsp;
          <button onClick={() => setShowPrivacy(true)} style={{
            background: 'none', border: 'none', color: '#06b6d4',
            cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0,
          }}>Privacy Policy</button>
          &nbsp;·&nbsp; Free multilingual typing speed test
        </p>
      </div>
    </div>
      <FeedbackButton />
      <InstallBanner isDark={isDark} colors={colors} />
    </Suspense>
  )
}

export default App

