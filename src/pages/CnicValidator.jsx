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
// Source: NADRA CNIC structure per atmateen.com, incpak.com, allfactsaddict.blogspot.com

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
  // KPK (1) — 7 divisions
  11: { division: 'Peshawar' },
  12: { division: 'Mardan' },
  13: { division: 'Kohat' },
  14: { division: 'Malakand' },
  15: { division: 'Hazara' },
  16: { division: 'Bannu' },
  17: { division: 'Dera Ismail Khan' },

  // FATA / Merged Districts (2)
  21: { division: 'Khyber Agency' },
  22: { division: 'Kurram Agency' },
  23: { division: 'Orakzai Agency' },
  24: { division: 'Mohmand Agency' },
  25: { division: 'Bajaur Agency' },
  26: { division: 'South Waziristan' },
  27: { division: 'North Waziristan' },

  // Punjab (3) — 9 divisions (35=Lahore, 32=Gujranwala, 33=Rawalpindi, 34=Faisalabad, 36=Multan confirmed)
  31: { division: 'Sargodha' },
  32: { division: 'Gujranwala' },
  33: { division: 'Rawalpindi' },
  34: { division: 'Faisalabad' },
  35: { division: 'Lahore' },
  36: { division: 'Multan' },
  37: { division: 'Sahiwal' },
  38: { division: 'Bahawalpur' },
  39: { division: 'Dera Ghazi Khan' },

  // Sindh (4) — 6 divisions (42=Karachi, 41=Hyderabad confirmed)
  41: { division: 'Hyderabad' },
  42: { division: 'Karachi' },
  43: { division: 'Sukkur' },
  44: { division: 'Larkana' },
  45: { division: 'Mirpur Khas' },
  46: { division: 'Shaheed Benazirabad' },

  // Balochistan (5) — 7 divisions
  51: { division: 'Quetta' },
  52: { division: 'Kalat' },
  53: { division: 'Makran' },
  54: { division: 'Nasirabad' },
  55: { division: 'Sibi' },
  56: { division: 'Zhob' },
  57: { division: 'Khuzdar' },

  // ICT (6) — single division (61=Islamabad confirmed)
  61: { division: 'Islamabad' },

  // Gilgit-Baltistan (7)
  71: { division: 'Gilgit' },
  72: { division: 'Diamer' },
  73: { division: 'Ghizer' },
  74: { division: 'Baltistan (Skardu)' },
  75: { division: 'Hunza-Nagar' },

  // AJK (8) — 3 divisions
  81: { division: 'Mirpur' },
  82: { division: 'Muzaffarabad' },
  83: { division: 'Poonch' },
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
  const province = PROVINCE_MAP[provinceCode]
  const divInfo = DIVISION_MAP[prefix]
  const division = divInfo ? divInfo.division : 'Unknown Division'
  const lastDigit = parseInt(digits[12], 10)
  const gender = lastDigit % 2 !== 0 ? 'Male' : 'Female'
  return {
    valid: true,
    formatted: formatCnic(digits),
    province,
    division,
    gender,
    prefix,
    provinceCode,
    provinceColor: PROVINCE_COLORS[province] || ACCENT,
    districtDigit: digits[2],
    tehsilDigit: digits[3],
    ucDigit: digits[4],
    divisionConfirmed: !!divInfo,
  }
}

function validateBForm(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 13) return { valid: false, error: 'B-Form must be exactly 13 digits.' }
  return { valid: true, formatted: formatCnic(digits), note: 'Valid B-Form format (13-digit child registration).' }
}

function validateNtn(raw) {
  const digits = raw.replace(/[-\s]/g, '').replace(/\D/g, '')
  if (digits.length !== 7) return { valid: false, error: 'NTN must be exactly 7 digits.' }
  return {
    valid: true,
    formatted: digits,
    note: 'Valid NTN format. The National Tax Number is issued by FBR to individual and corporate taxpayers in Pakistan.',
  }
}

