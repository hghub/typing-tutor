import { useState, useCallback, useMemo, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../utils/supabase'

const ACCENT = '#3b82f6'
const STORAGE_KEY = 'typely_warranties'
const SESSION_KEY = 'typely_session_id'

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'appliances',  label: 'Appliances',  icon: '🏠' },
  { id: 'vehicle',     label: 'Vehicle',      icon: '🚗' },
  { id: 'furniture',   label: 'Furniture',    icon: '🛋️' },
  { id: 'clothing',    label: 'Clothing',     icon: '👕' },
  { id: 'tools',       label: 'Tools',        icon: '🔧' },
  { id: 'other',       label: 'Other',        icon: '📦' },
]

const SAMPLE_DATA = [
  {
    product_name: 'Samsung Galaxy S23',
    brand: 'Samsung',
    category: 'electronics',
    purchase_date: '2023-09-15',
    warranty_months: 12,
    price: 149999,
    store: 'Hafeez Center, Lahore',
    notes: 'Official Samsung warranty. Keep receipt safe.',
  },
  {
    product_name: 'Haier Refrigerator HRF-306',
    brand: 'Haier',
    category: 'appliances',
    purchase_date: '2022-11-20',
    warranty_months: 24,
    price: 85000,
    store: 'Daraz Online',
    notes: 'Compressor warranty 5 years, general warranty 2 years.',
  },
  {
    product_name: 'Gree DC Inverter AC',
    brand: 'Gree',
    category: 'appliances',
    purchase_date: '2023-04-01',
    warranty_months: 36,
    price: 110000,
    store: 'Gree Authorized Dealer, Karachi',
    notes: 'Annual maintenance contract included.',
  },
  {
    product_name: 'Dell Inspiron 15 Laptop',
    brand: 'Dell',
    category: 'electronics',
    purchase_date: '2024-01-10',
    warranty_months: 12,
    price: 135000,
    store: 'Micro Vision, Islamabad',
    notes: 'Dell on-site warranty. Service tag saved separately.',
  },
  {
    product_name: 'TCL 55" 4K LED TV',
    brand: 'TCL',
    category: 'electronics',
    purchase_date: '2023-12-25',
    warranty_months: 24,
    price: 92000,
    store: 'Lucky Electronics, Lahore',
    notes: 'Panel warranty 24 months, parts 12 months.',
  },
]

const EMPTY_FORM = {
  product_name: '',
  brand: '',
  category: 'electronics',
  purchase_date: '',
  warranty_value: '',
  warranty_unit: 'months',
  price: '',
  store: '',
  notes: '',
}

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function WarrantyRecoveryCodeBox({ colors }) {
  const [copied, setCopied] = useState(false)
  const [restoreVal, setRestoreVal] = useState('')
  const [restoreMsg, setRestoreMsg] = useState('')
  const code = getSessionId()

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRestore() {
    const v = restoreVal.trim()
    if (!v) return
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRe.test(v)) { setRestoreMsg('Invalid code format.'); return }
    localStorage.setItem(SESSION_KEY, v)
    setRestoreMsg('Code applied! Reload the page to fetch your data.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <code style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.12)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: colors.text, letterSpacing: '0.03em', wordBreak: 'break-all' }}>{code}</code>
        <button onClick={handleCopy} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Paste recovery code to restore on this device…"
          value={restoreVal}
          onChange={e => setRestoreVal(e.target.value)}
          style={{ fontSize: '0.72rem', flex: 1, minWidth: 200, padding: '0.25rem 0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.3)', background: 'transparent', color: colors.text, outline: 'none' }}
        />
        <button onClick={handleRestore} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          Restore
        </button>
      </div>
      {restoreMsg && <p style={{ margin: 0, fontSize: '0.72rem', color: '#f59e0b' }}>{restoreMsg}</p>}
    </div>
  )
}

function getStatus(purchaseDate, warrantyMonths) {
  const [y, m, d] = purchaseDate.split('-').map(Number)
  const expiry = new Date(y, m - 1, d)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const now = new Date()
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', color: '#94a3b8', daysLeft }
  if (daysLeft <= 30) return { label: 'Expiring Soon', color: '#f59e0b', daysLeft }
  return { label: 'Active', color: '#22c55e', daysLeft }
}

