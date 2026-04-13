import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#ec4899'

const LEVEL_COLOR = { H: '#22c55e', M: '#eab308', L: '#ef4444' }
const LEVEL_SCORE = { H: 3, M: 2, L: 1 }
const LEVEL_LABEL = { H: 'High', M: 'Medium', L: 'Low' }

const SAMPLE_NAMES = [
  'Ahmed Khan', 'Sara Ali', 'Omar Sheikh', 'Fatima Malik', 'Bilal Ahmed',
  'Ayesha Siddiqui', 'Usman Raza', 'Zainab Hussain', 'Hamza Qureshi', 'Mariam Baig',
  'Talha Farooq', 'Hira Butt', 'Asad Mirza', 'Nimra Iqbal', 'Saad Chaudhry',
  'Amna Nawaz', 'Faisal Javed', 'Sana Riaz', 'Wahab Tahir', 'Nadia Hashmi',
  'Iqbal Ashraf', 'Mahnoor Gill', 'Junaid Lodhi', 'Rabia Anwer', 'Shahzad Bhatti',
  'Komal Zafar', 'Imran Cheema', 'Bushra Naqvi', 'Tariq Mehmood', 'Lubna Aslam',
]

const LEVELS = ['H', 'M', 'L']

function levelScore(student) {
  return LEVEL_SCORE[student.level] ?? 2
}

function balancedGroups(students, groupSize) {
  const sorted = [...students].sort((a, b) => levelScore(b) - levelScore(a))
  const numGroups = Math.ceil(students.length / groupSize)
  const groups = Array.from({ length: numGroups }, () => [])
  sorted.forEach((student, i) => {
    const round = Math.floor(i / numGroups)
    const pos = i % numGroups
    const groupIdx = round % 2 === 0 ? pos : numGroups - 1 - pos
    groups[groupIdx].push(student)
  })
  return groups
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function chunkGroups(students, groupSize) {
  const groups = []
  for (let i = 0; i < students.length; i += groupSize) {
    groups.push(students.slice(i, i + groupSize))
  }
  return groups
}

function generateGroups(students, groupSize, mode) {
  if (students.length === 0) return []
  if (mode === 'balanced') return balancedGroups(students, groupSize)
  if (mode === 'random') return chunkGroups(shuffle(students), groupSize)
  // ability-matched: sort by level, then chunk
  const sorted = [...students].sort((a, b) => levelScore(b) - levelScore(a))
  return chunkGroups(sorted, groupSize)
}

function groupSummary(group) {
  const counts = { H: 0, M: 0, L: 0 }
  group.forEach((s) => { if (counts[s.level] !== undefined) counts[s.level]++ })
  return [
    counts.H ? `${counts.H}H` : null,
    counts.M ? `${counts.M}M` : null,
    counts.L ? `${counts.L}L` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

let studentIdCounter = 0
function nextId() { return ++studentIdCounter }

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
      {children}
    </div>
  )
}

function Label({ children }) {
  return (
    <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>
      {children}
    </label>
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
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
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
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function PrimaryButton({ onClick, children, disabled, fullWidth, colors, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? colors.border : ACCENT,
        border: 'none',
        borderRadius: '0.5rem',
        color: disabled ? colors.textSecondary : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0.6rem 1.25rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        width: fullWidth ? '100%' : undefined,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({ onClick, children, colors, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `${ACCENT}18`,
        border: `1px solid ${ACCENT}44`,
        borderRadius: '0.5rem',
        color: ACCENT,
        cursor: 'pointer',
        padding: '0.55rem 1.1rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function LevelDot({ level }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '0.55rem',
      height: '0.55rem',
      borderRadius: '50%',
      background: LEVEL_COLOR[level] ?? '#aaa',
      flexShrink: 0,
      marginRight: '0.3rem',
    }} />
  )
}

function StudentChip({ student, onRemove, colors }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      background: `${LEVEL_COLOR[student.level] ?? '#aaa'}18`,
      border: `1px solid ${LEVEL_COLOR[student.level] ?? '#aaa'}44`,
      borderRadius: '2rem',
      padding: '0.2rem 0.55rem 0.2rem 0.45rem',
      fontSize: '0.8rem',
      color: colors.text,
    }}>
      <LevelDot level={student.level} />
      {student.name}
      <button
        onClick={() => onRemove(student.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.textSecondary,
          fontSize: '0.85rem',
          lineHeight: 1,
          padding: '0 0 0 0.2rem',
          marginLeft: '0.1rem',
        }}
        title="Remove"
      >
        ×
      </button>
    </span>
  )
}