function validateStrn(raw) {
  // STRN format: 13-digit (or with hyphens like 00-00-0000-000-00)
  const digits = raw.replace(/[-\s]/g, '').replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'STRN is typically 10–15 digits. Please verify the format.' }
  }
  return {
    valid: true,
    formatted: digits,
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
      background: `${colors.surface}`,
      border: `1px solid #f97316aa`,
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
        structure codes. It does not verify with NADRA. Results are for informational purposes only.
      </span>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'cnic', label: 'CNIC', icon: '🪪' },
  { id: 'bform', label: 'B-Form', icon: '👶' },
  { id: 'ntn', label: 'NTN', icon: '🏢' },
  { id: 'strn', label: 'STRN', icon: '🧾' },
  { id: 'bulk', label: 'Bulk', icon: '📋' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function CnicValidator() {
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
                  label="Division (2nd digit)"
                  value={cnicResult.divisionConfirmed ? cnicResult.division : `${cnicResult.division} ⚠️`}
                  valueColor={colors.text}
                />
                <ResultRow
                  label="District code (3rd digit)"
                  value={cnicResult.districtDigit}
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
    <SectionCard title="NTN Validator" icon="🏢" colors={colors}>
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
              <InfoBox color="#16a34a">{ntnResult.note}</InfoBox>
              <CopyButton text={ntnResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">✗ {ntnResult.error}</InfoBox>
          )}
        </div>
      )}
    </SectionCard>
  )

  // ── STRN Panel ─────────────────────────────────────────────────────────────

  const strnPanel = (
    <SectionCard title="STRN Validator" icon="🧾" colors={colors}>
      <InfoBox color={ACCENT}>
        <strong>What is an STRN?</strong> The Sales Tax Registration Number is issued by FBR to
        businesses registered under the Sales Tax Act. It is used for GST invoicing and returns.
        Format varies by registration type (10–15 digits).
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
              <CopyButton text={strnResult.formatted} colors={colors} />
            </>
          ) : (
            <InfoBox color="#dc2626">✗ {strnResult.error}</InfoBox>
          )}
        </div>
      )}
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

          {/* Copy all valid CNICs */}
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

  // ── Province reference table ───────────────────────────────────────────────

  const provinceTable = (
    <SectionCard title="Province / Division Code Reference" icon="🗺️" colors={colors}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '0.65rem',
      }}>
        {[
          { range: '10–19', province: 'Punjab', color: PROVINCE_COLORS['Punjab'], divisions: 'Lahore, Gujranwala, Rawalpindi, Sargodha, Faisalabad, Multan, Bahawalpur, Sahiwal, DG Khan' },
          { range: '20–29', province: 'Sindh', color: PROVINCE_COLORS['Sindh'], divisions: 'Karachi, Hyderabad, Sukkur, Larkana, Mirpur Khas, Shaheed Benazirabad' },
          { range: '30–39', province: 'KPK', color: PROVINCE_COLORS['Khyber Pakhtunkhwa (KPK)'], divisions: 'Peshawar, Mardan, Kohat, Malakand, Hazara, Bannu, DI Khan' },
          { range: '40–49', province: 'Balochistan', color: PROVINCE_COLORS['Balochistan'], divisions: 'Quetta, Kalat, Makran, Khuzdar, Nasirabad, Sibi, Zhob' },
          { range: '50–59', province: 'Islamabad (ICT)', color: PROVINCE_COLORS['Islamabad Capital Territory'], divisions: 'Federal Capital Territory' },
          { range: '60–69', province: 'FATA / Merged', color: PROVINCE_COLORS['FATA / Merged Districts'], divisions: 'Merged Tribal Districts' },
          { range: '70–79', province: 'AJK', color: PROVINCE_COLORS['Azad Jammu & Kashmir (AJK)'], divisions: 'Muzaffarabad, Mirpur, Poonch' },
          { range: '80–89', province: 'Gilgit-Baltistan', color: PROVINCE_COLORS['Gilgit-Baltistan'], divisions: 'Gilgit, Skardu, Diamer, Ghanche, Astore, Hunza-Nagar' },
        ].map(row => (
          <div
            key={row.range}
            style={{
              background: `${row.color}11`,
              border: `1px solid ${row.color}44`,
              borderRadius: '0.65rem',
              padding: '0.75rem',
            }}
          >
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
    <ToolLayout toolId="cnic-validator">
      {/* Page heading */}
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
          <span>🪪</span> Pakistan ID Validator
        </h1>
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textSecondary }}>
          Validate and decode CNIC · B-Form · NTN · STRN — all client-side, no data leaves your browser.
        </p>
      </div>

      <Disclaimer colors={colors} />

      {tabBar}

      {activeTab === 'cnic' && cnicPanel}
      {activeTab === 'bform' && bFormPanel}
      {activeTab === 'ntn' && ntnPanel}
      {activeTab === 'strn' && strnPanel}
      {activeTab === 'bulk' && bulkPanel}

      {provinceTable}
    </ToolLayout>
  )
}
