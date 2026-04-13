import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f97316'

/* ── Helpers ────────────────────────────────────────────────────────────── */

let itemCounter = 0
function uid() { return ++itemCounter }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function genInvoiceNo() {
  return 'INV-' + String(Date.now()).slice(-6)
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

/* ── Transcript parser ──────────────────────────────────────────────────── */
function parseTranscript(text) {
  const t = text.trim()
  if (!t) return null

  let description = t
  let qty = 1
  let price = 0

  // Extract price: look for number after price/at/rupees/rs/pkr/@
  const priceMatch = t.match(/(?:price|at|rupees|rs\.?|pkr|@)\s*([0-9]+(?:\.[0-9]+)?)/i)
  if (priceMatch) {
    price = parseFloat(priceMatch[1])
    description = description.replace(priceMatch[0], '').trim()
  } else {
    // Try trailing number as price: "Cleaning condenser coils 800"
    const trailingNum = t.match(/^(.+?)\s+([0-9]+(?:\.[0-9]+)?)\s*$/)
    if (trailingNum) {
      price = parseFloat(trailingNum[2])
      description = trailingNum[1].trim()
    }
  }

  // Extract qty: number before units/qty/pieces/x or "N hours"
  const qtyMatch = description.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:units?|qty|pieces?|pcs|x\b|hours?|hrs?)/i)
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1])
    description = description.replace(qtyMatch[0], '').trim()
  } else {
    // "quantity N"
    const qtyWord = description.match(/(?:quantity|qty)\s+([0-9]+(?:\.[0-9]+)?)/i)
    if (qtyWord) {
      qty = parseFloat(qtyWord[1])
      description = description.replace(qtyWord[0], '').trim()
    }
  }

  // Clean up leftover punctuation / conjunctions
  description = description.replace(/[,;]+$/g, '').replace(/^\s*[-,]\s*/, '').trim()
  if (!description) description = t

  // Capitalise first letter
  description = description.charAt(0).toUpperCase() + description.slice(1)

  return { description, qty, price }
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

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
          fontSize: '0.85rem',
          fontWeight: 700,
          color: ACCENT,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {title}
        </h2>
      )}
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
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    />
  )
}

function Label({ children }) {
  return (
    <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.65, display: 'block', marginBottom: '0.25rem' }}>
      {children}
    </label>
  )
}

