import { useState, useCallback, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#ec4899'

/* ── Data arrays ──────────────────────────────────────────────────────── */
const FIRST_NAMES = [
  'Ahmed', 'Ali', 'Fatima', 'Sara', 'Omar', 'Zara', 'Hassan', 'Ayesha',
  'Usman', 'Maryam', 'Bilal', 'Hina', 'Tariq', 'Sana', 'Imran', 'Nadia',
  'Kamran', 'Rabia', 'Asad', 'Layla', 'James', 'Emma', 'Noah', 'Olivia',
  'Liam', 'Sofia',
]

const LAST_NAMES = [
  'Khan', 'Malik', 'Sheikh', 'Ahmed', 'Butt', 'Chaudhry', 'Qureshi',
  'Siddiqui', 'Ansari', 'Awan', 'Mirza', 'Baig', 'Hussain', 'Rizvi',
  'Iqbal', 'Raza', 'Niazi', 'Abbasi', 'Hashmi', 'Shah', 'Smith', 'Johnson',
  'Williams', 'Brown',
]

const DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com']

const PK_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Peshawar', 'Quetta', 'Multan', 'Sialkot', 'Gujranwala',
]

const STREETS = [
  'Main Boulevard', 'Garden Road', 'Clifton Avenue', 'Mall Road',
  'DHA Phase', 'Gulberg Street', 'Johar Town Lane', 'Model Town Drive',
  'Satellite Town Road', 'Blue Area Plaza', 'Cantt Road', 'GT Road',
]

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'minim', 'veniam', 'quis',
]

const EDGE_CASE_SPECIALS = [
  '<script>alert(1)</script>',
  'DROP TABLE users;',
  '  ',
  'café résumé',
  '\n\r\t',
  '0️⃣🔥💥',
  'null',
  'undefined',
]

/* ── Helpers ──────────────────────────────────────────────────────────── */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomStr(len) {
  return Math.random().toString(36).substring(2, 2 + len)
}

/* ── Field type definitions ───────────────────────────────────────────── */
const FIELD_TYPES = [
  { id: 'uuid',      label: 'UUID',          generate: () => crypto.randomUUID() },
  { id: 'fullName',  label: 'Full Name',     generate: () => pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES) },
  { id: 'firstName', label: 'First Name',    generate: () => pick(FIRST_NAMES) },
  { id: 'lastName',  label: 'Last Name',     generate: () => pick(LAST_NAMES) },
  { id: 'email',     label: 'Email',         generate: () => randomStr(6) + '@' + pick(DOMAINS) },
  { id: 'phone',     label: 'Phone (PK)',    generate: () => '+92' + Math.floor(3000000000 + Math.random() * 999999999) },
  { id: 'int',       label: 'Integer',       generate: () => Math.floor(Math.random() * 1000) },
  { id: 'float',     label: 'Float',         generate: () => parseFloat((Math.random() * 1000).toFixed(2)) },
  { id: 'boolean',   label: 'Boolean',       generate: () => Math.random() > 0.5 },
  { id: 'date',      label: 'Date',          generate: () => new Date(Date.now() - Math.random() * 3e10).toISOString().split('T')[0] },
  { id: 'datetime',  label: 'DateTime',      generate: () => new Date(Date.now() - Math.random() * 3e10).toISOString() },
  { id: 'url',       label: 'URL',           generate: () => 'https://' + pick(DOMAINS) + '/item/' + Math.floor(Math.random() * 10000) },
  { id: 'city',      label: 'City (PK)',     generate: () => pick(PK_CITIES) },
  { id: 'address',   label: 'Address',       generate: () => Math.floor(Math.random() * 500 + 1) + ' ' + pick(STREETS) },
  { id: 'lorem',     label: 'Lorem Text',    generate: () => [...LOREM_WORDS].sort(() => 0.5 - Math.random()).slice(0, 8).join(' ') },
  { id: 'color',     label: 'Hex Color',     generate: () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0') },
  { id: 'ipv4',      label: 'IPv4 Address',  generate: () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.') },
]

const TYPE_MAP = Object.fromEntries(FIELD_TYPES.map((t) => [t.id, t]))

const DEFAULT_SCHEMA = [
  { id: 1, name: 'id',        type: 'uuid' },
  { id: 2, name: 'name',      type: 'fullName' },
  { id: 3, name: 'email',     type: 'email' },
  { id: 4, name: 'age',       type: 'int' },
  { id: 5, name: 'createdAt', type: 'date' },
]

/* ── Data generators ──────────────────────────────────────────────────── */
function maybeEdge(value, fieldType) {
  if (Math.random() > 0.1) return value
  const roll = Math.random()
  if (roll < 0.33) return null
  if (roll < 0.66) return fieldType === 'int' || fieldType === 'float' ? 0 : ''
  return pick(EDGE_CASE_SPECIALS)
}

function generateRows(schema, count, edgeMode) {
  return Array.from({ length: count }, () => {
    const row = {}
    for (const field of schema) {
      if (!field.name.trim()) continue
      const gen = TYPE_MAP[field.type]?.generate
      const raw = gen ? gen() : ''
      row[field.name.trim()] = edgeMode ? maybeEdge(raw, field.type) : raw
    }
    return row
  })
}

function toCSV(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','))
  }
  return lines.join('\n')
}

