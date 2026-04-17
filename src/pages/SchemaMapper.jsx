import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

/* ── Constants ──────────────────────────────────────────────────────────── */

const ACCENT = '#06b6d4'
const MAPPING_PALETTE = [
  '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#3b82f6', '#ec4899', '#f97316',
  '#14b8a6', '#a855f7',
]

const TYPE_ICONS = {
  string: '📝',
  number: '🔢',
  boolean: '☑️',
  array: '📋',
  object: '📦',
  null: '∅',
  unknown: '❓',
}

const DEMO_SOURCE = `{
  "user_id": 1,
  "first_name": "Jane",
  "last_name": "Doe",
  "email_address": "jane@example.com",
  "phone_num": "+1-555-0100",
  "addr_line1": "123 Main St",
  "city": "Springfield",
  "zip_code": "62701",
  "created_at": "2024-01-15T10:00:00Z",
  "is_active": true,
  "score": 87.5
}`

const DEMO_DEST = `{
  "userId": 0,
  "fullName": "",
  "email": "",
  "phone": "",
  "address": {
    "street": "",
    "city": "",
    "postalCode": ""
  },
  "metadata": {
    "createdAt": "",
    "active": false,
    "rating": 0
  }
}`

/* ── Schema parsing ─────────────────────────────────────────────────────── */

function detectType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function detectTypeFromSchema(schemaNode) {
  if (!schemaNode) return 'unknown'
  if (schemaNode.type) return schemaNode.type
  if (schemaNode.properties) return 'object'
  if (schemaNode.items) return 'array'
  return 'unknown'
}

function flattenObject(obj, prefix = '', depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return []
  const fields = []
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    const type = detectType(value)
    const parts = path.split('.')
    fields.push({
      path,
      label: key,
      type,
      depth,
      parent: prefix || null,
    })
    if (type === 'object' && value !== null && depth < maxDepth) {
      fields.push(...flattenObject(value, path, depth + 1, maxDepth))
    } else if (type === 'array' && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && depth < maxDepth) {
      fields.push(...flattenObject(value[0], `${path}[0]`, depth + 1, maxDepth))
    }
  }
  return fields
}

function flattenJsonSchema(schema, prefix = '', depth = 0, maxDepth = 5) {
  if (depth > maxDepth || !schema) return []
  const fields = []
  const props = schema.properties || {}
  for (const key of Object.keys(props)) {
    const path = prefix ? `${prefix}.${key}` : key
    const node = props[key]
    const type = detectTypeFromSchema(node)
    fields.push({
      path,
      label: key,
      type,
      depth,
      parent: prefix || null,
    })
    if ((type === 'object' || node.properties) && depth < maxDepth) {
      fields.push(...flattenJsonSchema(node, path, depth + 1, maxDepth))
    }
  }
  return fields
}

function isJsonSchema(parsed) {
  return (
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    (parsed.$schema || (parsed.type === 'object' && parsed.properties))
  )
}

function parseSchema(text) {
  try {
    const parsed = JSON.parse(text)
    if (isJsonSchema(parsed)) {
      return { fields: flattenJsonSchema(parsed), error: null }
    }
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { fields: flattenObject(parsed), error: null }
    }
    return { fields: [], error: 'Must be a JSON object or JSON Schema' }
  } catch (e) {
    return { fields: [], error: e.message }
  }
}

/* ── Levenshtein distance for auto-suggest ─────────────────────────────── */

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalizeName(s) {
  return s.toLowerCase().replace(/[_\-\s]/g, '')
}

function similarity(a, b) {
  const na = normalizeName(a), nb = normalizeName(b)
  if (na === nb) return 1
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(na, nb) / maxLen
}

/* ── Code generation ────────────────────────────────────────────────────── */

function buildNestedObject(mappings, indent = 2) {
  const nested = {}
  for (const m of mappings) {
    const parts = m.destPath.split('.')
    let node = nested
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {}
      node = node[parts[i]]
    }
    const leaf = parts[parts.length - 1]
    node[leaf] = `source.${m.srcPath}`
  }
  return nested
}

function renderJsObject(obj, indent) {
  const pad = ' '.repeat(indent)
  const lines = []
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      lines.push(`${pad}${k}: {`)
      lines.push(...renderJsObject(v, indent + 2).split('\n').map(l => l))
      lines.push(`${pad}},`)
    } else {
      lines.push(`${pad}${k}: ${v},`)
    }
  }
  return lines.join('\n')
}

