import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { sanitizeText } from '../utils/sanitize'
import { Link } from 'react-router-dom'
import {
  removeExtraSpaces, removeExtraBlankLines, removeAllBlankLines, trimLines,
  toUpperCase, toLowerCase, toTitleCase, toSentenceCase,
  toCamelCase, toSnakeCase, toKebabCase,
  stripHtmlTags, removeNumbers, removePunctuation,
  removeDuplicateLines, sortLines, reverseLines, addLineNumbers,
  replaceText,
} from '../utils/textFormatting'

const MAX_CHARS = 50000

const ACTION_GROUPS = [
  {
    label: 'Clean',
    color: '#10b981',
    actions: [
      { id: 'removeExtraSpaces',     label: 'Remove Extra Spaces',      fn: removeExtraSpaces },
      { id: 'trimLines',             label: 'Trim Line Whitespace',     fn: trimLines },
      { id: 'removeExtraBlankLines', label: 'Remove Extra Blank Lines', fn: removeExtraBlankLines },
      { id: 'removeAllBlankLines',   label: 'Remove All Blank Lines',   fn: removeAllBlankLines },
      { id: 'stripHtmlTags',         label: 'Strip HTML Tags',          fn: stripHtmlTags },
      { id: 'removeNumbers',         label: 'Remove Numbers',           fn: removeNumbers },
      { id: 'removePunctuation',     label: 'Remove Punctuation',       fn: removePunctuation },
      { id: 'removeDuplicateLines',  label: 'Remove Duplicate Lines',   fn: removeDuplicateLines },
    ],
  },
  {
    label: 'Case',
    color: '#06b6d4',
    actions: [
      { id: 'toUpperCase',    label: 'UPPER CASE',    fn: toUpperCase },
      { id: 'toLowerCase',    label: 'lower case',    fn: toLowerCase },
      { id: 'toTitleCase',    label: 'Title Case',    fn: toTitleCase },
      { id: 'toSentenceCase', label: 'Sentence case', fn: toSentenceCase },
      { id: 'toCamelCase',    label: 'camelCase',     fn: toCamelCase },
      { id: 'toSnakeCase',    label: 'snake_case',    fn: toSnakeCase },
      { id: 'toKebabCase',    label: 'kebab-case',    fn: toKebabCase },
    ],
  },
  {
    label: 'Lines',
    color: '#8b5cf6',
    actions: [
      { id: 'sortLines',    label: 'Sort A → Z',       fn: sortLines },
      { id: 'reverseLines', label: 'Reverse Lines',    fn: reverseLines },
      { id: 'addLineNums',  label: 'Add Line Numbers', fn: addLineNumbers },
    ],
  },
]

export default function TextCleaner() {
  const { isDark, colors } = useTheme()
  const [input, setInput]   = useState('')
  const [output, setOutput] = useState('')
  const [lastAction, setLastAction] = useState(null)
  const [copied, setCopied] = useState(false)
  // Find & Replace
  const [findVal,    setFindVal]    = useState('')
  const [replaceVal, setReplaceVal] = useState('')
  const [caseSens,   setCaseSens]   = useState(false)

  const applyAction = useCallback((fn, id) => {
    const result = fn(input || output || '')
    setOutput(result)
    setLastAction(id)
  }, [input, output])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [output])

  const handleReplace = useCallback(() => {
    const src = input || output || ''
    setOutput(replaceText(src, findVal, replaceVal, caseSens))
    setLastAction('replace')
  }, [input, output, findVal, replaceVal, caseSens])

  const inputStyle = {
    width: '100%',
    background: colors.card,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '0.9rem',
    color: colors.text,
    fontSize: '0.9rem',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  return (
    <ToolLayout toolId="text-cleaner">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(to right, #10b981, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          ✨ Text Formatter &amp; Cleaner
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Paste text, click an action — instant transformation. No upload required.
        </p>
      </div>

      {/* Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: colors.textSecondary, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(sanitizeText(e.target.value, MAX_CHARS))}
          placeholder="Paste your text here…"
          rows={7}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#10b981' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        {ACTION_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: '0.75rem' }}>
            <p style={{ color: group.color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
              {group.label}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {group.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => applyAction(action.fn, action.id)}
                  style={{
                    background: lastAction === action.id
                      ? `${group.color}22`
                      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${lastAction === action.id ? group.color : colors.border}`,
                    color: lastAction === action.id ? group.color : colors.text,
                    borderRadius: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = group.color }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = lastAction === action.id ? group.color : colors.border
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Find & Replace */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.25rem',
      }}>
        <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
          Find &amp; Replace
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Find…"
            value={findVal}
            onChange={(e) => setFindVal(e.target.value)}
            style={{ ...inputStyle, width: '160px', padding: '0.45rem 0.7rem', resize: 'none', rows: undefined, fontSize: '0.85rem' }}
          />
          <input
            type="text"
            placeholder="Replace with…"
            value={replaceVal}
            onChange={(e) => setReplaceVal(e.target.value)}
            style={{ ...inputStyle, width: '160px', padding: '0.45rem 0.7rem', resize: 'none', fontSize: '0.85rem' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: colors.textSecondary, fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={caseSens} onChange={(e) => setCaseSens(e.target.checked)} />
            Case sensitive
          </label>
          <button
            onClick={handleReplace}
            style={{
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              border: 'none',
              color: 'white',
              borderRadius: '0.4rem',
              padding: '0.45rem 1rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            Replace
          </button>
        </div>
      </div>

      {/* Output */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ color: colors.textSecondary, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Result
          </label>
          {output && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(16,185,129,0.15)' : 'none',
                  border: `1px solid ${copied ? '#10b981' : colors.border}`,
                  color: copied ? '#10b981' : colors.textSecondary,
                  borderRadius: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button
                onClick={() => { setInput(output); setOutput(''); setLastAction(null) }}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  borderRadius: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                ↑ Use as input
              </button>
            </div>
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Result will appear here after you apply an action…"
          rows={7}
          style={{
            ...inputStyle,
            borderColor: output ? '#10b981' : colors.border,
            opacity: output ? 1 : 0.6,
          }}
        />
      </div>

      {/* Cross-link */}
      {output && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/tools/word-counter"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              border: `1px solid ${colors.border}`, color: '#8b5cf6',
              padding: '0.4rem 0.9rem', borderRadius: '0.5rem',
              textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            📊 Analyze this text
          </Link>
        </div>
      )}
    </ToolLayout>
  )
}
