import { useState, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
const ACCENT = '#f59e0b'

function plural(n, word) {
  return `${n.toLocaleString()} ${word}${n !== 1 ? 's' : ''}`
}

function calcAge(dob) {
  const now = new Date()
  const birth = new Date(dob)
  if (isNaN(birth.getTime()) || birth > now) return null

  const diffMs = now - birth
  const totalDays = Math.floor(diffMs / 86400000)
  const totalHours = Math.floor(diffMs / 3600000)
  const totalMinutes = Math.floor(diffMs / 60000)
  const totalWeeks = Math.floor(totalDays / 7)

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) { years--; months += 12 }

  // Next birthday
  let nextBd = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBd <= now) nextBd.setFullYear(now.getFullYear() + 1)
  const daysUntilBd = Math.ceil((nextBd - now) / 86400000)
  const bdDayName = nextBd.toLocaleDateString('en-US', { weekday: 'long' })
  const nextAge = nextBd.getFullYear() - birth.getFullYear()

  // Approx days sleeping (8h/day = 1/3)
  const daysSlept = Math.floor(totalDays / 3)
  const daysAwake = totalDays - daysSlept

  return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, daysSlept, daysAwake, daysUntilBd, bdDayName, nextAge }
}

function StatCard({ label, value, sub, color, isDark, colors }) {
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || ACCENT, fontFamily: FONT }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: colors.text, fontWeight: 600, marginTop: '0.2rem', fontFamily: FONT }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: '0.15rem', fontFamily: FONT }}>{sub}</div>}
    </div>
  )
}

export default function AgeCalculator() {
  const { isDark, colors } = useTheme()
  const [dob, setDob] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const maxDate = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (dob) setResult(calcAge(dob))
    else setResult(null)
  }, [dob])

  function handleShare() {
    if (!result) return
    const text = `🎂 My Life Stats (from Rafiqy)\n` +
      `Age: ${result.years} years, ${result.months} months, ${result.days} days\n` +
      `📅 ${plural(result.totalDays, 'day')} alive\n` +
      `😴 ~${plural(result.daysSlept, 'day')} sleeping\n` +
      `⚡ ${plural(result.daysAwake, 'day')} awake & living\n` +
      `🎉 Next birthday in ${result.daysUntilBd} days (${result.bdDayName})\n` +
      `Calculate yours → https://rafiqy.app/tools/age-calculator`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const inp = {
    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.65rem 0.9rem',
    color: colors.text,
    fontSize: '1rem',
    fontFamily: FONT,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <ToolLayout toolId="age-calculator">
      <div style={{ fontFamily: FONT, maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT, margin: '0 0 0.25rem' }}>🎂 Age Calculator</h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Your life in numbers — not just years</p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.4rem' }}>
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            max={maxDate}
            onChange={e => setDob(e.target.value)}
            style={inp}
          />
        </div>

        {result && (
          <>
            {/* Main age */}
            <div style={{
              background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${ACCENT}40`,
              borderRadius: '1rem',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: ACCENT }}>
                {result.years} <span style={{ fontSize: '1rem', fontWeight: 600 }}>years</span>
              </div>
              <div style={{ fontSize: '1rem', color: colors.text, marginTop: '0.25rem', fontWeight: 500 }}>
                {result.months} months &amp; {result.days} days
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <StatCard label="Days Alive" value={result.totalDays.toLocaleString()} isDark={isDark} colors={colors} color="#06b6d4" />
              <StatCard label="Weeks Lived" value={result.totalWeeks.toLocaleString()} isDark={isDark} colors={colors} color="#8b5cf6" />
              <StatCard label="Hours Clocked" value={result.totalHours.toLocaleString()} isDark={isDark} colors={colors} color="#10b981" />
              <StatCard label="Days Sleeping" value={result.daysSlept.toLocaleString()} sub="~8 hrs/day average" isDark={isDark} colors={colors} color="#f97316" />
            </div>

            {/* Next birthday */}
            <div style={{
              background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)',
              border: `1px solid #6366f140`,
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.8rem' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, color: colors.text, fontSize: '0.95rem' }}>
                  Next birthday in <span style={{ color: '#6366f1' }}>{result.daysUntilBd} days</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '0.15rem' }}>
                  Falls on a <strong>{result.bdDayName}</strong> — you'll turn {result.nextAge}
                </div>
              </div>
            </div>

            {/* Awake vs sleeping */}
            <div style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>Time Breakdown</div>
              <div style={{ display: 'flex', gap: '0', borderRadius: '0.4rem', overflow: 'hidden', height: '1.2rem', marginBottom: '0.5rem' }}>
                <div style={{ flex: result.daysAwake, background: ACCENT, transition: 'flex 0.5s' }} title={`Awake: ${result.daysAwake} days`} />
                <div style={{ flex: result.daysSlept, background: '#6366f1', transition: 'flex 0.5s' }} title={`Sleeping: ${result.daysSlept} days`} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: colors.textSecondary }}>
                <span><span style={{ color: ACCENT }}>■</span> Awake: {result.daysAwake.toLocaleString()} days</span>
                <span><span style={{ color: '#6366f1' }}>■</span> Sleeping: {result.daysSlept.toLocaleString()} days</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: copied ? '#10b981' : ACCENT,
                color: '#000',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: FONT,
                transition: 'background 0.2s',
              }}
            >
              {copied ? '✅ Copied to clipboard!' : '📋 Copy & Share Life Stats'}
            </button>
          </>
        )}

        {!dob && (
          <div style={{ textAlign: 'center', color: colors.textSecondary, padding: '2rem 0', fontSize: '0.9rem' }}>
            Enter your date of birth to see your life stats
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
