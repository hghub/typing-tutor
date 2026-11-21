// A payslip draft reconciles entered payroll amounts; it does not determine tax law.
export function salarySlipTotals(input) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.month)) throw new Error('Choose a valid pay month.')
  const cents = (value, label) => {
    const text = String(value).trim()
    if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) throw new Error(`${label}: enter an amount below PKR 100 million with up to two decimals; enter 0 explicitly if none applies.`)
    const [whole, fraction = ''] = text.split('.')
    return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  }
  const earnings = ['basic', 'hra', 'medical', 'conveyance', 'otherAllowance'].map(key => cents(input[key], key))
  const deductions = ['tax', 'eobi', 'customDeduction'].map(key => cents(input[key], key))
  const gross = earnings.reduce((a, b) => a + b, 0)
  const total = deductions.reduce((a, b) => a + b, 0)
  if (total > gross) throw new Error('Deductions exceed gross earnings. Reconcile the payroll amounts before printing.')
  return { grossSalary: gross / 100, monthlyTax: deductions[0] / 100, employeeEobi: deductions[1] / 100, totalDeductions: total / 100, netSalary: (gross - total) / 100 }
}
