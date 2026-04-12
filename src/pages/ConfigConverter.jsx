import { useState, useCallback } from 'react'
import yaml from 'js-yaml'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#0ea5e9'

const FORMATS = ['.env', 'JSON', 'YAML', 'TOML']

/* ── TOML lightweight parser ─────────────────────────────────────────────── */
function parseTOML(str) {
  const obj = {}
  let current = obj
  let sectionKey = null

  for (const raw of str.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const sectionMatch = line.match(/^\[([^\]]+)\]$/)
    if (sectionMatch) {
      sectionKey = sectionMatch[1].trim()
      obj[sectionKey] = {}
      current = obj[sectionKey]
      continue
    }

    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue

    const key = line.slice(0, eqIdx).trim()
    const rawVal = line.slice(eqIdx + 1).trim()
    current[key] = parseTOMLValue(rawVal)
  }

  return obj
}

function parseTOMLValue(raw) {
  if ((raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10)
  if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw)
  return raw
}

function serializeTOML(obj) {
  const flat = []
  const sections = []

  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      sections.push([k, v])
    } else {
      flat.push(`${k} = ${tomlValue(v)}`)
    }
  }

  const parts = []
  if (flat.length) parts.push(flat.join('\n'))

  for (const [sec, vals] of sections) {
    const lines = [`[${sec}]`]
    for (const [k, v] of Object.entries(vals)) {
      lines.push(`${k} = ${tomlValue(v)}`)
    }
    parts.push(lines.join('\n'))
  }

  return parts.join('\n\n')
}

function tomlValue(v) {
  if (typeof v === 'string') {
    return v.includes('"') ? `'${v}'` : `"${v}"`
  }
  if (typeof v === 'boolean') return String(v)
  if (typeof v === 'number') return String(v)
  return `"${String(v)}"`
}

/* ── .env parser / serializer ────────────────────────────────────────────── */
function parseEnv(str) {
  const obj = {}
  for (const raw of str.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let val = line.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    obj[key] = val
  }
  return obj
}

function serializeEnv(obj) {
  const lines = []
  function flatten(o, prefix = '') {
    for (const [k, v] of Object.entries(o)) {
      const key = prefix ? `${prefix}_${k}`.toUpperCase() : k.toUpperCase()
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        flatten(v, key)
      } else {
        const val = String(v)
        lines.push(val.includes(' ') ? `${key}="${val}"` : `${key}=${val}`)
      }
    }
  }
  flatten(obj)
  return lines.join('\n')
}

/* ── Conversion engine ───────────────────────────────────────────────────── */
function parse(text, format) {
  switch (format) {
    case '.env': return parseEnv(text)
    case 'JSON': return JSON.parse(text)
    case 'YAML': return yaml.load(text)
    case 'TOML': return parseTOML(text)
    default: throw new Error(`Unknown format: ${format}`)
  }
}

function serialize(obj, format) {
  switch (format) {
    case '.env': return serializeEnv(obj)
    case 'JSON': return JSON.stringify(obj, null, 2)
    case 'YAML': return yaml.dump(obj, { indent: 2, lineWidth: -1 })
    case 'TOML': return serializeTOML(obj)
    default: throw new Error(`Unknown format: ${format}`)
  }
}