function ModeButton({ active, onClick, children, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.5rem 0.4rem',
        borderRadius: '0.5rem',
        border: active ? `2px solid ${ACCENT}` : `1px solid ${colors.border}`,
        background: active ? `${ACCENT}18` : colors.card,
        color: active ? ACCENT : colors.textSecondary,
        fontWeight: active ? 700 : 400,
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function StudentGroups() {
  const { isDark, colors } = useTheme()

  const [rosterText, setRosterText] = useState('')
  const [students, setStudents] = useState([])
  const [parseError, setParseError] = useState('')

  const [manualName, setManualName] = useState('')
  const [manualLevel, setManualLevel] = useState('M')

  const [groupSize, setGroupSize] = useState(3)
  const [mode, setMode] = useState('balanced')
  const [allowUneven, setAllowUneven] = useState(true)

  const [groups, setGroups] = useState([])
  const [copyMsg, setCopyMsg] = useState('')

  /* Parse roster textarea */
  const parseRoster = useCallback(() => {
    const lines = rosterText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) { setParseError('Roster is empty.'); return }
    const parsed = []
    const errors = []
    lines.forEach((line, idx) => {
      const parts = line.split(',')
      const name = parts[0]?.trim()
      const rawLevel = parts[1]?.trim().toUpperCase()
      if (!name) { errors.push(`Line ${idx + 1}: missing name`); return }
      let level = rawLevel
      if (!level || !LEVELS.includes(level)) {
        // Try numeric 1-5
        const n = parseInt(rawLevel, 10)
        if (!isNaN(n)) level = n >= 4 ? 'H' : n >= 2 ? 'M' : 'L'
        else level = 'M'
      }
      parsed.push({ id: nextId(), name, level })
    })
    if (errors.length) { setParseError(errors[0]); return }
    setParseError('')
    setStudents((prev) => {
      const existingNames = new Set(prev.map((s) => s.name.toLowerCase()))
      const fresh = parsed.filter((s) => !existingNames.has(s.name.toLowerCase()))
      return [...prev, ...fresh]
    })
    setRosterText('')
  }, [rosterText])

  const removeStudent = useCallback((id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addManual = useCallback(() => {
    const name = manualName.trim()
    if (!name) return
    setStudents((prev) => [...prev, { id: nextId(), name, level: manualLevel }])
    setManualName('')
  }, [manualName, manualLevel])

  const loadSample = useCallback(() => {
    const levels = ['H', 'H', 'M', 'M', 'M', 'L']
    const sample = SAMPLE_NAMES.slice(0, 30).map((name) => ({
      id: nextId(),
      name,
      level: levels[Math.floor(Math.random() * levels.length)],
    }))
    setStudents(sample)
    setRosterText('')
    setParseError('')
    setGroups([])
  }, [])

  const handleGenerate = useCallback(() => {
    if (students.length < 2) return
    const result = generateGroups(students, groupSize, mode)
    setGroups(result)
    setCopyMsg('')
  }, [students, groupSize, mode])

  const handleReshuffle = useCallback(() => {
    const result = generateGroups(students, groupSize, mode)
    setGroups(result)
    setCopyMsg('')
  }, [students, groupSize, mode])

  const copyGroups = useCallback(() => {
    const text = groups
      .map((g, i) => {
        const header = `Group ${i + 1}`
        const members = g.map((s) => `  ${s.name} (${s.level})`).join('\n')
        return `${header}\n${members}`
      })
      .join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }, [groups])

  const downloadCSV = useCallback(() => {
    const rows = [['Group', 'Name', 'Level']]
    groups.forEach((g, i) => {
      g.forEach((s) => rows.push([`Group ${i + 1}`, s.name, s.level]))
    })
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-groups.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [groups])

  return (
    <ToolLayout toolId="student-groups">
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        color: colors.text,
        fontFamily: 'inherit',
      }}>
        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: colors.text }}>
            Student Group Randomizer
          </h1>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: colors.textSecondary }}>
            Paste a class roster and generate balanced, random, or ability-matched groups.
          </p>
        </div>

        {/* Input Card */}
        <SectionCard title="Class Roster" colors={colors}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Label>Paste roster (Name, Level — one per line)</Label>
            <textarea
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
              placeholder={`Ahmed Khan, H\nSara Ali, M\nOmar Sheikh, L\nFatima Malik, H\nBilal Ahmed, M`}
              rows={6}
              style={{
                background: colors.input ?? colors.bg,
                border: `1px solid ${colors.inputBorder ?? colors.border}`,
                borderRadius: '0.5rem',
                padding: '0.6rem 0.75rem',
                color: colors.text,
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '180px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                width: '100%',
              }}
            />
            {parseError && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{parseError}</span>
            )}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <PrimaryButton onClick={parseRoster} colors={colors}>
                Parse Roster
              </PrimaryButton>
              <SecondaryButton onClick={loadSample} colors={colors}>
                Load Sample Class (30 students)
              </SecondaryButton>
            </div>
          </div>

          {/* Manual add */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Label>Or add student manually</Label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StyledInput
                colors={colors}
                placeholder="Student name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManual()}
                style={{ flex: 1, minWidth: '140px' }}
              />
              <StyledSelect
                colors={colors}
                value={manualLevel}
                onChange={(e) => setManualLevel(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="H">H — High</option>
                <option value="M">M — Medium</option>
                <option value="L">L — Low</option>
              </StyledSelect>
              <PrimaryButton onClick={addManual} colors={colors} disabled={!manualName.trim()}>
                + Add
              </PrimaryButton>
            </div>
          </div>

          {/* Student chips */}
          {students.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>{students.length} student{students.length !== 1 ? 's' : ''} loaded</Label>
                <button
                  onClick={() => { setStudents([]); setGroups([]) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ef4444', fontSize: '0.75rem', fontWeight: 600,
                  }}
                >
                  Clear all
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {students.map((s) => (
                  <StudentChip key={s.id} student={s} onRemove={removeStudent} colors={colors} />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Settings Card */}
        <SectionCard title="Group Settings" colors={colors}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Group size stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Label>Students per group</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setGroupSize((n) => Math.max(2, n - 1))}
                  disabled={groupSize <= 2}
                  style={{
                    width: '2rem', height: '2rem',
                    borderRadius: '0.4rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    color: colors.text,
                    fontSize: '1.1rem',
                    cursor: groupSize <= 2 ? 'not-allowed' : 'pointer',
                    opacity: groupSize <= 2 ? 0.4 : 1,
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, minWidth: '1.5rem', textAlign: 'center' }}>
                  {groupSize}
                </span>
                <button
                  onClick={() => setGroupSize((n) => Math.min(8, n + 1))}
                  disabled={groupSize >= 8}
                  style={{
                    width: '2rem', height: '2rem',
                    borderRadius: '0.4rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    color: colors.text,
                    fontSize: '1.1rem',
                    cursor: groupSize >= 8 ? 'not-allowed' : 'pointer',
                    opacity: groupSize >= 8 ? 0.4 : 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Mode toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
              <Label>Grouping mode</Label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <ModeButton active={mode === 'balanced'} onClick={() => setMode('balanced')} colors={colors}>
                  🔀 Balanced
                </ModeButton>
                <ModeButton active={mode === 'random'} onClick={() => setMode('random')} colors={colors}>
                  🎲 Random
                </ModeButton>
                <ModeButton active={mode === 'ability'} onClick={() => setMode('ability')} colors={colors}>
                  🏆 Ability-Matched
                </ModeButton>
              </div>
            </div>

            {/* Allow uneven toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Label>Allow uneven groups</Label>
              <button
                onClick={() => setAllowUneven((v) => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: allowUneven ? `${ACCENT}18` : colors.card,
                  border: `1px solid ${allowUneven ? ACCENT : colors.border}`,
                  borderRadius: '2rem',
                  padding: '0.35rem 0.75rem',
                  color: allowUneven ? ACCENT : colors.textSecondary,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  width: '1rem', height: '1rem',
                  borderRadius: '50%',
                  background: allowUneven ? ACCENT : colors.border,
                  display: 'inline-block',
                  transition: 'background 0.15s',
                }} />
                {allowUneven ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Generate buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <PrimaryButton
            onClick={handleGenerate}
            disabled={students.length < 2}
            fullWidth={groups.length === 0}
            colors={colors}
            style={{ flex: groups.length === 0 ? 1 : undefined, padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            Generate Groups →
          </PrimaryButton>
          {groups.length > 0 && (
            <SecondaryButton onClick={handleReshuffle} colors={colors} style={{ padding: '0.75rem 1.25rem' }}>
              🔄 Reshuffle
            </SecondaryButton>
          )}
        </div>

        {/* Groups output */}
        {groups.length > 0 && (
          <SectionCard title={`${groups.length} Groups Generated`} colors={colors}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}>
              {groups.map((group, i) => (
                <div
                  key={i}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.75rem',
                    padding: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT }}>
                      Group {i + 1}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      color: colors.textSecondary,
                      background: `${colors.border}80`,
                      borderRadius: '0.4rem',
                      padding: '0.1rem 0.4rem',
                    }}>
                      {groupSummary(group)}
                    </span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {group.map((s) => (
                      <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                        <LevelDot level={s.level} />
                        <span style={{ flex: 1 }}>{s.name}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: LEVEL_COLOR[s.level],
                          background: `${LEVEL_COLOR[s.level]}18`,
                          border: `1px solid ${LEVEL_COLOR[s.level]}44`,
                          borderRadius: '0.3rem',
                          padding: '0.05rem 0.35rem',
                        }}>
                          {s.level}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
              <SecondaryButton onClick={copyGroups} colors={colors}>
                📋 {copyMsg || 'Copy Groups'}
              </SecondaryButton>
              <SecondaryButton onClick={downloadCSV} colors={colors}>
                ⬇️ Download CSV
              </SecondaryButton>
            </div>
          </SectionCard>
        )}
      </div>
    </ToolLayout>
  )
}
