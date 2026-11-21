import { useState, useRef, useId } from 'react'
import ToolLayout from '../components/ToolLayout'
import PakistanFriendlyGuide from '../components/PakistanFriendlyGuide'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { salarySlipTotals } from '../lib/salarySlip'

const FONT = 'system-ui,-apple-system,sans-serif'
const PRINT_FONT = 'Arial,Helvetica,sans-serif'

const fmt = n => n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Field({ label, value, onChange, prefix, suffix, type = 'number', placeholder, isDark, colors }) {
  const id = useId()
  return (
    <div style={{ display: 'flex', minWidth: 0, flexDirection: 'column', gap: '0.3rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.78rem', fontWeight: 600, color: colors.muted }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: '0.65rem', color: colors.muted, fontSize: '0.82rem', pointerEvents: 'none' }}>{prefix}</span>}
        <input id={id} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.01' : undefined} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: `0.5rem ${suffix ? '2.5rem' : '0.7rem'} 0.5rem ${prefix ? '2.25rem' : '0.7rem'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${colors.border}`, borderRadius: '0.55rem',
            color: colors.text, fontSize: '1rem', fontFamily: FONT, minWidth: 0,
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
  const [enteredTax, setEnteredTax] = useState('')
  const [enteredEobi, setEnteredEobi] = useState('')
  const [printError, setPrintError] = useState('')
  const [customDeduction, setCustomDeduction] = useState(0)
  const [customDeductionLabel, setCustomDeductionLabel] = useState('Other Deduction')

  let report, error
  try { report = salarySlipTotals({ month, basic, hra, medical, conveyance, otherAllowance, tax: enteredTax, eobi: enteredEobi, customDeduction }) } catch (e) { error = e.message }
  const { grossSalary, monthlyTax, employeeEobi, totalDeductions, netSalary } = report || {}
  const monthLabel = error ? '' : new Date(month + '-01T12:00:00Z').toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const handlePrint = () => {
    if (error || !printRef.current) return
    setPrintError('')
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) { setPrintError('Allow the print window and try again.'); return }
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Salary slip draft</title>
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
    win.document.title = `Salary slip draft — ${empName || 'Employee'} — ${monthLabel}`
    win.document.close()
    setTimeout(() => { win.focus(); win.print(); win.close() }, 300)
  }

  const accentColor = '#10b981'

  return (
    <ToolLayout toolId="salary-slip">
      <div style={{ fontFamily: FONT, maxWidth: 820, minWidth: 0, overflowWrap: 'anywhere', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.3rem',
            background: `linear-gradient(to right, ${accentColor}, #34d399)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>🧾 Salary Slip Generator</h1>
          <p style={{ color: colors.muted, margin: 0, fontSize: '0.875rem' }}>
            Prepare a printable draft using payroll-confirmed earnings and deductions.
          </p>
        </div>
        <PakistanFriendlyGuide toolId="salary-slip" variant="light" />
        <p style={{ color: colors.text }}>Enter the actual income-tax and employee EOBI deductions confirmed for this pay period, including explicit zero where applicable. This generator does not calculate statutory liability or verify payment. Use the <a href="/tools/tax-calculator">year-specific salary tax calculator</a> separately for a base estimate; allowances, exemptions and payroll adjustments need employer review.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

          {/* Left: input form */}
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Company Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Company Name" value={company} onChange={setCompany} type="text" placeholder="Acme Corp" isDark={isDark} colors={colors} />
              <Field label="Company Address (optional)" value={companyAddress} onChange={setCompanyAddress} type="text" placeholder="123 Main St, Karachi" isDark={isDark} colors={colors} />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Employee Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Employee Name" value={empName} onChange={setEmpName} type="text" placeholder="Ali Ahmed" isDark={isDark} colors={colors} />
              <Field label="Designation" value={designation} onChange={setDesignation} type="text" placeholder="Software Engineer" isDark={isDark} colors={colors} />
              <Field label="Employee ID" value={empId} onChange={setEmpId} type="text" placeholder="EMP-001" isDark={isDark} colors={colors} />
              <Field label="Pay Month" value={month} onChange={setMonth} type="month" isDark={isDark} colors={colors} />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Salary Components (PKR)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Field label="Basic Salary" value={basic} onChange={setBasic} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="HRA" value={hra} onChange={setHra} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="Medical Allowance" value={medical} onChange={setMedical} prefix="Rs" isDark={isDark} colors={colors} />
              <Field label="Conveyance" value={conveyance} onChange={setConveyance} prefix="Rs" isDark={isDark} colors={colors} />
              <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '0.5rem', alignItems: 'end' }}>
                <Field label="Other Allowance Label" value={otherAllowanceLabel} onChange={setOtherAllowanceLabel} type="text" isDark={isDark} colors={colors} />
                <Field label="Amount" value={otherAllowance} onChange={setOtherAllowance} prefix="Rs" isDark={isDark} colors={colors} />
              </div>
            </div>

            <h2 style={{ fontSize: '1rem' }}>Payroll-confirmed deductions</h2>
            <Field label="Income tax withheld (required; 0 if none)" value={enteredTax} onChange={setEnteredTax} prefix="Rs" isDark={isDark} colors={colors} />
            <Field label="Employee EOBI deduction (required; 0 if none)" value={enteredEobi} onChange={setEnteredEobi} prefix="Rs" isDark={isDark} colors={colors} />
            <p>Other confirmed employee deductions can be totalled below with a clear label. Employer-only costs must not be deducted from employee pay.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '0.5rem' }}>
              <Field label="Deduction Label" value={customDeductionLabel} onChange={setCustomDeductionLabel} type="text" isDark={isDark} colors={colors} />
              <Field label="Amount" value={customDeduction} onChange={setCustomDeduction} prefix="Rs" isDark={isDark} colors={colors} />
            </div>
          </div>

          {/* Right: live preview summary */}
          {error ? <p role="alert" style={{ color: colors.text }}>{error}</p> : <div>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Live Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Gross Salary', value: grossSalary, color: '#10b981' },
                  { label: 'Income tax entered', value: monthlyTax, color: '#f97316' },
                  { label: 'Employee EOBI entered', value: employeeEobi, color: '#f97316' },
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

          </div>}
        </div>
        {printError && <p role="alert">{printError}</p>}

        {/* Printable slip */}
        {!error && <div style={{ background: colors.surface, border: `2px solid ${colors.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.25rem' }}>
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
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>SALARY SLIP DRAFT</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: '1rem', marginBottom: '0.875rem' }}>
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
                    <Row label="Income tax entered" value={monthlyTax} />
                    <Row label="Employee EOBI entered" value={employeeEobi} />
                    {Number(customDeduction) > 0 && <Row label={customDeductionLabel} value={Number(customDeduction)} />}
                    <Row label="Total Deductions" value={totalDeductions} bold color="#b91c1c" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net pay */}
            <div style={{ background: '#f0fdf4', border: '2px solid #15803d', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>NET PAY — DRAFT</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d' }}>PKR {fmt(netSalary)}</span>
            </div>

            <div style={{ marginTop: '0.875rem', fontSize: '0.7rem', color: '#888', textAlign: 'center' }}>
              Draft based on entered amounts. Tax and employee EOBI are payroll-supplied, not calculated here. No proof of employment, payment or statutory compliance; employer review and authorization required.
            </div>
          </div>
        </div>}

        <DisclaimerBlock type="professional" overrideBodyEn="This page reconciles entered earnings and deductions only. Confirm applicable tax, EOBI, provincial social security and any other payroll obligations with the responsible payroll professional. It does not calculate liability or certify a payslip. Inputs stay in page memory and are lost on reload; the print action opens a local browser window." />
      </div>
    </ToolLayout>
  )
}
