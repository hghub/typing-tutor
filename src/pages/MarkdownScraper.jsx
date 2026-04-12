import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#8b5cf6'

/* ── HTML → Markdown conversion ─────────────────────────────────────────── */

function stripCodeComments(code) {
  // Remove /* multi-line */ comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '')
  // Remove // single-line comments
  code = code.replace(/\/\/[^\n]*/g, '')
  // Remove # python-style comments (only when # is at start of line or after whitespace, not inside strings)
  code = code.replace(/(^|\n)([ \t]*)#[^\n]*/g, '$1$2')
  // Remove -- sql comments
  code = code.replace(/--[^\n]*/g, '')
  return code.trim()
}

function nodeToMd(node, options, listDepth = 0) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  const children = () =>
    Array.from(node.childNodes)
      .map((n) => nodeToMd(n, options, listDepth))
      .join('')

  switch (tag) {
    case 'h1': return `\n\n# ${children().trim()}\n\n`
    case 'h2': return `\n\n## ${children().trim()}\n\n`
    case 'h3': return `\n\n### ${children().trim()}\n\n`
    case 'h4': return `\n\n#### ${children().trim()}\n\n`
    case 'h5': return `\n\n##### ${children().trim()}\n\n`
    case 'h6': return `\n\n###### ${children().trim()}\n\n`

    case 'p': return `\n\n${children().trim()}\n\n`

    case 'br': return '  \n'

    case 'strong':
    case 'b': {
      const inner = children().trim()
      return inner ? `**${inner}**` : ''
    }

    case 'em':
    case 'i': {
      const inner = children().trim()
      return inner ? `*${inner}*` : ''
    }

    case 'a': {
      const href = node.getAttribute('href') || ''
      const text = children().trim()
      if (!text) return ''
      if (!href) return text
      return `[${text}](${href})`
    }

    case 'img': {
      const src = node.getAttribute('src') || ''
      const alt = node.getAttribute('alt') || ''
      return `![${alt}](${src})`
    }

    case 'code': {
      const parent = node.parentElement?.tagName?.toLowerCase()
      if (parent === 'pre') return children()
      return `\`${children()}\``
    }

    case 'pre': {
      let codeContent = node.textContent || ''
      const langClass = node.querySelector('[class*="language-"]')?.className || ''
      const langMatch = langClass.match(/language-(\w+)/)
      const lang = langMatch ? langMatch[1] : ''
      if (options.stripComments) {
        codeContent = stripCodeComments(codeContent)
      }
      return `\n\n\`\`\`${lang}\n${codeContent.trim()}\n\`\`\`\n\n`
    }

    case 'blockquote': {
      const inner = children().trim()
      return '\n\n' + inner.split('\n').map((l) => `> ${l}`).join('\n') + '\n\n'
    }

    case 'hr': return '\n\n---\n\n'

    case 'ul': {
      const items = Array.from(node.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li) => {
          const indent = '  '.repeat(listDepth)
          const content = nodeToMd(li, options, listDepth + 1).trim()
          return `${indent}- ${content}`
        })
        .join('\n')
      return `\n\n${items}\n\n`
    }

    case 'ol': {
      const items = Array.from(node.children)
        .filter((c) => c.tagName.toLowerCase() === 'li')
        .map((li, idx) => {
          const indent = '  '.repeat(listDepth)
          const content = nodeToMd(li, options, listDepth + 1).trim()
          return `${indent}${idx + 1}. ${content}`
        })
        .join('\n')
      return `\n\n${items}\n\n`
    }

    case 'li': return children().trim()

    case 'table': {
      const rows = Array.from(node.querySelectorAll('tr'))
      if (rows.length === 0) return ''
      const mdRows = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td'))
        return '| ' + cells.map((c) => c.textContent.trim().replace(/\|/g, '\\|')).join(' | ') + ' |'
      })
      const headerRow = mdRows[0]
      const headerCells = Array.from(rows[0].querySelectorAll('th, td')).length
      const separator = '| ' + Array(headerCells).fill('---').join(' | ') + ' |'
      const result = [headerRow, separator, ...mdRows.slice(1)].join('\n')
      return `\n\n${result}\n\n`
    }

    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'span':
      return children()

    default:
      return children()
  }
}

function buildToc(doc) {
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  if (headings.length === 0) return ''

  const lines = headings.map((h) => {
    const level = parseInt(h.tagName[1], 10)
    const text = h.textContent.trim()
    const anchor = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    const indent = '  '.repeat(level - 1)
    return `${indent}- [${text}](#${anchor})`
  })

  return '## Table of Contents\n\n' + lines.join('\n')
}

