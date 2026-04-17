import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
const ACCENT = '#0ea5e9'
const USD_RATE = 280 // approximate: 1 USD = 280 PKR
const MARLA_TO_SQFT = 272.25

const CONDITION_OPTIONS = ['Poor', 'Average', 'Good', 'Excellent']
const CONDITION_GRADES = { Poor: 0, Average: 1, Good: 2, Excellent: 3 }

const DEFAULT_ADJUSTMENTS = {
  perBedroom: 500000,
  perBathroom: 300000,
  per100sqft: 50000,
  perMarla: 200000,
  perYear: -50000,
  perGarage: 400000,
  perFloor: 100000,
  perConditionGrade: 500000,
}

const DEFAULT_SUBJECT = {
  bedrooms: 4,
  bathrooms: 2,
  builtup: 1500,
  plotSize: 10,
  plotUnit: 'marla',
  age: 8,
  parking: 1,
  floor: 0,
  condition: 'Good',
}

const DEFAULT_COMP = {
  salePrice: 15000000,
  bedrooms: 3,
  bathrooms: 2,
  builtup: 1200,
  plotSize: 10,
  plotUnit: 'marla',
  age: 10,
  parking: 1,
  floor: 0,
  condition: 'Average',
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function plotToMarla(size, unit) {
  return unit === 'marla' ? size : size / MARLA_TO_SQFT
}

function fmtValue(n, currency) {
  const v = currency === 'USD' ? n / USD_RATE : n
  const sym = currency === 'USD' ? 'USD' : 'PKR'
  const abs = Math.abs(v)
  const formatted = abs.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${v < 0 ? '-' : ''}${sym}\u202f${formatted}`
}

function fmtAdj(n, currency) {
  const v = currency === 'USD' ? n / USD_RATE : n
  const sym = currency === 'USD' ? 'USD' : 'PKR'
  const abs = Math.abs(v)
  const formatted = abs.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${v >= 0 ? '+' : '−'}${sym}\u202f${formatted}`
}

function calcAdjustments(subject, comp, adj) {
  const rows = []

  // Bedrooms
  const bedDiff = subject.bedrooms - comp.bedrooms
  rows.push({
    feature: 'Bedrooms',
    subjectVal: subject.bedrooms,
    compVal: comp.bedrooms,
    diff: bedDiff,
    adjustment: bedDiff * adj.perBedroom,
  })

  // Bathrooms
  const bathDiff = subject.bathrooms - comp.bathrooms
  rows.push({
    feature: 'Bathrooms',
    subjectVal: subject.bathrooms % 1 === 0 ? subject.bathrooms : subject.bathrooms.toFixed(1),
    compVal: comp.bathrooms % 1 === 0 ? comp.bathrooms : comp.bathrooms.toFixed(1),
    diff: bathDiff,
    adjustment: bathDiff * adj.perBathroom,
  })

  // Built-up area
  const builtDiff = subject.builtup - comp.builtup
  rows.push({
    feature: 'Built-up Area',
    subjectVal: `${subject.builtup.toLocaleString()} sqft`,
    compVal: `${comp.builtup.toLocaleString()} sqft`,
    diff: builtDiff,
    diffLabel: `${builtDiff >= 0 ? '+' : ''}${builtDiff.toLocaleString()} sqft`,
    adjustment: (builtDiff / 100) * adj.per100sqft,
  })

  // Plot size (normalise to marla for comparison)
  const subjMarla = plotToMarla(subject.plotSize, subject.plotUnit)
  const compMarla = plotToMarla(comp.plotSize, comp.plotUnit)
  const plotDiff = subjMarla - compMarla
  rows.push({
    feature: 'Plot Size',
    subjectVal: `${subject.plotSize} ${subject.plotUnit}`,
    compVal: `${comp.plotSize} ${comp.plotUnit}`,
    diff: plotDiff,
    diffLabel: `${plotDiff >= 0 ? '+' : ''}${plotDiff.toFixed(2)} marla`,
    adjustment: plotDiff * adj.perMarla,
  })

  // Age
  const ageDiff = subject.age - comp.age
  rows.push({
    feature: 'Age (years)',
    subjectVal: `${subject.age} yrs`,
    compVal: `${comp.age} yrs`,
    diff: ageDiff,
    diffLabel: `${ageDiff >= 0 ? '+' : ''}${ageDiff} yrs`,
    adjustment: ageDiff * adj.perYear,
  })

  // Parking
  const parkDiff = subject.parking - comp.parking
  rows.push({
    feature: 'Parking/Garage',
    subjectVal: subject.parking,
    compVal: comp.parking,
    diff: parkDiff,
    adjustment: parkDiff * adj.perGarage,
  })

  // Floor
  const floorLabel = (n) => (n === 0 ? 'Ground' : `${n}`)
  const floorDiff = subject.floor - comp.floor
  rows.push({
    feature: 'Floor',
    subjectVal: floorLabel(subject.floor),
    compVal: floorLabel(comp.floor),
    diff: floorDiff,
    adjustment: floorDiff * adj.perFloor,
  })

  // Condition
  const subjGrade = CONDITION_GRADES[subject.condition]
  const compGrade = CONDITION_GRADES[comp.condition]
  const condDiff = subjGrade - compGrade
  rows.push({
    feature: 'Condition',
    subjectVal: subject.condition,
    compVal: comp.condition,
    diff: condDiff,
    diffLabel: condDiff === 0 ? '—' : `${condDiff > 0 ? '+' : ''}${condDiff} grade`,
    adjustment: condDiff * adj.perConditionGrade,
  })

  const totalAdj = rows.reduce((s, r) => s + r.adjustment, 0)
  return { rows, totalAdj }
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

function FieldRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>{label}</label>
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
        padding: '0.45rem 0.7rem',
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
        padding: '0.45rem 0.7rem',
        color: colors.text,
        fontSize: '0.875rem',
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function Stepper({ value, onChange, min = 0, max = 20, step = 1, colors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
        style={{
          width: '2rem', height: '2rem',
          background: `${ACCENT}22`,
          border: `1px solid ${ACCENT}44`,
          borderRadius: '0.4rem',
          color: ACCENT,
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 700,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >−</button>
      <span style={{
        minWidth: '2.5rem',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.95rem',
        color: colors.text,
      }}>
        {value % 1 === 0 ? value : value.toFixed(1)}
      </span>
      <button
        onClick={() => onChange(Math.min(max, Math.round((value + step) * 10) / 10))}
        style={{
          width: '2rem', height: '2rem',
          background: `${ACCENT}22`,
          border: `1px solid ${ACCENT}44`,
          borderRadius: '0.4rem',
          color: ACCENT,
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 700,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >+</button>
    </div>
  )
}

function SegmentToggle({ value, options, onChange, colors }) {
  return (
    <div style={{
      display: 'flex',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`,
      flexShrink: 0,
    }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '0.4rem 0.7rem',
            background: value === opt ? ACCENT : 'transparent',
            color: value === opt ? '#fff' : colors.text,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >{opt}</button>
      ))}
    </div>
  )
}

function PropertyForm({ data, onChange, showSalePrice, colors, title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: ACCENT }}>{title}</h3>

      {showSalePrice && (
        <FieldRow label="Sale Price (PKR)">
          <StyledInput
            type="number"
            colors={colors}
            value={data.salePrice || ''}
            onChange={(e) => onChange('salePrice', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 15000000"
          />
        </FieldRow>
      )}

      <FieldRow label="Bedrooms">
        <Stepper value={data.bedrooms} onChange={(v) => onChange('bedrooms', v)} min={0} max={10} colors={colors} />
      </FieldRow>

      <FieldRow label="Bathrooms">
        <Stepper value={data.bathrooms} onChange={(v) => onChange('bathrooms', v)} min={0} max={10} step={0.5} colors={colors} />
      </FieldRow>

      <FieldRow label="Built-up Area (sqft)">
        <StyledInput
          type="number"
          colors={colors}
          value={data.builtup || ''}
          onChange={(e) => onChange('builtup', parseFloat(e.target.value) || 0)}
          placeholder="e.g. 1500"
        />
      </FieldRow>

      <FieldRow label="Plot Size">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <StyledInput
            type="number"
            colors={colors}
            value={data.plotSize || ''}
            onChange={(e) => onChange('plotSize', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 10"
            style={{ flex: 1 }}
          />
          <SegmentToggle
            value={data.plotUnit}
            options={['marla', 'sqft']}
            onChange={(u) => onChange('plotUnit', u)}
            colors={colors}
          />
        </div>
      </FieldRow>

      <FieldRow label="Age of Building (years)">
        <StyledInput
          type="number"
          colors={colors}
          value={data.age || ''}
          onChange={(e) => onChange('age', parseFloat(e.target.value) || 0)}
          placeholder="e.g. 8"
        />
      </FieldRow>

      <FieldRow label="Parking/Garage">
        <Stepper value={data.parking} onChange={(v) => onChange('parking', v)} min={0} max={5} colors={colors} />
      </FieldRow>

      <FieldRow label="Floor (0 = Ground)">
        <StyledInput
          type="number"
          colors={colors}
          value={data.floor}
          onChange={(e) => onChange('floor', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </FieldRow>

      <FieldRow label="Condition">
        <StyledSelect colors={colors} value={data.condition} onChange={(e) => onChange('condition', e.target.value)}>
          {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </StyledSelect>
      </FieldRow>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function PropertyComp() {
  const { isDark, colors } = useTheme()

  const [subject, setSubject] = useState({ ...DEFAULT_SUBJECT })
  const [comps, setComps] = useState([
    { ...DEFAULT_COMP },
    { ...DEFAULT_COMP, salePrice: 0 },
    { ...DEFAULT_COMP, salePrice: 0 },
  ])
  const [activeComp, setActiveComp] = useState(0)
  const [adjustments, setAdjustments] = useState({ ...DEFAULT_ADJUSTMENTS })
  const [currency, setCurrency] = useState('PKR')

  const updateSubject = (field, value) => setSubject((prev) => ({ ...prev, [field]: value }))

  const updateComp = (idx, field, value) =>
    setComps((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })

  const updateAdj = (field, value) => setAdjustments((prev) => ({ ...prev, [field]: value }))

  const results = useMemo(() =>
    comps.map((comp) => {
      if (!comp.salePrice) return null
      const { rows, totalAdj } = calcAdjustments(subject, comp, adjustments)
      return { rows, totalAdj, indicatedValue: comp.salePrice + totalAdj, salePrice: comp.salePrice }
    }),
    [subject, comps, adjustments]
  )

  const activeResult = results[activeComp]
  const validResults = results.filter(Boolean)
  const averageValue = validResults.length > 1
    ? validResults.reduce((s, r) => s + r.indicatedValue, 0) / validResults.length
    : null

  const diffColor = (n) => {
    if (typeof n !== 'number' || n === 0) return colors.textSecondary
    return n > 0 ? '#22c55e' : '#ef4444'
  }

  const renderDiff = (row) => {
    if (row.diffLabel !== undefined) return row.diffLabel
    if (typeof row.diff !== 'number') return row.diff
    if (row.diff === 0) return '—'
    return row.diff > 0 ? `+${row.diff}` : `${row.diff}`
  }

  return (
    <ToolLayout toolId="property-comp">
      <div style={{
        maxWidth: '920px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1rem',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🏠</span>
              <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: colors.text }}>
                Property Comp Adjuster
              </h1>
            </div>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.875rem' }}>
              Compare your subject property to comparable sales to estimate its indicated value.
            </p>
          </div>

          {/* Currency toggle */}
          <SegmentToggle
            value={currency}
            options={['PKR', 'USD']}
            onChange={setCurrency}
            colors={colors}
          />
        </div>

        {currency === 'USD' && (
          <div style={{
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}44`,
            borderRadius: '0.5rem',
            padding: '0.5rem 0.85rem',
            fontSize: '0.8rem',
            color: ACCENT,
          }}>
            ⚠️ USD values are approximate (1 USD ≈ PKR 280). All calculations use PKR internally.
          </div>
        )}

        {/* Property Details — two column */}
        <SectionCard title="🏡 Property Details" colors={colors}>
          {/* Comp tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {comps.map((comp, i) => (
              <button
                key={i}
                onClick={() => setActiveComp(i)}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '0.4rem',
                  border: `1px solid ${activeComp === i ? ACCENT : colors.border}`,
                  background: activeComp === i ? `${ACCENT}22` : 'transparent',
                  color: activeComp === i ? ACCENT : colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Comp {i + 1}
                {comp.salePrice > 0 && (
                  <span style={{
                    marginLeft: '0.4rem',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }} />
                )}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '0',
          }}>
            {/* Subject column */}
            <div style={{ padding: '0.25rem 1.25rem 0.25rem 0.25rem' }}>
              <PropertyForm
                data={subject}
                onChange={updateSubject}
                showSalePrice={false}
                colors={colors}
                title="Subject Property"
              />
            </div>

            {/* Divider */}
            <div style={{
              borderLeft: `1px solid ${colors.border}`,
              margin: '0 0.25rem',
              display: 'block',
            }} />

            {/* Comp column */}
            <div style={{ padding: '0.25rem 0.25rem 0.25rem 1.25rem' }}>
              <PropertyForm
                data={comps[activeComp]}
                onChange={(field, value) => updateComp(activeComp, field, value)}
                showSalePrice={true}
                colors={colors}
                title={`Comparable ${activeComp + 1}`}
              />
            </div>
          </div>
        </SectionCard>

        {/* Adjustment Settings */}
        <SectionCard title="⚙️ Adjustment Settings" colors={colors}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary }}>
            Pakistani market defaults — edit to match your local market. Negative values reduce the indicated price.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem',
          }}>
            {[
              { key: 'perBedroom', label: 'Per Bedroom (PKR)' },
              { key: 'perBathroom', label: 'Per Bathroom (PKR)' },
              { key: 'per100sqft', label: 'Per 100 sqft Built-up (PKR)' },
              { key: 'perMarla', label: 'Per Marla Plot (PKR)' },
              { key: 'perYear', label: 'Per Year Age (PKR)' },
              { key: 'perGarage', label: 'Per Garage Space (PKR)' },
              { key: 'perFloor', label: 'Per Floor Above Ground (PKR)' },
              { key: 'perConditionGrade', label: 'Per Condition Grade (PKR)' },
            ].map(({ key, label }) => (
              <FieldRow key={key} label={label}>
                <StyledInput
                  type="number"
                  colors={colors}
                  value={adjustments[key]}
                  onChange={(e) => updateAdj(key, parseFloat(e.target.value) || 0)}
                />
              </FieldRow>
            ))}
          </div>
        </SectionCard>

        {/* Results */}
        <SectionCard title={`📊 Results — Comp ${activeComp + 1}`} colors={colors}>
          {!comps[activeComp].salePrice ? (
            <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: 0 }}>
              Enter a Sale Price for Comp {activeComp + 1} above to see the adjustment analysis.
            </p>
          ) : activeResult ? (
            <>
              {/* Adjustment table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.845rem', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      {['Feature', 'Subject', 'Comp', 'Difference', 'Adjustment'].map((h, i) => (
                        <th key={h} style={{
                          textAlign: i === 0 ? 'left' : 'right',
                          padding: '0.5rem 0.75rem',
                          borderBottom: `2px solid ${colors.border}`,
                          color: colors.textSecondary,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeResult.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: `1px solid ${colors.border}30`,
                          background: i % 2 === 0 ? 'transparent' : (isDark ? '#ffffff04' : '#00000003'),
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', color: colors.text, fontWeight: 500 }}>
                          {row.feature}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: colors.text, textAlign: 'right' }}>
                          {row.subjectVal}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: colors.text, textAlign: 'right' }}>
                          {row.compVal}
                        </td>
                        <td style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'right',
                          color: diffColor(row.diff),
                          fontWeight: 500,
                        }}>
                          {renderDiff(row)}
                        </td>
                        <td style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'right',
                          color: diffColor(row.adjustment),
                          fontWeight: 700,
                        }}>
                          {row.adjustment === 0 ? '—' : fmtAdj(row.adjustment, currency)}
                        </td>
                      </tr>
                    ))}

                    {/* Total row */}
                    <tr style={{ borderTop: `2px solid ${colors.border}` }}>
                      <td
                        colSpan={4}
                        style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: colors.text }}
                      >
                        Total Adjustment
                      </td>
                      <td style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: diffColor(activeResult.totalAdj),
                      }}>
                        {fmtAdj(activeResult.totalAdj, currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Value summary card */}
              <div style={{
                background: isDark ? '#ffffff08' : '#00000005',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    Comp {activeComp + 1} Sale Price
                  </span>
                  <span style={{ color: colors.text, fontWeight: 600 }}>
                    {fmtValue(activeResult.salePrice, currency)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    + Total Adjustment
                  </span>
                  <span style={{ color: diffColor(activeResult.totalAdj), fontWeight: 600 }}>
                    {fmtAdj(activeResult.totalAdj, currency)}
                  </span>
                </div>

                <div style={{ height: '1px', background: colors.border, margin: '0.15rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ color: colors.text, fontWeight: 700, fontSize: '0.95rem' }}>
                    = Indicated Value of Subject
                  </span>
                  <span style={{
                    color: ACCENT,
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    letterSpacing: '-0.01em',
                  }}>
                    {fmtValue(activeResult.indicatedValue, currency)}
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textSecondary, fontStyle: 'italic' }}>
                Based on {validResults.length} comparable{validResults.length !== 1 ? 's' : ''} —{' '}
                {validResults.length < 3
                  ? 'add more comps for better accuracy'
                  : 'good confidence with 3 comps'}
              </p>
            </>
          ) : null}
        </SectionCard>

        {/* Reconciled average (only when 2+ valid comps) */}
        {averageValue !== null && (
          <SectionCard title="🔁 Reconciled Value" colors={colors}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textSecondary }}>
              Average indicated value across {validResults.length} comparables:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {results.map((r, i) =>
                r ? (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.4rem 0.6rem',
                    background: `${ACCENT}0d`,
                    borderRadius: '0.4rem',
                    fontSize: '0.875rem',
                  }}>
                    <span style={{ color: colors.textSecondary }}>Comp {i + 1}</span>
                    <span style={{ color: colors.text, fontWeight: 600 }}>
                      {fmtValue(r.indicatedValue, currency)}
                    </span>
                  </div>
                ) : null
              )}
            </div>

            <div style={{ height: '1px', background: colors.border }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}>
              <span style={{ color: colors.text, fontWeight: 700, fontSize: '0.95rem' }}>
                Average Indicated Value
              </span>
              <span style={{
                color: ACCENT,
                fontWeight: 800,
                fontSize: '1.7rem',
                letterSpacing: '-0.01em',
              }}>
                {fmtValue(averageValue, currency)}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textSecondary, fontStyle: 'italic' }}>
              Simple average — weight individual comps based on similarity to subject for a more precise reconciliation.
            </p>
          </SectionCard>
        )}

        {/* ── API Note ── */}
        <DisclaimerBlock type="noApi" overrideBodyEn="Property prices are entered manually. No real-time property registry or market data API is integrated. When a public API (e.g. FBR property valuation or Zameen.com feed) becomes available, it can be connected." />
      </div>
    </ToolLayout>
  )
}
