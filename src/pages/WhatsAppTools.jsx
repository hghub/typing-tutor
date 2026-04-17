import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const TABS = ['Message Formatter', 'Message Counter', 'Template Builder', 'Link Generator']
const TEMPLATES_KEY = 'rafiqy_wa_templates'

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') } catch { return [] }
}
function saveTemplates(t) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(t))
}

// Detect RTL characters (Arabic/Urdu range)
function hasRTL(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
}

function renderWaFormatted(text) {
  // Parse WhatsApp formatting inline
  let result = text
  // code blocks (must do first)
  result = result.replace(/```([\s\S]*?)```/g, (_, m) => `<code style="font-family:monospace;background:#f3f4f6;padding:0.1em 0.3em;border-radius:3px;">${m}</code>`)
  result = result.replace(/\*([^*]+)\*/g, '<b>$1</b>')
  result = result.replace(/_([^_]+)_/g, '<i>$1</i>')
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>')
  result = result.replace(/\n/g, '<br/>')
  return result
}

export default function WhatsAppTools() {
  const { isDark, colors } = useTheme()
  const [tab, setTab] = useState(0)

  return (
    <ToolLayout toolId="whatsapp-tools">
      <div style={{ color: colors.text }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>💬 WhatsApp Tools</h1>
        <p style={{ color: colors.textSecondary, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Format, count, template &amp; generate wa.me links for WhatsApp.</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              background: tab === i ? '#25d366' : colors.card,
              color: tab === i ? '#fff' : colors.text,
              outline: tab === i ? '2px solid #25d366' : `1px solid ${colors.border}`,
            }}>{t}</button>
          ))}
        </div>

        {tab === 0 && <FormatterTab colors={colors} isDark={isDark} />}
        {tab === 1 && <CounterTab colors={colors} isDark={isDark} />}
        {tab === 2 && <TemplateTab colors={colors} isDark={isDark} />}
        {tab === 3 && <LinkTab colors={colors} isDark={isDark} />}
      </div>
    </ToolLayout>
  )
}