function Btn({ onClick, children, disabled, variant = 'primary', style: extra = {} }) {
  const base = {
    border: 'none',
    borderRadius: '0.5rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'opacity 0.15s',
    opacity: disabled ? 0.5 : 1,
    ...extra,
  }
  if (variant === 'primary') {
    return <button onClick={onClick} disabled={disabled} style={{ ...base, background: ACCENT, color: '#fff' }}>{children}</button>
  }
  if (variant === 'ghost') {
    return <button onClick={onClick} disabled={disabled} style={{ ...base, background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}44` }}>{children}</button>
  }
  if (variant === 'danger') {
    return <button onClick={onClick} disabled={disabled} style={{ ...base, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }}>{children}</button>
  }
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function VoiceInvoice() {
  const { colors } = useTheme()

  // Invoice header
  const [businessName, setBusinessName] = useState('')
  const [clientName, setClientName] = useState('')
  const [invoiceNo, setInvoiceNo] = useState(genInvoiceNo)
  const [invoiceDate, setInvoiceDate] = useState(todayStr)

  // Voice
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLang, setSelectedLang] = useState('en-US')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [speechSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )
  const recognitionRef = useRef(null)

  // Line items
  const [items, setItems] = useState([])
  const [taxRate, setTaxRate] = useState(0)

  // Feedback
  const [copyMsg, setCopyMsg] = useState('')

  /* ── Speech recognition ── */
  const startRecording = useCallback(() => {
    if (!speechSupported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = selectedLang
    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
      setLiveTranscript(transcript)
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)
  }, [speechSupported, selectedLang])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  // Stop recognition when lang changes mid-session
  useEffect(() => {
    if (isRecording) {
      stopRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang])

  /* ── Line items ── */
  const addFromTranscript = useCallback(() => {
    const parsed = parseTranscript(liveTranscript)
    if (!parsed) return
    setItems((prev) => [...prev, { id: uid(), ...parsed }])
    setLiveTranscript('')
  }, [liveTranscript])

  const addBlankRow = useCallback(() => {
    setItems((prev) => [...prev, { id: uid(), description: '', qty: 1, price: 0 }])
  }, [])

  const updateItem = useCallback((id, field, value) => {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }, [])

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  /* ── Totals ── */
  const subtotal = items.reduce((s, item) => s + (Number(item.qty) || 0) * (Number(item.price) || 0), 0)
  const taxAmount = subtotal * (Number(taxRate) / 100)
  const total = subtotal + taxAmount

  /* ── Export ── */
  const buildTextInvoice = useCallback(() => {
    const lines = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `  ${businessName || 'Business Name'}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Invoice #: ${invoiceNo}`,
      `Date: ${invoiceDate}`,
      `Client: ${clientName || 'Client Name'}`,
      '',
      'ITEMS',
      '─────────────────────────────────────',
      ...items.map((item, i) =>
        `${i + 1}. ${item.description || '(no description)'}` +
        `  Qty: ${item.qty}  @ ${fmt(item.price)}  = ${fmt((item.qty || 0) * (item.price || 0))}`
      ),
      '─────────────────────────────────────',
      `Subtotal: ${fmt(subtotal)}`,
      taxRate > 0 ? `Tax (${taxRate}%): ${fmt(taxAmount)}` : '',
      `TOTAL: ${fmt(total)}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ].filter((l) => l !== undefined)
    return lines.join('\n')
  }, [businessName, clientName, invoiceNo, invoiceDate, items, subtotal, taxRate, taxAmount, total])

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTextInvoice())
      setCopyMsg('Copied!')
    } catch {
      setCopyMsg('Failed')
    }
    setTimeout(() => setCopyMsg(''), 2000)
  }, [buildTextInvoice])

  const downloadCSV = useCallback(() => {
    const rows = [
      ['Invoice #', invoiceNo],
      ['Date', invoiceDate],
      ['Business', businessName],
      ['Client', clientName],
      [],
      ['#', 'Description', 'Qty', 'Unit Price', 'Total'],
      ...items.map((item, i) => [
        i + 1,
        item.description,
        item.qty,
        item.price,
        (item.qty || 0) * (item.price || 0),
      ]),
      [],
      ['', '', '', 'Subtotal', subtotal],
      taxRate > 0 ? ['', '', '', `Tax (${taxRate}%)`, taxAmount] : null,
      ['', '', '', 'TOTAL', total],
    ].filter(Boolean)

    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceNo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [invoiceNo, invoiceDate, businessName, clientName, items, subtotal, taxRate, taxAmount, total])

  /* ── Styles ── */
  const inputStyle = {
    background: colors.input ?? colors.bg,
    border: `1px solid ${colors.inputBorder ?? colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.4rem 0.6rem',
    color: colors.text,
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const cellInputStyle = {
    ...inputStyle,
    width: '100%',
    border: 'none',
    background: 'transparent',
    padding: '0.25rem 0.4rem',
    fontSize: '0.85rem',
  }

  return (
    <ToolLayout toolId="voice-invoice">
      {/* Print stylesheet */}
      <style media="print">{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .print-card { border: 1px solid #ccc !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Mic pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 ${ACCENT}66; }
          70%  { box-shadow: 0 0 0 14px ${ACCENT}00; }
          100% { box-shadow: 0 0 0 0 ${ACCENT}00; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '860px', margin: '0 auto' }}>

        {/* Page title */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            🎙️ Voice-to-Invoice
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: colors.textSecondary }}>
            Speak your work items — get a formatted invoice instantly.
          </p>
        </div>

        {/* ── Invoice Header ── */}
        <SectionCard title="Invoice Details" colors={colors}>
          <div className="print-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <Label>Business Name</Label>
              <StyledInput colors={colors} placeholder="Your Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label>Client Name</Label>
              <StyledInput colors={colors} placeholder="Client / Customer Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label>Invoice #</Label>
              <StyledInput colors={colors} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <StyledInput colors={colors} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </SectionCard>

        {/* ── Voice Input ── */}
        <SectionCard title="Voice Input" colors={colors}>
          <div className="no-print">
            {!speechSupported ? (
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: '#ef444415',
                border: '1px solid #ef444430',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}>
                ⚠️ Web Speech API is not supported in this browser. Try Chrome or Edge on desktop.
              </div>
            ) : (
              <>
                {/* Mic button + lang selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      border: `3px solid ${isRecording ? ACCENT : colors.border}`,
                      background: isRecording ? `${ACCENT}22` : colors.card,
                      cursor: 'pointer',
                      fontSize: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      animation: isRecording ? 'pulse-ring 1.4s ease-out infinite' : 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {isRecording ? '⏹' : '🎤'}
                  </button>

                  <div>
                    <Label>Language</Label>
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      style={{
                        ...inputStyle,
                        padding: '0.45rem 0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="en-US">🇺🇸 English (US)</option>
                      <option value="ur-PK">🇵🇰 Urdu (Pakistan)</option>
                    </select>
                  </div>

                  <div style={{ color: colors.textSecondary, fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {isRecording
                      ? <span style={{ color: ACCENT, fontWeight: 600 }}>● Recording…</span>
                      : 'Press 🎤 and speak your work item'}
                  </div>
                </div>

                {/* Live transcript */}
                <div>
                  <Label>Live Transcript</Label>
                  <div style={{
                    background: colors.input ?? colors.bg,
                    border: `1px solid ${isRecording ? ACCENT : colors.inputBorder ?? colors.border}`,
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    minHeight: '4rem',
                    fontSize: '0.9rem',
                    color: liveTranscript ? colors.text : colors.textSecondary,
                    transition: 'border-color 0.2s',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}>
                    {liveTranscript || 'Your speech will appear here…'}
                  </div>
                </div>

                {/* Transcript actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Btn onClick={addFromTranscript} disabled={!liveTranscript.trim()} variant="primary">
                    + Add Line Item
                  </Btn>
                  <Btn onClick={() => setLiveTranscript('')} disabled={!liveTranscript} variant="ghost">
                    Clear Transcript
                  </Btn>
                </div>

                {/* Hint */}
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.textSecondary,
                  background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}25`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  lineHeight: 1.6,
                }}>
                  <strong>Tips:</strong> &nbsp;
                  "Replaced 20 amp breaker, quantity 1, price 1500" &nbsp;·&nbsp;
                  "Labour charge 2 hours at 500 per hour" &nbsp;·&nbsp;
                  "Cleaning condenser coils 800 rupees"
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ── Invoice Table ── */}
        <SectionCard title="Line Items" colors={colors}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                  {['#', 'Description', 'Qty', 'Unit Price', 'Total', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '0.5rem 0.5rem',
                      textAlign: i <= 1 ? 'left' : 'right',
                      color: colors.textSecondary,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      ...(i === 5 ? { width: '2.5rem' } : {}),
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary, fontSize: '0.875rem' }}>
                      No items yet — use voice input or add a blank row below.
                    </td>
                  </tr>
                )}
                {items.map((item, idx) => {
                  const rowTotal = (Number(item.qty) || 0) * (Number(item.price) || 0)
                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '0.35rem 0.5rem', color: colors.textSecondary, width: '2rem', textAlign: 'left' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', minWidth: '180px' }}>
                        <input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description"
                          style={{ ...cellInputStyle, textAlign: 'left' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', width: '70px' }}>
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                          style={{ ...cellInputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', width: '110px' }}>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          style={{ ...cellInputStyle, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {fmt(rowTotal)}
                      </td>
                      <td style={{ padding: '0.25rem 0.25rem', textAlign: 'center' }} className="no-print">
                        <button
                          onClick={() => deleteItem(item.id)}
                          title="Delete row"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '1rem',
                            padding: '0.15rem 0.3rem',
                            borderRadius: '0.3rem',
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Add blank row */}
          <div className="no-print">
            <Btn onClick={addBlankRow} variant="ghost">+ Add Blank Row</Btn>
          </div>

          {/* Totals */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.4rem',
            borderTop: `1px solid ${colors.border}`,
            paddingTop: '0.75rem',
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Subtotal</span>
              <span style={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="no-print">
              <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Tax %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{ ...inputStyle, width: '70px', textAlign: 'right' }}
              />
            </div>
            {Number(taxRate) > 0 && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Tax ({taxRate}%)</span>
                <span style={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>{fmt(taxAmount)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              borderTop: `2px solid ${colors.border}`,
              paddingTop: '0.4rem',
              marginTop: '0.2rem',
            }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: ACCENT, minWidth: '100px', textAlign: 'right' }}>
                {fmt(total)}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── Export ── */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Btn onClick={copyText} variant="ghost">
            📋 {copyMsg || 'Copy as Text'}
          </Btn>
          <Btn onClick={downloadCSV} variant="ghost">
            ⬇️ Download CSV
          </Btn>
          <Btn onClick={() => window.print()} variant="ghost">
            🖨️ Print
          </Btn>
        </div>

      </div>
    </ToolLayout>
  )
}
