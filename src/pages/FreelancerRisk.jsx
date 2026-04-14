import { useState, useMemo, useCallback, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f59e0b'
const LS_KEY = 'typely_freelancer_assessments'

// ── Scoring data ────────────────────────────────────────────────────────────

const CLIENT_SOURCE_OPTIONS = [
  { label: 'Upwork', value: 'upwork', pts: 0 },
  { label: 'Fiverr', value: 'fiverr', pts: 0 },
  { label: 'LinkedIn', value: 'linkedin', pts: 5 },
  { label: 'Referred by someone I trust', value: 'referral', pts: 0 },
  { label: 'Social media DM', value: 'social_dm', pts: 15 },
  { label: 'WhatsApp / cold contact', value: 'whatsapp', pts: 20 },
  { label: 'Other website', value: 'other_web', pts: 10 },
]

const ACCOUNT_AGE_OPTIONS = [
  { label: '> 2 years', value: 'gt2', pts: 0 },
  { label: '1–2 years', value: '1to2', pts: 3 },
  { label: '6–12 months', value: '6to12', pts: 8 },
  { label: '< 6 months', value: 'lt6', pts: 15 },
  { label: 'Not on platform / unknown', value: 'unknown', pts: 20 },
]

const REVIEWS_OPTIONS = [
  { label: 'Many positive reviews', value: 'many_pos', pts: 0 },
  { label: 'Some reviews, mostly positive', value: 'some_pos', pts: 3 },
  { label: 'Few reviews', value: 'few', pts: 8 },
  { label: 'No reviews', value: 'none', pts: 15 },
]

const LOCATION_OPTIONS = [
  { label: 'USA / UK / EU / AUS / CA', value: 'tier1', pts: 0 },
  { label: 'Middle East', value: 'me', pts: 3 },
  { label: 'South Asia', value: 'sa', pts: 5 },
  { label: 'Other', value: 'other', pts: 8 },
  { label: 'Unknown / refuses to say', value: 'unknown', pts: 15 },
]

const CONTRACT_OPTIONS = [
  { label: 'Signed contract with clear terms', value: 'signed', pts: 0 },
  { label: 'Platform ToS covers it', value: 'platform_tos', pts: 5 },
  { label: 'Verbal agreement only', value: 'verbal', pts: 20 },
  { label: 'Nothing formal', value: 'nothing', pts: 30 },
]

const PAYMENT_STRUCTURE_OPTIONS = [
  { label: 'Full advance payment', value: 'full_advance', pts: 0 },
  { label: '50% advance, 50% on delivery', value: 'half_half', pts: 3 },
  { label: 'Milestone-based via escrow', value: 'milestone_escrow', pts: 5 },
  { label: 'Milestone-based, no escrow', value: 'milestone_no_escrow', pts: 15 },
  { label: '100% on delivery, no escrow', value: 'full_delivery', pts: 25 },
  { label: 'Payment "after client approval" — no deadline', value: 'approval_nodl', pts: 35 },
]

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Platform escrow (Upwork / Fiverr)', value: 'escrow', pts: 0 },
  { label: 'PayPal / Wise / Payoneer', value: 'paypal_wise', pts: 5 },
  { label: 'Bank transfer', value: 'bank', pts: 8 },
  { label: 'Crypto', value: 'crypto', pts: 12 },
  { label: '"Will pay later" / cheque', value: 'later_cheque', pts: 25 },
]

const PAYMENT_TERMS_OPTIONS = [
  { label: 'Immediate / on delivery', value: 'immediate', pts: 0 },
  { label: 'Net 7', value: 'net7', pts: 3 },
  { label: 'Net 15', value: 'net15', pts: 5 },
  { label: 'Net 30', value: 'net30', pts: 10 },
  { label: 'Net 60+', value: 'net60plus', pts: 20 },
]

const RED_FLAGS = [
  { id: 'rushing', label: 'Client is rushing you without a clear brief', pts: 10 },
  { id: 'scope_change', label: 'Client keeps changing scope mid-project', pts: 8 },
  { id: 'free_sample', label: 'Client asks for free samples before contract', pts: 12 },
  { id: 'no_deliverables', label: 'No clear deliverables defined', pts: 8 },
  { id: 'disappeared', label: 'Client has disappeared mid-conversation', pts: 15 },
  { id: 'long_term_promise', label: 'Promises a large long-term contract after this "trial"', pts: 10 },
  { id: 'credentials', label: 'Asks for login credentials or sensitive access early', pts: 15 },
  { id: 'refuses_platform', label: 'Refuses to use platform payment system', pts: 12 },
]

