import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCENT = '#0ea5e9'

const DISTRICT_MAP = {
  10: { district: 'Lahore',         province: 'Punjab' },
  11: { district: 'Sheikhupura',    province: 'Punjab' },
  12: { district: 'Faisalabad',     province: 'Punjab' },
  13: { district: 'Gujranwala',     province: 'Punjab' },
  14: { district: 'Rawalpindi',     province: 'Punjab' },
  15: { district: 'Multan',         province: 'Punjab' },
  16: { district: 'Bahawalpur',     province: 'Punjab' },
  17: { district: 'Sargodha',       province: 'Punjab' },
  18: { district: 'Sahiwal',        province: 'Punjab' },
  19: { district: 'D.G. Khan',      province: 'Punjab' },
  20: { district: 'Karachi',        province: 'Sindh' },
  21: { district: 'Hyderabad',      province: 'Sindh' },
  22: { district: 'Larkana',        province: 'Sindh' },
  23: { district: 'Sukkur',         province: 'Sindh' },
  24: { district: 'Mirpurkhas',     province: 'Sindh' },
  25: { district: 'Nawabshah',      province: 'Sindh' },
  26: { district: 'Khairpur',       province: 'Sindh' },
  30: { district: 'Peshawar',       province: 'KPK' },
  31: { district: 'Mardan',         province: 'KPK' },
  32: { district: 'Abbottabad',     province: 'KPK' },
  33: { district: 'Bannu',          province: 'KPK' },
  34: { district: 'D.I. Khan',      province: 'KPK' },
  35: { district: 'Kohat',          province: 'KPK' },
  36: { district: 'Malakand',       province: 'KPK' },
  37: { district: 'Swat',           province: 'KPK' },
  38: { district: 'Swabi',          province: 'KPK' },
  40: { district: 'Quetta',         province: 'Balochistan' },
  41: { district: 'Kalat',          province: 'Balochistan' },
  42: { district: 'Makran',         province: 'Balochistan' },
  43: { district: 'Sibi',           province: 'Balochistan' },
  44: { district: 'Zhob',           province: 'Balochistan' },
  45: { district: 'Loralai',        province: 'Balochistan' },
  46: { district: 'Turbat',         province: 'Balochistan' },
  51: { district: 'Islamabad',      province: 'ICT' },
  61: { district: 'Kurram',         province: 'Ex-FATA (merged KPK)' },
  62: { district: 'North Waziristan', province: 'Ex-FATA (merged KPK)' },
  63: { district: 'South Waziristan', province: 'Ex-FATA (merged KPK)' },
  64: { district: 'Bajaur',         province: 'Ex-FATA (merged KPK)' },
  65: { district: 'Mohmand',        province: 'Ex-FATA (merged KPK)' },
  66: { district: 'Khyber',         province: 'Ex-FATA (merged KPK)' },
  67: { district: 'Orakzai',        province: 'Ex-FATA (merged KPK)' },
  71: { district: 'Muzaffarabad',   province: 'AJK' },
  72: { district: 'Mirpur',         province: 'AJK' },
  73: { district: 'Kotli',          province: 'AJK' },
  74: { district: 'Bhimber',        province: 'AJK' },
  75: { district: 'Bagh',           province: 'AJK' },
  76: { district: 'Rawalakot / Poonch', province: 'AJK' },
  81: { district: 'Gilgit',         province: 'Gilgit-Baltistan' },
  82: { district: 'Skardu',         province: 'Gilgit-Baltistan' },
  83: { district: 'Diamer (Chilas)', province: 'Gilgit-Baltistan' },
  84: { district: 'Ghanche',        province: 'Gilgit-Baltistan' },
}

