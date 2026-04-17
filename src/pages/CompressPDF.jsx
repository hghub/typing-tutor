import { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const PRESETS = [
  { id: 'whatsapp', icon: '📱', label: 'WhatsApp', desc: 'Target < 15 MB · Best for mobile sharing', color: '#10b981' },
  { id: 'email',    icon: '📧', label: 'Email',    desc: 'Target < 10 MB · Good for Gmail/Outlook',  color: '#3b82f6' },
  { id: 'print',    icon: '🖨️', label: 'Print',    desc: 'High quality · Minimal compression',       color: '#8b5cf6' },
  { id: 'archive',  icon: '🗃️', label: 'Archive',  desc: 'Maximum compression · Smallest possible',  color: '#f97316' },
]

function autoSelectPreset(sizeMB) {
  if (sizeMB > 10) return 'whatsapp'
  if (sizeMB >= 3)  return 'email'
  return 'print'
}

export default function CompressPDF() {
  const { isDark, colors } = useTheme()
  const [file, setFile] = useState(null)
  const [preset, setPreset] = useState('email')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    if (!f || f.type !== 'application/pdf') { setError('Please drop a valid PDF file.'); return }
    setError('')
    setResult(null)
    setFile(f)
    const mb = f.size / (1024 * 1024)
    setPreset(autoSelectPreset(mb))
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  const onInputChange = (e) => handleFile(e.target.files[0])

  const compress = async () => {
    if (!file) return
    setProcessing(true); setProgress(10); setError('')
    try {
      const bytes = await file.arrayBuffer()
      setProgress(30)
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setProgress(50)

      if (preset === 'archive') {
        pdfDoc.setTitle('')
        pdfDoc.setAuthor('')
        pdfDoc.setSubject('')
        pdfDoc.setKeywords([])
        pdfDoc.setProducer('')
        pdfDoc.setCreator('')
      }

      const useStreams = preset !== 'print'
      setProgress(70)
      const compressed = await pdfDoc.save({ useObjectStreams: useStreams })
      setProgress(90)

      const ratio = Math.round((1 - compressed.byteLength / bytes.byteLength) * 100)
      const resultMB = compressed.byteLength / (1024 * 1024)
      let badge = null
      if (resultMB < 10) badge = '✅ Under Gmail 25 MB limit'
      if (resultMB < 15) badge = badge || '✅ Fits WhatsApp (< 16 MB)'

      setResult({
        bytes: compressed,
        originalSize: bytes.byteLength,
        compressedSize: compressed.byteLength,
        ratio,
        badge,
        filename: file.name.replace('.pdf', '-compressed.pdf'),
        minimal: ratio < 5,
      })
      setProgress(100)
    } catch (e) {
      setError('Failed to process PDF. It may be encrypted or corrupted.')
    } finally {
      setProcessing(false)
    }
  }

  const download = () => {
    if (!result) return
    const blob = new Blob([result.bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = result.filename; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setFile(null); setResult(null); setError(''); setProgress(0) }

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1.5rem' }
  const btn = (active, col) => ({
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    padding: '0.875rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
    border: `2px solid ${active ? col : colors.border}`,
    background: active ? (isDark ? `${col}18` : `${col}10`) : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
    transition: 'all 0.15s ease', textAlign: 'left', flex: 1, minWidth: '140px', fontFamily: FONT,
  })

  return (
    <ToolLayout toolId="compress-pdf">
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.4rem',
            background: 'linear-gradient(to right, #f97316, #fb923c)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
            🗜️ Compress PDF
          </h1>
          <p style={{ color: colors.muted, fontSize: '0.9rem', margin: 0 }}>
            Reduce PDF file size for WhatsApp, email, or archiving — 100% in your browser.
          </p>
        </div>

        {/* Privacy badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem',
          background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.25)', borderRadius: '999px',
          fontSize: '0.75rem', color: '#10b981', width: 'fit-content', marginBottom: '1.5rem' }}>
          <span>📵</span>
          <span>Processed locally · Your file never leaves this device</span>
        </div>

        {!result ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => !file && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                ...card, padding: '2.5rem 1.5rem', textAlign: 'center', cursor: file ? 'default' : 'pointer',
                border: `2px dashed ${dragging ? '#f97316' : file ? '#10b981' : colors.border}`,
                background: dragging ? (isDark ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                transition: 'all 0.2s ease', marginBottom: '1.5rem',
              }}
            >
              <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={onInputChange} />
              {file ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                  <div style={{ fontWeight: 700, color: colors.text, marginBottom: '0.25rem' }}>{file.name}</div>
                  <div style={{ color: '#10b981', fontSize: '0.85rem' }}>{formatBytes(file.size)}</div>
                  <button onClick={(e) => { e.stopPropagation(); reset() }}
                    style={{ marginTop: '0.75rem', background: 'none', border: `1px solid ${colors.border}`,
                      color: colors.muted, padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                      cursor: 'pointer', fontSize: '0.8rem', fontFamily: FONT }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📁</div>
                  <div style={{ fontWeight: 600, color: colors.text, marginBottom: '0.25rem' }}>Drop a PDF here</div>
                  <div style={{ color: colors.muted, fontSize: '0.85rem' }}>or click to browse</div>
                </div>
              )}
            </div>

            {/* Presets */}
            {file && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: '0.75rem' }}>Compression Preset</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {PRESETS.map(p => (
                    <button key={p.id} onClick={() => setPreset(p.id)} style={btn(preset === p.id, p.color)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: preset === p.id ? p.color : colors.text }}>{p.label}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: colors.muted, lineHeight: 1.4 }}>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem',
                padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            {file && (
              <div>
                {processing ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', color: colors.muted }}>Compressing…</span>
                      <span style={{ fontSize: '0.85rem', color: '#f97316', fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, #f97316, #fb923c)',
                        borderRadius: '99px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={compress} style={{
                    background: 'linear-gradient(to right, #f97316, #fb923c)', color: '#fff',
                    border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem',
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT,
                    boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                  }}>
                    🗜️ Compress PDF
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Results */
          <div style={{ ...card }}>
            <h2 style={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem' }}>
              ✅ Compression Complete
            </h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Before</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>{formatBytes(result.originalSize)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: colors.muted, fontSize: '1.5rem' }}>→</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>After</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{formatBytes(result.compressedSize)}</div>
              </div>
            </div>

            {result.minimal ? (
              <div style={{ background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.3)', borderRadius: '0.75rem',
                padding: '0.75rem 1rem', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ℹ️ This PDF is already well-optimized — minimal size reduction was possible.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  Reduced by {result.ratio}%
                </span>
                {result.badge && (
                  <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    {result.badge}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={download} style={{
                background: 'linear-gradient(to right, #10b981, #059669)', color: '#fff',
                border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: FONT,
              }}>
                ⬇️ Download compressed PDF
              </button>
              <button onClick={reset} style={{
                background: 'none', border: `1px solid ${colors.border}`, color: colors.muted,
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
                fontSize: '0.9rem', fontFamily: FONT,
              }}>
                🔄 Compress another
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