function getExpiryDateStr(purchaseDate, warrantyMonths) {
  const [y, m, d] = purchaseDate.split('-').map(Number)
  const expiry = new Date(y, m - 1, d)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const ey = expiry.getFullYear()
  const em = String(expiry.getMonth() + 1).padStart(2, '0')
  const ed = String(expiry.getDate()).padStart(2, '0')
  return `${ey}-${em}-${ed}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  // Use local time parsing to avoid UTC offset issues
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function loadFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToLocalStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: '0.3rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}

function WarrantyCard({ item, status, expiryDate, category, colors, isDark, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        border: `1px solid ${hovered ? status.color : colors.border}`,
        borderRadius: '12px',
        padding: '1.25rem',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        boxShadow: hovered ? `0 4px 20px ${status.color}2a` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>{category.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: '700',
            color: colors.text,
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {item.product_name}
          </div>
          {item.brand && (
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: '0.1rem' }}>
              {item.brand}
            </div>
          )}
        </div>
        <span style={{
          background: `${status.color}22`,
          color: status.color,
          border: `1px solid ${status.color}55`,
          borderRadius: '20px',
          padding: '0.15rem 0.6rem',
          fontSize: '0.7rem',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ height: '1px', background: colors.border }} />

      {/* Expiry row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Expires
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: colors.text }}>
            {formatDate(expiryDate)}
          </div>
        </div>
        <div>
          {status.daysLeft < 0 ? (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Expired {Math.abs(status.daysLeft)}d ago
            </span>
          ) : status.daysLeft <= 30 ? (
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>
              ⚠️ {status.daysLeft} days left
            </span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: '600' }}>
              {status.daysLeft} days left
            </span>
          )}
        </div>
      </div>

      {/* Purchase info */}
      <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
        Purchased: <strong style={{ color: colors.text }}>{formatDate(item.purchase_date)}</strong>
        {item.store && (
          <span> · 🏪 {item.store}</span>
        )}
      </div>

      {/* Price */}
      {item.price != null && (
        <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          💰 PKR {Number(item.price).toLocaleString('en-PK')}
        </div>
      )}

      {/* Notes snippet */}
      {item.notes && (
        <div style={{
          fontSize: '0.76rem',
          color: colors.textSecondary,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          borderRadius: '6px',
          padding: '0.4rem 0.6rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          📝 {item.notes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.25rem' }}>
        <button
          onClick={onEdit}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            padding: '0.3rem 0.65rem',
            cursor: 'pointer',
            color: colors.textSecondary,
            fontSize: '0.78rem',
            transition: 'border-color 0.15s',
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            background: 'transparent',
            border: '1px solid #ef444433',
            borderRadius: '6px',
            padding: '0.3rem 0.65rem',
            cursor: 'pointer',
            color: '#ef4444',
            fontSize: '0.78rem',
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WarrantyTracker() {
  const { isDark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [useLocal, setUseLocal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('expiry')

  const sessionId = useMemo(() => getSessionId(), [])

  // Load on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('warranties')
          .select('*')
          .eq('user_id', sessionId)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (!cancelled) setItems(data || [])
      } catch {
        if (!cancelled) {
          setUseLocal(true)
          setItems(loadFromLocalStorage())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  const persistItem = useCallback(async (item, prevItems) => {
    if (useLocal) {
      const updated = prevItems.find(x => x.id === item.id)
        ? prevItems.map(x => x.id === item.id ? item : x)
        : [item, ...prevItems]
      saveToLocalStorage(updated)
      return updated
    }
    try {
      const { error } = await supabase.from('warranties').upsert(item)
      if (error) throw error
      return prevItems.find(x => x.id === item.id)
        ? prevItems.map(x => x.id === item.id ? item : x)
        : [item, ...prevItems]
    } catch {
      setUseLocal(true)
      const updated = prevItems.find(x => x.id === item.id)
        ? prevItems.map(x => x.id === item.id ? item : x)
        : [item, ...prevItems]
      saveToLocalStorage(updated)
      return updated
    }
  }, [useLocal])

  const deleteItem = useCallback(async (id) => {
    if (useLocal) {
      setItems(prev => {
        const updated = prev.filter(x => x.id !== id)
        saveToLocalStorage(updated)
        return updated
      })
      return
    }
    try {
      const { error } = await supabase.from('warranties').delete().eq('id', id)
      if (error) throw error
      setItems(prev => prev.filter(x => x.id !== id))
    } catch {
      setUseLocal(true)
      setItems(prev => {
        const updated = prev.filter(x => x.id !== id)
        saveToLocalStorage(updated)
        return updated
      })
    }
  }, [useLocal])

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
    setShowModal(true)
  }, [])

  const openEdit = useCallback((item) => {
    const wMonths = item.warranty_months
    const isYears = wMonths % 12 === 0 && wMonths >= 12
    setForm({
      product_name: item.product_name,
      brand: item.brand || '',
      category: item.category,
      purchase_date: item.purchase_date,
      warranty_value: isYears ? String(wMonths / 12) : String(wMonths),
      warranty_unit: isYears ? 'years' : 'months',
      price: item.price != null ? String(item.price) : '',
      store: item.store || '',
      notes: item.notes || '',
    })
    setErrors({})
    setEditingId(item.id)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setEditingId(null)
    setErrors({})
  }, [])

  const handleSubmit = useCallback(async () => {
    const e = {}
    if (!form.product_name.trim()) e.product_name = 'Product name is required'
    if (!form.purchase_date) e.purchase_date = 'Purchase date is required'
    if (!form.warranty_value || Number(form.warranty_value) <= 0)
      e.warranty_value = 'Warranty period must be greater than 0'
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const warrantyMonths = form.warranty_unit === 'years'
      ? Math.round(Number(form.warranty_value) * 12)
      : Math.round(Number(form.warranty_value))

    const existingCreatedAt = editingId
      ? items.find(x => x.id === editingId)?.created_at
      : undefined

    const item = {
      id: editingId || crypto.randomUUID(),
      user_id: sessionId,
      product_name: form.product_name.trim(),
      brand: form.brand.trim() || null,
      category: form.category,
      purchase_date: form.purchase_date,
      warranty_months: warrantyMonths,
      price: form.price !== '' ? Number(form.price) : null,
      store: form.store.trim() || null,
      notes: form.notes.trim() || null,
      created_at: existingCreatedAt || new Date().toISOString(),
    }

    const updated = await persistItem(item, items)
    setItems(updated)
    closeModal()
  }, [form, editingId, sessionId, items, persistItem, closeModal])

  const populateSample = useCallback(async () => {
    let current = [...items]
    for (const s of SAMPLE_DATA) {
      const item = {
        ...s,
        id: crypto.randomUUID(),
        user_id: sessionId,
        created_at: new Date().toISOString(),
      }
      current = await persistItem(item, current)
    }
    setItems(current)
  }, [sessionId, items, persistItem])

  // Derived stats
  const stats = useMemo(() => {
    const statuses = items.map(i => getStatus(i.purchase_date, i.warranty_months))
    return {
      total: items.length,
      active: statuses.filter(s => s.label === 'Active').length,
      expiringSoon: statuses.filter(s => s.label === 'Expiring Soon').length,
      expired: statuses.filter(s => s.label === 'Expired').length,
    }
  }, [items])

  const urgentItems = useMemo(() =>
    items.filter(i => {
      const s = getStatus(i.purchase_date, i.warranty_months)
      return s.label !== 'Expired' && s.daysLeft <= 7
    }),
    [items]
  )

  const filtered = useMemo(() => {
    let result = [...items]

    if (filterStatus !== 'all') {
      result = result.filter(i => getStatus(i.purchase_date, i.warranty_months).label === filterStatus)
    }
    if (filterCategory !== 'all') {
      result = result.filter(i => i.category === filterCategory)
    }

    result.sort((a, b) => {
      if (sortBy === 'expiry') {
        return getExpiryDateStr(a.purchase_date, a.warranty_months)
          .localeCompare(getExpiryDateStr(b.purchase_date, b.warranty_months))
      }
      if (sortBy === 'purchase') return b.purchase_date.localeCompare(a.purchase_date)
      if (sortBy === 'name') return a.product_name.localeCompare(b.product_name)
      return 0
    })

    return result
  }, [items, filterStatus, filterCategory, sortBy])

  const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

  // Shared style helpers
  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '1.25rem',
  }

  const inputSt = {
    width: '100%',
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnPrimary = {
    background: ACCENT,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  }

  const btnSecondary = {
    background: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '0.6rem 1.25rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
  }

  if (loading) {
    return (
      <ToolLayout toolId="warranty-tracker">
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: colors.textSecondary }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          Loading your warranties…
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout toolId="warranty-tracker">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: colors.text, lineHeight: 1.2 }}>
              🧾 Smart Warranty Tracker
            </h1>
            <p style={{ margin: '0.3rem 0 0', color: colors.textSecondary, fontSize: '0.9rem' }}>
              Never miss a warranty claim again
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {useLocal && (
              <span style={{
                background: '#f59e0b18',
                color: '#d97706',
                border: '1px solid #f59e0b44',
                borderRadius: '20px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                💾 Saving locally
              </span>
            )}
            {items.length === 0 && (
              <button style={btnSecondary} onClick={populateSample}>
                Load Sample Data
              </button>
            )}
            <button style={btnPrimary} onClick={openAdd}>
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {/* ── Urgent alert banner ─────────────────────────────────────── */}
      {urgentItems.length > 0 && (
        <div style={{
          background: '#f59e0b18',
          border: '1px solid #f59e0b66',
          borderRadius: '10px',
          padding: '0.8rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: '700', color: '#d97706', fontSize: '0.9rem' }}>
            ⚠️ {urgentItems.length} warrant{urgentItems.length === 1 ? 'y' : 'ies'} expire{urgentItems.length === 1 ? 's' : ''} within 7 days — check {urgentItems.length === 1 ? 'it' : 'them'} now!
          </span>
          <span style={{ color: '#d97706', fontSize: '0.82rem', opacity: 0.8 }}>
            {urgentItems.map(i => i.product_name).join(', ')}
          </span>
        </div>
      )}

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Total Tracked', value: stats.total,       color: ACCENT,     icon: '📋', statusFilter: null },
          { label: 'Active',        value: stats.active,      color: '#22c55e',  icon: '✅', statusFilter: 'Active' },
          { label: 'Expiring Soon', value: stats.expiringSoon, color: '#f59e0b', icon: '⏰', statusFilter: 'Expiring Soon' },
          { label: 'Expired',       value: stats.expired,     color: '#94a3b8',  icon: '📁', statusFilter: 'Expired' },
        ].map(s => (
          <div
            key={s.label}
            onClick={s.statusFilter ? () => setFilterStatus(s.statusFilter) : undefined}
            style={{
              ...card,
              borderTop: `3px solid ${s.color}`,
              textAlign: 'center',
              cursor: s.statusFilter ? 'pointer' : 'default',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { if (s.statusFilter) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: colors.textSecondary, fontWeight: '600', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter / Sort bar ───────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
      }}>
        {/* Status chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'Active', 'Expiring Soon', 'Expired'].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                border: `1px solid ${filterStatus === f ? ACCENT : colors.border}`,
                background: filterStatus === f ? `${ACCENT}1a` : 'transparent',
                color: filterStatus === f ? ACCENT : colors.textSecondary,
                borderRadius: '20px',
                padding: '0.28rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ ...inputSt, width: 'auto', padding: '0.3rem 0.75rem' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ ...inputSt, width: 'auto', padding: '0.3rem 0.75rem', marginLeft: 'auto' }}
        >
          <option value="expiry">Sort: Expiry Date</option>
          <option value="purchase">Sort: Purchase Date</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '4rem 2rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {items.length === 0 ? '🧾' : '🔍'}
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: colors.text, fontSize: '1.2rem' }}>
            {items.length === 0 ? 'No warranties tracked yet' : 'No matching warranties'}
          </h3>
          <p style={{ color: colors.textSecondary, margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
            {items.length === 0
              ? 'Add your first product to start tracking'
              : 'Try adjusting your filters'}
          </p>
          {items.length === 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={btnPrimary} onClick={openAdd}>+ Add Product</button>
              <button style={btnSecondary} onClick={populateSample}>Load Sample Data</button>
            </div>
          )}
        </div>
      )}

      {/* ── Product cards grid ──────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {filtered.map(item => (
            <WarrantyCard
              key={item.id}
              item={item}
              status={getStatus(item.purchase_date, item.warranty_months)}
              expiryDate={getExpiryDateStr(item.purchase_date, item.warranty_months)}
              category={getCat(item.category)}
              colors={colors}
              isDark={isDark}
              onEdit={() => openEdit(item)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div style={{
            background: colors.card,
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '1.2rem', fontWeight: '700' }}>
                {editingId ? '✏️ Edit Product' : '➕ Add Product'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  lineHeight: 1,
                  padding: '0.25rem',
                }}
              >
                ×
              </button>
            </div>

            {/* Product name */}
            <FormField label="Product Name *" error={errors.product_name}>
              <input
                style={{
                  ...inputSt,
                  borderColor: errors.product_name ? '#ef4444' : colors.inputBorder,
                }}
                value={form.product_name}
                onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                placeholder="e.g. Samsung Galaxy S23"
              />
            </FormField>

            {/* Brand */}
            <FormField label="Brand">
              <input
                style={inputSt}
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                placeholder="e.g. Samsung"
              />
            </FormField>

            {/* Category */}
            <FormField label="Category *">
              <select
                style={inputSt}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </FormField>

            {/* Purchase date + Warranty period in a 2-col row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Purchase Date *" error={errors.purchase_date}>
                <input
                  type="date"
                  style={{
                    ...inputSt,
                    borderColor: errors.purchase_date ? '#ef4444' : colors.inputBorder,
                    colorScheme: isDark ? 'dark' : 'light',
                  }}
                  value={form.purchase_date}
                  onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                />
              </FormField>

              <FormField label="Warranty Period *" error={errors.warranty_value}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="number"
                    min="1"
                    style={{
                      ...inputSt,
                      flex: 1,
                      borderColor: errors.warranty_value ? '#ef4444' : colors.inputBorder,
                    }}
                    value={form.warranty_value}
                    onChange={e => setForm(f => ({ ...f, warranty_value: e.target.value }))}
                    placeholder="e.g. 12"
                  />
                  <select
                    style={{ ...inputSt, width: 'auto', padding: '0.5rem 0.4rem', flexShrink: 0 }}
                    value={form.warranty_unit}
                    onChange={e => setForm(f => ({ ...f, warranty_unit: e.target.value }))}
                  >
                    <option value="months">Mo</option>
                    <option value="years">Yr</option>
                  </select>
                </div>
              </FormField>
            </div>

            {/* Price + Store */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Purchase Price (PKR)">
                <input
                  type="number"
                  min="0"
                  style={inputSt}
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 85000"
                />
              </FormField>

              <FormField label="Store / Retailer">
                <input
                  style={inputSt}
                  value={form.store}
                  onChange={e => setForm(f => ({ ...f, store: e.target.value }))}
                  placeholder="e.g. Hafeez Center"
                />
              </FormField>
            </div>

            {/* Notes */}
            <FormField label="Notes">
              <textarea
                rows={3}
                style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Serial number, service center, receipt location…"
              />
            </FormField>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button style={btnSecondary} onClick={closeModal}>Cancel</button>
              <button style={btnPrimary} onClick={handleSubmit}>
                {editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Data Storage Note ── */}
      <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start', marginTop: '1.5rem' }}>
        <span>💾</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: colors.text }}>Data is device-specific.</strong>{' '}
            Your warranty records are tied to this browser on this device. Switching browsers, clearing cache, or using a different device will show a blank slate. Save your Recovery Code below to restore access from another device.{' '}
            <strong style={{ color: '#ef4444' }}>If multiple people share this browser, they will see each other's data — use a private/incognito window for personal records.</strong>
          </p>
          <WarrantyRecoveryCodeBox colors={colors} />
        </div>
      </div>
    </ToolLayout>
  )
}