function htmlToMarkdown(html, { generateToc, stripComments }) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const tocContent = generateToc ? buildToc(doc) : ''

  ;['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe', 'noscript'].forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove())
  })

  const body = doc.body || doc.documentElement
  let md = nodeToMd(body, { stripComments })

  // Collapse excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  return { markdown: md, toc: tocContent }
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Toggle({ label, checked, onChange, colors }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: colors.text,
        userSelect: 'none',
      }}
    >
      <span
        onClick={onChange}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '2.5rem',
          height: '1.4rem',
          background: checked ? ACCENT : colors.border,
          borderRadius: '999px',
          transition: 'background 0.2s',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '0.2rem',
            left: checked ? '1.2rem' : '0.2rem',
            width: '1rem',
            height: '1rem',
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
      {label}
    </label>
  )
}

function Tab({ label, active, onClick, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.45rem 1.1rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        background: active ? ACCENT : 'transparent',
        color: active ? '#fff' : colors.textSecondary,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function MarkdownScraper() {
  const { isDark, colors } = useTheme()

  const [url, setUrl] = useState('')
  const [htmlInput, setHtmlInput] = useState('')
  const [generateToc, setGenerateToc] = useState(true)
  const [stripComments, setStripComments] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('markdown')
  const [copyLabel, setCopyLabel] = useState('📋 Copy for AI')

  const handleConvert = useCallback(() => {
    if (!htmlInput.trim()) return
    const { markdown, toc } = htmlToMarkdown(htmlInput, { generateToc, stripComments })
    setResult({ markdown, toc })
    setActiveTab('markdown')
  }, [htmlInput, generateToc, stripComments])

  const activeContent = result
    ? activeTab === 'markdown'
      ? result.markdown
      : result.toc || '(No headings found — Table of Contents is empty)'
    : ''

  const charCount = activeContent.length
  const wordCount = activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0
  const tokenEstimate = Math.ceil(charCount / 4)

  const handleCopy = useCallback(() => {
    if (!activeContent) return
    navigator.clipboard.writeText(activeContent).then(() => {
      setCopyLabel('✅ Copied!')
      setTimeout(() => setCopyLabel('📋 Copy for AI'), 2000)
    })
  }, [activeContent])

  const handleDownload = useCallback(() => {
    if (!result?.markdown) return
    const blob = new Blob([result.markdown], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'output.md'
    a.click()
    URL.revokeObjectURL(a.href)
  }, [result])

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.6rem',
    padding: '0.6rem 0.875rem',
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }

  return (
    <ToolLayout toolId="markdown-scraper">
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            🧹 LLM-Ready Markdown Scraper
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
            Convert raw HTML into clean, token-efficient Markdown — optimised for LLM context windows.
          </p>
        </div>

        {/* Options row */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <Toggle
              label="📑 Generate Table of Contents"
              checked={generateToc}
              onChange={() => setGenerateToc((v) => !v)}
              colors={colors}
            />
            <Toggle
              label="🧹 Strip Code Comments"
              checked={stripComments}
              onChange={() => setStripComments((v) => !v)}
              colors={colors}
            />
          </div>
        </div>

        {/* URL hint + HTML input */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Page URL (reference only)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              style={inputStyle}
            />
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: colors.textSecondary }}>
              ⚠️ Due to browser security (CORS), paste the page's HTML source directly below
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Raw HTML Source
            </label>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste the raw HTML source of any page here…"
              style={{
                ...inputStyle,
                minHeight: '250px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <button
            onClick={handleConvert}
            disabled={!htmlInput.trim()}
            style={{
              background: htmlInput.trim() ? ACCENT : colors.border,
              color: '#fff',
              border: 'none',
              borderRadius: '0.65rem',
              padding: '0.7rem 1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: htmlInput.trim() ? 'pointer' : 'not-allowed',
              width: '100%',
              transition: 'background 0.2s',
            }}
          >
            Convert to Markdown →
          </button>
        </div>

        {/* Output section */}
        {result && (
          <div style={cardStyle}>
            {/* Stats bar */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                fontSize: '0.82rem',
                color: colors.textSecondary,
                padding: '0.5rem 0.75rem',
                background: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
                borderRadius: '0.5rem',
                border: `1px solid rgba(139,92,246,0.2)`,
              }}
            >
              <span>🪙 <strong style={{ color: ACCENT }}>~{tokenEstimate.toLocaleString()}</strong> tokens</span>
              <span>📝 <strong style={{ color: colors.text }}>{wordCount.toLocaleString()}</strong> words</span>
              <span>🔤 <strong style={{ color: colors.text }}>{charCount.toLocaleString()}</strong> characters</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>
              <Tab label="Markdown" active={activeTab === 'markdown'} onClick={() => setActiveTab('markdown')} colors={colors} />
              <Tab label="Table of Contents" active={activeTab === 'toc'} onClick={() => setActiveTab('toc')} colors={colors} />
            </div>

            {/* Output textarea */}
            <textarea
              readOnly
              value={activeContent}
              style={{
                ...inputStyle,
                minHeight: '320px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                resize: 'vertical',
                lineHeight: 1.6,
                color: colors.text,
              }}
            />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  background: ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.6rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copyLabel}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  background: 'transparent',
                  color: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  borderRadius: '0.6rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ⬇️ Download .md
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
