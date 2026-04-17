import { useState, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import ToolLayout from '../components/ToolLayout'

// ─── CNIC data ────────────────────────────────────────────────────────────────
// Structure: XXXXX-YYYYYYY-Z
//   Digit 1   : Province code (1=KPK, 2=FATA, 3=Punjab, 4=Sindh, 5=Balochistan, 6=ICT, 7=GB, 8=AJK)
//   Digit 2   : Division within province
//   Digit 3   : District within division
//   Digit 4   : Tehsil (0 = same as district)
//   Digit 5   : Union Council
//   Digits 6-12: Family/serial number (7 digits)
//   Digit 13  : Gender (odd=Male, even=Female)
// Source: cnicinformation.net.pk/nadra-cnic-city-codes (NADRA official division codes)

const PROVINCE_MAP = {
  1: 'Khyber Pakhtunkhwa (KPK)',
  2: 'FATA / Merged Districts',
  3: 'Punjab',
  4: 'Sindh',
  5: 'Balochistan',
  6: 'Islamabad Capital Territory',
  7: 'Gilgit-Baltistan',
  8: 'Azad Jammu & Kashmir (AJK)',
}

// Key = first two digits of CNIC (province digit + division digit)
const DIVISION_MAP = {
  // KPK (1)
  11: { division: 'Bannu' },
  12: { division: 'Dera Ismail Khan' },
  13: { division: 'Hazara' },
  14: { division: 'Kohat' },
  15: { division: 'Malakand' },
  16: { division: 'Mardan' },
  17: { division: 'Peshawar' },

  // FATA / Merged Districts (2) — agency-level codes
  21: { division: 'Khyber Agency' },
  22: { division: 'Kurram Agency' },
  23: { division: 'Orakzai Agency' },
  24: { division: 'Mohmand Agency' },
  25: { division: 'Bajaur Agency' },
  26: { division: 'South Waziristan' },
  27: { division: 'North Waziristan' },

  // Punjab (3)
  31: { division: 'Bahawalpur' },
  32: { division: 'Dera Ghazi Khan' },
  33: { division: 'Faisalabad' },
  34: { division: 'Gujranwala & Gujrat' },
  35: { division: 'Lahore' },
  36: { division: 'Multan & Sahiwal' },
  37: { division: 'Rawalpindi' },
  38: { division: 'Sargodha & Mianwali' },

  // Sindh (4)
  41: { division: 'Hyderabad' },
  42: { division: 'Karachi' },
  43: { division: 'Larkana' },
  44: { division: 'Mirpur Khas' },
  45: { division: 'Sukkur & Shaheed Benazirabad' },

  // Balochistan (5)
  51: { division: 'Kalat & Rakhshan' },
  52: { division: 'Makran' },
  53: { division: 'Nasirabad' },
  54: { division: 'Quetta' },
  55: { division: 'Sibi' },
  56: { division: 'Zhob & Loralai' },

  // ICT (6)
  61: { division: 'Islamabad' },

  // Gilgit-Baltistan (7)
  71: { division: 'Gilgit, Baltistan & Diamer' },

  // AJK (8)
  81: { division: 'Mirpur' },
  82: { division: 'Poonch & Muzaffarabad' },
}

const PROVINCE_COLORS = {
  'Khyber Pakhtunkhwa (KPK)': '#b45309',
  'FATA / Merged Districts': '#dc2626',
  Punjab: '#16a34a',
  Sindh: '#0284c7',
  Balochistan: '#7c3aed',
  'Islamabad Capital Territory': '#0ea5e9',
  'Gilgit-Baltistan': '#c2410c',
  'Azad Jammu & Kashmir (AJK)': '#0d9488',
}

// Key = first two digits (province+division) → { districtDigit: name }
const DISTRICT_MAP = {
  // KPK (1)
  '11': { 1: 'Bannu', 2: 'Bannu Cantonment' },
  '12': { 1: 'DI Khan', 2: 'Tank' },
  '13': { 1: 'Abbottabad', 2: 'Batagram', 3: 'Haripur', 4: 'Kohistan', 5: 'Mansehra' },
  '14': { 1: 'Hangu', 2: 'Karak', 3: 'Kohat' },
  '15': { 0: 'Dir', 1: 'Buner', 2: 'Lower Chitral', 3: 'Lower Dir', 4: 'Malakand', 5: 'Shangla', 6: 'Swat', 7: 'Upper Dir' },
  '16': { 1: 'Mardan', 2: 'Swabi' },
  '17': { 1: 'Charsadda', 2: 'Nowshera', 3: 'Peshawar' },
  // FATA (2)
  '21': { 1: 'Bajaur', 2: 'Khyber', 3: 'Kurram', 4: 'Mohmand', 5: 'North Waziristan', 6: 'Orakzai', 7: 'South Waziristan' },
  '22': { 1: 'Lucky Marwat', 2: 'Bannu', 3: 'DI Khan', 4: 'Kohat', 5: 'Peshawar', 6: 'Tank' },
  // Punjab (3)
  '31': { 1: 'Bahawalnagar', 2: 'Bahawalpur', 3: 'Rahim Yar Khan' },
  '32': { 1: 'DG Khan', 2: 'Layyah', 3: 'Muzaffargarh', 4: 'Rajanpur' },
  '33': { 1: 'Faisalabad', 2: 'Jhang', 3: 'Toba Tek Singh', 4: 'Chiniot' },
  '34': { 1: 'Gujranwala', 2: 'Gujrat', 3: 'Hafizabad', 4: 'Mandi Bahauddin', 5: 'Narowal', 6: 'Sialkot' },
  '35': { 1: 'Kasur', 2: 'Lahore', 3: 'Okara', 4: 'Sheikhupura', 5: 'Nankana Sahib' },
  '36': { 1: 'Khanewal', 2: 'Lodhran', 3: 'Multan', 4: 'Pak Pattan', 5: 'Sahiwal', 6: 'Vehari' },
  '37': { 1: 'Attock', 2: 'Chakwal', 3: 'Jhelum', 4: 'Rawalpindi' },
  '38': { 1: 'Bhakkar', 2: 'Khushab', 3: 'Mianwali', 4: 'Sargodha' },
  // Sindh (4)
  '41': { 1: 'Badin', 2: 'Dadu', 3: 'Hyderabad', 4: 'Thatta', 5: 'Jamshoro', 6: 'TM Khan', 7: 'Tando Allahyar', 8: 'Matiari' },
  '42': { 0: 'Korangi', 1: 'Karachi Central', 2: 'Karachi East', 3: 'Karachi South', 4: 'Karachi West', 5: 'Malir' },
  '43': { 1: 'Jacobabad', 2: 'Larkana', 3: 'Shikarpur', 4: 'Qambar Shahdadkot', 5: 'Kashmor' },
  '44': { 1: 'Mirpur Khas', 2: 'Sanghar', 3: 'Tharparkar', 4: 'Umerkot' },
  '45': { 1: 'Ghotki', 2: 'Khairpur', 3: 'Naushahro Feroze', 4: 'Shaheed Benazirabad', 5: 'Sukkur' },
  // Balochistan (5)
  '51': { 1: 'Awaran', 2: 'Kalat', 3: 'Khuzdar', 4: 'Lasbela', 5: 'Mastung', 6: 'Washuk' },
  '52': { 1: 'Gwadar', 2: 'Kech', 3: 'Panjgur' },
  '53': { 1: 'Jaffarabad', 2: 'Jhal Magsi', 3: 'Kachhi', 4: 'Nasirabad', 5: 'Sohbatpur' },
  '54': { 1: 'Chagai', 2: 'Nushki', 3: 'Pishin', 4: 'Quetta', 5: 'Ziarat' },
  '55': { 1: 'Harnai', 2: 'Kohlu', 3: 'Sibi', 4: 'Ziarat' },
  '56': { 1: 'Barkhan', 2: 'Killa Saifullah', 3: 'Loralai', 4: 'Musakhel', 5: 'Sherani', 6: 'Zhob' },
  // ICT (6)
  '61': { 1: 'Islamabad' },
  // GB (7)
  '71': { 1: 'Diamer', 2: 'Ghanche', 3: 'Ghizer', 4: 'Gilgit', 5: 'Hunza', 6: 'Skardu' },
  // AJK (8)
  '81': { 1: 'Bhimber', 2: 'Kotli', 3: 'Mirpur' },
  '82': { 1: 'Bagh', 2: 'Haveli', 3: 'Muzaffarabad', 4: 'Neelum', 5: 'Poonch', 6: 'Sudhanoti' },
}

// RTO codes for STRN (first 4 digits)
const RTO_MAP = {
  1101: 'Islamabad (RTO-I)', 1102: 'Islamabad (RTO-II)',
  1201: 'Rawalpindi',
  1701: 'Lahore (LTO)', 1702: 'Lahore (RTO-I)', 1703: 'Lahore (RTO-II)',
  1901: 'Karachi (LTO)', 1902: 'Karachi (RTO-I)', 1903: 'Karachi (RTO-II)',
  2101: 'Faisalabad', 2201: 'Multan', 2301: 'Gujranwala', 2401: 'Peshawar',
  2501: 'Quetta', 2601: 'Sukkur', 2701: 'Hyderabad', 2801: 'Abbottabad',
}

// ─── Tax reference data (from FBR / Finance Act 2024-25) ────────────────────

const WHT_ROWS = [
  { type: 'Bank profit / interest',             filer: '15%',      nonFiler: '35%',      ref: 'Sec 151' },
  { type: 'Dividend income',                    filer: '15%',      nonFiler: '30%',      ref: 'Sec 150' },
  { type: 'Property purchase (>5M)',             filer: '3%',       nonFiler: '6%',       ref: 'Sec 236K' },
  { type: 'Property sale / transfer',           filer: '3%',       nonFiler: '6%',       ref: 'Sec 236C' },
  { type: 'Vehicle registration (≤1300cc)',      filer: '1%',       nonFiler: '3%',       ref: 'Sec 231B' },
  { type: 'Vehicle registration (1301–2000cc)', filer: '2%',       nonFiler: '5%',       ref: 'Sec 231B' },
  { type: 'Vehicle registration (>2000cc)',      filer: '3%',       nonFiler: '7%',       ref: 'Sec 231B' },
  { type: 'Cash withdrawal >50,000/day',        filer: '0%',       nonFiler: '0.6%',     ref: 'Sec 231A' },
  { type: 'Imports (commercial)',               filer: '5.5%',     nonFiler: '8%',       ref: 'Sec 148' },
  { type: 'Salary (above taxable limit)',       filer: 'Per slab', nonFiler: 'Per slab', ref: 'Sec 149' },
  { type: 'Services (contract)',                filer: '8%',       nonFiler: '14%',      ref: 'Sec 153(1)(b)' },
  { type: 'Execution of contract',              filer: '7%',       nonFiler: '13%',      ref: 'Sec 153(1)(c)' },
  { type: 'Prize bond / lottery',               filer: '15%',      nonFiler: '25%',      ref: 'Sec 156' },
]

const TAX_DEADLINES = [
  { event: 'Income Tax Return (Salaried/Individual)', date: 'September 30',          note: 'Tax Year ends June 30' },
  { event: 'Wealth Statement',                        date: 'September 30',          note: 'Filed with ITR' },
  { event: 'Monthly Sales Tax Return',                date: '18th of next month',    note: 'e.g., July return → Aug 18' },
  { event: 'Annual Sales Tax Return',                 date: 'July 31',               note: 'Summary for the year' },
  { event: 'Advance Tax — Q1 (Jul–Sep)',              date: 'September 25',          note: '25% of estimated annual tax' },
  { event: 'Advance Tax — Q2 (Oct–Dec)',              date: 'December 25',           note: 'Cumulative 50%' },
  { event: 'Advance Tax — Q3 (Jan–Mar)',              date: 'March 25',              note: 'Cumulative 75%' },
  { event: 'Advance Tax — Q4 (Apr–Jun)',              date: 'June 15',               note: 'Cumulative 100%' },
  { event: 'Employer Annual Withholding Statement',   date: 'March 31',              note: 'Form e-Filing' },
  { event: 'Monthly WHT Statement',                   date: '15th of next month',    note: 'Sec 165 statement' },
  { event: 'ATL Publication',                         date: 'March 1',               note: 'FBR publishes updated ATL' },
  { event: 'STRN Registration (Sales Tax)',           date: 'Before first taxable supply', note: 'Mandatory if turnover ≥5M' },
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
    def: "FBR's published list of individuals and entities who filed their Income Tax Return. Updated annually on March 1. Being on the ATL (a \"filer\") qualifies you for reduced withholding tax rates across dozens of transactions.",
  },
  {
    term: 'WHT — Withholding Tax',
    def: 'Tax deducted at source by the payer before making payment. Pakistan uses WHT extensively: banks deduct it on profit, car dealers on vehicle registration, property registrars on transfers, etc. Rates differ for filers and non-filers.',
  },
  {
    term: 'FBR — Federal Board of Revenue',
    def: "Pakistan's apex tax authority responsible for collecting direct taxes (Income Tax, Corporate Tax) and indirect taxes (Sales Tax, Federal Excise, Customs). Official portal: fbr.gov.pk.",
  },
  {
    term: 'RTO — Regional Tax Office',
    def: "FBR's field offices handling taxpayer registration, audits, and assessments for their geographic jurisdiction. Major RTOs: Lahore, Karachi I/II/III, Islamabad, Faisalabad, Multan, Peshawar, Quetta.",
  },
  {
    term: 'IRIS — Integrated Revenue Information System',
    def: "FBR's online tax portal (iris.fbr.gov.pk) for e-filing returns, registering for NTN/STRN, submitting declarations, paying taxes, and viewing notices.",
  },
  {
    term: 'CNIC — Computerised National Identity Card',
    def: 'Issued by NADRA — 13-digit number (XXXXX-XXXXXXX-X). First 5 digits encode district/area, next 7 are the family sequence, last digit indicates gender. For individuals, NTN is usually the same as CNIC number.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT = '#0ea5e9'

function stripCnic(raw) {
  return raw.replace(/[-\s]/g, '')
}

function formatCnic(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 13)
  if (d.length <= 5) return d
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`
}

function validateCnic(raw) {
  const digits = stripCnic(raw)
  if (!/^\d{13}$/.test(digits)) {
    return { valid: false, error: 'Must be exactly 13 digits (XXXXX-YYYYYYY-Z).' }
  }
  const provinceCode = parseInt(digits[0], 10)
  if (!PROVINCE_MAP[provinceCode]) {
    return { valid: false, error: `Invalid province code "${provinceCode}". First digit must be 1–8.` }
  }
  const prefix = parseInt(digits.slice(0, 2), 10)
  const divKey = digits.slice(0, 2)
  const province = PROVINCE_MAP[provinceCode]
  const divInfo = DIVISION_MAP[prefix]
  const division = divInfo ? divInfo.division : 'Unknown Division'
  const lastDigit = parseInt(digits[12], 10)
  const gender = lastDigit % 2 !== 0 ? 'Male' : 'Female'
  const districtKey = parseInt(digits[2], 10)
  const districtEntry = DISTRICT_MAP[divKey]
  const district = districtEntry && districtEntry[districtKey] != null
    ? districtEntry[districtKey]
    : `District code: ${digits[2]}`
  return {
    valid: true,
    formatted: formatCnic(digits),
    province,
    division,
    district,
    gender,
    prefix,
    provinceCode,
    provinceColor: PROVINCE_COLORS[province] || ACCENT,
    districtDigit: digits[2],
    tehsilDigit: digits[3],
    ucDigit: digits[4],
    divisionConfirmed: !!divInfo,
    divKey,
  }
}

function validateBForm(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 13) return { valid: false, error: 'B-Form must be exactly 13 digits.' }
  const decode = validateCnic(digits)
  return {
    valid: true,
    formatted: formatCnic(digits),
    note: 'Valid B-Form format (13-digit child registration).',
    province: decode.valid ? decode.province : null,
    division: decode.valid ? decode.division : null,
    district: decode.valid ? decode.district : null,
    gender: decode.valid ? decode.gender : null,
    provinceColor: decode.valid ? decode.provinceColor : ACCENT,
  }
}

function validateNtn(raw) {
  const digits = raw.replace(/[-\s]/g, '').replace(/\D/g, '')
  if (digits.length !== 7) return { valid: false, error: 'NTN must be exactly 7 digits (format: XXX-XXXX).' }
  return {
    valid: true,
    formatted: `${digits.slice(0, 3)}-${digits.slice(3)}`,
    note: '7-digit NTN format issued by FBR to individuals, companies, and AOPs.',
    nadraNote: 'Post-2018: NADRA-integrated NTNs are issued automatically based on CNIC. The NTN may match your CNIC serial.',
    atlNote: 'Verify ATL (Active Taxpayer List) status at iris.fbr.gov.pk',
  }
}

function validateStrn(raw) {
  const digits = raw.replace(/[-\s]/g, '').replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 14) {
    return { valid: false, error: 'STRN must be 13 or 14 digits (XXXX-XXXXXXX-XX or XXXX-XXXXXXX-XX-X).' }
  }
  const rtoCode = parseInt(digits.slice(0, 4), 10)
  const rtoCity = RTO_MAP[rtoCode] || `RTO code: ${digits.slice(0, 4)}`
  const ntnPortion = digits.slice(4, 11)
  const branchCode = digits.slice(11, 13)
  const checkDigit = digits.length === 14 ? digits[13] : null
  const formatted = checkDigit
    ? `${digits.slice(0, 4)}-${ntnPortion}-${branchCode}-${checkDigit}`
    : `${digits.slice(0, 4)}-${ntnPortion}-${branchCode}`
  return {
    valid: true,
    formatted,
    rtoCity,
    rtoCode: digits.slice(0, 4),
    ntnPortion,
    branchCode,
    checkDigit,
    note: 'Valid STRN format. The Sales Tax Registration Number is issued by FBR for GST-registered businesses.',
  }
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
        fontSize: '1rem',
        fontWeight: 700,
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, colors, monospace }) {
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: '0.35rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: colors.input,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '0.5rem',
          padding: '0.65rem 0.85rem',
          fontSize: monospace ? '1rem' : '0.9rem',
          fontFamily: monospace ? '"Courier New", monospace' : 'inherit',
          color: colors.text,
          outline: 'none',
          letterSpacing: monospace ? '0.05em' : 'normal',
        }}
        onFocus={e => { e.target.style.borderColor = ACCENT }}
        onBlur={e => { e.target.style.borderColor = colors.inputBorder }}
      />
    </div>
  )
}

// Valid / invalid badge (green ✓ or red ✗)
function Badge({ valid }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '2rem',
      fontSize: '0.72rem',
      fontWeight: 700,
      background: valid ? '#16a34a22' : '#dc262622',
      color: valid ? '#16a34a' : '#dc2626',
      border: `1px solid ${valid ? '#16a34a55' : '#dc262655'}`,
      letterSpacing: '0.04em',
    }}>
      {valid ? '✓ Valid' : '✗ Invalid'}
    </span>
  )
}

// Colored text label badge (for ATL filer/non-filer labels)
function TaxBadge({ text, color = ACCENT }) {
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: valueColor || 'inherit' }}>{value}</span>
    </div>
  )
}

function CopyButton({ text, colors }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        marginTop: '0.75rem',
        padding: '0.45rem 1rem',
        background: copied ? '#16a34a22' : `${ACCENT}18`,
        border: `1px solid ${copied ? '#16a34a55' : `${ACCENT}55`}`,
        borderRadius: '0.5rem',
        color: copied ? '#16a34a' : ACCENT,
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ Copied!' : '⎘ Copy'}
    </button>
  )
}

function InfoBox({ children, color = ACCENT }) {
  return (
    <div style={{
      background: `${color}12`,
      border: `1px solid ${color}44`,
      borderRadius: '0.65rem',
      padding: '0.75rem 1rem',
      fontSize: '0.82rem',
      lineHeight: 1.6,
      color: 'inherit',
      marginTop: '0.5rem',
    }}>
      {children}
    </div>
  )
}

function Disclaimer({ colors }) {
  return (
    <div style={{
      background: colors.surface,
      border: '1px solid #f97316aa',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      fontSize: '0.78rem',
      color: colors.textSecondary,
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
      <span>
        <strong style={{ color: '#f97316' }}>Disclaimer:</strong> This tool decodes publicly known CNIC
        structure codes and provides general tax reference information only. It does not verify with NADRA or FBR.
        Results are for informational purposes only. Always verify official data at nadra.gov.pk or fbr.gov.pk.
      </span>
    </div>
  )
}

function GlossaryItem({ term, def, colors }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${colors.border}` }}>
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

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'cnic',     label: 'CNIC',        icon: '🪪' },
  { id: 'bform',    label: 'B-Form',      icon: '👶' },
  { id: 'ntn',      label: 'NTN',         icon: '🔢' },
  { id: 'strn',     label: 'STRN',        icon: '🧾' },
  { id: 'bulk',     label: 'Bulk',        icon: '📋' },
  { id: 'wht',      label: 'WHT Rates',   icon: '📊' },
  { id: 'calendar', label: 'FBR Calendar', icon: '📅' },
  { id: 'glossary', label: 'Glossary',    icon: '📖' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function PkIdTaxHub() {
  const { colors } = useTheme()

  const [activeTab, setActiveTab] = useState('cnic')

  // CNIC tab
  const [cnicInput, setCnicInput] = useState('')
  const [cnicResult, setCnicResult] = useState(null)

  // B-Form tab
  const [bFormInput, setBFormInput] = useState('')
  const [bFormResult, setBFormResult] = useState(null)

  // NTN tab
  const [ntnInput, setNtnInput] = useState('')
  const [ntnResult, setNtnResult] = useState(null)

  // STRN tab
  const [strnInput, setStrnInput] = useState('')
  const [strnResult, setStrnResult] = useState(null)

  // Bulk tab
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResults, setBulkResults] = useState([])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCnicChange = useCallback((raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 13)
    setCnicInput(formatCnic(digits))
    setCnicResult(null)
  }, [])

  const handleCnicValidate = useCallback(() => {
    setCnicResult(validateCnic(cnicInput))
  }, [cnicInput])

  const handleBFormValidate = useCallback(() => {
    setBFormResult(validateBForm(bFormInput))
  }, [bFormInput])

  const handleNtnValidate = useCallback(() => {
    setNtnResult(validateNtn(ntnInput))
  }, [ntnInput])

  const handleStrnValidate = useCallback(() => {
    setStrnResult(validateStrn(strnInput))
  }, [strnInput])

  const handleBulkValidate = useCallback(() => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean)
    setBulkResults(
      lines.map(line => ({
        raw: line,
        result: validateCnic(line),
      }))
    )
  }, [bulkInput])

  // ── Shared button style ────────────────────────────────────────────────────

  const btnStyle = {
    padding: '0.6rem 1.4rem',
    background: ACCENT,
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  }

  // ── Tab bar ────────────────────────────────────────────────────────────────

  const tabBar = (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      marginBottom: '1.5rem',
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '0.35rem',
      flexWrap: 'wrap',
    }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: '1 1 auto',
            minWidth: '60px',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            transition: 'all 0.15s',
            background: activeTab === tab.id ? ACCENT : 'transparent',
            color: activeTab === tab.id ? '#fff' : colors.textSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )

  // ── CNIC Panel ─────────────────────────────────────────────────────────────

  const cnicPanel = (
    <SectionCard title="CNIC Validator & Decoder" icon="🪪" colors={colors}>
      <InputField
        label="Enter CNIC (13 digits or formatted)"
        value={cnicInput}
        onChange={handleCnicChange}
        placeholder="e.g. 35202-1234567-3"
        colors={colors}
        monospace
      />
      <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: colors.muted }}>
        Digits auto-format as you type: <strong>XXXXX-YYYYYYY-Z</strong>
      </p>
      <button style={btnStyle} onClick={handleCnicValidate}>Validate &amp; Decode</button>

      {cnicResult && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Badge valid={cnicResult.valid} />
            {cnicResult.valid && (
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: '0.08em',
              }}>
                {cnicResult.formatted}
              </span>
            )}
          </div>

          {cnicResult.valid ? (
            <>
              <div style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
              }}>
                <ResultRow
                  label="Province / Territory"
                  value={cnicResult.province}
                  valueColor={cnicResult.provinceColor}
                />
                <ResultRow
                  label="Division"
                  value={`${cnicResult.divKey} — ${cnicResult.divisionConfirmed ? cnicResult.division : `${cnicResult.division} ⚠️`}`}
                  valueColor={colors.text}
                />
                <ResultRow
                  label="District (3rd digit)"
                  value={cnicResult.district}
                  valueColor={ACCENT}
                />
                <ResultRow
                  label="Tehsil (4th digit)"
                  value={cnicResult.tehsilDigit === '0' ? '0 — same as district' : cnicResult.tehsilDigit}
                  valueColor={ACCENT}
                />
                <ResultRow
                  label="Union Council (5th digit)"
                  value={cnicResult.ucDigit}
                  valueColor={ACCENT}
                />
                <ResultRow
                  label="Gender (last digit)"
                  value={`${cnicResult.gender} (${cnicResult.formatted.slice(-1)} is ${parseInt(cnicResult.formatted.slice(-1), 10) % 2 !== 0 ? 'odd' : 'even'})`}
                  valueColor={cnicResult.gender === 'Male' ? '#0284c7' : '#be185d'}
                />
              </div>
              {!cnicResult.divisionConfirmed && (
                <InfoBox color="#f59e0b">
                  ⚠️ Division data for code <strong>{String(cnicResult.prefix).padStart(2, '0')}</strong> is not in our reference list, but the province is confirmed.
                </InfoBox>
              )}
              {/* 5-digit area code visual breakdown: PR DV DI TH UC */}
              <div style={{
                marginTop: '1rem',
                background: `${ACCENT}0d`,
                border: `1px solid ${ACCENT}33`,
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
              }}>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  📍 Address code breakdown
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {[
                    { digit: cnicResult.formatted[0], label: 'PR', title: 'Province' },
                    { digit: cnicResult.formatted[1], label: 'DV', title: 'Division' },
                    { digit: cnicResult.formatted[2], label: 'DI', title: 'District' },
                    { digit: cnicResult.formatted[3], label: 'TH', title: 'Tehsil' },
                    { digit: cnicResult.formatted[4], label: 'UC', title: 'Union Council' },
                  ].map(({ digit, label, title }) => (
                    <div key={label} style={{ textAlign: 'center', flex: '1 1 0' }}>
                      <div style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: ACCENT,
                        lineHeight: 1.2,
                      }}>{digit}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', marginTop: '0.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.1rem', lineHeight: 1.3 }}>{title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <CopyButton text={cnicResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">
              ✗ {cnicResult.error}
            </InfoBox>
          )}
        </div>
      )}
    </SectionCard>
  )

  // ── B-Form Panel ───────────────────────────────────────────────────────────

  const bFormPanel = (
    <SectionCard title="B-Form Validator" icon="👶" colors={colors}>
      <InfoBox color={ACCENT}>
        <strong>What is a B-Form?</strong> A 13-digit Child Registration Certificate issued by NADRA
        to Pakistani children under 18. It follows the same 13-digit format as a CNIC.
      </InfoBox>
      <div style={{ marginTop: '1rem' }}>
        <InputField
          label="Enter B-Form Number (13 digits)"
          value={bFormInput}
          onChange={setBFormInput}
          placeholder="e.g. 3520212345673"
          colors={colors}
          monospace
        />
        <button style={btnStyle} onClick={handleBFormValidate}>Validate B-Form</button>
      </div>

      {bFormResult && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Badge valid={bFormResult.valid} />
            {bFormResult.valid && (
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: '0.08em',
              }}>
                {bFormResult.formatted}
              </span>
            )}
          </div>
          {bFormResult.valid ? (
            <>
              <InfoBox color="#16a34a">{bFormResult.note}</InfoBox>
              {bFormResult.province && (
                <div style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginTop: '0.75rem',
                }}>
                  <ResultRow label="Province / Territory" value={bFormResult.province} valueColor={bFormResult.provinceColor} />
                  <ResultRow label="Division" value={bFormResult.division} valueColor={colors.text} />
                  <ResultRow label="District" value={bFormResult.district} valueColor={ACCENT} />
                  <ResultRow
                    label="Gender (last digit)"
                    value={bFormResult.gender}
                    valueColor={bFormResult.gender === 'Male' ? '#0284c7' : '#be185d'}
                  />
                </div>
              )}
              <CopyButton text={bFormResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">✗ {bFormResult.error}</InfoBox>
          )}
        </div>
      )}
    </SectionCard>
  )

  // ── NTN Panel ──────────────────────────────────────────────────────────────

  const ntnPanel = (
    <SectionCard title="NTN Validator" icon="🔢" colors={colors}>
      <InfoBox color={ACCENT}>
        <strong>What is an NTN?</strong> The National Tax Number is a 7-digit identifier issued by
        the Federal Board of Revenue (FBR) to taxpayers — individuals, companies, and associations
        of persons (AOPs) — for tax filing and compliance purposes.
      </InfoBox>
      <div style={{ marginTop: '1rem' }}>
        <InputField
          label="Enter NTN (7 digits)"
          value={ntnInput}
          onChange={setNtnInput}
          placeholder="e.g. 1234567"
          colors={colors}
          monospace
        />
        <button style={btnStyle} onClick={handleNtnValidate}>Validate NTN</button>
      </div>

      {ntnResult && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Badge valid={ntnResult.valid} />
            {ntnResult.valid && (
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: '0.08em',
              }}>
                {ntnResult.formatted}
              </span>
            )}
          </div>
          {ntnResult.valid ? (
            <>
              <InfoBox color="#16a34a">
                <strong>✓ Valid NTN</strong><br />
                {ntnResult.note}<br /><br />
                <span style={{ color: '#f59e0b' }}>ℹ️ {ntnResult.nadraNote}</span><br />
                <span style={{ marginTop: '0.3rem', display: 'inline-block' }}>🔗 {ntnResult.atlNote}</span>
              </InfoBox>
              <CopyButton text={ntnResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">✗ {ntnResult.error}</InfoBox>
          )}
        </div>
      )}

      {/* NTN range reference */}
      <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { range: '0000001 – 1999999', type: 'Individual (Salaried / Self-employed)', color: '#22c55e' },
          { range: '2000000 – 3999999', type: 'Association of Persons (AOP / Firm)', color: '#f59e0b' },
          { range: '4000000 – 6999999', type: 'Company / Corporate Entity', color: '#a78bfa' },
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

  // ── STRN Panel ─────────────────────────────────────────────────────────────

  const strnPanel = (
    <SectionCard title="STRN Validator" icon="🧾" colors={colors}>
      <InfoBox color={ACCENT}>
        <strong>What is an STRN?</strong> The Sales Tax Registration Number is issued by FBR to
        businesses registered under the Sales Tax Act. It is used for GST invoicing and returns.
        Format: <strong>XXXX-XXXXXXX-XX</strong> (13–14 digits). The first 4 digits encode the RTO.
      </InfoBox>
      <div style={{ marginTop: '1rem' }}>
        <InputField
          label="Enter STRN"
          value={strnInput}
          onChange={setStrnInput}
          placeholder="e.g. 0012345678901"
          colors={colors}
          monospace
        />
        <button style={btnStyle} onClick={handleStrnValidate}>Validate STRN</button>
      </div>

      {strnResult && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Badge valid={strnResult.valid} />
            {strnResult.valid && (
              <span style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: '0.08em',
              }}>
                {strnResult.formatted}
              </span>
            )}
          </div>
          {strnResult.valid ? (
            <>
              <InfoBox color="#16a34a">{strnResult.note}</InfoBox>
              <div style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                marginTop: '0.75rem',
              }}>
                <ResultRow label="RTO Office" value={strnResult.rtoCity} valueColor={ACCENT} />
                <ResultRow label="RTO Code (digits 1–4)" value={strnResult.rtoCode} valueColor={colors.text} />
                <ResultRow label="NTN Portion (digits 5–11)" value={strnResult.ntnPortion} valueColor={colors.text} />
                <ResultRow label="Branch Code (digits 12–13)" value={strnResult.branchCode} valueColor={colors.text} />
                {strnResult.checkDigit && (
                  <ResultRow label="Check Digit (14th)" value={strnResult.checkDigit} valueColor={colors.text} />
                )}
              </div>
              <CopyButton text={strnResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">✗ {strnResult.error}</InfoBox>
          )}
        </div>
      )}

      {/* Sales Tax vs Income Tax comparison */}
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

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: '0.65rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>⚠️ Registration Threshold:</strong> Businesses with annual taxable turnover
        of <strong style={{ color: '#f59e0b' }}>PKR 5 million or more</strong> must register for Sales Tax. Retailers and
        service providers in FBR's "Tier-1" category are also required to register.
      </div>
    </SectionCard>
  )

  // ── Bulk Panel ─────────────────────────────────────────────────────────────

  const bulkPanel = (
    <SectionCard title="Bulk CNIC Validator" icon="📋" colors={colors}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: colors.textSecondary }}>
        Paste multiple CNICs — one per line. Formatted or raw digits both accepted.
      </p>
      <textarea
        value={bulkInput}
        onChange={e => setBulkInput(e.target.value)}
        placeholder={'35202-1234567-3\n42101-9876543-1\n12345-6789012-4'}
        rows={6}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: colors.input,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '0.5rem',
          padding: '0.65rem 0.85rem',
          fontSize: '0.88rem',
          fontFamily: '"Courier New", monospace',
          color: colors.text,
          outline: 'none',
          resize: 'vertical',
          marginBottom: '0.85rem',
          letterSpacing: '0.04em',
        }}
        onFocus={e => { e.target.style.borderColor = ACCENT }}
        onBlur={e => { e.target.style.borderColor = colors.inputBorder }}
      />
      <button style={btnStyle} onClick={handleBulkValidate}>Validate All</button>

      {bulkResults.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: colors.textSecondary }}>
            {bulkResults.filter(r => r.result.valid).length} valid / {bulkResults.length} total
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bulkResults.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: colors.cardBg,
                  border: `1px solid ${item.result.valid ? '#16a34a33' : '#dc262633'}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  flexWrap: 'wrap',
                }}
              >
                <Badge valid={item.result.valid} />
                <span style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9rem',
                  color: item.result.valid ? ACCENT : colors.textSecondary,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  {item.result.valid ? item.result.formatted : item.raw}
                </span>
                {item.result.valid ? (
                  <span style={{ fontSize: '0.78rem', color: colors.muted, marginLeft: 'auto' }}>
                    {item.result.province} · {item.result.gender}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', marginLeft: 'auto' }}>
                    {item.result.error}
                  </span>
                )}
              </div>
            ))}
          </div>

          {bulkResults.some(r => r.result.valid) && (
            <CopyButton
              text={bulkResults.filter(r => r.result.valid).map(r => r.result.formatted).join('\n')}
              colors={colors}
            />
          )}
        </div>
      )}
    </SectionCard>
  )

  // ── WHT Rates Panel (with ATL / Filer intro) ───────────────────────────────

  const whtPanel = (
    <SectionCard title="ATL / Filer Benefits & WHT Rates" icon="📊" colors={colors}>
      {/* ATL info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
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

      {/* Filer vs Non-Filer summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
            <TaxBadge text={item.label} color={item.color} />
            <p style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.8rem', color: colors.textSecondary }}>{item.desc}</p>
            <p style={{ margin: 0, fontWeight: 700, color: item.color, fontSize: '0.9rem' }}>{item.rate}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '0.65rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>🔗 Official ATL Check:</strong>{' '}
        <span style={{ color: ACCENT, fontWeight: 600 }}>fbr.gov.pk/ird/atlsearch</span>
        {' '}— Enter CNIC or NTN to check filer status. Also reachable via IRIS portal under "Taxpayer Profile".
      </div>

      {/* WHT rates table */}
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: colors.text }}>
        Withholding Tax Reference Table
      </h3>
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
              <tr key={row.type} style={{ background: i % 2 === 0 ? 'transparent' : colors.surface }}>
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

  // ── Calendar Panel ─────────────────────────────────────────────────────────

  const calendarPanel = (
    <SectionCard title="Pakistan Tax Calendar — Key Deadlines" icon="📅" colors={colors}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: colors.textSecondary, lineHeight: 1.6 }}>
        Pakistan's tax year runs from <strong style={{ color: colors.text }}>1 July to 30 June</strong>.
        All deadlines are fixed unless FBR issues an extension order (common for ITR — check fbr.gov.pk for extensions).
      </p>

      <div style={{ display: 'grid', gap: '0.55rem' }}>
        {TAX_DEADLINES.map((item, i) => {
          const isAdvance = item.event.startsWith('Advance Tax')
          const isMonthly = item.event.includes('Monthly')
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

  // ── Glossary Panel ─────────────────────────────────────────────────────────

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

  // ── Province reference table (shown on CNIC/B-Form tabs via tab content) ───

  const provinceTable = (
    <SectionCard title="Province / Division Code Reference" icon="🗺️" colors={colors}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '0.65rem',
      }}>
        {[
          { range: '10–19', province: 'Punjab',           color: PROVINCE_COLORS['Punjab'],                          divisions: 'Lahore, Gujranwala, Rawalpindi, Sargodha, Faisalabad, Multan, Bahawalpur, Sahiwal, DG Khan' },
          { range: '20–29', province: 'Sindh',            color: PROVINCE_COLORS['Sindh'],                           divisions: 'Karachi, Hyderabad, Sukkur, Larkana, Mirpur Khas, Shaheed Benazirabad' },
          { range: '30–39', province: 'KPK',              color: PROVINCE_COLORS['Khyber Pakhtunkhwa (KPK)'],        divisions: 'Peshawar, Mardan, Kohat, Malakand, Hazara, Bannu, DI Khan' },
          { range: '40–49', province: 'Balochistan',      color: PROVINCE_COLORS['Balochistan'],                     divisions: 'Quetta, Kalat, Makran, Khuzdar, Nasirabad, Sibi, Zhob' },
          { range: '50–59', province: 'Islamabad (ICT)',  color: PROVINCE_COLORS['Islamabad Capital Territory'],     divisions: 'Federal Capital Territory' },
          { range: '60–69', province: 'FATA / Merged',    color: PROVINCE_COLORS['FATA / Merged Districts'],         divisions: 'Merged Tribal Districts' },
          { range: '70–79', province: 'AJK',              color: PROVINCE_COLORS['Azad Jammu & Kashmir (AJK)'],      divisions: 'Muzaffarabad, Mirpur, Poonch' },
          { range: '80–89', province: 'Gilgit-Baltistan', color: PROVINCE_COLORS['Gilgit-Baltistan'],                divisions: 'Gilgit, Skardu, Diamer, Ghanche, Astore, Hunza-Nagar' },
        ].map(row => (
          <div key={row.range} style={{
            background: `${row.color}11`,
            border: `1px solid ${row.color}44`,
            borderRadius: '0.65rem',
            padding: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: row.color, letterSpacing: '0.05em' }}>
                {row.range}
              </span>
            </div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: 700, color: row.color }}>{row.province}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: colors.muted, lineHeight: 1.5 }}>{row.divisions}</p>
          </div>
        ))}
      </div>
      <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: colors.muted }}>
        <strong>Gender rule:</strong> Last digit odd (1, 3, 5, 7, 9) = <strong style={{ color: '#0284c7' }}>Male</strong> · Last digit even (0, 2, 4, 6, 8) = <strong style={{ color: '#be185d' }}>Female</strong>
      </p>
    </SectionCard>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ToolLayout toolId="pk-id-tax-hub">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          margin: '0 0 0.4rem',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🇵🇰</span> Pakistan ID &amp; Tax Hub
        </h1>
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textSecondary }}>
          CNIC decoder · NTN/STRN validator · WHT rates · FBR calendar — all client-side, no data leaves your browser.
        </p>
      </div>

      <Disclaimer colors={colors} />

      {tabBar}

      {activeTab === 'cnic' && (
        <>
          {cnicPanel}
          {provinceTable}
        </>
      )}
      {activeTab === 'bform' && bFormPanel}
      {activeTab === 'ntn' && ntnPanel}
      {activeTab === 'strn' && strnPanel}
      {activeTab === 'bulk' && bulkPanel}
      {activeTab === 'wht' && whtPanel}
      {activeTab === 'calendar' && calendarPanel}
      {activeTab === 'glossary' && glossaryPanel}
    </ToolLayout>
  )
}