function generateJS(mappings) {
  if (mappings.length === 0) {
    return `// Auto-generated by Rafiqy Schema Mapper\nfunction transform(source) {\n  return {};\n}`
  }
  const nested = buildNestedObject(mappings)
  const body = renderJsObject(nested, 4)
  return `// Auto-generated by Rafiqy Schema Mapper\nfunction transform(source) {\n  return {\n${body}\n  };\n}`
}

function generatePython(mappings) {
  if (mappings.length === 0) {
    return `# Auto-generated by Rafiqy Schema Mapper\ndef transform(source: dict) -> dict:\n    return {}`
  }
  const nested = buildNestedObject(mappings)
  function renderPyObject(obj, depth) {
    const pad = '    '.repeat(depth)
    const lines = []
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'object' && v !== null) {
        lines.push(`${pad}"${k}": {`)
        lines.push(...renderPyObject(v, depth + 1).split('\n'))
        lines.push(`${pad}},`)
      } else {
        const srcPath = v.replace('source.', '')
        const parts = srcPath.split('.')
        const getter = parts.reduce((acc, p) => `${acc}.get("${p}", {})`, 'source').replace(/.get\("([^"]+)", \{\}\)$/, `.get("$1")`)
        lines.push(`${pad}"${k}": ${getter},`)
      }
    }
    return lines.join('\n')
  }
  const body = renderPyObject(nested, 2)
  return `# Auto-generated by Rafiqy Schema Mapper\ndef transform(source: dict) -> dict:\n    return {\n${body}\n    }`
}

/* ── Syntax highlighting ────────────────────────────────────────────────── */

function highlight(code, lang) {
  const jsKeywords = /\b(function|return|const|let|var|if|else|for|while|do|new|this|typeof|instanceof|null|undefined|true|false)\b/g
  const pyKeywords = /\b(def|return|dict|None|True|False|if|else|for|while|in|not|and|or|import|from|class|self)\b/g
  const commentRe = lang === 'python' ? /^(#.*)$/gm : /^(\/\/.*)$/gm
  const stringRe = /"([^"]*)"/g

  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const placeholder = (tag, content) => `\x00${tag}\x01${content}\x02`
  const restore = (s) => s
    .replace(/\x00kw\x01(.*?)\x02/g, '<span style="color:#60a5fa">$1</span>')
    .replace(/\x00cm\x01(.*?)\x02/g, '<span style="color:#94a3b8">$1</span>')
    .replace(/\x00st\x01(.*?)\x02/g, '<span style="color:#34d399">"$1"</span>')
    .replace(/\x00nu\x01(.*?)\x02/g, '<span style="color:#f97316">$1</span>')

  escaped = escaped.replace(commentRe, (_, c) => placeholder('cm', c.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')))
  escaped = escaped.replace(stringRe, (_, inner) => placeholder('st', inner))
  escaped = escaped.replace(lang === 'python' ? pyKeywords : jsKeywords, (kw) => placeholder('kw', kw))
  escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, (n) => placeholder('nu', n))

  return restore(escaped)
}

/* ── Complexity score ───────────────────────────────────────────────────── */

function computeComplexity(srcFields, dstFields, mappings) {
  const totalSrc = srcFields.length
  const totalDst = dstFields.length
  if (totalSrc === 0 && totalDst === 0) return { score: 0, label: 'LOW', mapped: 0, unmapped: 0, depth: 0, typeMismatches: 0 }

  const maxSrcDepth = srcFields.reduce((m, f) => Math.max(m, f.depth), 0)
  const maxDstDepth = dstFields.reduce((m, f) => Math.max(m, f.depth), 0)
  const depth = Math.max(maxSrcDepth, maxDstDepth)

  const mappedDstPaths = new Set(mappings.map(m => m.destPath))
  const unmapped = dstFields.filter(f => !mappedDstPaths.has(f.path)).length
  const unmappedPct = totalDst > 0 ? unmapped / totalDst : 0

  const typeMismatches = mappings.filter(m => {
    const s = srcFields.find(f => f.path === m.srcPath)
    const d = dstFields.find(f => f.path === m.destPath)
    return s && d && s.type !== d.type && s.type !== 'unknown' && d.type !== 'unknown'
  }).length

  const fieldScore = Math.min(30, totalSrc * 1.5)
  const depthScore = Math.min(20, depth * 6)
  const unmappedScore = unmappedPct * 30
  const mismatchScore = Math.min(20, typeMismatches * 5)

  const score = Math.round(fieldScore + depthScore + unmappedScore + mismatchScore)
  const label = score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : 'HIGH'
  return { score, label, mapped: mappings.length, unmapped, depth, typeMismatches }
}