// ── Risk level helpers ───────────────────────────────────────────────────────

function getRiskLevel(score) {
  if (score <= 25) return { label: 'Low Risk', icon: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
  if (score <= 50) return { label: 'Moderate Risk', icon: '🟡', color: '#eab308', bg: 'rgba(234,179,8,0.12)' }
  if (score <= 75) return { label: 'High Risk', icon: '🟠', color: '#f97316', bg: 'rgba(249,115,22,0.12)' }
  return { label: 'Very High Risk', icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

// ── SVG Arc Score Meter ──────────────────────────────────────────────────────

function ScoreMeter({ score, riskLevel }) {
  const radius = 72
  const stroke = 10
  const cx = 90
  const cy = 90
  const arcAngle = 220 // degrees of arc
  const startAngle = (180 - arcAngle) / 2 + 180 // starts bottom-left

  const toRad = (deg) => (deg * Math.PI) / 180

  // Arc path helper
  function describeArc(centerX, centerY, r, startDeg, endDeg) {
    const s = toRad(startDeg)
    const e = toRad(endDeg)
    const x1 = centerX + r * Math.cos(s)
    const y1 = centerY + r * Math.sin(s)
    const x2 = centerX + r * Math.cos(e)
    const y2 = centerY + r * Math.sin(e)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const bgStart = startAngle
  const bgEnd = startAngle + arcAngle
  const fillEnd = startAngle + (score / 100) * arcAngle

  const bgPath = describeArc(cx, cy, radius, bgStart, bgEnd)
  const fillPath = score > 0 ? describeArc(cx, cy, radius, bgStart, fillEnd) : null
  const circumference = (arcAngle / 360) * 2 * Math.PI * radius
  const fillLength = (score / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="180" height="150" viewBox="0 0 180 150" style={{ overflow: 'visible' }}>
        {/* Track */}
        <path d={bgPath} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={stroke} strokeLinecap="round" />
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={riskLevel.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.4s ease, d 0.4s ease' }}
          />
        )}
        {/* Score number */}
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fontSize="32"
          fontWeight="700"
          fill={riskLevel.color}
          style={{ transition: 'fill 0.4s ease' }}
        >
          {score}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize="11" fill="#94a3b8">
          out of 100
        </text>
      </svg>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.9rem',
        borderRadius: '999px',
        background: riskLevel.bg,
        border: `1px solid ${riskLevel.color}40`,
        fontSize: '0.88rem',
        fontWeight: '600',
        color: riskLevel.color,
        transition: 'all 0.4s ease',
      }}>
        <span style={{ fontSize: '1rem' }}>{riskLevel.icon}</span>
        {riskLevel.label}
      </div>
    </div>
  )
}

// ── Section bar ──────────────────────────────────────────────────────────────

function BreakdownBar({ label, score, max, color, colors }) {
  const pct = Math.min((score / max) * 100, 100)
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color }}>
          {score}<span style={{ color: colors.textSecondary, fontWeight: '400' }}>/{max}</span>
        </span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(148,163,184,0.15)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '3px',
          background: color,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ── Radio group ──────────────────────────────────────────────────────────────

function RadioGroup({ options, value, onChange, colors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: `1px solid ${selected ? ACCENT + '80' : colors.inputBorder}`,
              background: selected ? ACCENT + '15' : colors.input,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontSize: '0.875rem',
              color: colors.text,
            }}
          >
            <input
              type="radio"
              name={undefined}
              checked={selected}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: ACCENT, width: '15px', height: '15px', flexShrink: 0 }}
            />
            <span style={{ flex: 1 }}>{opt.label}</span>
            <span style={{
              fontSize: '0.75rem',
              color: opt.pts === 0 ? '#22c55e' : opt.pts <= 5 ? '#eab308' : opt.pts <= 15 ? '#f97316' : '#ef4444',
              fontWeight: '600',
              minWidth: '2.5rem',
              textAlign: 'right',
            }}>
              +{opt.pts}
            </span>
          </label>
        )
      })}
    </div>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.25rem',
    }}>
      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: '700', color: colors.text }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ margin: '0 0 1.1rem', fontSize: '0.8rem', color: colors.textSecondary }}>{subtitle}</p>
      )}
      {children}
    </div>
  )
}