/* ── Sample data ─────────────────────────────────────────────────────────── */
const SAMPLES = {
  '.env': `# Application config
APP_NAME=MyApp
APP_ENV=production
DEBUG=false

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_db
DB_USER=admin
DB_PASSWORD="s3cur3p@ss"

# Server
MAX_CONNECTIONS=100
REQUEST_TIMEOUT=30`,

  'JSON': `{
  "app": {
    "name": "MyApp",
    "env": "production",
    "debug": false
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "user": "admin",
    "password": "s3cur3p@ss"
  },
  "server": {
    "max_connections": 100,
    "request_timeout": 30
  }
}`,

  'YAML': `app:
  name: MyApp
  env: production
  debug: false

database:
  host: localhost
  port: 5432
  name: myapp_db
  user: admin
  password: "s3cur3p@ss"

server:
  max_connections: 100
  request_timeout: 30`,

  'TOML': `# Application config

[app]
name = "MyApp"
env = "production"
debug = false

[database]
host = "localhost"
port = 5432
name = "myapp_db"
user = "admin"
password = "s3cur3p@ss"

[server]
max_connections = 100
request_timeout = 30`,
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ConfigConverter() {
  const { isDark, colors } = useTheme()
  const [srcFmt, setSrcFmt] = useState('JSON')
  const [tgtFmt, setTgtFmt] = useState('YAML')
  const [input, setInput] = useState(SAMPLES['JSON'])
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = useCallback((text = input, sf = srcFmt, tf = tgtFmt) => {
    setError('')
    try {
      const parsed = parse(text, sf)
      if (parsed === null || typeof parsed !== 'object') {
        throw new Error('Input must represent a key-value object.')
      }
      setOutput(serialize(parsed, tf))
    } catch (e) {
      setError(e.message || String(e))
      setOutput('')
    }
  }, [input, srcFmt, tgtFmt])

  const handleSwapFormats = useCallback(() => {
    const newSrc = tgtFmt
    const newTgt = srcFmt
    const newInput = output || input
    setSrcFmt(newSrc)
    setTgtFmt(newTgt)
    setInput(newInput)
    setOutput('')
    setError('')
  }, [srcFmt, tgtFmt, input, output])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output) return
    const ext = { '.env': 'env', 'JSON': 'json', 'YAML': 'yaml', 'TOML': 'toml' }[tgtFmt] || 'txt'
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `config.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [output, tgtFmt])

  const handleLoadSample = useCallback((fmt) => {
    setSrcFmt(fmt)
    setInput(SAMPLES[fmt])
    setOutput('')
    setError('')
  }, [])

  /* ── Styles ── */
  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.875rem',
    padding: '1.25rem',
  }

  const btnBase = {
    padding: '0.45rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
  }

  const primaryBtn = {
    ...btnBase,
    background: ACCENT,
    color: '#fff',
  }

  const secondaryBtn = {
    ...btnBase,
    background: isDark ? '#1e293b' : '#e2e8f0',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  }

  const textareaStyle = {
    width: '100%',
    minHeight: '300px',
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    padding: '0.75rem',
    color: colors.text,
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '0.82rem',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: '0.4rem',
    display: 'block',
  }

  return (
    <ToolLayout toolId="config-converter">
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            Config Polyglot Converter
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.95rem' }}>
            Convert between <strong>.env</strong>, <strong>JSON</strong>, <strong>YAML</strong>, and <strong>TOML</strong> — entirely in your browser.
          </p>
        </div>

        {/* Format selector */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>From</span>
            <FormatButtonGroup formats={FORMATS} selected={srcFmt} onSelect={setSrcFmt} colors={colors} isDark={isDark} />
          </div>

          <button
            onClick={handleSwapFormats}
            title="Swap source and target"
            style={{
              ...secondaryBtn,
              padding: '0.45rem 0.75rem',
              fontSize: '1rem',
              marginTop: 'auto',
            }}
          >
            ⇄
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>To</span>
            <FormatButtonGroup formats={FORMATS} selected={tgtFmt} onSelect={setTgtFmt} colors={colors} isDark={isDark} />
          </div>
        </div>

        {/* Two-panel editor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={card}>
            <label style={labelStyle}>Input</label>
            <textarea
              style={textareaStyle}
              value={input}
              onChange={(e) => { setInput(e.target.value); setError('') }}
              spellCheck={false}
              placeholder={`Paste your ${srcFmt} config here…`}
            />
          </div>

          <div style={card}>
            <label style={labelStyle}>Output</label>
            <textarea
              style={{ ...textareaStyle, color: output ? colors.text : colors.textSecondary }}
              value={output}
              readOnly
              spellCheck={false}
              placeholder="Converted output will appear here…"
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: isDark ? '#3b0a0a' : '#fee2e2',
            border: `1px solid ${isDark ? '#7f1d1d' : '#fca5a5'}`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            color: isDark ? '#fca5a5' : '#b91c1c',
            fontSize: '0.875rem',
            fontFamily: '"Fira Code", monospace',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button style={primaryBtn} onClick={() => convert()}>
            Convert →
          </button>
          <button style={secondaryBtn} onClick={handleSwapFormats}>
            Swap ↔
          </button>
          <button style={secondaryBtn} onClick={handleCopy} disabled={!output}>
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button style={secondaryBtn} onClick={handleDownload} disabled={!output}>
            Download
          </button>
        </div>

        {/* Sample loaders */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <span style={labelStyle}>Load a sample</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {FORMATS.map((fmt) => (
              <button
                key={fmt}
                style={{
                  ...secondaryBtn,
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.8rem',
                  borderColor: srcFmt === fmt ? ACCENT : colors.border,
                  color: srcFmt === fmt ? ACCENT : colors.text,
                }}
                onClick={() => handleLoadSample(fmt)}
              >
                Load {fmt} sample
              </button>
            ))}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}

/* ── FormatButtonGroup ───────────────────────────────────────────────────── */
function FormatButtonGroup({ formats, selected, onSelect, colors, isDark }) {
  return (
    <div style={{ display: 'flex', borderRadius: '0.5rem', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
      {formats.map((fmt, i) => {
        const isSelected = fmt === selected
        return (
          <button
            key={fmt}
            onClick={() => onSelect(fmt)}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${colors.border}` : 'none',
              background: isSelected ? ACCENT : (isDark ? '#1e293b' : '#f1f5f9'),
              color: isSelected ? '#fff' : colors.text,
              transition: 'background 0.15s',
            }}
          >
            {fmt}
          </button>
        )
      })}
    </div>
  )
}
