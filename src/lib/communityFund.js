// Single-period synthetic shared-services fund. All arithmetic uses integer minor units.
export const FUND_SAMPLE = {
  period: '2026-11', currency: 'PKR', opening: '5000',
  members: [{ id: 'UNIT-A01', agreed: '3000', waived: '0', received: '3000' }, { id: 'UNIT-A02', agreed: '3000', waived: '0', received: '1500' }, { id: 'UNIT-A03', agreed: '3000', waived: '1000', received: '2000' }, { id: 'UNIT-A04', agreed: '3000', waived: '0', received: '4000' }],
  expenses: [{ id: 'GUARD', approved: '15000', paid: '5000' }, { id: 'CLEANING', approved: '5000', paid: '2000' }],
}
export function fundAmount(value) {
  const s = String(value).trim()
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(s)) throw new Error('Use a nonnegative amount below 100 million, with at most two decimals. No blanks or commas.')
  const [whole, fraction = ''] = s.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0)
export function planCommunityFund(input) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.period) || !['PKR', 'USD', 'GBP', 'AED'].includes(input.currency)) throw new Error('Choose a valid month and supported currency label.')
  if (!Array.isArray(input.members) || !input.members.length || input.members.length > 50 || !Array.isArray(input.expenses) || !input.expenses.length || input.expenses.length > 20) throw new Error('Use 1–50 member rows and 1–20 expense rows.')
  const validateIds = rows => {
    const ids = new Set()
    for (const r of rows) {
      if (!/^[A-Z0-9-]{1,30}$/.test(r.id) || ids.has(r.id)) throw new Error('Use unique synthetic references with uppercase letters, digits or hyphens.')
      ids.add(r.id)
    }
  }
  validateIds(input.members); validateIds(input.expenses)
  const members = input.members.map(r => {
    const agreed = fundAmount(r.agreed), waived = fundAmount(r.waived), received = fundAmount(r.received)
    if (waived > agreed) throw new Error(`${r.id}: an agreed reduction cannot exceed the contribution.`)
    const due = agreed - waived, allocated = Math.min(received, due), outstanding = due - allocated, credit = Math.max(0, received - due)
    return { id: r.id, agreed, waived, received, due, allocated, outstanding, credit, status: due === 0 ? 'No amount due' : outstanding === 0 ? 'Current contribution covered' : allocated ? 'Partly received' : 'Not received' }
  })
  const expenses = input.expenses.map(r => {
    const approved = fundAmount(r.approved), paid = fundAmount(r.paid)
    if (paid > approved) throw new Error(`${r.id}: recorded payment exceeds the approved expense. Reconcile or amend the approved amount first.`)
    return { id: r.id, approved, paid, remaining: approved - paid }
  })
  const opening = fundAmount(input.opening), received = sum(members, 'received'), netDues = sum(members, 'due'), outstanding = sum(members, 'outstanding'), credits = sum(members, 'credit')
  const approved = sum(expenses, 'approved'), paid = sum(expenses, 'paid'), remaining = approved - paid
  const closingCash = opening + received - paid
  const unrestricted = closingCash - credits
  const fundingGap = Math.max(0, remaining - unrestricted)
  const structuralGap = Math.max(0, approved - (opening + netDues))
  return { period: input.period, currency: input.currency, members, expenses, opening, received, netDues, outstanding, credits, approved, paid, remaining, closingCash, unrestricted, fundingGap, structuralGap, reconcile: unrestricted < 0, uncommittedAfterExpenses: Math.max(0, unrestricted - remaining) }
}
const amount = (r, n) => `${r.currency} ${(n / 100).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export function fundSummary(r, language = 'en') {
  const money = n => language === 'ur' ? `\u2066${amount(r, n)}\u2069` : amount(r, n)
  if (language === 'ur') return [
    `فرضی مشترکہ خدمات فنڈ — \u2066${r.period}\u2069`,
    r.reconcile ? 'پہلے حساب کی جانچ کریں: غیر مختص رقم منفی ہے؛ محفوظ اضافی رقم دستیاب ہونے کی تصدیق نہیں۔ اصل نقد، بینک بیلنس یا ادائیگی کی تصدیق نہیں۔' : 'صرف درج شدہ اعداد کا حساب؛ اصل نقد، بینک بیلنس یا ادائیگی کی تصدیق نہیں۔',
    `ابتدائی غیر مختص رقم: ${money(r.opening)}`,
    `رعایت کے بعد طے شدہ موجودہ شراکت: ${money(r.netDues)}`,
    `درج شدہ کل وصولی: ${money(r.received)}`,
    `موجودہ شراکت میں شمار شدہ وصولی: ${money(r.received - r.credits)}`,
    `الگ محفوظ اضافی وصولی: ${money(r.credits)}`,
    `کل منظور شدہ اخراجات: ${money(r.approved)}`,
    `درج شدہ ادا شدہ اخراجات: ${money(r.paid)}`,
    `حساب کے مطابق اختتامی رقم: ${money(r.closingCash)}`,
    `اضافی وصولی محفوظ رکھنے کے بعد غیر مختص رقم: ${money(r.unrestricted)}`,
    `باقی منظور شدہ اخراجات: ${money(r.remaining)}`,
    `ممبرز کی باقی موجودہ شراکت: ${money(r.outstanding)}`,
    `موجودہ فنڈنگ کی کمی: ${money(r.fundingGap)}`,
    `تمام باقی شراکت وصول ہونے کے بعد بھی بجٹ کی کمی: ${money(r.structuralGap)}`,
    'اختتامی رقم = ابتدائی رقم + کل وصولی − ادا شدہ اخراجات۔ غیر مختص رقم = اختتامی رقم − محفوظ اضافی وصولی۔',
    'کسی ممبر کی انفرادی تفصیل شامل نہیں۔ کوئی پیغام نہیں بھیجا گیا۔',
  ].join('\n')
  return [
    `SYNTHETIC shared-services fund — ${r.period}`,
    r.reconcile ? 'RECONCILE RECORDS FIRST: unrestricted cash is negative; protected money may not be available. Cash, bank balances and payments are not independently verified.' : 'Entered figures only; cash, bank balances and payments are not independently verified.',
    `Opening unrestricted cash entered: ${money(r.opening)}`,
    `Net agreed current contributions: ${money(r.netDues)}`,
    `Total receipts entered: ${money(r.received)}`,
    `Receipts allocated to current contributions: ${money(r.received - r.credits)}`,
    `Unallocated excess receipts protected: ${money(r.credits)}`,
    `Total approved expenses entered: ${money(r.approved)}`,
    `Recorded expenses paid: ${money(r.paid)}`,
    `Calculated closing cash: ${money(r.closingCash)}`,
    `Unrestricted cash after protecting excess: ${money(r.unrestricted)}`,
    `Approved expenses still unpaid: ${money(r.remaining)}`,
    `Current contributions outstanding: ${money(r.outstanding)}`,
    `Funding gap now: ${money(r.fundingGap)}`,
    `Budget gap even if all current contributions arrive: ${money(r.structuralGap)}`,
    'Closing cash = opening cash + total receipts − paid expenses. Unrestricted cash = closing cash − protected excess.',
    'No member-level information included. No message sent.',
  ].join('\n')
}