function toJSON(rows) {
  return JSON.stringify(rows, null, 2)
}

function byteSize(str) {
  return new TextEncoder().encode(str).length
}

/* ── Sub-components ───────────────────────────────────────────────────── */
function SectionCard({ title, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {title && (
        <h2 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          color: ACCENT,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

function StyledInput({ colors, ...props }) {
  return (
    <input
      {...props}
      style={{
        background: colors.input ?? colors.bg,
        border: `1px solid ${colors.inputBorder ?? colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.45rem 0.75rem',
        color: colors.text,
        fontSize: '0.875rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    />
  )
}

function StyledSelect({ colors, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        background: colors.input ?? colors.bg,
        border: `1px solid ${colors.inputBorder ?? colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.45rem 0.75rem',
        color: colors.text,
        fontSize: '0.875rem',
        outline: 'none',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function ToggleButton({ active, onClick, children, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? ACCENT : 'transparent',
        border: `1px solid ${active ? ACCENT : colors.border}`,
        borderRadius: '0.4rem',
        color: active ? '#fff' : colors.text,
        cursor: 'pointer',
        padding: '0.4rem 1rem',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

let schemaIdCounter = 10

/* ── Main component ───────────────────────────────────────────────────── */
export default function MockDataGenerator() {
  const { colors } = useTheme()

  const [schema, setSchema] = useState(DEFAULT_SCHEMA)
  const [rowCount, setRowCount] = useState(100)
  const [format, setFormat] = useState('json')
  const [edgeMode, setEdgeMode] = useState(false)
  const [rows, setRows] = useState([])
  const [generating, setGenerating] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const outputRef = useRef('')

  /* Schema helpers */
  const addField = useCallback(() => {
    setSchema((s) => [...s, { id: ++schemaIdCounter, name: '', type: 'fullName' }])
  }, [])

  const removeField = useCallback((id) => {
    setSchema((s) => s.filter((f) => f.id !== id))
  }, [])

  const updateField = useCallback((id, key, value) => {
    setSchema((s) => s.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  }, [])

  /* Generate */
  const handleGenerate = useCallback(() => {
    const count = Math.max(1, Math.min(10000, Number(rowCount) || 1))
    const validSchema = schema.filter((f) => f.name.trim())
    if (!validSchema.length) return

    if (count > 1000) {
      setGenerating(true)
      setTimeout(() => {
        const result = generateRows(validSchema, count, edgeMode)
        setRows(result)
        outputRef.current = format === 'json' ? toJSON(result) : toCSV(result)
        setGenerating(false)
      }, 0)
    } else {
      const result = generateRows(validSchema, count, edgeMode)
      setRows(result)
      outputRef.current = format === 'json' ? toJSON(result) : toCSV(result)
    }
  }, [schema, rowCount, format, edgeMode])

  /* Keep output in sync when format changes after generation */
  const handleFormatChange = useCallback((f) => {
    setFormat(f)
    if (rows.length) {
      outputRef.current = f === 'json' ? toJSON(rows) : toCSV(rows)
    }
  }, [rows])

  /* Download */
  const handleDownload = useCallback(() => {
    if (!rows.length) return
    const content = format === 'json' ? toJSON(rows) : toCSV(rows)
    const mime = format === 'json' ? 'application/json' : 'text/csv'
    const ext = format === 'json' ? 'json' : 'csv'
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-data.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, format])

  /* Copy */
  const handleCopy = useCallback(() => {
    if (!rows.length) return
    const content = format === 'json' ? toJSON(rows) : toCSV(rows)
    navigator.clipboard.writeText(content).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }, [rows, format])

  /* Preview: first 5 rows */
  const previewRows = rows.slice(0, 5)
  const previewHeaders = rows.length ? Object.keys(rows[0]) : []

  /* Stats */
  const sizeKB = rows.length
    ? (byteSize(format === 'json' ? toJSON(rows) : toCSV(rows)) / 1024).toFixed(1)
    : 0

  const validFieldCount = schema.filter((f) => f.name.trim()).length

  /* Shared cell style */
  const cellStyle = {
    padding: '0.45rem 0.65rem',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: '0.8rem',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '160px',
  }

  const thStyle = {
    ...cellStyle,
    fontWeight: 700,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '0.05em',
    background: colors.card,
  }

  return (
    <ToolLayout toolId="mock-data">
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        color: colors.text,
        fontFamily: 'inherit',
      }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800 }}>
            Mock Data Generator
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
            Define a schema, choose a row count, and download realistic fake data as JSON or CSV.
            Use <strong style={{ color: ACCENT }}>Edge Case Mode</strong> to stress-test your code
            with nulls, zeros, and special characters.
          </p>
        </div>

        {/* Schema builder */}
        <SectionCard title="Schema" colors={colors}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '42%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thStyle}>Field Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {schema.map((field) => (
                  <tr key={field.id}>
                    <td style={{ ...cellStyle, padding: '0.35rem 0.5rem' }}>
                      <StyledInput
                        colors={colors}
                        value={field.name}
                        onChange={(e) => updateField(field.id, 'name', e.target.value)}
                        placeholder="field_name"
                      />
                    </td>
                    <td style={{ ...cellStyle, padding: '0.35rem 0.5rem' }}>
                      <StyledSelect
                        colors={colors}
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                        style={{ width: '100%' }}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </StyledSelect>
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <button
                        onClick={() => removeField(field.id)}
                        title="Remove field"
                        style={{
                          background: '#ef444422',
                          border: '1px solid #ef444444',
                          borderRadius: '0.4rem',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.85rem',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addField}
            style={{
              alignSelf: 'flex-start',
              background: `${ACCENT}18`,
              border: `1px dashed ${ACCENT}66`,
              borderRadius: '0.5rem',
              color: ACCENT,
              cursor: 'pointer',
              padding: '0.45rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            + Add Field
          </button>
        </SectionCard>

        {/* Generation options */}
        <SectionCard title="Options" colors={colors}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
            {/* Row count */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '140px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Row Count
              </label>
              <StyledInput
                colors={colors}
                type="number"
                min={1}
                max={10000}
                value={rowCount}
                onChange={(e) => setRowCount(e.target.value)}
                style={{ width: '130px' }}
              />
            </div>

            {/* Format toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Output Format
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <ToggleButton active={format === 'json'} onClick={() => handleFormatChange('json')} colors={colors}>
                  JSON
                </ToggleButton>
                <ToggleButton active={format === 'csv'} onClick={() => handleFormatChange('csv')} colors={colors}>
                  CSV
                </ToggleButton>
              </div>
            </div>

            {/* Edge case mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Edge Case Mode
              </label>
              <ToggleButton active={edgeMode} onClick={() => setEdgeMode((v) => !v)} colors={colors}>
                {edgeMode ? '⚠️ Edge Mode ON' : '⚠️ Edge Mode OFF'}
              </ToggleButton>
            </div>
          </div>

          {edgeMode && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#f59e0b', background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
              ⚠️ Edge Case Mode is active — ~10% of values will be replaced with nulls, zeros, empty strings, or special characters.
            </p>
          )}
        </SectionCard>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || schema.filter((f) => f.name.trim()).length === 0}
          style={{
            background: generating || !validFieldCount ? colors.border : ACCENT,
            border: 'none',
            borderRadius: '0.65rem',
            color: generating || !validFieldCount ? colors.textSecondary : '#fff',
            cursor: generating || !validFieldCount ? 'not-allowed' : 'pointer',
            padding: '0.8rem',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            width: '100%',
            transition: 'opacity 0.15s',
          }}
        >
          {generating ? '⏳ Generating…' : '⚡ Generate Data'}
        </button>

        {/* Preview + Download/Copy */}
        {rows.length > 0 && (
          <>
            <SectionCard title={`Preview (first ${Math.min(5, rows.length)} rows)`} colors={colors}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {previewHeaders.map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {previewHeaders.map((h) => (
                          <td key={h} style={cellStyle}>
                            {row[h] === null ? <span style={{ color: colors.textSecondary, fontStyle: 'italic' }}>null</span>
                              : row[h] === '' ? <span style={{ color: colors.textSecondary, fontStyle: 'italic' }}>""</span>
                              : String(row[h])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Actions + Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleDownload}
                style={{
                  background: ACCENT,
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                ⬇️ Download .{format.toUpperCase()}
              </button>

              <button
                onClick={handleCopy}
                style={{
                  background: `${ACCENT}20`,
                  border: `1px solid ${ACCENT}55`,
                  borderRadius: '0.5rem',
                  color: ACCENT,
                  cursor: 'pointer',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {copyMsg || '📋 Copy to Clipboard'}
              </button>

              <span style={{
                marginLeft: 'auto',
                fontSize: '0.8rem',
                color: colors.textSecondary,
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                padding: '0.4rem 0.8rem',
              }}>
                Generated <strong style={{ color: colors.text }}>{rows.length.toLocaleString()}</strong> rows
                · <strong style={{ color: colors.text }}>{previewHeaders.length}</strong> fields
                · <strong style={{ color: colors.text }}>{sizeKB} KB</strong>
              </span>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