const RTO_MAP = {
  Punjab:                  ['Lahore RTO', 'Faisalabad RTO', 'Gujranwala RTO', 'Rawalpindi RTO', 'Multan RTO'],
  Sindh:                   ['Karachi RTO-I', 'Karachi RTO-II', 'Karachi RTO-III', 'Hyderabad RTO', 'Sukkur RTO'],
  KPK:                     ['Peshawar RTO', 'Abbottabad RTO'],
  'Ex-FATA (merged KPK)':  ['Peshawar RTO'],
  Balochistan:             ['Quetta RTO'],
  ICT:                     ['Islamabad RTO'],
  AJK:                     ['AJK RTO (Muzaffarabad)'],
  'Gilgit-Baltistan':      ['GB RTO (Gilgit)'],
}

const PROVINCE_LABEL_MAP = {
  Punjab:                  '1x codes (10–19)',
  Sindh:                   '2x codes (20–26)',
  KPK:                     '3x codes (30–38)',
  Balochistan:             '4x codes (40–46)',
  ICT:                     '5x code (51)',
  'Ex-FATA (merged KPK)':  '6x codes (61–67)',
  AJK:                     '7x codes (71–76)',
  'Gilgit-Baltistan':      '8x codes (81–84)',
}

const WHT_ROWS = [
  { type: 'Bank profit / interest',           filer: '15%',  nonFiler: '35%',  ref: 'Sec 151' },
  { type: 'Dividend income',                  filer: '15%',  nonFiler: '30%',  ref: 'Sec 150' },
  { type: 'Property purchase (>5M)',          filer: '3%',   nonFiler: '6%',   ref: 'Sec 236K' },
  { type: 'Property sale / transfer',         filer: '3%',   nonFiler: '6%',   ref: 'Sec 236C' },
  { type: 'Vehicle registration (≤1300cc)',   filer: '1%',   nonFiler: '3%',   ref: 'Sec 231B' },
  { type: 'Vehicle registration (1301–2000cc)', filer: '2%', nonFiler: '5%',   ref: 'Sec 231B' },
  { type: 'Vehicle registration (>2000cc)',   filer: '3%',   nonFiler: '7%',   ref: 'Sec 231B' },
  { type: 'Cash withdrawal >50,000/day',      filer: '0%',   nonFiler: '0.6%', ref: 'Sec 231A' },
  { type: 'Imports (commercial)',             filer: '5.5%', nonFiler: '8%',   ref: 'Sec 148' },
  { type: 'Salary (above taxable limit)',     filer: 'Per slab', nonFiler: 'Per slab', ref: 'Sec 149' },
  { type: 'Services (contract)',              filer: '8%',   nonFiler: '14%',  ref: 'Sec 153(1)(b)' },
  { type: 'Execution of contract',            filer: '7%',   nonFiler: '13%',  ref: 'Sec 153(1)(c)' },
  { type: 'Prize bond / lottery',             filer: '15%',  nonFiler: '25%',  ref: 'Sec 156' },
]

const TAX_DEADLINES = [
  { event: 'Income Tax Return (Salaried/Individual)', date: 'September 30', note: 'Tax Year ends June 30' },
  { event: 'Wealth Statement',                         date: 'September 30', note: 'Filed with ITR' },
  { event: 'Monthly Sales Tax Return',                 date: '18th of next month', note: 'e.g., July return → Aug 18' },
  { event: 'Annual Sales Tax Return',                  date: 'July 31',      note: 'Summary for the year' },
  { event: 'Advance Tax — Q1 (Jul–Sep)',               date: 'September 25', note: '25% of estimated annual tax' },
  { event: 'Advance Tax — Q2 (Oct–Dec)',               date: 'December 25',  note: 'Cumulative 50%' },
  { event: 'Advance Tax — Q3 (Jan–Mar)',               date: 'March 25',     note: 'Cumulative 75%' },
  { event: 'Advance Tax — Q4 (Apr–Jun)',               date: 'June 15',      note: 'Cumulative 100%' },
  { event: 'Employer Annual Withholding Statement',    date: 'March 31',     note: 'Form e-Filing' },
  { event: 'Monthly WHT Statement',                    date: '15th of next month', note: 'Sec 165 statement' },
  { event: 'ATL Publication',                          date: 'March 1',      note: 'FBR publishes updated ATL' },
  { event: 'STRN Registration (Sales Tax)',            date: 'Before first taxable supply', note: 'Mandatory if turnover ≥5M' },
]

