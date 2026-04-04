import { useState } from 'react'
import { getAccuracyColor } from '../utils/typing'

export default function CompletionCard({ wpm, cpm, accuracy, currentLangDir, isNewBest, colors, xpEarned, onChallenge, challengeData, onSendResult, activeRoom, onSubmitToRoom, isKidsMode, onReset }) {
  const [copied, setCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)
  const [roomCopied, setRoomCopied] = useState(false)

  const handleChallenge = () => {
    if (onChallenge) {
      onChallenge()
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleSendResult = () => {
    if (onSendResult) {
      onSendResult()
      setResultCopied(true)
      setTimeout(() => setResultCopied(false), 3000)
    }
  }

  const handleSubmitToRoom = () => {
    if (onSubmitToRoom) {
      onSubmitToRoom()
      setRoomCopied(true)
      setTimeout(() => setRoomCopied(false), 3000)
    }
  }

  const won = challengeData ? wpm > challengeData.wpm : null
  const tied = challengeData ? wpm === challengeData.wpm : false

  if (isKidsMode) {
    const stars = accuracy >= 95 ? 5 : accuracy >= 80 ? 4 : accuracy >= 60 ? 3 : accuracy >= 40 ? 2 : 1
    const starColors = ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6']
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
        backdropFilter: 'blur(12px)',
        borderRadius: '1.5rem',
        border: '3px solid rgba(236,72,153,0.5)',
        padding: '2.5rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(139,92,246,0.25)',
        direction: currentLangDir,
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
        <p style={{
          fontSize: '2rem',
          fontWeight: 900,
          background: 'linear-gradient(to right, #f97316, #ec4899, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
        }}>
          You did it! 🌟
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{
              fontSize: '2.5rem',
              color: s <= stars ? starColors[s - 1] : (colors?.textSecondary || '#94a3b8'),
              filter: s <= stars ? 'drop-shadow(0 0 6px currentColor)' : 'none',
              transition: 'color 0.2s',
            }}>★</span>
          ))}
        </div>
        <p style={{ color: colors?.text || '#e2e8f0', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          You typed <span style={{ color: '#10b981', fontWeight: 900 }}>{wpm}</span> words per minute!
        </p>
        <p style={{ color: colors?.textSecondary || '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>
          Accuracy: <span style={{ fontWeight: 900, color: getAccuracyColor(accuracy) }}>{accuracy}%</span>
        </p>
        {xpEarned > 0 && (
          <p style={{
            display: 'inline-block',
            background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '2rem',
            padding: '0.3rem 1rem',
            marginBottom: '1.25rem',
          }}>
            ✨ +{xpEarned} XP earned
          </p>
        )}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={onReset}
            style={{
              background: 'linear-gradient(to right, #f97316, #ec4899)',
              color: 'white',
              border: 'none',
              borderRadius: '0.875rem',
              padding: '0.75rem 2rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(236,72,153,0.4)',
            }}
          >
            Type Again! 🚀
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: colors?.card || '#1e293b',
      borderRadius: '0.875rem',
      border: challengeData
        ? `1px solid ${won ? 'rgba(16,185,129,0.4)' : tied ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`
        : `1px solid ${colors?.border || 'rgba(51,65,85,0.5)'}`,
      padding: '1.5rem',
      direction: currentLangDir,
    }}>

      {/* Challenge result banner */}
      {challengeData && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: '0.875rem',
          background: won
            ? 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(6,182,212,0.15))'
            : tied
              ? 'rgba(245,158,11,0.12)'
              : 'rgba(239,68,68,0.12)',
          border: `1px solid ${won ? 'rgba(16,185,129,0.4)' : tied ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`,
        }}>
          <p style={{
            fontSize: '1.8rem', margin: '0 0 0.35rem',
            fontWeight: 900,
            background: won
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : tied
                ? 'linear-gradient(to right, #f59e0b, #f97316)'
                : 'linear-gradient(to right, #ef4444, #f97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {won ? '🏆 You Won!' : tied ? '🤝 It\'s a Tie!' : '💪 You Lost'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, color: colors?.textSecondary, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em' }}>YOU</p>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', color: won ? '#10b981' : '#ef4444' }}>{wpm} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>WPM</span></p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: colors?.textSecondary }}>{accuracy}% acc</p>
            </div>
            <div style={{ alignSelf: 'center', color: colors?.textSecondary, fontSize: '1.2rem', fontWeight: 700 }}>vs</div>
            <div>
              <p style={{ margin: 0, color: colors?.textSecondary, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em' }}>CHALLENGER</p>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', color: won ? '#ef4444' : '#10b981' }}>{challengeData.wpm} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>WPM</span></p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: colors?.textSecondary }}>{challengeData.accuracy}% acc</p>
            </div>
          </div>
          {won && (
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
              You were {wpm - challengeData.wpm} WPM faster! 🔥
            </p>
          )}
          {!won && !tied && (
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>
              {challengeData.wpm - wpm} WPM behind — try again!
            </p>
          )}
        </div>
      )}

      <p style={{
        fontSize: challengeData ? '1.2rem' : '1.5rem',
        fontWeight: 700,
        background: 'linear-gradient(to right, #10b981, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.75rem',
        marginTop: 0,
      }}>
        {challengeData ? '📊 Your Stats' : '🎉 Complete!'}
      </p>
      {isNewBest && (
        <p style={{
          display: 'inline-block',
          background: '#d97706',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: '0.375rem',
          padding: '0.2rem 0.75rem',
          marginBottom: '0.75rem',
        }}>
          🏅 New Personal Best!
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: colors?.textSecondary || '#94a3b8', fontSize: '0.8rem' }}>Final WPM</span>
          <span style={{ fontWeight: 700, color: '#06b6d4', fontSize: '1.25rem' }}>{wpm}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: colors?.textSecondary || '#94a3b8', fontSize: '0.8rem' }}>CPM</span>
          <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1.25rem' }}>{cpm}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: colors?.textSecondary || '#94a3b8', fontSize: '0.8rem' }}>Accuracy</span>
          <span style={{ fontWeight: 700, color: getAccuracyColor(accuracy), fontSize: '1.25rem' }}>{accuracy}%</span>
        </div>
      </div>
      {xpEarned > 0 && (
        <p style={{
          display: 'inline-block',
          background: '#1d4ed8',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.85rem',
          borderRadius: '0.375rem',
          padding: '0.25rem 0.75rem',
          marginBottom: '0.75rem',
        }}>
          ✨ +{xpEarned} XP earned
        </p>
      )}

      {/* Buttons row */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Submit to active group room */}
        {activeRoom && !activeRoom.isCreator && (
          <button
            onClick={handleSubmitToRoom}
            style={{
              background: roomCopied ? '#059669' : '#0e7490',
              color: 'white', border: 'none', borderRadius: '0.5rem',
              padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.85rem', transition: 'background 0.2s',
            }}
          >
            {roomCopied ? '✅ Submitted!' : `📤 Submit to Room ${activeRoom.id}`}
          </button>
        )}
        {/* Submit button for creator too */}
        {activeRoom && activeRoom.isCreator && (
          <button
            onClick={handleSubmitToRoom}
            style={{
              background: roomCopied ? '#059669' : '#0e7490',
              color: 'white', border: 'none', borderRadius: '0.5rem',
              padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.85rem', transition: 'background 0.2s',
            }}
          >
            {roomCopied ? '✅ Submitted!' : `📤 Submit to Room ${activeRoom.id}`}
          </button>
        )}
        {/* Send result back — only shown when completing a challenge */}
        {challengeData && (
          <button
            onClick={handleSendResult}
            style={{
              background: resultCopied ? '#059669' : '#1e293b',
              color: 'white', border: '1px solid #334155', borderRadius: '0.5rem',
              padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.85rem', transition: 'background 0.2s',
            }}
          >
            {resultCopied ? '✅ Result Link Copied!' : '📨 Send Result to Challenger'}
          </button>
        )}
        <button
          onClick={handleChallenge}
          style={{
            background: copied ? '#059669' : 'linear-gradient(to right, #06b6d4, #3b82f6)',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.85rem', transition: 'background 0.2s',
          }}
        >
          {copied ? '✅ Link Copied!' : '⚔️ Challenge a Friend'}
        </button>
      </div>
    </div>
  )
}

