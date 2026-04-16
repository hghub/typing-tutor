import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import SharePanel from '../components/SharePanel'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

const ACCENT = '#10b981'

/* ── CSV Parser ─────────────────────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim()
    })
    return obj
  })
}

/* ── Category Rules ─────────────────────────────────────────────────────── */
const CATEGORY_RULES = [
  { category: 'Food & Dining',    color: '#f97316', icon: '🍽️',  keywords: ['kfc','mcdonalds','pizza','burger','food','restaurant','cafe','dhaba','biryani','sweets','bakery','dine','eat'] },
  { category: 'Groceries',        color: '#22c55e', icon: '🛒',  keywords: ['daraz','store','mart','supermarket','grocery','carrefour','imtiaz','metro','spinzer','hyperstar','naheed'] },
  { category: 'Transport',        color: '#3b82f6', icon: '🚗',  keywords: ['uber','careem','fuel','petrol','cng','parking','toll','suzuki','honda','transport','bykea','indriver'] },
  { category: 'Utilities',        color: '#8b5cf6', icon: '💡',  keywords: ['electric','wapda','sui','gas','water','bill','iesco','lesco','kesc','ptcl','internet','wifi','telecom'] },
  { category: 'Health',           color: '#ef4444', icon: '🏥',  keywords: ['pharmacy','medical','hospital','clinic','doctor','medicine','lab','chemist','aga khan','shaukat'] },
  { category: 'Shopping',         color: '#ec4899', icon: '🛍️', keywords: ['clothes','fashion','shoes','khaadi','gul ahmed','j.','sapphire','nishat','outfitters','alkaram'] },
  { category: 'Entertainment',    color: '#a855f7', icon: '🎬',  keywords: ['netflix','spotify','youtube','cinema','nueplex','atrium','ticket','game','subscription'] },
  { category: 'Education',        color: '#06b6d4', icon: '📚',  keywords: ['school','university','college','tuition','book','stationary','course','fee'] },
  { category: 'Banking & Finance',color: '#eab308', icon: '🏦',  keywords: ['transfer','payment','charge','fee','interest','easypaisa','jazzcash','sadapay','nayapay','atm'] },
  { category: 'Telecom',          color: '#14b8a6', icon: '📱',  keywords: ['jazz','zong','ufone','telenor','recharge','topup','mobile','sms','call'] },
]
const UNCATEGORIZED = { category: 'Other', color: '#94a3b8', icon: '📌' }

function categorize(description) {
  const lower = (description || '').toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule
  }
  return UNCATEGORIZED
}

/* ── Amount parser ──────────────────────────────────────────────────────── */
function parseAmount(val) {
  if (!val) return 0
  const n = parseFloat(String(val).replace(/,/g, ''))
  return isNaN(n) ? 0 : Math.abs(n)
}

/* ── Sample Data ────────────────────────────────────────────────────────── */
const SAMPLE_TRANSACTIONS = [
  { date: '2024-01-03', description: 'KFC Gulberg',          amount: 1450, type: 'debit' },
  { date: '2024-01-05', description: 'Uber ride to office',  amount: 320,  type: 'debit' },
  { date: '2024-01-06', description: 'Imtiaz Superstore',    amount: 3200, type: 'debit' },
  { date: '2024-01-08', description: 'LESCO electricity bill',amount: 4500,type: 'debit' },
  { date: '2024-01-10', description: 'Netflix subscription', amount: 1100, type: 'debit' },
  { date: '2024-01-11', description: 'McDonald\'s DHA',      amount: 980,  type: 'debit' },
  { date: '2024-01-12', description: 'Careem ride',          amount: 410,  type: 'debit' },
  { date: '2024-01-13', description: 'Jazz monthly recharge',amount: 600,  type: 'debit' },
  { date: '2024-01-15', description: 'Aga Khan Hospital',    amount: 2800, type: 'debit' },
  { date: '2024-01-17', description: 'Khaadi clothes',       amount: 5500, type: 'debit' },
  { date: '2024-01-18', description: 'Uber ride',            amount: 290,  type: 'debit' },
  { date: '2024-01-19', description: 'Naheed Supermarket',   amount: 2100, type: 'debit' },
  { date: '2024-01-20', description: 'Sui Gas bill',         amount: 1800, type: 'debit' },
  { date: '2024-01-22', description: 'Pizza Hut',            amount: 1650, type: 'debit' },
  { date: '2024-02-02', description: 'EasyPaisa transfer',   amount: 5000, type: 'debit' },
  { date: '2024-02-05', description: 'Bykea ride',           amount: 180,  type: 'debit' },
  { date: '2024-02-07', description: 'Daraz.pk order',       amount: 2800, type: 'debit' },
  { date: '2024-02-10', description: 'School fee payment',   amount: 8500, type: 'debit' },
  { date: '2024-02-14', description: 'Nueplex cinema',       amount: 1200, type: 'debit' },
  { date: '2024-02-20', description: 'Salary credit',        amount: 85000,type: 'credit' },
]