const GLOSSARY = [
  {
    term: 'NTN — National Tax Number',
    def: 'A unique 7-digit identifier assigned by FBR to every registered taxpayer (individual or company). Required for filing returns, opening business bank accounts, and participating in government tenders.',
  },
  {
    term: 'STRN — Sales Tax Registration Number',
    def: 'Issued by FBR for Sales Tax registration under the Sales Tax Act 1990. Format: XXXX-XXXX-XXXXXX-XX. Required for businesses with taxable turnover ≥ PKR 5 million. Distinct from NTN (which is for Income Tax).',
  },
  {
    term: 'ATL — Active Taxpayer List',
    def: 'FBR\'s published list of individuals and entities who filed their Income Tax Return. Updated annually on March 1. Being on the ATL (a "filer") qualifies you for reduced withholding tax rates across dozens of transactions.',
  },
  {
    term: 'WHT — Withholding Tax',
    def: 'Tax deducted at source by the payer before making payment. Pakistan uses WHT extensively: banks deduct it on profit, car dealers on vehicle registration, property registrars on transfers, etc. Rates differ for filers and non-filers.',
  },
  {
    term: 'FBR — Federal Board of Revenue',
    def: 'Pakistan\'s apex tax authority responsible for collecting direct taxes (Income Tax, Corporate Tax) and indirect taxes (Sales Tax, Federal Excise, Customs). Official portal: fbr.gov.pk.',
  },
  {
    term: 'RTO — Regional Tax Office',
    def: 'FBR\'s field offices handling taxpayer registration, audits, and assessments for their geographic jurisdiction. Major RTOs: Lahore, Karachi I/II/III, Islamabad, Faisalabad, Multan, Peshawar, Quetta.',
  },
  {
    term: 'IRIS — Integrated Revenue Information System',
    def: 'FBR\'s online tax portal (iris.fbr.gov.pk) for e-filing returns, registering for NTN/STRN, submitting declarations, paying taxes, and viewing notices.',
  },
  {
    term: 'CNIC — Computerised National Identity Card',
    def: 'Issued by NADRA — 13-digit number (XXXXX-XXXXXXX-X). First 5 digits encode district/area, next 7 are the family sequence, last digit indicates gender. For individuals, NTN is usually the same as CNIC number.',
  },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

function validateNTN(raw) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length !== 7) return { valid: false, error: `NTN must be exactly 7 digits (got ${digits.length})` }
  const num = parseInt(digits, 10)
  let type = 'Unknown'
  // FBR number ranges (approximate — exact ranges change with new registrations)
  if (num >= 0 && num <= 1999999) type = 'Individual (Person)'
  else if (num >= 2000000 && num <= 3999999) type = 'Association of Persons (AOP)'
  else if (num >= 4000000 && num <= 6999999) type = 'Company / Corporate Entity'
  else type = 'Individual / Miscellaneous'
  const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits[6]}`
  return { valid: true, digits, formatted, type }
}

function formatNTNDisplay(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 7)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d[6]}`
}

