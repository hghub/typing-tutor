import { useState, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

const FONT = 'system-ui,-apple-system,sans-serif'
const PRINT_FONT = 'Arial,Helvetica,sans-serif'

// EOBI rates (2024-25)
const EOBI_EMPLOYEE_RATE = 0.01   // 1%
const EOBI_EMPLOYER_RATE = 0.05   // 5%
const EOBI_MAX_WAGES     = 30000  // max wage for EOBI calc

// Pakistan income tax slabs 2024-25 (salaried)
const SLABS = [
  { max: 600000,   rate: 0,     base: 0 },
  { max: 1200000,  rate: 0.05,  base: 0,      min: 600000 },
  { max: 2400000,  rate: 0.15,  base: 30000,  min: 1200000 },
  { max: 3600000,  rate: 0.25,  base: 210000, min: 2400000 },
  { max: 6000000,  rate: 0.30,  base: 510000, min: 3600000 },
  { max: Infinity, rate: 0.35,  base: 1230000,min: 6000000 },
]

function annualTax(annualIncome) {
  const slab = SLABS.find(s => annualIncome <= s.max)
  if (!slab || slab.rate === 0) return 0
  return slab.base + (annualIncome - slab.min) * slab.rate
}

function calcEOBI(basicSalary) {
  const base = Math.min(basicSalary, EOBI_MAX_WAGES)
  return { employee: Math.round(base * EOBI_EMPLOYEE_RATE), employer: Math.round(base * EOBI_EMPLOYER_RATE) }
}

const fmt = n => Math.round(n).toLocaleString('en-PK')

function Field({ label, value, onChange, prefix, suffix, type = 'number', placeholder, isDark, colors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: colors.muted }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: '0.65rem', color: colors.muted, fontSize: '0.82rem', pointerEvents: 'none' }}>{prefix}</span>}
        <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: `0.5rem ${suffix ? '2.5rem' : '0.7rem'} 0.5rem ${prefix ? '2.25rem' : '0.7rem'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${colors.border}`, borderRadius: '0.55rem',
            color: colors.text, fontSize: '0.9rem', fontFamily: FONT, outline: 'none',
          }} />
        {suffix && <span style={{ position: 'absolute', right: '0.65rem', color: colors.muted, fontSize: '0.8rem', pointerEvents: 'none' }}>{suffix}</span>}
      </div>
    </div>
  )
}

function Row({ label, value, bold, color, small }) {
  return (
    <tr>
      <td style={{ padding: '0.45rem 0.75rem', fontSize: small ? '0.78rem' : '0.85rem', color: bold ? '#111' : '#333', fontWeight: bold ? 700 : 400 }}>{label}</td>
      <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontSize: small ? '0.78rem' : '0.85rem', color: color || (bold ? '#111' : '#444'), fontWeight: bold ? 700 : 400 }}>
        PKR {fmt(value)}
      </td>
    </tr>
  )
}

