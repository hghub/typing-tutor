import { useState } from 'react'
import { generateDrill, getWeakSummary, PRESET_DRILLS, FINGER_KEYS } from '../utils/drillGenerator'

const FINGER_NAMES = [
  'Left Pinky', 'Left Ring', 'Left Middle', 'Left Index',
  'Right Index', 'Right Middle', 'Right Ring', 'Right Pinky',
]

const FINGER_EMOJI = ['🤙', '💍', '🖕', '☝️', '☝️', '🖕', '💍', '🤙']

function speedLabel(ms, avg) {
  if (ms === null) return null
  const ratio = ms / avg
  if (ratio < 0.8) return { label: 'Fast', color: '#10b981' }
  if (ratio < 1.2) return { label: 'Good', color: '#06b6d4' }
  if (ratio < 1.6) return { label: 'Avg', color: '#f59e0b' }
  return { label: 'Slow', color: '#ef4444' }
}

function digraphIntensityColor(ms, globalAvg) {
  const ratio = ms / globalAvg
  if (ratio < 1.6) return '#f59e0b'   // mild
  if (ratio < 2.2) return '#f97316'   // moderate
  return '#ef4444'                     // severe
}

export default function TypingAnalysis({ analysis, isDark, colors, onStartDrill }) {
  const [showPresets, setShowPresets] = useState(false)
  const [drillStarted, setDrillStarted] = useState(false)

  if (!analysis) return null

  const { weakKeys, fingerAvg, slowDigraphs, fatigueDrop, globalAvg } = analysis
  const hasFatigue = fatigueDrop > 15
  const hasWeakKeys = weakKeys.length > 0
  const hasSlowDigraphs = slowDigraphs.length > 0
  const hasWeakness = hasWeakKeys || hasSlowDigraphs

  const weakSummary = getWeakSummary({ weakKeys, slowDigraphs, fingerAvg })

  const cardStyle = {
    background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '0.875rem',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
  }

  const handleStartMyDrill = () => {
    const text = generateDrill({ weakKeys, slowDigraphs, fingerAvg })
    setDrillStarted(true)
    if (onStartDrill) onStartDrill(text)
  }

  const handlePresetDrill = (text) => {
    setDrillStarted(true)
    if (onStartDrill) onStartDrill(text)
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{
        color: colors.text, fontSize: '1rem', fontWeight: 700,
        marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        ⌨️ Typing Analysis
      </h3>

      {/* Weak summary line */}
      {weakSummary && (
        <p style={{
          margin: '0 0 0.75rem 0', fontSize: '0.82rem', fontWeight: 600,
          color: '#f97316',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          🎯 Focus on: {weakSummary}
        </p>
      )}

      {/* Finger heatmap */}
      <div style={cardStyle}>
        <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
          🖐️ Finger Speed
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {fingerAvg.map((ms, i) => {
            const s = ms !== null ? speedLabel(ms, globalAvg) : null
            const isSlow = s?.label === 'Slow'
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '0.5rem 0.25rem',
                background: s ? `${s.color}18` : 'transparent',
                borderRadius: '0.5rem',
                border: `${isSlow ? '2px' : '1px'} solid ${s ? s.color + (isSlow ? 'bb' : '44') : 'transparent'}`,
                opacity: ms === null ? 0.3 : 1,
                boxShadow: isSlow ? `0 0 8px ${s.color}55` : 'none',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '1.2rem' }}>{FINGER_EMOJI[i]}</div>
                <div style={{ fontSize: '0.65rem', color: colors.textSecondary, marginTop: '0.2rem' }}>
                  {FINGER_NAMES[i].split(' ')[1]}
                </div>
                {s && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color }}>{s.label}</div>}
                {ms && <div style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms</div>}
                {/* Show key labels for slow fingers */}
                {isSlow && (
                  <div style={{ fontSize: '0.55rem', color: s.color, marginTop: '0.15rem', fontFamily: 'monospace', lineHeight: 1.3 }}>
                    {FINGER_KEYS[i]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '0.7rem', color: colors.textSecondary, margin: '0.5rem 0 0 0', textAlign: 'center' }}>
          Global avg: {globalAvg}ms/key
        </p>
      </div>

      {/* Weak keys */}
      {hasWeakKeys && (
        <div style={cardStyle}>
          <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            🐌 Slowest Keys — practice these!
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {weakKeys.map(({ char, ms }) => (
              <span key={char} style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: '0.5rem', padding: '0.35rem 0.6rem', minWidth: '2.5rem',
              }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ef4444', fontFamily: 'monospace' }}>
                  {char === ' ' ? '␣' : char}
                </span>
                <span style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Slow digraphs */}
      {hasSlowDigraphs && (
        <div style={cardStyle}>
          <p style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            🔗 Slow Key Combos
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {slowDigraphs.map(({ digraph, ms }) => {
              const col = digraphIntensityColor(ms, globalAvg)
              return (
                <span key={digraph} style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  background: `${col}18`, border: `1px solid ${col}55`,
                  borderRadius: '0.5rem', padding: '0.35rem 0.75rem',
                }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: col, fontFamily: 'monospace' }}>
                    {digraph}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: colors.textSecondary }}>{ms}ms avg</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Targeted Drill CTA */}
      <div style={{
        ...cardStyle,
        background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)',
        border: `1px solid rgba(6,182,212,0.25)`,
      }}>
        {drillStarted ? (
          <p style={{ margin: 0, color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
            🚀 Drill loaded! Scroll up to start typing.
          </p>
        ) : (
          <>
            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
              🎯 Targeted Drill
            </p>
            {hasWeakness ? (
              <>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: colors.textSecondary }}>
                  A custom passage built around your weak keys{weakSummary ? ` (${weakSummary})` : ''} will be generated for you.
                </p>
                <button
                  onClick={handleStartMyDrill}
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                    color: 'white', border: 'none', borderRadius: '0.6rem',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  🎯 Start My Targeted Drill
                </button>
                <br />
              </>
            ) : (
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                🏆 No significant weaknesses! Try a preset drill to keep improving:
              </p>
            )}
            <button
              onClick={() => setShowPresets(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.textSecondary, fontSize: '0.78rem', fontWeight: 600,
                padding: 0, textDecoration: 'underline',
              }}
            >
              {showPresets ? '▲ Hide' : '▼ Show'} preset drills
            </button>
            {showPresets && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {PRESET_DRILLS.map(drill => (
                  <button
                    key={drill.id}
                    onClick={() => handlePresetDrill(drill.text)}
                    title={drill.desc}
                    style={{
                      padding: '0.4rem 0.85rem',
                      background: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.7)',
                      border: `1px solid ${isDark ? 'rgba(71,85,105,0.6)' : 'rgba(148,163,184,0.5)'}`,
                      borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600,
                      fontSize: '0.8rem', color: colors.text, transition: 'all 0.15s',
                    }}
                  >
                    {drill.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fatigue */}
      <div style={{ ...cardStyle, border: `1px solid ${hasFatigue ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{hasFatigue ? '😴' : '💪'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: hasFatigue ? '#ef4444' : '#10b981' }}>
              {hasFatigue
                ? `Fatigue detected — speed dropped ${fatigueDrop}% toward the end`
                : 'No fatigue — consistent speed throughout!'}
            </p>
            {hasFatigue && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: colors.textSecondary }}>
                Tip: Take a short break, then practice in shorter bursts to build endurance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