function validateSTRN(raw) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length !== 16) return { valid: false, error: `STRN must be 16 digits (got ${digits.length}). Format: XXXX-XXXX-XXXXXX-XX` }
  const formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 14)}-${digits.slice(14)}`
  const rtoCode = parseInt(digits.slice(0, 4), 10)
  return { valid: true, digits, formatted, rtoCode }
}

function formatSTRNDisplay(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 16)
  let out = d
  if (d.length > 4)  out = `${d.slice(0, 4)}-${d.slice(4)}`
  if (d.length > 8)  out = `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`
  if (d.length > 14) out = `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8, 14)}-${d.slice(14)}`
  return out
}

function validateCNIC(raw) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length !== 13) return { valid: false, error: `CNIC must be exactly 13 digits (got ${digits.length})` }
  const code = parseInt(digits.slice(0, 2), 10)
  const info = DISTRICT_MAP[code]
  const lastDigit = parseInt(digits[12], 10)
  const gender = lastDigit % 2 !== 0 ? 'Male' : 'Female'
  const formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits[12]}`
  const rtos = info ? (RTO_MAP[info.province] || []) : []
  return {
    valid: true,
    digits,
    formatted,
    gender,
    genderDigit: lastDigit,
    districtCode: code,
    district: info?.district || 'Unknown',
    province: info?.province || 'Unknown',
    rtos,
  }
}

