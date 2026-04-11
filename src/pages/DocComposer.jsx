import { useState, useRef, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DOC_TEMPLATES, getTemplateById } from '../data/docTemplates'
import { Link } from 'react-router-dom'

// jsPDF + html2canvas loaded on demand only when user clicks Export
async function exportToPDF(el, filename) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = (canvas.height * pdfW) / canvas.width
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH)
  pdf.save(filename)
}

function TemplateSelector({ selected, onSelect, colors, isDark }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
        Choose Template
      </p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {DOC_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: selected === t.id ? `${t.color}18` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1.5px solid ${selected === t.id ? t.color : colors.border}`,
              color: selected === t.id ? t.color : colors.text,
              borderRadius: '0.6rem',
              padding: '0.5rem 0.9rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: selected === t.id ? 700 : 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { if (selected !== t.id) e.currentTarget.style.borderColor = t.color }}
            onMouseLeave={(e) => { if (selected !== t.id) e.currentTarget.style.borderColor = colors.border }}
          >
            <span>{t.icon}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DocPreview({ template, values, colors }) {
  if (!template) return null
  const tc = template.color
  const fields = template.sections.filter((s) => s.type === 'field')
  const sections = template.sections.filter((s) => s.type === 'locked').map((s) => s.text)

  // Group sections with their fields
  const grouped = []
  let currentSection = null
  let currentFields = []
  template.sections.forEach((s) => {
    if (s.type === 'locked') {
      if (currentSection !== null) grouped.push({ heading: currentSection, fields: currentFields })
      currentSection = s.text
      currentFields = []
    } else {
      currentFields.push(s)
    }
  })
  if (currentSection !== null) grouped.push({ heading: currentSection, fields: currentFields })

  return (
    <div style={{ background: '#ffffff', color: '#1e293b', padding: '2.5rem', minHeight: '297mm', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '11pt', lineHeight: 1.6 }}>
      {/* Doc title */}
      <div style={{ borderBottom: `3px solid ${tc}`, paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: tc, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {template.name}
        </h1>
      </div>

      {grouped.map(({ heading, fields: grpFields }) => (
        <div key={heading} style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '10pt', fontWeight: 700, color: tc, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem', fontFamily: 'Arial, Helvetica, sans-serif', borderBottom: `1px solid ${tc}44`, paddingBottom: '0.2rem' }}>
            {heading}
          </h2>
          {grpFields.map((f) => {
            const val = (values[f.id] || '').trim()
            if (!val) return null
            return (
              <div key={f.id} style={{ marginBottom: '0.35rem' }}>
                {grpFields.length > 1 && (
                  <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#334155', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {f.label}:{' '}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre-wrap' }}>{val}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function DocComposer() {
  const { isDark, colors } = useTheme()
  const [templateId, setTemplateId] = useState('cv')
  const [values, setValues] = useState({})
  const [exporting, setExporting] = useState(false)
  const [voice, setVoice] = useState({})  // field id → listening bool
  const previewRef = useRef(null)

  const template = getTemplateById(templateId)

  const handleTemplateChange = useCallback((id) => {
    setTemplateId(id)
    setValues({})
  }, [])

  const handleFieldChange = useCallback((id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }, [])

  const handleExport = useCallback(async () => {
    if (!previewRef.current || exporting) return
    setExporting(true)
    try {
      await exportToPDF(previewRef.current, `typely-${templateId}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }, [templateId, exporting])

  // Web Speech API voice input
  const startVoice = useCallback((fieldId) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice input is not supported in this browser. Try Chrome or Edge.')
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.onstart  = () => setVoice((v) => ({ ...v, [fieldId]: true }))
    rec.onend    = () => setVoice((v) => ({ ...v, [fieldId]: false }))
    rec.onerror  = () => setVoice((v) => ({ ...v, [fieldId]: false }))
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setValues((prev) => ({ ...prev, [fieldId]: (prev[fieldId] || '') + (prev[fieldId] ? ' ' : '') + transcript }))
    }
    rec.start()
  }, [])

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.55rem 0.75rem',
    color: colors.text,
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
    resize: 'vertical',
  }

  return (
    <ToolLayout toolId="doc-composer">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          📄 Doc Composer
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Fill in the fields, preview instantly, and export to PDF.
          <span style={{ color: '#3b82f6', fontWeight: 600 }}> Works offline — nothing is uploaded.</span>
        </p>
      </div>

      <TemplateSelector selected={templateId} onSelect={handleTemplateChange} colors={colors} isDark={isDark} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* ─ Form ─ */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              Fill Details
            </p>
          </div>

          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {template && template.sections.map((section, i) => {
              if (section.type === 'locked') {
                return (
                  <p key={i} style={{
                    color: template.color,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    margin: i === 0 ? '0' : '0.5rem 0 0',
                    borderTop: i > 0 ? `1px solid ${colors.border}` : 'none',
                    paddingTop: i > 0 ? '0.75rem' : 0,
                  }}>
                    {section.text}
                  </p>
                )
              }
              const isListening = voice[section.id]
              return (
                <div key={section.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>
                      {section.label}
                    </label>
                    {section.voice && (
                      <button
                        onClick={() => startVoice(section.id)}
                        title="Voice input"
                        style={{
                          background: isListening ? 'rgba(239,68,68,0.15)' : 'none',
                          border: `1px solid ${isListening ? '#ef4444' : colors.border}`,
                          color: isListening ? '#ef4444' : colors.textSecondary,
                          borderRadius: '0.3rem',
                          padding: '0.1rem 0.4rem',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        {isListening ? '🔴 Listening…' : '🎙 Voice'}
                      </button>
                    )}
                  </div>
                  {section.inputType === 'textarea' ? (
                    <textarea
                      value={values[section.id] || ''}
                      onChange={(e) => handleFieldChange(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      rows={section.rows || 3}
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = template.color }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[section.id] || ''}
                      onChange={(e) => handleFieldChange(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = template.color }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Export & actions */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                background: exporting ? colors.border : `linear-gradient(to right, ${template?.color || '#3b82f6'}, #8b5cf6)`,
                border: 'none', color: 'white',
                borderRadius: '0.6rem', padding: '0.6rem 1.25rem',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: '0.88rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                opacity: exporting ? 0.7 : 1, transition: 'opacity 0.15s',
              }}
            >
              {exporting ? '⏳ Generating…' : '⬇️ Export PDF'}
            </button>
            <button
              onClick={() => setValues({})}
              style={{
                background: 'none', border: `1px solid ${colors.border}`,
                color: colors.textSecondary, borderRadius: '0.6rem',
                padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              ✕ Clear
            </button>
            <Link
              to="/tools/word-counter"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                border: `1px solid ${colors.border}`, color: '#8b5cf6',
                padding: '0.6rem 1rem', borderRadius: '0.6rem',
                textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
              }}
            >
              📊 Word Count
            </Link>
          </div>
        </div>

        {/* ─ Preview ─ */}
        <div>
          <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
            Live Preview
          </p>
          <div style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <div ref={previewRef}>
              <DocPreview template={template} values={values} colors={colors} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