// ── Field label ───────────────────────────────────────────────────────────────

function FieldLabel({ children, colors }) {
  return (
    <p style={{
      margin: '1rem 0 0.5rem',
      fontSize: '0.825rem',
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {children}
    </p>
  )
}

// ── Recommendations ───────────────────────────────────────────────────────────

function buildRecommendations(form, breakdown) {
  const tips = []

  // Contract tips
  if (form.contract === 'verbal' || form.contract === 'nothing') {
    tips.push({
      icon: '📄',
      title: 'No written contract detected',
      body: 'Ask for a simple email confirmation of scope, timeline, and payment terms. Even a bullet-point list is better than nothing.',
    })
  }

  // Payment structure
  if (form.paymentStructure === 'full_delivery' || form.paymentStructure === 'approval_nodl') {
    tips.push({
      icon: '💸',
      title: '100% on delivery is high risk',
      body: 'Negotiate at least 30% advance. If refused, that itself is a red flag — walk away.',
    })
  }

  // Social / cold contact
  if (form.clientSource === 'social_dm' || form.clientSource === 'whatsapp') {
    tips.push({
      icon: '🔍',
      title: 'Unverified client channel',
      body: 'Verify their identity. Ask for a LinkedIn profile, company website, or video call before starting any work.',
    })
  }

  // No reviews
  if (form.reviews === 'none') {
    tips.push({
      icon: '⭐',
      title: 'Client has no reviews',
      body: 'Start with a small paid test task. Require payment via escrow before proceeding to the full project.',
    })
  }

  // Unknown account age
  if (form.accountAge === 'unknown' || form.accountAge === 'lt6') {
    tips.push({
      icon: '🕵️',
      title: 'New or off-platform client',
      body: 'Request a video call to verify the client is real. Ask for partial upfront payment before beginning.',
    })
  }

  // Crypto payment
  if (form.paymentMethod === 'crypto') {
    tips.push({
      icon: '₿',
      title: 'Crypto payments are irreversible',
      body: 'Agree on exact token, wallet, and exchange rate before starting. Consider using a stablecoin (USDT/USDC) to avoid volatility.',
    })
  }

  // Will pay later
  if (form.paymentMethod === 'later_cheque') {
    tips.push({
      icon: '🚩',
      title: '"Will pay later" is a major red flag',
      body: 'Do not deliver any work without upfront payment or secure escrow. Cheques can bounce — insist on digital transfer.',
    })
  }

  // Red flags
  if (form.redFlags.free_sample) {
    tips.push({
      icon: '🎁',
      title: 'Free samples requested',
      body: 'Legitimate clients don\'t need free samples. Offer a paid discovery or a reduced-scope paid trial instead.',
    })
  }
  if (form.redFlags.credentials) {
    tips.push({
      icon: '🔐',
      title: 'Sensitive access requested early',
      body: 'Never share admin credentials, API keys, or passwords before a signed contract and first payment are in place.',
    })
  }
  if (form.redFlags.disappeared) {
    tips.push({
      icon: '👻',
      title: 'Client went silent',
      body: 'Send one follow-up with a clear deadline. If no response within 48 hours, pause all work and preserve all deliverables.',
    })
  }
  if (form.redFlags.long_term_promise) {
    tips.push({
      icon: '🪝',
      title: '"Big contract later" is a classic hook',
      body: 'Treat every project on its own merits. Discounts or free work for a promised future contract rarely materialise.',
    })
  }
  if (form.redFlags.refuses_platform) {
    tips.push({
      icon: '⚠️',
      title: 'Client avoids platform payment',
      body: 'This bypasses buyer/seller protections. Insist on escrow or take a larger advance (50%+) before proceeding.',
    })
  }

  // General high-score tip
  if (breakdown.total >= 51 && tips.length === 0) {
    tips.push({
      icon: '🛡️',
      title: 'High risk profile detected',
      body: 'Review each section carefully. Prioritise getting a written agreement and partial advance payment before starting.',
    })
  }

  // Always show at least one tip
  if (tips.length === 0) {
    tips.push({
      icon: '✅',
      title: 'Risk profile looks healthy',
      body: 'Keep protecting yourself: always have a written agreement and use platform escrow when possible.',
    })
  }

  return tips.slice(0, 5)
}

// ── Saved assessment card ─────────────────────────────────────────────────────

function AssessmentCard({ item, onDelete, colors }) {
  const [expanded, setExpanded] = useState(false)
  const risk = getRiskLevel(item.score)

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '0.75rem',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span style={{
          background: risk.bg,
          color: risk.color,
          border: `1px solid ${risk.color}40`,
          borderRadius: '6px',
          padding: '0.2rem 0.55rem',
          fontWeight: '700',
          fontSize: '0.85rem',
          flexShrink: 0,
        }}>
          {item.score}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label || 'Unnamed Assessment'}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
            {new Date(item.savedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            &nbsp;·&nbsp;{risk.icon} {risk.label}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            padding: '0.25rem 0.55rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            flexShrink: 0,
          }}
        >
          Delete
        </button>
        <span style={{ color: colors.textSecondary, fontSize: '0.8rem', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '1rem',
          fontSize: '0.825rem',
          color: colors.textSecondary,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}>
          {[
            { label: 'Client Info', score: item.breakdown.clientInfo, max: 35 },
            { label: 'Contract', score: item.breakdown.contract, max: 40 },
            { label: 'Red Flags', score: item.breakdown.redFlags, max: 25 },
          ].map((s) => (
            <div key={s.label} style={{
              background: colors.bg,
              borderRadius: '8px',
              padding: '0.6rem 0.75rem',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: colors.text }}>
                {s.score}<span style={{ fontSize: '0.7rem', fontWeight: '400', color: colors.textSecondary }}>/{s.max}</span>
              </div>
              <div style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FreelancerRisk() {
  const { isDark, colors } = useTheme()

  // Form state
  const [clientSource, setClientSource] = useState('')
  const [accountAge, setAccountAge] = useState('')
  const [reviews, setReviews] = useState('')
  const [location, setLocation] = useState('')
  const [contract, setContract] = useState('')
  const [paymentStructure, setPaymentStructure] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [redFlags, setRedFlags] = useState({
    rushing: false,
    scope_change: false,
    free_sample: false,
    no_deliverables: false,
    disappeared: false,
    long_term_promise: false,
    credentials: false,
    refuses_platform: false,
  })

  // Save state
  const [assessmentLabel, setAssessmentLabel] = useState('')
  const [savedAssessments, setSavedAssessments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(savedAssessments))
  }, [savedAssessments])

  const toggleFlag = useCallback((id) => {
    setRedFlags((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // ── Score computation ──────────────────────────────────────────────────────

  const breakdown = useMemo(() => {
    const srcPts = CLIENT_SOURCE_OPTIONS.find((o) => o.value === clientSource)?.pts ?? 0
    const agePts = ACCOUNT_AGE_OPTIONS.find((o) => o.value === accountAge)?.pts ?? 0
    const revPts = REVIEWS_OPTIONS.find((o) => o.value === reviews)?.pts ?? 0
    const locPts = LOCATION_OPTIONS.find((o) => o.value === location)?.pts ?? 0
    const clientInfo = srcPts + agePts + revPts + locPts

    const ctrPts = CONTRACT_OPTIONS.find((o) => o.value === contract)?.pts ?? 0
    const pysPts = PAYMENT_STRUCTURE_OPTIONS.find((o) => o.value === paymentStructure)?.pts ?? 0
    const pymPts = PAYMENT_METHOD_OPTIONS.find((o) => o.value === paymentMethod)?.pts ?? 0
    const pytPts = PAYMENT_TERMS_OPTIONS.find((o) => o.value === paymentTerms)?.pts ?? 0
    const contractScore = ctrPts + pysPts + pymPts + pytPts

    const flagPts = RED_FLAGS.reduce((sum, f) => sum + (redFlags[f.id] ? f.pts : 0), 0)

    const raw = clientInfo + contractScore + flagPts
    const total = Math.min(raw, 100)

    return { clientInfo: Math.min(clientInfo, 35), contract: Math.min(contractScore, 40), redFlags: Math.min(flagPts, 25), total }
  }, [clientSource, accountAge, reviews, location, contract, paymentStructure, paymentMethod, paymentTerms, redFlags])

  const riskLevel = useMemo(() => getRiskLevel(breakdown.total), [breakdown.total])

  const form = useMemo(() => ({
    clientSource, accountAge, reviews, location,
    contract, paymentStructure, paymentMethod, paymentTerms,
    redFlags,
  }), [clientSource, accountAge, reviews, location, contract, paymentStructure, paymentMethod, paymentTerms, redFlags])

  const recommendations = useMemo(() => buildRecommendations(form, breakdown), [form, breakdown])

  // ── Save / delete ──────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const label = assessmentLabel.trim() || `Assessment ${new Date().toLocaleDateString()}`
    setSavedAssessments((prev) => [
      {
        id: Date.now(),
        label,
        score: breakdown.total,
        breakdown: { clientInfo: breakdown.clientInfo, contract: breakdown.contract, redFlags: breakdown.redFlags },
        savedAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setAssessmentLabel('')
  }, [assessmentLabel, breakdown])

  const handleDelete = useCallback((id) => {
    setSavedAssessments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleReset = useCallback(() => {
    setClientSource(''); setAccountAge(''); setReviews(''); setLocation('')
    setContract(''); setPaymentStructure(''); setPaymentMethod(''); setPaymentTerms('')
    setRedFlags({ rushing: false, scope_change: false, free_sample: false, no_deliverables: false, disappeared: false, long_term_promise: false, credentials: false, refuses_platform: false })
    setAssessmentLabel('')
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ToolLayout toolId="freelancer-risk">
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            fontSize: '2rem',
            background: `linear-gradient(135deg, ${ACCENT}, #fb923c)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: colors.text }}>
            Freelancer Payment Risk Analyzer
          </h1>
        </div>
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.95rem', maxWidth: '680px' }}>
          Answer a few questions about your client and contract to get an instant risk score.
          Built for Pakistani freelancers doing due-diligence before starting work.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
        gap: '1.5rem',
        alignItems: 'start',
      }}
        className="risk-grid"
      >
        {/* ── LEFT: Form ────────────────────────────────────────────────── */}
        <div>
          {/* Section 1 */}
          <SectionCard
            title="📋 Section 1 — Client Info"
            subtitle="Max 35 pts · Assess how you found this client and their track record."
            colors={colors}
          >
            <FieldLabel colors={colors}>Where did you find this client?</FieldLabel>
            <RadioGroup options={CLIENT_SOURCE_OPTIONS} value={clientSource} onChange={setClientSource} colors={colors} />

            <FieldLabel colors={colors}>Client account age (on platform)</FieldLabel>
            <RadioGroup options={ACCOUNT_AGE_OPTIONS} value={accountAge} onChange={setAccountAge} colors={colors} />

            <FieldLabel colors={colors}>Client reviews / history</FieldLabel>
            <RadioGroup options={REVIEWS_OPTIONS} value={reviews} onChange={setReviews} colors={colors} />

            <FieldLabel colors={colors}>Client location</FieldLabel>
            <RadioGroup options={LOCATION_OPTIONS} value={location} onChange={setLocation} colors={colors} />
          </SectionCard>

          {/* Section 2 */}
          <SectionCard
            title="📝 Section 2 — Contract & Payment Terms"
            subtitle="Max 40 pts · How well is your payment protected?"
            colors={colors}
          >
            <FieldLabel colors={colors}>Written agreement</FieldLabel>
            <RadioGroup options={CONTRACT_OPTIONS} value={contract} onChange={setContract} colors={colors} />

            <FieldLabel colors={colors}>Payment structure</FieldLabel>
            <RadioGroup options={PAYMENT_STRUCTURE_OPTIONS} value={paymentStructure} onChange={setPaymentStructure} colors={colors} />

            <FieldLabel colors={colors}>Payment method</FieldLabel>
            <RadioGroup options={PAYMENT_METHOD_OPTIONS} value={paymentMethod} onChange={setPaymentMethod} colors={colors} />

            <FieldLabel colors={colors}>Payment terms (days)</FieldLabel>
            <RadioGroup options={PAYMENT_TERMS_OPTIONS} value={paymentTerms} onChange={setPaymentTerms} colors={colors} />
          </SectionCard>

          {/* Section 3 */}
          <SectionCard
            title="🚩 Section 3 — Project Red Flags"
            subtitle="Additive checkboxes · Check all that apply to your situation."
            colors={colors}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {RED_FLAGS.map((flag) => {
                const checked = redFlags[flag.id]
                return (
                  <label
                    key={flag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${checked ? '#ef444480' : colors.inputBorder}`,
                      background: checked ? 'rgba(239,68,68,0.1)' : colors.input,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontSize: '0.875rem',
                      color: colors.text,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFlag(flag.id)}
                      style={{ accentColor: '#ef4444', width: '15px', height: '15px', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1 }}>{flag.label}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      fontWeight: '600',
                      minWidth: '2.5rem',
                      textAlign: 'right',
                    }}>
                      +{flag.pts}
                    </span>
                  </label>
                )
              })}
            </div>
          </SectionCard>

          {/* Save assessment */}
          <SectionCard title="💾 Save This Assessment" colors={colors}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={assessmentLabel}
                onChange={(e) => setAssessmentLabel(e.target.value)}
                placeholder='Label e.g. "John Doe – Logo Design"'
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: `1px solid ${colors.inputBorder}`,
                  background: colors.input,
                  color: colors.text,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: ACCENT,
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Save Assessment
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: `1px solid ${colors.inputBorder}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Reset
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT: Score + breakdown + tips ───────────────────────────── */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          {/* Score card */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '14px',
            padding: '1.5rem 1.25rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Score
            </h3>

            <ScoreMeter score={breakdown.total} riskLevel={riskLevel} />

            <div style={{ margin: '1.25rem 0 0.5rem', borderTop: `1px solid ${colors.border}`, paddingTop: '1.1rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Score Breakdown
              </p>
              <BreakdownBar label="Client Info" score={breakdown.clientInfo} max={35} color={getRiskLevel(Math.round((breakdown.clientInfo / 35) * 100)).color} colors={colors} />
              <BreakdownBar label="Contract & Payment" score={breakdown.contract} max={40} color={getRiskLevel(Math.round((breakdown.contract / 40) * 100)).color} colors={colors} />
              <BreakdownBar label="Red Flags" score={breakdown.redFlags} max={25} color={getRiskLevel(Math.round((breakdown.redFlags / 25) * 100)).color} colors={colors} />
            </div>

            {/* Legend */}
            <div style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.4rem',
              fontSize: '0.72rem',
              textAlign: 'left',
            }}>
              {[
                { range: '0–25', label: 'Low', color: '#22c55e' },
                { range: '26–50', label: 'Moderate', color: '#eab308' },
                { range: '51–75', label: 'High', color: '#f97316' },
                { range: '76–100', label: 'Very High', color: '#ef4444' },
              ].map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colors.textSecondary }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  {l.range} — {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations card */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '14px',
            padding: '1.25rem',
          }}>
            <h3 style={{ margin: '0 0 0.9rem', fontSize: '0.85rem', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💡 Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recommendations.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1.3 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: colors.text, marginBottom: '0.2rem' }}>
                      {tip.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                      {tip.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Past Assessments ─────────────────────────────────────────────── */}
      {savedAssessments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            🗂️ Past Assessments
            <span style={{
              background: ACCENT + '25',
              color: ACCENT,
              border: `1px solid ${ACCENT}50`,
              borderRadius: '999px',
              padding: '0.1rem 0.6rem',
              fontSize: '0.78rem',
              fontWeight: '700',
            }}>
              {savedAssessments.length}
            </span>
          </h2>
          {savedAssessments.map((item) => (
            <AssessmentCard key={item.id} item={item} onDelete={handleDelete} colors={colors} />
          ))}
        </div>
      )}

      {/* Responsive grid style override */}
      <style>{`
        @media (max-width: 700px) {
          .risk-grid {
            grid-template-columns: 1fr !important;
          }
          .risk-grid > div:nth-child(2) {
            position: static !important;
          }
        }
      `}</style>
    </ToolLayout>
  )
}