function formatCNICDisplay(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 13)
  if (d.length <= 5) return d
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d[12]}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <h2 style={{
        margin: '0 0 1.25rem',
        fontSize: '1.05rem',
        fontWeight: 700,
        color: ACCENT,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function Badge({ text, color = ACCENT }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}20`,
      color,
      border: `1px solid ${color}44`,
      borderRadius: '0.4rem',
      padding: '0.15rem 0.55rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    }}>
      {text}
    </span>
  )
}

function ResultRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8', minWidth: '130px', flexShrink: 0, paddingTop: '0.05rem' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: valueColor || 'inherit', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  )
}

function StyledInput({ value, onChange, placeholder, style = {} }) {
  const { colors } = useTheme()
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '0.65rem 0.9rem',
        background: colors.input,
        border: `1.5px solid ${colors.inputBorder}`,
        borderRadius: '0.6rem',
        color: colors.text,
        fontSize: '0.95rem',
        fontFamily: 'monospace',
        outline: 'none',
        boxSizing: 'border-box',
        letterSpacing: '0.05em',
        ...style,
      }}
    />
  )
}

function ValidationBanner({ result, colors }) {
  if (!result) return null
  if (!result.valid) {
    return (
      <div style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#ef444420',
        border: '1px solid #ef444444',
        borderRadius: '0.6rem',
        color: '#f87171',
        fontSize: '0.83rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span>✗</span> {result.error}
      </div>
    )
  }
  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.75rem 1rem',
      background: '#22c55e20',
      border: '1px solid #22c55e44',
      borderRadius: '0.6rem',
      color: '#4ade80',
      fontSize: '0.83rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <span>✓</span> Valid format
    </div>
  )
}

function InfoChip({ label, value, colors }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.6rem',
      padding: '0.65rem 0.9rem',
    }}>
      <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>{value}</p>
    </div>
  )
}

function GlossaryItem({ term, def, colors }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.9rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.text,
          fontSize: '0.9rem',
          fontWeight: 600,
          textAlign: 'left',
          gap: '0.5rem',
        }}
      >
        <span>{term}</span>
        <span style={{ color: ACCENT, fontSize: '1.1rem', flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p style={{
          margin: '0 0 0.9rem',
          fontSize: '0.84rem',
          color: colors.textSecondary,
          lineHeight: 1.7,
        }}>
          {def}
        </p>
      )}
    </div>
  )
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ntn',      label: 'NTN',       icon: '🔢' },
  { id: 'strn',     label: 'STRN',      icon: '🏷️' },
  { id: 'cnic',     label: 'CNIC',      icon: '🪪' },
  { id: 'atl',      label: 'ATL / Filer', icon: '✅' },
  { id: 'wht',      label: 'WHT Rates', icon: '📊' },
  { id: 'calendar', label: 'Calendar',  icon: '📅' },
  { id: 'glossary', label: 'Glossary',  icon: '📖' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function NtnChecker() {
  const { isDark, colors } = useTheme()
  const [activeTab, setActiveTab] = useState('ntn')

  // NTN state
  const [ntnInput, setNtnInput] = useState('')
  // STRN state
  const [strnInput, setStrnInput] = useState('')
  // CNIC state
  const [cnicInput, setCnicInput] = useState('')

  const ntnResult  = validateNTN(ntnInput)
  const strnResult = validateSTRN(strnInput)
  const cnicResult = validateCNIC(cnicInput)

  // ─── Tab bar ────────────────────────────────────────────────────────────────
  const tabBar = (
    <div style={{
      display: 'flex',
      gap: '0.35rem',
      flexWrap: 'wrap',
      marginBottom: '1.75rem',
      padding: '0.35rem',
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.9rem',
    }}>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{
            flex: '1 0 auto',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.65rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s',
            background: activeTab === t.id ? ACCENT : 'transparent',
            color: activeTab === t.id ? '#fff' : colors.textSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )

  // ─── NTN panel ──────────────────────────────────────────────────────────────
  const ntnPanel = (
    <SectionCard title="NTN — National Tax Number Validator" icon="🔢" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        An NTN is a 7-digit number assigned by FBR to every registered taxpayer. For individuals, the NTN is
        usually the same as your CNIC number (without dashes). Companies and AOPs receive a separate 7-digit NTN.
      </p>

      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: colors.textSecondary, marginBottom: '0.4rem' }}>
        Enter NTN (7 digits)
      </label>
      <StyledInput
        value={ntnInput}
        onChange={e => setNtnInput(formatNTNDisplay(e.target.value))}
        placeholder="e.g. 123-456-7"
      />

      <ValidationBanner result={ntnResult} colors={colors} />

      {ntnResult?.valid && (
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <ResultRow label="Formatted NTN"  value={ntnResult.formatted} valueColor={ACCENT} />
          <ResultRow label="Digits only"    value={ntnResult.digits} />
          <ResultRow label="Taxpayer type"  value={ntnResult.type} valueColor={ACCENT} />
        </div>
      )}

      <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { range: '0000001 – 1999999', type: 'Individual (Salaried / Self-employed)', color: '#22c55e' },
          { range: '2000000 – 3999999', type: 'Association of Persons (AOP / Firm)', color: '#f59e0b' },
          { range: '4000000 – 6999999', type: 'Company / Corporate Entity',           color: '#a78bfa' },
        ].map(item => (
          <div key={item.range} style={{
            background: `${item.color}12`,
            border: `1px solid ${item.color}33`,
            borderRadius: '0.65rem',
            padding: '0.75rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', fontFamily: 'monospace', color: colors.textSecondary }}>{item.range}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '0.65rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>💡 Tip:</strong> Individuals can register for NTN online via{' '}
        <strong style={{ color: ACCENT }}>IRIS (iris.fbr.gov.pk)</strong> using their CNIC and mobile number.
        NTN registration is free and mandatory for filing Income Tax Returns.
      </div>
    </SectionCard>
  )

  // ─── STRN panel ─────────────────────────────────────────────────────────────
  const strnPanel = (
    <SectionCard title="STRN — Sales Tax Registration Number Validator" icon="🏷️" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        STRN is issued under the <strong style={{ color: colors.text }}>Sales Tax Act 1990</strong> for businesses
        making taxable supplies. It is separate from NTN. Format:{' '}
        <code style={{ fontFamily: 'monospace', background: colors.surface, padding: '0.1rem 0.35rem', borderRadius: '0.3rem', fontSize: '0.8rem' }}>
          XXXX-XXXX-XXXXXX-XX
        </code>{' '}
        (16 digits).
      </p>

      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: colors.textSecondary, marginBottom: '0.4rem' }}>
        Enter STRN
      </label>
      <StyledInput
        value={strnInput}
        onChange={e => setStrnInput(formatSTRNDisplay(e.target.value))}
        placeholder="e.g. 0311-0000-234567-12"
      />

      <ValidationBanner result={strnResult} colors={colors} />

      {strnResult?.valid && (
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <ResultRow label="Formatted STRN" value={strnResult.formatted} valueColor={ACCENT} />
          <ResultRow label="Digits only"    value={strnResult.digits} />
          <ResultRow label="RTO prefix"     value={String(strnResult.rtoCode).padStart(4, '0')} />
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 700, color: colors.text }}>
          Sales Tax vs Income Tax — Key Differences
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            {
              title: 'Income Tax (NTN)',
              points: ['Direct tax on income/profits', 'Governed by ITO 2001', 'Paid by earner', 'Filed annually (Sep 30)', 'Administered by RTO'],
              color: ACCENT,
            },
            {
              title: 'Sales Tax (STRN)',
              points: ['Indirect tax on supplies', 'Governed by STA 1990', 'Collected from buyer', 'Filed monthly (18th)', 'Standard rate 18%'],
              color: '#a78bfa',
            },
          ].map(col => (
            <div key={col.title} style={{
              background: `${col.color}10`,
              border: `1px solid ${col.color}30`,
              borderRadius: '0.65rem',
              padding: '0.85rem',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.83rem', color: col.color }}>{col.title}</p>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {col.points.map(pt => (
                  <li key={pt} style={{ fontSize: '0.78rem', color: colors.textSecondary, marginBottom: '0.2rem', lineHeight: 1.5 }}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: `#f59e0b10`, border: `1px solid #f59e0b30`, borderRadius: '0.65rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>⚠️ Registration Threshold:</strong> Businesses with annual taxable turnover
        of <strong style={{ color: '#f59e0b' }}>PKR 5 million or more</strong> must register for Sales Tax. Retailers and
        service providers in FBR's "Tier-1" category are also required to register.
      </div>
    </SectionCard>
  )

  // ─── CNIC panel ─────────────────────────────────────────────────────────────
  const cnicPanel = (
    <SectionCard title="CNIC-Based Tax & Province Info" icon="🪪" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        Enter your 13-digit CNIC to decode the province/district, gender, and find your relevant FBR Regional Tax Office (RTO).
        For individuals, your NTN is typically your CNIC without dashes.
      </p>

      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: colors.textSecondary, marginBottom: '0.4rem' }}>
        Enter CNIC (13 digits)
      </label>
      <StyledInput
        value={cnicInput}
        onChange={e => setCnicInput(formatCNICDisplay(e.target.value))}
        placeholder="e.g. 35202-1234567-1"
      />

      <ValidationBanner result={cnicResult} colors={colors} />

      {cnicResult?.valid && (
        <>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
            <ResultRow label="Formatted CNIC" value={cnicResult.formatted} valueColor={ACCENT} />
            <ResultRow label="District code"  value={String(cnicResult.districtCode).padStart(2, '0')} />
            <ResultRow label="District"       value={cnicResult.district} valueColor={ACCENT} />
            <ResultRow label="Province"       value={cnicResult.province} valueColor={ACCENT} />
            <ResultRow
              label="Gender"
              value={`${cnicResult.gender} (last digit ${cnicResult.genderDigit} is ${cnicResult.genderDigit % 2 !== 0 ? 'odd → male' : 'even → female'})`}
              valueColor={cnicResult.gender === 'Male' ? '#60a5fa' : '#f472b6'}
            />
          </div>

          {cnicResult.rtos.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '0.7rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.82rem', color: ACCENT }}>
                🏢 Relevant RTO(s) for {cnicResult.province}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cnicResult.rtos.map(rto => <Badge key={rto} text={rto} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Province map */}
      <div style={{ marginTop: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 700, color: colors.text }}>
          NADRA Province / Area Codes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
          {Object.entries(PROVINCE_LABEL_MAP).map(([province, codes]) => {
            const rtos = RTO_MAP[province] || []
            return (
              <div key={province} style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.65rem',
                padding: '0.75rem',
              }}>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.82rem', color: ACCENT }}>{province}</p>
                <p style={{ margin: '0 0 0.3rem', fontFamily: 'monospace', fontSize: '0.75rem', color: colors.textSecondary }}>{codes}</p>
                {rtos.slice(0, 2).map(r => (
                  <span key={r} style={{ display: 'inline-block', marginRight: '0.3rem', marginBottom: '0.2rem', fontSize: '0.68rem', color: colors.muted }}>→ {r}</span>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )

  // ─── ATL panel ──────────────────────────────────────────────────────────────
  const atlPanel = (
    <SectionCard title="ATL — Active Taxpayer List & Filer Benefits" icon="✅" colors={colors}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: '📋', title: 'What is ATL?', body: 'The Active Taxpayer List is published by FBR every year on March 1. It lists all individuals and companies who filed their Income Tax Return by the due date for the previous tax year.' },
          { icon: '🔍', title: 'How to check?', body: 'Visit fbr.gov.pk → ATL Search, or IRIS portal. Enter your NTN or CNIC. You can also SMS your CNIC to 9966 (ATL<space>CNIC). Status updates within 2–3 days of filing.' },
          { icon: '💰', title: 'Why it matters?', body: 'Being a "filer" on ATL qualifies you for significantly reduced withholding tax rates on dozens of transactions — bank profits, property, vehicles, imports, dividends and more.' },
          { icon: '🗓️', title: 'ATL Fee (late joiner)', body: 'If you file your return after the deadline but before March 1, FBR charges a surcharge fee (PKR 1,000 for individuals) to be included in the ATL. This is worth paying given the WHT savings.' },
        ].map(card => (
          <div key={card.title} style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.4rem', fontSize: '1.2rem' }}>{card.icon}</p>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '0.85rem', color: colors.text }}>{card.title}</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textSecondary, lineHeight: 1.6 }}>{card.body}</p>
          </div>
        ))}
      </div>

      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 700, color: colors.text }}>
        Filer vs Non-Filer — WHT Rate Comparison
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Filer', desc: 'On ATL — filed ITR on time', rate: 'Lower rates', color: '#22c55e' },
          { label: 'Non-Filer', desc: 'Not on ATL — did not file ITR', rate: 'Higher rates (1.5–3×)', color: '#ef4444' },
        ].map(item => (
          <div key={item.label} style={{
            background: `${item.color}12`,
            border: `1px solid ${item.color}33`,
            borderRadius: '0.7rem',
            padding: '1rem',
            textAlign: 'center',
          }}>
            <Badge text={item.label} color={item.color} />
            <p style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.8rem', color: colors.textSecondary }}>{item.desc}</p>
            <p style={{ margin: 0, fontWeight: 700, color: item.color, fontSize: '0.9rem' }}>{item.rate}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '0.65rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>🔗 Official ATL Check:</strong>{' '}
        <span style={{ color: ACCENT, fontWeight: 600 }}>fbr.gov.pk/ird/atlsearch</span>
        {' '}— Enter CNIC or NTN to check filer status. Also reachable via IRIS portal under "Taxpayer Profile".
      </div>
    </SectionCard>
  )

  // ─── WHT table panel ─────────────────────────────────────────────────────────
  const whtPanel = (
    <SectionCard title="Withholding Tax Reference Table" icon="📊" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        WHT rates under the <strong style={{ color: colors.text }}>Income Tax Ordinance 2001</strong>. Filer rates apply to
        taxpayers on FBR's Active Taxpayer List. Rates are based on Finance Act 2024–25.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: `${ACCENT}15` }}>
              {['Transaction', 'Filer Rate', 'Non-Filer Rate', 'ITO Section'].map(h => (
                <th key={h} style={{
                  padding: '0.65rem 0.75rem',
                  textAlign: 'left',
                  color: ACCENT,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  borderBottom: `2px solid ${ACCENT}33`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WHT_ROWS.map((row, i) => (
              <tr key={row.type} style={{ background: i % 2 === 0 ? 'transparent' : `${colors.surface}` }}>
                <td style={{ padding: '0.6rem 0.75rem', color: colors.text, fontWeight: 500, borderBottom: `1px solid ${colors.border}` }}>{row.type}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#22c55e', fontWeight: 700, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{row.filer}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#f87171', fontWeight: 700, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{row.nonFiler}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: colors.muted, fontFamily: 'monospace', fontSize: '0.75rem', borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{row.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: colors.muted, fontStyle: 'italic' }}>
        * Rates are illustrative and subject to change via annual Finance Acts. Always verify with the latest FBR circular or a tax consultant.
      </p>
    </SectionCard>
  )

  // ─── Calendar panel ──────────────────────────────────────────────────────────
  const calendarPanel = (
    <SectionCard title="Pakistan Tax Calendar — Key Deadlines" icon="📅" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        Pakistan's tax year runs from <strong style={{ color: colors.text }}>1 July to 30 June</strong>.
        All deadlines are fixed unless FBR issues an extension order (common for ITR — check fbr.gov.pk for extensions).
      </p>

      <div style={{ display: 'grid', gap: '0.55rem' }}>
        {TAX_DEADLINES.map((item, i) => {
          const isAdvance = item.event.startsWith('Advance Tax')
          const isMonthly = item.event.includes('Monthly') || item.event.includes('Monthly')
          const dotColor = isAdvance ? '#f59e0b' : isMonthly ? '#a78bfa' : ACCENT
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'flex-start',
              padding: '0.75rem 0.9rem',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.6rem',
              borderLeft: `3px solid ${dotColor}`,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.84rem', color: colors.text }}>{item.event}</p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: colors.textSecondary }}>{item.note}</p>
              </div>
              <span style={{
                flexShrink: 0,
                background: `${dotColor}18`,
                color: dotColor,
                border: `1px solid ${dotColor}40`,
                borderRadius: '0.4rem',
                padding: '0.2rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {item.date}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
        {[
          { color: ACCENT, label: 'Annual / Registration deadlines' },
          { color: '#f59e0b', label: 'Advance Tax (quarterly)' },
          { color: '#a78bfa', label: 'Monthly obligations' },
        ].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: colors.textSecondary }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color, flexShrink: 0 }} />
            {l.label}
          </span>
        ))}
      </div>
    </SectionCard>
  )

  // ─── Glossary panel ──────────────────────────────────────────────────────────
  const glossaryPanel = (
    <SectionCard title="Tax Glossary — Quick Reference" icon="📖" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        Click any term to expand its definition.
      </p>
      <div>
        {GLOSSARY.map(item => (
          <GlossaryItem key={item.term} term={item.term} def={item.def} colors={colors} />
        ))}
      </div>
    </SectionCard>
  )

  const panelMap = {
    ntn:      ntnPanel,
    strn:     strnPanel,
    cnic:     cnicPanel,
    atl:      atlPanel,
    wht:      whtPanel,
    calendar: calendarPanel,
    glossary: glossaryPanel,
  }

  return (
    <ToolLayout toolId="ntn-checker">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          margin: '0 0 0.35rem',
          fontSize: '1.6rem',
          fontWeight: 800,
          background: `linear-gradient(135deg, ${ACCENT}, #38bdf8)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🇵🇰 Pakistan NTN / STRN / CNIC Tax Info
        </h1>
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.88rem' }}>
          Validate NTN &amp; STRN formats · Decode CNIC province &amp; gender · WHT rates · Tax calendar &amp; glossary — all client-side, no data leaves your browser.
        </p>
      </div>

      <DisclaimerBlock
        type="professional"
        overrideBodyEn="This tool validates formats and provides general tax reference information only. For official verification, visit fbr.gov.pk or consult a tax consultant."
      />

      <div style={{ marginTop: '1.5rem' }}>
        {tabBar}
        {panelMap[activeTab]}
      </div>
    </ToolLayout>
  )
}