const cardStyle = (colors) => ({ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' })
const inputStyle = (colors) => ({ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' })
const btnStyle = (bg = '#25d366') => ({ padding: '0.45rem 1rem', borderRadius: '8px', background: bg, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' })

// ── Tab 1: Message Formatter ───────────────────────────────────────────────────
function FormatterTab({ colors, isDark }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const taRef = useRef()

  function wrap(prefix, suffix) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart, end = ta.selectionEnd
    const sel = text.slice(start, end)
    if (!sel) return
    const newText = text.slice(0, start) + prefix + sel + suffix + text.slice(end)
    setText(newText)
    setTimeout(() => { ta.selectionStart = start + prefix.length; ta.selectionEnd = end + prefix.length; ta.focus() }, 0)
  }

  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const fmtBtns = [
    { label: 'B Bold', action: () => wrap('*','*') },
    { label: 'I Italic', action: () => wrap('_','_') },
    { label: 'S Strike', action: () => wrap('~','~') },
    { label: '⌨ Mono', action: () => wrap('```','```') },
  ]

  return (
    <div>
      <div style={cardStyle(colors)}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {fmtBtns.map(b => (
            <button key={b.label} onClick={b.action} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>{b.label}</button>
          ))}
          <button onClick={copy} style={{ ...btnStyle(), marginLeft: 'auto' }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
        </div>
        <textarea ref={taRef} value={text} onChange={e => setText(e.target.value)} rows={8} style={inputStyle(colors)} placeholder="Type your WhatsApp message here. Select text then click a format button…" />
      </div>
      {text && (
        <div style={cardStyle(colors)}>
          <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>📱 PREVIEW</div>
          <div style={{ background: isDark ? '#0a2a1a' : '#dcf8c6', border: `1px solid ${isDark ? '#1a4a2a' : '#b9e5a6'}`, borderRadius: '12px 12px 12px 0', padding: '0.75rem 1rem', maxWidth: '80%', lineHeight: 1.6, fontSize: '0.9rem', direction: hasRTL(text) ? 'rtl' : 'ltr' }}
            dangerouslySetInnerHTML={{ __html: renderWaFormatted(text) }}
          />
        </div>
      )}
    </div>
  )
}

// ── Tab 2: Message Counter ─────────────────────────────────────────────────────
function CounterTab({ colors }) {
  const [text, setText] = useState('')
  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const smsParts = Math.ceil(chars / 160) || 0
  const waParts = Math.ceil(chars / 65536) || 0
  const rtl = hasRTL(text)

  return (
    <div>
      <div style={cardStyle(colors)}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8} style={inputStyle(colors)} placeholder="Paste or type your WhatsApp message…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Characters', value: chars, warn: chars > 1000 },
          { label: 'Words', value: words },
          { label: 'SMS Parts', value: smsParts, sub: '160 chars/part', warn: smsParts > 1 },
          { label: 'WA Messages', value: waParts, sub: '64k chars/msg' },
        ].map(stat => (
          <div key={stat.label} style={{ ...cardStyle(colors), marginBottom: 0, textAlign: 'center', border: `1px solid ${stat.warn ? '#f59e0b' : colors.border}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.warn ? '#f59e0b' : '#25d366' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 600 }}>{stat.label}</div>
            {stat.sub && <div style={{ fontSize: '0.65rem', color: colors.textSecondary }}>{stat.sub}</div>}
          </div>
        ))}
      </div>
      {rtl && (
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '8px', background: '#7c3aed22', border: '1px solid #7c3aed', fontSize: '0.85rem', color: '#a78bfa' }}>
          🌙 Urdu/Arabic RTL text detected — WhatsApp uses UTF-16 encoding for these characters, which may affect message length limits.
        </div>
      )}
      {chars > 1000 && (
        <div style={{ marginTop: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', background: '#f59e0b22', border: '1px solid #f59e0b', fontSize: '0.85rem', color: '#d97706' }}>
          ⚠️ Long message — consider splitting for better readability.
        </div>
      )}
    </div>
  )
}

// ── Tab 3: Template Builder ────────────────────────────────────────────────────
function TemplateTab({ colors, isDark }) {
  const [template, setTemplate] = useState('Dear {{name}}, your order {{order_id}} is ready for pickup.')
  const [vars, setVars] = useState({})
  const [templates, setTemplates] = useState(loadTemplates)
  const [saveName, setSaveName] = useState('')
  const [copied, setCopied] = useState(false)

  const detectedVars = [...new Set((template.match(/\{\{(\w+)\}\}/g) || []).map(m => m.slice(2, -2)))]

  const preview = template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`)

  function setVar(k, v) { setVars(prev => ({ ...prev, [k]: v })) }

  function save() {
    if (!saveName.trim() || !template.trim()) return
    const updated = [...templates.filter(t => t.name !== saveName.trim()), { name: saveName.trim(), text: template }].slice(-5)
    setTemplates(updated); saveTemplates(updated); setSaveName('')
  }

  function load(t) { setTemplate(t.text); setVars({}) }

  function deleteT(name) {
    const updated = templates.filter(t => t.name !== name)
    setTemplates(updated); saveTemplates(updated)
  }

  function copy() {
    navigator.clipboard.writeText(preview).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const inputS = inputStyle(colors)

  return (
    <div>
      <div style={cardStyle(colors)}>
        <label style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Template (use {'{{variable}}'} for placeholders)</label>
        <textarea value={template} onChange={e => { setTemplate(e.target.value); setVars({}) }} rows={4} style={inputS} />

        {detectedVars.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, marginBottom: '0.4rem' }}>Fill Variables</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.5rem' }}>
              {detectedVars.map(v => (
                <div key={v}>
                  <label style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: '0.2rem' }}>{'{{' + v + '}}'}</label>
                  <input value={vars[v] || ''} onChange={e => setVar(v, e.target.value)} style={{ ...inputS, resize: 'none', padding: '0.4rem 0.6rem' }} placeholder={v} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, marginBottom: '0.4rem' }}>Preview</div>
          <div style={{ background: isDark ? '#0a2a1a' : '#dcf8c6', border: `1px solid ${isDark ? '#1a4a2a' : '#b9e5a6'}`, borderRadius: '12px 12px 12px 0', padding: '0.75rem 1rem', lineHeight: 1.6, fontSize: '0.9rem', direction: hasRTL(preview) ? 'rtl' : 'ltr', whiteSpace: 'pre-wrap' }}>
            {preview}
          </div>
          <button onClick={copy} style={{ ...btnStyle(), marginTop: '0.5rem' }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
        </div>

        {/* Save */}
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Template name…" style={{ ...inputS, width: 'auto', flex: 1, resize: 'none', padding: '0.4rem 0.6rem' }} />
          <button onClick={save} style={btnStyle()}>💾 Save (max 5)</button>
        </div>
      </div>

      {templates.length > 0 && (
        <div style={cardStyle(colors)}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, marginBottom: '0.5rem' }}>Saved Templates</div>
          {templates.map(t => (
            <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: '0.85rem', color: colors.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.75rem' }}>
                <button onClick={() => load(t)} style={btnStyle()}>Load</button>
                <button onClick={() => deleteT(t.name)} style={btnStyle('#ef4444')}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab 4: Link Generator ──────────────────────────────────────────────────────
function LinkTab({ colors }) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  function formatPK(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('92')) return '+' + digits
    if (digits.startsWith('0')) return '+92' + digits.slice(1)
    if (digits.length === 10 && digits.startsWith('3')) return '+92' + digits
    return digits ? '+' + digits : ''
  }

  const formatted = formatPK(phone)
  const link = formatted ? `https://wa.me/${formatted.replace('+', '')}${message ? '?text=' + encodeURIComponent(message) : ''}` : ''

  function copy() {
    if (!link) return
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const inputS = inputStyle(colors)

  return (
    <div>
      <div style={cardStyle(colors)}>
        <label style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputS, marginBottom: '0.75rem' }} placeholder="03xx-xxxxxxx or +923xxxxxxxxx" />

        {formatted && (
          <div style={{ fontSize: '0.8rem', color: '#25d366', marginBottom: '0.75rem', fontWeight: 600 }}>
            ✓ Formatted: {formatted}
          </div>
        )}

        <label style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Pre-filled Message (optional)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} style={inputS} placeholder="Hi! I'd like to enquire about…" />

        {link && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, marginBottom: '0.4rem' }}>Generated Link</div>
            <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', wordBreak: 'break-all', color: '#25d366', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
              {link}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={copy} style={btnStyle()}>{copied ? '✓ Copied!' : '📋 Copy Link'}</button>
              <a href={link} target="_blank" rel="noopener noreferrer" style={{ ...btnStyle('#128c7e'), textDecoration: 'none', display: 'inline-block' }}>🔗 Open in WhatsApp</a>
            </div>
          </div>
        )}
      </div>

      <div style={{ ...cardStyle(colors), fontSize: '0.82rem', color: colors.textSecondary }}>
        <b style={{ color: colors.text }}>Pakistan number formats supported:</b>
        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem' }}>
          <li>03xx-xxxxxxx → +923xxxxxxxxx</li>
          <li>03xxxxxxxxx → +923xxxxxxxxx</li>
          <li>3xxxxxxxxx → +923xxxxxxxxx</li>
          <li>+923xxxxxxxxx → stays the same</li>
        </ul>
      </div>
    </div>
  )
}