export default function SalarySlip() {
  const { isDark, colors } = useTheme()
  const printRef = useRef()

  // Company info
  const [company, setCompany] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  // Employee info
  const [empName, setEmpName] = useState('')
  const [designation, setDesignation] = useState('')
  const [empId, setEmpId] = useState('')
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  // Salary components
  const [basic, setBasic] = useState(50000)
  const [hra, setHra] = useState(10000)
  const [medical, setMedical] = useState(5000)
  const [conveyance, setConveyance] = useState(5000)
  const [otherAllowance, setOtherAllowance] = useState(0)
  const [otherAllowanceLabel, setOtherAllowanceLabel] = useState('Other Allowance')
  // Deductions
  const [customDeduction, setCustomDeduction] = useState(0)
  const [customDeductionLabel, setCustomDeductionLabel] = useState('Other Deduction')

  const grossSalary = [basic, hra, medical, conveyance, otherAllowance].reduce((a, b) => a + Number(b), 0)
  const annualGross = grossSalary * 12
  const monthlyTax = Math.round(annualTax(annualGross) / 12)
  const eobi = calcEOBI(Number(basic))
  const totalDeductions = monthlyTax + eobi.employee + Number(customDeduction)
  const netSalary = grossSalary - totalDeductions

  const monthLabel = new Date(month + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Salary Slip — ${empName || 'Employee'} — ${monthLabel}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${PRINT_FONT}; color: #111; padding: 30px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #ddd; padding: 6px 10px; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 700; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>${content}</body></html>
    `)
    win.document.close()
    setTimeout(() => { win.focus(); win.print(); win.close() }, 300)
  }

  const accentColor = '#10b981'

  return (
    <ToolLayout toolId="salary-slip">
      <div style={{ fontFamily: FONT, maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.3rem',
            background: `linear-gradient(to right, ${accentColor}, #34d399)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>🧾 Salary Slip Generator</h1>
          <p style={{ color: colors.muted, margin: 0, fontSize: '0.875rem' }}>
            Generate a printable salary slip with EOBI &amp; income tax auto-calculated
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

          {/* Left: input form */}
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Company Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Company Name" value={company} onChange={setCompany} type="text" placeholder="Acme Corp" isDark={isDark} colors={colors} />
              <Field label="Company Address (optional)" value={companyAddress} onChange={setCompanyAddress} type="text" placeholder="123 Main St, Karachi" isDark={isDark} colors={colors} />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Employee Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Employee Name" value={empName} onChange={setEmpName} type="text" placeholder="Ali Ahmed" isDark={isDark} colors={colors} />
              <Field label="Designation" value={designation} onChange={setDesignation} type="text" placeholder="Software Engineer" isDark={isDark} colors={colors} />
              <Field label="Employee ID" value={empId} onChange={setEmpId} type="text" placeholder="EMP-001" isDark={isDark} colors={colors} />
              <Field label="Pay Month" value={month} onChange={setMonth} type="month" isDark={isDark} colors={colors} />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Salary Components (PKR)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Basic Salary" value={basic} onChange={setBasic} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="HRA" value={hra} onChange={setHra} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="Medical Allowance" value={medical} onChange={setMedical} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="Conveyance" value={conveyance} onChange={setConveyance} prefix="Rs" isDark={isDark} colors={colors} />
              <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', alignItems: 'end' }}>
                <Field label="Other Allowance Label" value={otherAllowanceLabel} onChange={setOtherAllowanceLabel} type="text" isDark={isDark} colors={colors} />
                <Field label="Amount" value={otherAllowance} onChange={setOtherAllowance} prefix="Rs" isDark={isDark} colors={colors} />
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Extra Deductions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <Field label="Deduction Label" value={customDeductionLabel} onChange={setCustomDeductionLabel} type="text" isDark={isDark} colors={colors} />
              <Field label="Amount" value={customDeduction} onChange={setCustomDeduction} prefix="Rs" isDark={isDark} colors={colors} />
            </div>
          </div>

          {/* Right: live preview summary */}
          <div>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Live Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Gross Salary', value: grossSalary, color: '#10b981' },
                  { label: 'Income Tax (est.)', value: monthlyTax, color: '#f97316' },
                  { label: 'EOBI (employee 1%)', value: eobi.employee, color: '#f97316' },
                  ...(Number(customDeduction) > 0 ? [{ label: customDeductionLabel, value: Number(customDeduction), color: '#f97316' }] : []),
                  { label: 'Total Deductions', value: totalDeductions, color: '#ef4444' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: '0.85rem', color: colors.text }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.color }}>Rs {fmt(item.value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: `${accentColor}15`, borderRadius: '0.6rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: accentColor }}>Net Salary</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: accentColor }}>Rs {fmt(netSalary)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.1)', border: `1px solid rgba(251,191,36,0.3)`, borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.78rem', color: isDark ? '#fcd34d' : '#92400e' }}>
              <strong>EOBI Employer Cost:</strong> Rs {fmt(eobi.employer)}/month (not deducted from employee — shown for employer reference only)
            </div>
          </div>
        </div>

        {/* Printable slip */}
        <div style={{ background: colors.surface, border: `2px solid ${colors.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Printable Slip Preview</div>
            <button onClick={handlePrint} style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
              background: accentColor, color: '#fff', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600,
            }}>🖨️ Print / Save PDF</button>
          </div>

          {/* The printable content */}
          <div ref={printRef} style={{ background: '#fff', color: '#111', fontFamily: PRINT_FONT, padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            {/* Slip header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111', paddingBottom: '0.75rem', marginBottom: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{company || 'Company Name'}</div>
                {companyAddress && <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.15rem' }}>{companyAddress}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>SALARY SLIP</div>
                <div style={{ fontSize: '0.82rem', color: '#555' }}>{monthLabel}</div>
              </div>
            </div>

            {/* Employee details */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.25rem 0', fontWeight: 600, width: '25%', color: '#555' }}>Employee Name</td>
                  <td style={{ padding: '0.25rem 0', width: '25%' }}>{empName || '—'}</td>
                  <td style={{ padding: '0.25rem 0', fontWeight: 600, width: '25%', color: '#555' }}>Designation</td>
                  <td style={{ padding: '0.25rem 0' }}>{designation || '—'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0', fontWeight: 600, color: '#555' }}>Employee ID</td>
                  <td style={{ padding: '0.25rem 0' }}>{empId || '—'}</td>
                  <td style={{ padding: '0.25rem 0', fontWeight: 600, color: '#555' }}>Pay Period</td>
                  <td style={{ padding: '0.25rem 0' }}>{monthLabel}</td>
                </tr>
              </tbody>
            </table>

            {/* Earnings + Deductions side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.875rem' }}>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '0.4rem 0.75rem', textAlign: 'left', border: '1px solid #ddd', fontWeight: 700 }}>Earnings</th>
                      <th style={{ padding: '0.4rem 0.75rem', textAlign: 'right', border: '1px solid #ddd', fontWeight: 700 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Basic Salary" value={Number(basic)} />
                    <Row label="House Rent Allowance" value={Number(hra)} />
                    <Row label="Medical Allowance" value={Number(medical)} />
                    <Row label="Conveyance" value={Number(conveyance)} />
                    {Number(otherAllowance) > 0 && <Row label={otherAllowanceLabel} value={Number(otherAllowance)} />}
                    <Row label="Gross Salary" value={grossSalary} bold color="#15803d" />
                  </tbody>
                </table>
              </div>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '0.4rem 0.75rem', textAlign: 'left', border: '1px solid #ddd', fontWeight: 700 }}>Deductions</th>
                      <th style={{ padding: '0.4rem 0.75rem', textAlign: 'right', border: '1px solid #ddd', fontWeight: 700 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Income Tax (FBR est.)" value={monthlyTax} />
                    <Row label="EOBI (Employee 1%)" value={eobi.employee} />
                    {Number(customDeduction) > 0 && <Row label={customDeductionLabel} value={Number(customDeduction)} />}
                    <Row label="Total Deductions" value={totalDeductions} bold color="#b91c1c" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net pay */}
            <div style={{ background: '#f0fdf4', border: '2px solid #15803d', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>NET SALARY PAYABLE</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d' }}>PKR {fmt(netSalary)}</span>
            </div>

            <div style={{ marginTop: '0.875rem', fontSize: '0.7rem', color: '#888', textAlign: 'center' }}>
              This is a computer-generated salary slip. Income tax is estimated under Finance Act 2024-25. EOBI calculated at 1% employee contribution (max wage: PKR 30,000).
            </div>
          </div>
        </div>

        <DisclaimerBlock type="professional" overrideBodyEn="Income tax is estimated using Finance Act 2024-25 slab rates. Actual tax may vary based on exemptions, investments, and employer policies. Consult your accounts department or a tax professional for exact figures." />
      </div>
    </ToolLayout>
  )
}