/* ── Field tree node component ──────────────────────────────────────────── */

function FieldNode({ field, allFields, selectedSrcPath, mappings, onClickField, side, collapsed, onToggleCollapse, colors, isDark }) {
  const childFields = allFields.filter(f => f.parent === field.path)
  const hasChildren = childFields.length > 0
  const isCollapsed = collapsed.has(field.path)

  const myMappings = mappings.filter(m =>
    side === 'src' ? m.srcPath === field.path : m.destPath === field.path
  )
  const isSelected = side === 'src' && selectedSrcPath === field.path
  const isMapped = myMappings.length > 0

  const indent = field.depth * 16

  const bg = isSelected
    ? `${ACCENT}22`
    : isMapped
    ? `${MAPPING_PALETTE[myMappings[0].colorIdx % MAPPING_PALETTE.length]}11`
    : 'transparent'

  const borderLeft = isSelected
    ? `3px solid ${ACCENT}`
    : isMapped
    ? `3px solid ${MAPPING_PALETTE[myMappings[0].colorIdx % MAPPING_PALETTE.length]}`
    : '3px solid transparent'

  return (
    <>
      <div
        data-field-path={field.path}
        data-side={side}
        onClick={() => onClickField(field, side)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.5rem',
          paddingLeft: `${indent + 8}px`,
          cursor: 'pointer',
          background: bg,
          borderLeft,
          borderRadius: '0.25rem',
          marginBottom: '2px',
          transition: 'background 0.15s',
          flexWrap: 'wrap',
        }}
      >
        {hasChildren && (
          <span
            onClick={e => { e.stopPropagation(); onToggleCollapse(field.path) }}
            style={{ cursor: 'pointer', fontSize: '0.65rem', color: colors.textSecondary, userSelect: 'none', minWidth: '10px' }}
          >
            {isCollapsed ? '▶' : '▼'}
          </span>
        )}
        {!hasChildren && <span style={{ minWidth: '10px' }} />}
        <span style={{ fontSize: '0.75rem' }}>{TYPE_ICONS[field.type] || '❓'}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.text, fontFamily: 'monospace' }}>{field.label}</span>
        <span style={{
          fontSize: '0.65rem',
          color: colors.textSecondary,
          background: isDark ? '#334155' : '#e2e8f0',
          borderRadius: '999px',
          padding: '1px 6px',
        }}>
          {field.type}
        </span>
        {myMappings.map(m => (
          <span
            key={m.id}
            onClick={e => { e.stopPropagation(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.65rem',
              background: MAPPING_PALETTE[m.colorIdx % MAPPING_PALETTE.length],
              color: '#fff',
              borderRadius: '999px',
              padding: '2px 7px',
              fontWeight: 600,
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={side === 'src' ? `→ ${m.destPath}` : `← ${m.srcPath}`}
          >
            {side === 'src' ? `→ ${m.destPath.split('.').pop()}` : `← ${m.srcPath.split('.').pop()}`}
            <span
              onClick={e => { e.stopPropagation(); m.onRemove(m.id) }}
              style={{ cursor: 'pointer', fontWeight: 900, marginLeft: '2px' }}
              title="Remove mapping"
            >×</span>
          </span>
        ))}
      </div>
      {!isCollapsed && hasChildren && childFields.map(child => (
        <FieldNode
          key={child.path}
          field={child}
          allFields={allFields}
          selectedSrcPath={selectedSrcPath}
          mappings={mappings}
          onClickField={onClickField}
          side={side}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          colors={colors}
          isDark={isDark}
        />
      ))}
    </>
  )
}

/* ── SVG Lines panel ────────────────────────────────────────────────────── */

function SvgLines({ mappings, srcContainerRef, dstContainerRef, containerRef }) {
  const [lines, setLines] = useState([])

  const recalc = useCallback(() => {
    if (!srcContainerRef.current || !dstContainerRef.current || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const newLines = []

    for (const m of mappings) {
      const srcEl = srcContainerRef.current.querySelector(`[data-field-path="${CSS.escape(m.srcPath)}"][data-side="src"]`)
      const dstEl = dstContainerRef.current.querySelector(`[data-field-path="${CSS.escape(m.destPath)}"][data-side="dst"]`)
      if (!srcEl || !dstEl) continue

      const sr = srcEl.getBoundingClientRect()
      const dr = dstEl.getBoundingClientRect()

      const x1 = sr.right - containerRect.left
      const y1 = sr.top + sr.height / 2 - containerRect.top
      const x2 = dr.left - containerRect.left
      const y2 = dr.top + dr.height / 2 - containerRect.top

      const cx1 = x1 + 20
      const cx2 = x2 - 20

      newLines.push({ id: m.id, x1, y1, x2, y2, cx1, cx2, color: MAPPING_PALETTE[m.colorIdx % MAPPING_PALETTE.length] })
    }
    setLines(newLines)
  }, [mappings, srcContainerRef, dstContainerRef, containerRef])

  useEffect(() => {
    recalc()
    const timer = setInterval(recalc, 300)
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', recalc, true)
      window.removeEventListener('resize', recalc)
    }
  }, [recalc])

  if (lines.length === 0) return null

  const minY = Math.min(...lines.map(l => Math.min(l.y1, l.y2))) - 10
  const maxY = Math.max(...lines.map(l => Math.max(l.y1, l.y2))) + 10
  const height = Math.max(maxY - minY, 100)
  const minX = Math.min(...lines.map(l => l.x1)) - 5
  const maxX = Math.max(...lines.map(l => l.x2)) + 5
  const width = maxX - minX

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 10,
      }}
    >
      <defs>
        {MAPPING_PALETTE.map((c, i) => (
          <marker key={i} id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={c} />
          </marker>
        ))}
      </defs>
      {lines.map(l => (
        <path
          key={l.id}
          d={`M ${l.x1} ${l.y1} C ${l.cx1} ${l.y1}, ${l.cx2} ${l.y2}, ${l.x2} ${l.y2}`}
          stroke={l.color}
          strokeWidth="1.5"
          fill="none"
          strokeOpacity="0.7"
          markerEnd={`url(#arrow-${MAPPING_PALETTE.indexOf(l.color)})`}
          style={{ animation: 'svgFadeIn 0.3s ease' }}
        />
      ))}
    </svg>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function SchemaMapper() {
  const { isDark, colors } = useTheme()

  const [srcText, setSrcText] = useState('')
  const [dstText, setDstText] = useState('')
  const [srcParsed, setSrcParsed] = useState({ fields: [], error: null })
  const [dstParsed, setDstParsed] = useState({ fields: [], error: null })
  const [mappings, setMappings] = useState([])
  const [selectedSrcPath, setSelectedSrcPath] = useState(null)
  const [srcCollapsed, setSrcCollapsed] = useState(new Set())
  const [dstCollapsed, setDstCollapsed] = useState(new Set())
  const [codeTab, setCodeTab] = useState('js')
  const [copied, setCopied] = useState(false)
  const [mappingCounter, setMappingCounter] = useState(0)

  const srcContainerRef = useRef(null)
  const dstContainerRef = useRef(null)
  const mapAreaRef = useRef(null)

  const parseSrc = useCallback((text) => {
    if (!text.trim()) { setSrcParsed({ fields: [], error: null }); return }
    setSrcParsed(parseSchema(text))
  }, [])

  const parseDst = useCallback((text) => {
    if (!text.trim()) { setDstParsed({ fields: [], error: null }); return }
    setDstParsed(parseSchema(text))
  }, [])

  const handleSrcChange = (val) => {
    setSrcText(val)
    try { JSON.parse(val); parseSrc(val) } catch { /* wait for parse button */ }
  }

  const handleDstChange = (val) => {
    setDstText(val)
    try { JSON.parse(val); parseDst(val) } catch { /* wait for parse button */ }
  }

  const removeMapping = useCallback((id) => {
    setMappings(prev => prev.filter(m => m.id !== id))
  }, [])

  const handleClickField = useCallback((field, side) => {
    if (side === 'src') {
      setSelectedSrcPath(prev => prev === field.path ? null : field.path)
    } else if (side === 'dst') {
      if (!selectedSrcPath) return
      const already = mappings.find(m => m.srcPath === selectedSrcPath && m.destPath === field.path)
      if (already) { setSelectedSrcPath(null); return }
      const colorIdx = mappingCounter % MAPPING_PALETTE.length
      setMappings(prev => [...prev, {
        id: `m-${Date.now()}`,
        srcPath: selectedSrcPath,
        destPath: field.path,
        colorIdx,
      }])
      setMappingCounter(c => c + 1)
      setSelectedSrcPath(null)
    }
  }, [selectedSrcPath, mappings, mappingCounter])

  const handleAutoSuggest = useCallback(() => {
    const srcLeaves = srcParsed.fields.filter(f => !srcParsed.fields.some(o => o.parent === f.path))
    const dstLeaves = dstParsed.fields.filter(f => !dstParsed.fields.some(o => o.parent === f.path))
    const newMappings = []
    let counter = mappingCounter

    for (const dst of dstLeaves) {
      if (mappings.find(m => m.destPath === dst.path)) continue
      let best = null, bestScore = 0
      for (const src of srcLeaves) {
        if (mappings.find(m => m.srcPath === src.path && m.destPath === dst.path)) continue
        const s = similarity(src.label, dst.label)
        if (s > bestScore && s > 0.6) { best = src; bestScore = s }
      }
      if (best) {
        newMappings.push({
          id: `m-auto-${Date.now()}-${counter}`,
          srcPath: best.path,
          destPath: dst.path,
          colorIdx: counter % MAPPING_PALETTE.length,
        })
        counter++
      }
    }
    setMappings(prev => [...prev, ...newMappings])
    setMappingCounter(counter)
  }, [srcParsed.fields, dstParsed.fields, mappings, mappingCounter])

  const handleClearMappings = () => setMappings([])

  const handleFileUpload = useCallback((side, file) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target.result
      if (side === 'src') { setSrcText(text); parseSrc(text) }
      else { setDstText(text); parseDst(text) }
    }
    reader.readAsText(file)
  }, [parseSrc, parseDst])

  const loadDemo = () => {
    setSrcText(DEMO_SOURCE)
    setDstText(DEMO_DEST)
    parseSrc(DEMO_SOURCE)
    parseDst(DEMO_DEST)
    setMappings([])
    setMappingCounter(0)
  }

  const mappingsWithRemove = useMemo(() =>
    mappings.map(m => ({ ...m, onRemove: removeMapping })),
    [mappings, removeMapping]
  )

  const jsCode = useMemo(() => generateJS(mappings), [mappings])
  const pyCode = useMemo(() => generatePython(mappings), [mappings])
  const code = codeTab === 'js' ? jsCode : pyCode

  const complexity = useMemo(() =>
    computeComplexity(srcParsed.fields, dstParsed.fields, mappings),
    [srcParsed.fields, dstParsed.fields, mappings]
  )

  const unmappedDstFields = useMemo(() => {
    const mappedDstPaths = new Set(mappings.map(m => m.destPath))
    return dstParsed.fields.filter(f =>
      !mappedDstPaths.has(f.path) &&
      !dstParsed.fields.some(o => o.parent === f.path)
    )
  }, [dstParsed.fields, mappings])

  const srcRootFields = srcParsed.fields.filter(f => f.depth === 0)
  const dstRootFields = dstParsed.fields.filter(f => f.depth === 0)

  const hasSchemas = srcParsed.fields.length > 0 && dstParsed.fields.length > 0

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  /* ── Styles ── */
  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1rem',
  }

  const inputStyle = {
    width: '100%',
    background: isDark ? '#0f172a' : '#f8fafc',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.6rem 0.75rem',
    color: colors.text,
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btn = (accent) => ({
    background: `${accent}22`,
    border: `1px solid ${accent}55`,
    borderRadius: '0.5rem',
    padding: '0.4rem 0.9rem',
    color: accent,
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
  })

  const primaryBtn = {
    background: ACCENT,
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1.2rem',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
  }

  const complexityColor = complexity.label === 'LOW' ? '#10b981' : complexity.label === 'MEDIUM' ? '#f59e0b' : '#ef4444'

  return (
    <ToolLayout toolId="schema-mapper">
      <style>{`
        @keyframes svgFadeIn { from { opacity: 0; stroke-dashoffset: 100; } to { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .sm-field-row:hover { background: ${isDark ? '#ffffff08' : '#00000006'} !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 900,
            background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🗺️ Schema Field Mapper
          </h1>
          <span style={{
            background: `${ACCENT}22`,
            border: `1px solid ${ACCENT}55`,
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '0.65rem',
            fontWeight: 800,
            color: ACCENT,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            DETERMINISTIC
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textSecondary }}>
          Visually map fields between schemas — generate transform code instantly. 100% client-side.
        </p>
      </div>

      {/* Empty state */}
      {!hasSchemas && (
        <div style={{
          ...card,
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          marginBottom: '1.5rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗺️</div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>
            Map fields between two JSON schemas
          </h2>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: colors.textSecondary, maxWidth: '480px', display: 'inline-block' }}>
            Paste a source JSON object and a destination JSON object (or JSON Schema) in the panels below.
            Click fields to create mappings and get a generated transform function instantly.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={loadDemo} style={primaryBtn}>
              ⚡ Load Demo Data
            </button>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Click source field', icon: '1️⃣' },
              { label: 'Click dest field', icon: '2️⃣' },
              { label: 'Mapping created!', icon: '✅' },
            ].map(step => (
              <div key={step.label} style={{
                background: isDark ? '#0f172a' : '#f1f5f9',
                borderRadius: '0.5rem',
                padding: '0.6rem 1rem',
                fontSize: '0.78rem',
                color: colors.textSecondary,
              }}>
                {step.icon} {step.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema input panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Source */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text }}>📥 Source Schema</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <label style={{ ...btn(ACCENT), cursor: 'pointer' }}>
                📁
                <input type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload('src', e.target.files[0])} />
              </label>
              <button style={btn(ACCENT)} onClick={() => parseSrc(srcText)}>Parse</button>
            </div>
          </div>
          <textarea
            value={srcText}
            onChange={e => handleSrcChange(e.target.value)}
            placeholder={'{\n  "user_id": 1,\n  "name": "John"\n}'}
            rows={7}
            style={inputStyle}
          />
          {srcParsed.error && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>⚠ {srcParsed.error}</p>
          )}
          {srcParsed.fields.length > 0 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: '#10b981' }}>
              ✓ {srcParsed.fields.length} fields parsed
            </p>
          )}
        </div>

        {/* Destination */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text }}>📤 Destination Schema</span>
              {unmappedDstFields.length > 0 && (
                <span style={{
                  background: '#ef444422',
                  border: '1px solid #ef444455',
                  color: '#ef4444',
                  borderRadius: '999px',
                  padding: '1px 8px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}>
                  {unmappedDstFields.length} unmapped
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <label style={{ ...btn('#8b5cf6'), cursor: 'pointer' }}>
                📁
                <input type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload('dst', e.target.files[0])} />
              </label>
              <button style={btn('#8b5cf6')} onClick={() => parseDst(dstText)}>Parse</button>
            </div>
          </div>
          <textarea
            value={dstText}
            onChange={e => handleDstChange(e.target.value)}
            placeholder={'{\n  "userId": 0,\n  "fullName": ""\n}'}
            rows={7}
            style={inputStyle}
          />
          {dstParsed.error && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>⚠ {dstParsed.error}</p>
          )}
          {dstParsed.fields.length > 0 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: '#10b981' }}>
              ✓ {dstParsed.fields.length} fields parsed
            </p>
          )}
        </div>
      </div>

      {/* Action bar */}
      {hasSchemas && (
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleAutoSuggest} style={primaryBtn}>
            ✨ Auto-Suggest Mappings
          </button>
          <button onClick={handleClearMappings} style={btn('#ef4444')}>
            🗑 Clear Mappings
          </button>
          {selectedSrcPath && (
            <span style={{
              fontSize: '0.78rem',
              color: ACCENT,
              background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}44`,
              borderRadius: '0.4rem',
              padding: '0.3rem 0.75rem',
              fontWeight: 600,
            }}>
              📍 Selected: {selectedSrcPath} — now click a destination field
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: colors.textSecondary }}>
            {mappings.length} mapping{mappings.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Three-column mapping area */}
      {hasSchemas && (
        <div
          ref={mapAreaRef}
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 48px 1fr',
            gap: '0',
            marginBottom: '1.5rem',
            ...card,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Source tree */}
          <div
            ref={srcContainerRef}
            style={{
              padding: '1rem 0.5rem',
              borderRight: `1px solid ${colors.border}`,
              minHeight: '200px',
              maxHeight: '500px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem 0.5rem' }}>
              Source Fields
            </div>
            {srcRootFields.map(field => (
              <FieldNode
                key={field.path}
                field={field}
                allFields={srcParsed.fields}
                selectedSrcPath={selectedSrcPath}
                mappings={mappingsWithRemove}
                onClickField={handleClickField}
                side="src"
                collapsed={srcCollapsed}
                onToggleCollapse={(path) => setSrcCollapsed(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n })}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </div>

          {/* SVG Lines column */}
          <div style={{ position: 'relative', background: isDark ? '#0f172a55' : '#f8fafc88' }}>
            <SvgLines
              mappings={mappings}
              srcContainerRef={srcContainerRef}
              dstContainerRef={dstContainerRef}
              containerRef={mapAreaRef}
            />
          </div>

          {/* Destination tree */}
          <div
            ref={dstContainerRef}
            style={{
              padding: '1rem 0.5rem',
              borderLeft: `1px solid ${colors.border}`,
              minHeight: '200px',
              maxHeight: '500px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem 0.5rem' }}>
              Destination Fields
            </div>
            {dstRootFields.map(field => (
              <FieldNode
                key={field.path}
                field={field}
                allFields={dstParsed.fields}
                selectedSrcPath={selectedSrcPath}
                mappings={mappingsWithRemove}
                onClickField={handleClickField}
                side="dst"
                collapsed={dstCollapsed}
                onToggleCollapse={(path) => setDstCollapsed(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n })}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results: Complexity + Unmapped warnings */}
      {hasSchemas && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Complexity */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text }}>📊 Complexity Score</span>
              <span style={{
                background: `${complexityColor}22`,
                border: `1px solid ${complexityColor}55`,
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: complexityColor,
              }}>
                {complexity.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                flex: 1,
                height: '8px',
                background: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${complexity.score}%`,
                  height: '100%',
                  background: complexityColor,
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: complexityColor, minWidth: '2.5rem' }}>
                {complexity.score}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.8 }}>
              <span>✅ {complexity.mapped} fields mapped</span>
              {' · '}
              <span style={{ color: complexity.unmapped > 0 ? '#f59e0b' : colors.textSecondary }}>
                ⚠ {complexity.unmapped} unmapped
              </span>
              {' · '}
              <span>🌲 depth {complexity.depth}</span>
              {complexity.typeMismatches > 0 && (
                <span style={{ color: '#ef4444' }}>{' · '}⚡ {complexity.typeMismatches} type mismatch{complexity.typeMismatches !== 1 ? 'es' : ''}</span>
              )}
            </div>
          </div>

          {/* Unmapped warnings */}
          <div style={card}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text, marginBottom: '0.6rem' }}>
              ⚠️ Unmapped Destination Fields
            </div>
            {unmappedDstFields.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#10b981' }}>✓ All destination fields are mapped!</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                {unmappedDstFields.map(f => (
                  <span key={f.path} style={{
                    background: '#ef444415',
                    border: '1px solid #ef444433',
                    borderRadius: '0.35rem',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: '#ef4444',
                    fontFamily: 'monospace',
                  }}>
                    {f.path}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code panel */}
      {hasSchemas && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[{ id: 'js', label: 'JavaScript' }, { id: 'python', label: 'Python' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCodeTab(tab.id)}
                  style={{
                    background: codeTab === tab.id ? ACCENT : 'transparent',
                    border: `1px solid ${codeTab === tab.id ? ACCENT : colors.border}`,
                    borderRadius: '0.5rem',
                    padding: '0.3rem 0.9rem',
                    color: codeTab === tab.id ? '#fff' : colors.textSecondary,
                    fontSize: '0.78rem',
                    fontWeight: codeTab === tab.id ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              style={{
                ...btn(copied ? '#10b981' : ACCENT),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
          </div>

          {/* Code block */}
          <div style={{
            background: isDark ? '#0a0f1e' : '#f1f5f9',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            overflowX: 'auto',
          }}>
            <pre
              style={{
                margin: 0,
                fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
                fontSize: '0.8rem',
                lineHeight: 1.65,
                color: isDark ? '#e2e8f0' : '#1e293b',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: highlight(code, codeTab === 'python' ? 'python' : 'js') }}
            />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