/* ── Utility ────────────────────────────────────────────────────────────── */
function fmtPKR(n) {
  return 'PKR\u202f' + Math.round(n).toLocaleString('en-PK')
}

function getDayOfWeek(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
  } catch { return 'Unknown' }
}

function getMonthKey(dateStr) {
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  } catch { return 'Unknown' }
}

function getMonthLabel(key) {
  try {
    const [y, m] = key.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  } catch { return key }
}

/* ── useDebounce ────────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Card({ children, colors, style = {} }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: '1.25rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, sub, icon, colors }) {
  return (
    <Card colors={colors} style={{ flex: 1, minWidth: 160, textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: ACCENT, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: 4 }}>{label}</div>
    </Card>
  )
}

function CategoryChip({ cat, small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cat.color + '22',
      color: cat.color,
      borderRadius: 20,
      padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? '0.7rem' : '0.75rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {cat.icon} {cat.category}
    </span>
  )
}

/* ── Category Bar Chart ─────────────────────────────────────────────────── */
function CategoryChart({ transactions, colors }) {
  const debits = transactions.filter(t => t.type === 'debit')
  const total = debits.reduce((s, t) => s + t.amount, 0)

  const byCategory = useMemo(() => {
    const map = {}
    debits.forEach(t => {
      const key = t.cat.category
      if (!map[key]) map[key] = { ...t.cat, total: 0, count: 0 }
      map[key].total += t.amount
      map[key].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [transactions])

  if (!byCategory.length) return null
  const max = byCategory[0].total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {byCategory.map(cat => {
        const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) : 0
        const barW = max > 0 ? (cat.total / max) * 100 : 0
        return (
          <div key={cat.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
              <span style={{ color: colors.text, fontWeight: 500 }}>
                {cat.icon} {cat.category}
              </span>
              <span style={{ color: colors.textSecondary }}>
                {fmtPKR(cat.total)} &middot; {pct}%
              </span>
            </div>
            <div style={{ height: 10, background: colors.border, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${barW}%`,
                background: cat.color,
                borderRadius: 6,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Monthly Trend SVG Chart ────────────────────────────────────────────── */
function MonthlyChart({ transactions, colors }) {
  const debits = transactions.filter(t => t.type === 'debit')
  const monthly = useMemo(() => {
    const map = {}
    debits.forEach(t => {
      const k = getMonthKey(t.date)
      map[k] = (map[k] || 0) + t.amount
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [transactions])

  if (monthly.length === 0) return null

  const max = Math.max(...monthly.map(([, v]) => v))
  const chartH = 120
  const barW = Math.max(30, Math.min(60, Math.floor(400 / monthly.length) - 8))
  const gap = 8
  const totalW = monthly.length * (barW + gap)
  const maxMonthIdx = monthly.findIndex(([, v]) => v === max)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(totalW + 40, 300)} height={chartH + 44} style={{ display: 'block' }}>
        {monthly.map(([key, val], i) => {
          const barH = max > 0 ? (val / max) * chartH : 4
          const x = i * (barW + gap) + 20
          const y = chartH - barH
          const isMax = i === maxMonthIdx
          return (
            <g key={key}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={4}
                fill={isMax ? ACCENT : colors.textSecondary + '66'}
              />
              <text
                x={x + barW / 2} y={chartH + 14}
                textAnchor="middle"
                fill={colors.textSecondary}
                fontSize={10}
              >
                {getMonthLabel(key)}
              </text>
              {isMax && (
                <text
                  x={x + barW / 2} y={y - 4}
                  textAnchor="middle"
                  fill={ACCENT}
                  fontSize={9}
                  fontWeight="bold"
                >
                  ★
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginTop: 4 }}>
        ★ Highest spending month
      </div>
    </div>
  )
}

/* ── Insights ───────────────────────────────────────────────────────────── */
function Insights({ transactions, colors }) {
  const insights = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit')
    const total = debits.reduce((s, t) => s + t.amount, 0)
    if (!debits.length) return []
    const result = []

    // Top category
    const catMap = {}
    debits.forEach(t => {
      const k = t.cat.category
      catMap[k] = (catMap[k] || 0) + t.amount
    })
    const [topCat, topCatAmt] = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
    result.push({
      icon: '📊',
      text: `Your biggest expense category is ${topCat} at ${fmtPKR(topCatAmt)} (${((topCatAmt / total) * 100).toFixed(0)}% of total).`,
    })

    // Food budget
    const foodAmt = catMap['Food & Dining'] || 0
    if (foodAmt > 0 && total > 0) {
      const foodPct = (foodAmt / total) * 100
      result.push({
        icon: foodPct > 20 ? '⚠️' : '✅',
        text: `You spent ${fmtPKR(foodAmt)} on food — that's ${foodPct.toFixed(0)}% of your total${foodPct > 20 ? ', above the typical 20% guideline.' : ', within a healthy range.'}`,
      })
    }

    // Top merchant
    const merchantMap = {}
    debits.forEach(t => {
      const key = t.description
      if (!merchantMap[key]) merchantMap[key] = { total: 0, count: 0 }
      merchantMap[key].total += t.amount
      merchantMap[key].count++
    })
    const [topM, topMData] = Object.entries(merchantMap).sort((a, b) => b[1].total - a[1].total)[0]
    result.push({
      icon: '🏪',
      text: `Top merchant: "${topM}" — ${fmtPKR(topMData.total)} across ${topMData.count} transaction${topMData.count > 1 ? 's' : ''}.`,
    })

    // Recurring pattern
    const recurring = Object.entries(merchantMap).filter(([, d]) => d.count >= 2)
    if (recurring.length > 0) {
      const [recName, recData] = recurring.sort((a, b) => b[1].count - a[1].count)[0]
      result.push({
        icon: '🔄',
        text: `Recurring pattern: "${recName}" appears ${recData.count} times in your history.`,
      })
    }

    // Day of week
    const dayMap = {}
    debits.forEach(t => {
      const d = getDayOfWeek(t.date)
      dayMap[d] = (dayMap[d] || 0) + t.amount
    })
    const [topDay] = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]
    result.push({
      icon: '📅',
      text: `Your highest spending day of week is ${topDay} — consider reviewing expenses on that day.`,
    })

    return result.slice(0, 5)
  }, [transactions])

  if (!insights.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {insights.map((ins, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: ACCENT + '11',
          border: `1px solid ${ACCENT}33`,
          borderRadius: 8,
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          color: colors.text,
          lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ins.icon}</span>
          <span>{ins.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Transaction Table ──────────────────────────────────────────────────── */
function TransactionTable({ transactions, colors }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const debouncedSearch = useDebounce(search, 200)

  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.cat.category))]
    return cats.sort()
  }, [transactions])

  const filtered = useMemo(() => {
    let rows = transactions
    if (catFilter !== 'all') rows = rows.filter(t => t.cat.category === catFilter)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      rows = rows.filter(t => t.description.toLowerCase().includes(q))
    }
    rows = [...rows].sort((a, b) => {
      let av, bv
      if (sortBy === 'date') { av = a.date; bv = b.date }
      else { av = a.amount; bv = b.amount }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [transactions, catFilter, debouncedSearch, sortBy, sortDir])

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    padding: '0.45rem 0.75rem',
    color: colors.text,
    fontSize: '0.82rem',
    outline: 'none',
  }

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const thStyle = (col) => ({
    padding: '0.6rem 0.75rem',
    textAlign: col === 'amount' ? 'right' : 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.textSecondary,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${colors.border}`,
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 160px' }}
          placeholder="Search description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={{ ...inputStyle, flex: '0 1 auto' }}
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
          <thead>
            <tr>
              <th style={thStyle('date')} onClick={() => toggleSort('date')}>
                Date {sortBy === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ ...thStyle('desc'), cursor: 'default' }}>Description</th>
              <th style={{ ...thStyle('cat'), cursor: 'default' }}>Category</th>
              <th style={thStyle('amount')} onClick={() => toggleSort('amount')}>
                Amount {sortBy === 'amount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: colors.textSecondary }}>
                  No transactions match your filter.
                </td>
              </tr>
            )}
            {filtered.map((t, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '0.55rem 0.75rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                  {t.date}
                </td>
                <td style={{ padding: '0.55rem 0.75rem', color: colors.text, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </td>
                <td style={{ padding: '0.55rem 0.75rem' }}>
                  <CategoryChip cat={t.cat} small />
                </td>
                <td style={{
                  padding: '0.55rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: t.type === 'credit' ? '#22c55e' : '#ef4444',
                }}>
                  {t.type === 'credit' ? '+' : '-'}{fmtPKR(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: colors.textSecondary }}>
        {filtered.length} of {transactions.length} transactions
      </div>
    </div>
  )
}

/* ── Column Mapper ──────────────────────────────────────────────────────── */
function ColumnMapper({ rawData, onConfirm, onCancel, colors }) {
  const headers = useMemo(() => Object.keys(rawData[0] || {}), [rawData])
  const preview = rawData.slice(0, 3)

  function autoDetect(field) {
    const lowerHeaders = headers.map(h => h.toLowerCase())
    if (field === 'date') {
      return lowerHeaders.findIndex(h => h.includes('date')) > -1
        ? headers[lowerHeaders.findIndex(h => h.includes('date'))] : ''
    }
    if (field === 'description') {
      const idx = lowerHeaders.findIndex(h =>
        h.includes('desc') || h.includes('narration') || h.includes('merchant') ||
        h.includes('detail') || h.includes('particulars') || h.includes('remarks')
      )
      return idx > -1 ? headers[idx] : ''
    }
    if (field === 'amount') {
      const idx = lowerHeaders.findIndex(h =>
        h.includes('debit') || h.includes('amount') || h.includes('dr') ||
        h.includes('withdrawal') || h.includes('deducted')
      )
      return idx > -1 ? headers[idx] : ''
    }
    if (field === 'type') {
      const idx = lowerHeaders.findIndex(h =>
        h.includes('type') || h.includes('cr/dr') || h.includes('transaction type')
      )
      return idx > -1 ? headers[idx] : ''
    }
    return ''
  }

  const [mapping, setMapping] = useState({
    date: autoDetect('date'),
    description: autoDetect('description'),
    amount: autoDetect('amount'),
    type: autoDetect('type'),
  })

  function handleConfirm() {
    if (!mapping.date || !mapping.description || !mapping.amount) return
    const transactions = rawData.map(row => {
      const amount = parseAmount(row[mapping.amount])
      let type = 'debit'
      if (mapping.type && row[mapping.type]) {
        const tv = String(row[mapping.type]).toLowerCase()
        if (tv.includes('cr') || tv.includes('credit')) type = 'credit'
      }
      const rawAmt = parseFloat(String(row[mapping.amount]).replace(/,/g, ''))
      if (!isNaN(rawAmt) && rawAmt < 0) type = 'debit'
      const desc = row[mapping.description] || ''
      return {
        date: row[mapping.date] || '',
        description: desc,
        amount,
        type,
        cat: categorize(desc),
      }
    }).filter(t => t.amount > 0)
    onConfirm(transactions)
  }

  const selectStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    padding: '0.4rem 0.6rem',
    color: colors.text,
    fontSize: '0.82rem',
    outline: 'none',
    width: '100%',
  }

  const isReady = mapping.date && mapping.description && mapping.amount

  return (
    <Card colors={colors}>
      <h3 style={{ margin: '0 0 1rem', color: colors.text, fontSize: '1rem' }}>
        🗂️ Map CSV Columns
      </h3>

      {/* Preview table */}
      <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginBottom: 6 }}>
          Preview (first 3 rows):
        </div>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '0.35rem 0.6rem',
                  background: colors.border,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {headers.map(h => (
                  <td key={h} style={{
                    padding: '0.3rem 0.6rem',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}>
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mapping selects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { field: 'date', label: 'Date *', required: true },
          { field: 'description', label: 'Description / Merchant *', required: true },
          { field: 'amount', label: 'Amount *', required: true },
          { field: 'type', label: 'Type (debit/credit)', required: false },
        ].map(({ field, label }) => (
          <div key={field}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: colors.textSecondary, marginBottom: 4 }}>
              {label}
            </label>
            <select
              style={selectStyle}
              value={mapping[field]}
              onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
            >
              <option value="">— not mapped —</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleConfirm}
          disabled={!isReady}
          style={{
            background: isReady ? ACCENT : colors.border,
            color: isReady ? '#fff' : colors.textSecondary,
            border: 'none', borderRadius: 8,
            padding: '0.6rem 1.25rem',
            fontWeight: 600, fontSize: '0.85rem',
            cursor: isReady ? 'pointer' : 'not-allowed',
          }}
        >
          Confirm Mapping →
        </button>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '0.6rem 1rem',
            color: colors.textSecondary,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </Card>
  )
}

/* ── Manual Entry Form ──────────────────────────────────────────────────── */
function ManualEntry({ onAdd, colors }) {
  const [form, setForm] = useState({ date: '', description: '', amount: '', type: 'debit' })
  const [error, setError] = useState('')

  function handleAdd() {
    if (!form.date || !form.description || !form.amount) {
      setError('Please fill in all fields.')
      return
    }
    const amt = parseAmount(form.amount)
    if (amt <= 0) { setError('Enter a valid amount.'); return }
    setError('')
    onAdd({
      date: form.date,
      description: form.description,
      amount: amt,
      type: form.type,
      cat: categorize(form.description),
    })
    setForm({ date: '', description: '', amount: '', type: 'debit' })
  }

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    padding: '0.5rem 0.75rem',
    color: colors.text,
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <Card colors={colors}>
      <h3 style={{ margin: '0 0 1rem', color: colors.text, fontSize: '1rem' }}>➕ Add Transaction</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: 4 }}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: 4 }}>Description / Merchant</label>
          <input type="text" style={inputStyle} placeholder="e.g. KFC Gulberg" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: 4 }}>Amount (PKR)</label>
          <input type="number" style={inputStyle} placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: 4 }}>Type</label>
          <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="debit">Debit (expense)</option>
            <option value="credit">Credit (income)</option>
          </select>
        </div>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{error}</div>}
      <button
        onClick={handleAdd}
        style={{
          background: ACCENT, color: '#fff', border: 'none',
          borderRadius: 8, padding: '0.55rem 1.2rem',
          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
        }}
      >
        Add Transaction
      </button>
    </Card>
  )
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function ExpenseAnalyzer() {
  const { isDark, colors } = useTheme()
  const fileRef = useRef(null)
  const [mode, setMode] = useState('upload') // 'upload' | 'manual'
  const [stage, setStage] = useState('idle') // 'idle' | 'mapping' | 'dashboard'
  const [rawData, setRawData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState('')

  const sectionTitle = (text) => ({
    margin: '0 0 1rem',
    fontSize: '1.05rem',
    fontWeight: 700,
    color: colors.text,
  })

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit')
    const total = debits.reduce((s, t) => s + t.amount, 0)
    const count = transactions.length

    const dates = debits.map(t => t.date).filter(Boolean).sort()
    let avgPerDay = 0
    if (dates.length > 1) {
      const d1 = new Date(dates[0]), d2 = new Date(dates[dates.length - 1])
      const days = Math.max(1, Math.round((d2 - d1) / 86400000) + 1)
      avgPerDay = total / days
    } else if (debits.length === 1) {
      avgPerDay = total
    }

    const catMap = {}
    debits.forEach(t => {
      catMap[t.cat.category] = (catMap[t.cat.category] || 0) + t.amount
    })
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

    return { total, count, avgPerDay, topCat }
  }, [transactions])

  /* ── File handling ── */
  function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setFileError('Please upload a CSV file.')
      return
    }
    setFileError('')
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = parseCSV(e.target.result)
        if (!data.length) { setFileError('CSV appears empty.'); return }
        setRawData(data)
        setStage('mapping')
      } catch {
        setFileError('Failed to parse CSV. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = useCallback(e => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = useCallback(e => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setDragOver(false), [])

  /* ── Sample data ── */
  function loadSample() {
    setTransactions(SAMPLE_TRANSACTIONS.map(t => ({ ...t, cat: categorize(t.description) })))
    setStage('dashboard')
    setMode('upload')
  }

  /* ── Manual mode ── */
  function addTransaction(tx) {
    setTransactions(prev => [...prev, tx])
    if (stage !== 'dashboard') setStage('dashboard')
  }

  /* ── Reset ── */
  function reset() {
    setTransactions([])
    setRawData(null)
    setStage('idle')
    setFileError('')
  }

  /* ── Export ── */
  function exportSummary() {
    const debits = transactions.filter(t => t.type === 'debit')
    const total = debits.reduce((s, t) => s + t.amount, 0)
    const catMap = {}
    debits.forEach(t => {
      const k = t.cat.category
      if (!catMap[k]) catMap[k] = { total: 0, count: 0 }
      catMap[k].total += t.amount
      catMap[k].count++
    })
    const rows = [
      ['Category', 'Total PKR', 'Count', 'Percentage'],
      ...Object.entries(catMap)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([cat, d]) => [cat, Math.round(d.total), d.count, ((d.total / total) * 100).toFixed(1) + '%']),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'expense-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const btnBase = {
    border: 'none', borderRadius: 8,
    padding: '0.5rem 1rem',
    fontWeight: 600, fontSize: '0.82rem',
    cursor: 'pointer',
  }

  return (
    <ToolLayout toolId="expense-analyzer">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            💳 Personal Expense Analyzer
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
            Understand your spending patterns from bank &amp; mobile wallet exports — PKR, privacy-first.
          </p>
        </div>

        {/* Privacy Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: ACCENT + '18',
          border: `1px solid ${ACCENT}44`,
          borderRadius: 10,
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: colors.text,
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span>
          <span>
            <strong>Your data never leaves this browser.</strong> No uploads. No accounts. No tracking.
            Everything runs 100% locally in JavaScript.
          </span>
        </div>

        {/* Stage: idle → upload or manual */}
        {stage === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['upload', 'manual'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    ...btnBase,
                    background: mode === m ? ACCENT : colors.card,
                    color: mode === m ? '#fff' : colors.textSecondary,
                    border: `1px solid ${mode === m ? ACCENT : colors.border}`,
                  }}
                >
                  {m === 'upload' ? '📂 Upload CSV' : '✏️ Manual Entry'}
                </button>
              ))}
              <button
                onClick={loadSample}
                style={{ ...btnBase, background: colors.card, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
              >
                🎯 Load Sample Data
              </button>
            </div>

            {mode === 'upload' && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? ACCENT : colors.inputBorder}`,
                  borderRadius: 12,
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? ACCENT + '0d' : colors.card,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                <div style={{ fontWeight: 600, color: colors.text, marginBottom: 6 }}>
                  Drag &amp; drop your CSV file here
                </div>
                <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  or click to browse · Supports bank statements, Easypaisa &amp; JazzCash exports
                </div>
                <input
                  ref={fileRef}
                  type="file" accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            )}

            {fileError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: '#ef444422', borderRadius: 8 }}>
                ⚠️ {fileError}
              </div>
            )}

            {mode === 'manual' && (
              <ManualEntry onAdd={addTransaction} colors={colors} />
            )}

            {/* Format hint */}
            <Card colors={colors} style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
              <strong style={{ color: colors.text }}>📋 Supported formats:</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                <li>HBL / MCB / UBL / ABL Internet Banking statement (CSV export)</li>
                <li>Easypaisa transaction history download</li>
                <li>JazzCash statement export</li>
                <li>Any CSV with Date, Description/Narration, and Amount columns</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Stage: mapping */}
        {stage === 'mapping' && rawData && (
          <ColumnMapper
            rawData={rawData}
            colors={colors}
            onConfirm={txs => { setTransactions(txs); setStage('dashboard') }}
            onCancel={() => { setStage('idle'); setRawData(null) }}
          />
        )}

        {/* Stage: dashboard */}
        {stage === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mode === 'manual' && (
                  <button
                    onClick={() => {}}
                    style={{ ...btnBase, background: ACCENT, color: '#fff' }}
                    title="Switch to add more manually"
                  >
                    ➕ Add More
                  </button>
                )}
                <button
                  onClick={exportSummary}
                  style={{ ...btnBase, background: colors.card, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
                >
                  ⬇️ Export Summary
                </button>
                <button
                  onClick={reset}
                  style={{ ...btnBase, background: 'transparent', color: '#ef4444', border: '1px solid #ef444444' }}
                >
                  🗑️ Clear Data
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                {transactions.length} transactions loaded
              </div>
            </div>

            {/* Manual entry inline for manual mode */}
            {mode === 'manual' && (
              <ManualEntry onAdd={addTransaction} colors={colors} />
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <StatCard
                label="Total Expenses"
                value={fmtPKR(stats.total)}
                icon="💸"
                colors={colors}
              />
              <StatCard
                label="Avg per Day"
                value={fmtPKR(stats.avgPerDay)}
                icon="📆"
                colors={colors}
              />
              <StatCard
                label="Top Category"
                value={stats.topCat ? stats.topCat[0] : '—'}
                sub={stats.topCat ? fmtPKR(stats.topCat[1]) : ''}
                icon="🏆"
                colors={colors}
              />
              <StatCard
                label="Transactions"
                value={stats.count}
                icon="🧾"
                colors={colors}
              />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              <Card colors={colors}>
                <h3 style={sectionTitle('Spending by Category')}>📊 Spending by Category</h3>
                <CategoryChart transactions={transactions} colors={colors} />
              </Card>
              <Card colors={colors}>
                <h3 style={sectionTitle('Monthly Trend')}>📈 Monthly Trend</h3>
                <MonthlyChart transactions={transactions} colors={colors} />
              </Card>
            </div>

            {/* Insights */}
            <Card colors={colors}>
              <h3 style={sectionTitle('Insights')}>💡 Smart Insights</h3>
              <Insights transactions={transactions} colors={colors} />
            </Card>

            {/* Transaction table */}
            <Card colors={colors}>
              <h3 style={sectionTitle('Transactions')}>🧾 Transactions</h3>
              <TransactionTable transactions={transactions} colors={colors} />
            </Card>
          </div>
        )}

        {/* Mode toggle available on dashboard too */}
        {stage === 'dashboard' && mode === 'upload' && (
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => setMode('manual')}
              style={{ ...btnBase, background: 'transparent', color: colors.textSecondary, border: `1px solid ${colors.border}` }}
            >
              ✏️ Also add transactions manually
            </button>
          </div>
        )}

        {/* ── Share / Export ── */}
        {stage === 'dashboard' && transactions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <SharePanel
              filename="expense-report.pdf"
              textSummary={(() => {
                const total = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)
                return 'Expense Report — Total spent: PKR ' + total.toLocaleString() + '\n' +
                  transactions.slice(0, 10).map(t => t.date + ' | ' + (t.description || 'N/A') + ' | PKR ' + t.amount).join('\n')
              })()}
              getBlob={async () => {
                const { default: jsPDF } = await import('jspdf')
                const pdf = new jsPDF()
                const total = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)
                pdf.setFontSize(16); pdf.text('Expense Report', 14, 18)
                pdf.setFontSize(10); pdf.text('Total spent: PKR ' + total.toLocaleString(), 14, 28)
                let y = 38
                pdf.setFontSize(9)
                transactions.forEach(t => {
                  if (y > 270) { pdf.addPage(); y = 18 }
                  pdf.text((t.date || '') + '  ' + (t.description || 'N/A').slice(0, 45) + '  PKR ' + t.amount, 14, y)
                  y += 7
                })
                return pdf.output('arraybuffer')
              }}
            />
          </div>
        )}

        {/* ── API Note ── */}
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start', marginTop: '1.5rem' }}>
          <DisclaimerBlock type="noApi" overrideBodyEn="Expenses are entered manually or imported via CSV. No bank statement API is connected. When open-banking APIs (e.g. 1Link, HBL OpenAPI) become available, automatic import can be enabled." />
        </div>

      </div>
    </ToolLayout>
  )
}
