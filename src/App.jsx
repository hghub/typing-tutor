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
import GroupChallengeModal from './components/GroupChallengeModal'
import BattleModal from './components/BattleModal'

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
  const challengeApplied = useRef(false)
  const activeRoomApplied = useRef(false)
  const battleApplied = useRef(false)

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

  // Detect challenge link (?c=) or result link (?r=) on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('c')
    const r = params.get('r')
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
    if (c || r) window.history.replaceState({}, '', window.location.pathname)
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
        // fallback to index-based if passage_text missing (old rooms)
        const pool = (PASSAGES[activeRoom.language]?.[activeRoom.difficulty] ?? PASSAGES.english?.easy) || []
        const idx = (activeRoom.passage_index ?? 0) % Math.max(pool.length, 1)
        if (pool[idx]) setPassage(pool[idx])
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
    const t = setTimeout(() => {
      if (activeBattle.passage_text) {
        setPassage(activeBattle.passage_text)
        resetTest()
        battleApplied.current = true
      }
    }, 100)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBattle, battleStep])

  const handleCustomStart = (text, dir) => {
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
    // Called when countdown hits 0 — load the battle passage
    battleApplied.current = false
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
              language={language}
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
            onGroupChallenge={() => setShowGroupChallenge(true)}
            onBattle={() => setShowBattle(true)}
          />
        </div>

        {finished && <CompletionCard wpm={wpm} cpm={cpm} accuracy={accuracy} currentLangDir={currentLangDir} isNewBest={isNewBest} colors={colors} xpEarned={xpEarned} challengeData={challengeData} activeRoom={activeRoom} onSubmitToRoom={handleSubmitToRoom} onChallenge={() => {
          const data = { wpm, accuracy, difficulty, language, passageIndex }
          const encoded = btoa(JSON.stringify(data))
          const url = `${window.location.origin}${window.location.pathname}?c=${encoded}`
          navigator.clipboard.writeText(url).catch(() => {})
        }} onSendResult={() => {
          // Encode both scores so sender can see who won
          const data = { friendWpm: wpm, friendAccuracy: accuracy, myWpm: challengeData?.wpm, myAccuracy: challengeData?.accuracy }
          const encoded = btoa(JSON.stringify(data))
          const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`
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

