import { useState, useMemo, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'

import { useTheme } from '../hooks/useTheme'
import { analyzeText } from '../utils/textAnalysis'
import { sanitizeText } from '../utils/sanitize'
import { Link } from 'react-router-dom'

const MAX_CHARS = 50000

function StatCard({ label, value, sub, color, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
    }}>
      <span style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: color || colors.text, lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && <span style={{ color: colors.textSecondary, fontSize: '0.72rem' }}>{sub}</span>}
    </div>
  )
}

function ReadabilityBar({ score, label, colors }) {
  const pct = score ?? 0
  const barColor = pct >= 60 ? '#10b981' : pct >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>Flesch Reading Ease</span>
        <span style={{ fontWeight: 700, color: barColor, fontSize: '0.85rem' }}>{score ?? '—'} · {label}</span>
      </div>
      <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '99px', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.65rem', color: colors.textSecondary }}>Very Difficult</span>
        <span style={{ fontSize: '0.65rem', color: colors.textSecondary }}>Very Easy</span>
      </div>
    </div>
  )
}

export default function WordCounter() {
  const { isDark, colors } = useTheme()
  const [text, setText] = useState('')

  const handleChange = useCallback((e) => {
    setText(sanitizeText(e.target.value, MAX_CHARS))
  }, [])

  const stats = useMemo(() => analyzeText(text), [text])

  const isEmpty = text.trim().length === 0
  const charPct = Math.round((text.length / MAX_CHARS) * 100)

  return (
    <ToolLayout toolId="word-counter">
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          📊 Word Counter &amp; Text Analyzer
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Paste any text — get instant word count, readability score, reading time and keyword density.
          <span style={{ color: '#8b5cf6', fontWeight: 600 }}> Everything happens in your browser.</span>
        </p>
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Paste or type your text here… (up to 50,000 characters)"
          rows={10}
          style={{
            width: '100%',
            background: colors.card,
            border: `1.5px solid ${text ? '#8b5cf6' : colors.border}`,
            borderRadius: '0.75rem',
            padding: '1rem',
            color: colors.text,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#8b5cf6' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = text ? '#8b5cf6' : colors.border }}
        />
        {/* Char counter */}
        <div style={{
          position: 'absolute',
          bottom: '0.6rem',
          right: '0.75rem',
          fontSize: '0.7rem',
          color: charPct > 90 ? '#ef4444' : colors.textSecondary,
        }}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>
      </div>

      {/* Clear button */}
      {!isEmpty && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setText('')}
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              padding: '0.4rem 0.9rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            ✕ Clear
          </button>
          {/* Cross-link: improve your typing */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: `1px solid ${colors.border}`,
              color: '#06b6d4',
              padding: '0.4rem 0.9rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            ⌨️ Improve your typing speed
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard label="Words"       value={stats.words.toLocaleString()}   color="#8b5cf6" colors={colors} />
        <StatCard label="Characters"  value={stats.chars.toLocaleString()}   colors={colors} sub="incl. spaces" />
        <StatCard label="No Spaces"   value={stats.charsNoSpaces.toLocaleString()} colors={colors} />
        <StatCard label="Sentences"   value={stats.sentences.toLocaleString()} colors={colors} />
        <StatCard label="Paragraphs"  value={stats.paragraphs.toLocaleString()} colors={colors} />
        <StatCard label="Lines"       value={stats.lines.toLocaleString()}   colors={colors} />
        <StatCard label="Reading Time" value={isEmpty ? '—' : stats.readingTime} color="#06b6d4" colors={colors} sub="at 200 WPM" />
        <StatCard label="Avg Words/Sentence" value={isEmpty ? '—' : stats.avgWordsPerSentence} colors={colors} />
      </div>

      {/* Readability */}
      {!isEmpty && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
            Readability
          </h2>
          <ReadabilityBar
            score={stats.fleschScore}
            label={stats.readabilityLabel}
            colors={colors}
          />
        </div>
      )}

      {/* Top keywords */}
      {!isEmpty && stats.topKeywords.length > 0 && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
            Top Keywords
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats.topKeywords.map(({ word, count }) => (
              <span key={word} style={{
                background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#8b5cf6',
                borderRadius: '2rem',
                padding: '0.25rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
              }}>
                {word}
                <span style={{ color: colors.textSecondary, fontWeight: 400, fontSize: '0.72rem' }}>×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state CTA */}
      {isEmpty && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: colors.textSecondary,
          fontSize: '0.9rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ margin: '0 0 1rem' }}>Paste any text above to see a full analysis</p>
          <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
            Works with English, Urdu, Arabic — any language
          </p>
        </div>
      )}
      </ToolLayout>
  )
}

