import { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const MODES = [
  { id: 'first',  icon: '📄', label: 'Extract first page',         desc: 'Most common use case' },
  { id: 'all',    icon: '📋', label: 'Split into individual pages', desc: 'One PDF per page — downloaded as ZIP' },
  { id: 'custom', icon: '✂️', label: 'Custom range',                desc: 'Specify start and end page' },
]

export default function SplitPDF() {
  const { isDark, colors } = useTheme()
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [mode, setMode] = useState('first')
  const [fromPage, setFromPage] = useState(1)
  const [toPage, setToPage] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') { setError('Please drop a valid PDF file.'); return }
    setError(''); setResult(null)
    try {
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const count = doc.getPageCount()
      setFile(f); setTotalPages(count)
      setFromPage(1); setToPage(count)
    } catch {
      setError('Could not read this PDF. It may be encrypted or damaged.')
    }
  }, [])

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  const split = async () => {
    if (!file) return
    setProcessing(true); setProgress(5); setError('')
    try {
      const srcBytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(srcBytes, { ignoreEncryption: true })

      let indices = []
      if (mode === 'first') {
        indices = [0]
      } else if (mode === 'all') {
        indices = Array.from({ length: totalPages }, (_, i) => i)
      } else {
        const f = Math.max(1, Math.min(fromPage, totalPages))
        const t = Math.max(f, Math.min(toPage, totalPages))
        indices = Array.from({ length: t - f + 1 }, (_, i) => f - 1 + i)
      }

      setProgress(20)

      if (indices.length === 1) {
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(srcPdf, indices)
        newPdf.addPage(page)
        const bytes = await newPdf.save()
        setProgress(100)
        setResult({ type: 'single', bytes, size: bytes.byteLength, filename: `page-${indices[0] + 1}.pdf` })
      } else {
        const zip = new JSZip()
        for (let i = 0; i < indices.length; i++) {
          const newPdf = await PDFDocument.create()
          const [page] = await newPdf.copyPages(srcPdf, [indices[i]])
          newPdf.addPage(page)
          const bytes = await newPdf.save()
          zip.file(`page-${indices[i] + 1}.pdf`, bytes)
          setProgress(20 + Math.round(((i + 1) / indices.length) * 70))
        }
        setProgress(92)
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        setProgress(100)
        setResult({ type: 'zip', blob: zipBlob, count: indices.length, filename: `split-${indices.length}-pages.zip` })
      }
    } catch (e) {
      setError('Split failed. The PDF may be encrypted or corrupted.')
    } finally {
      setProcessing(false)
    }
  }

  const download = () => {
    if (!result) return
    if (result.type === 'single') {
      downloadBlob(new Blob([result.bytes], { type: 'application/pdf' }), result.filename)
    } else {
      downloadBlob(result.blob, result.filename)
    }
  }

  const reset = () => { setFile(null); setTotalPages(0); setResult(null); setError(''); setProgress(0) }

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1.5rem' }
  const modeBtn = (active) => ({
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    padding: '0.875rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
    border: `2px solid ${active ? '#ec4899' : colors.border}`,
    background: active ? (isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.06)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
    transition: 'all 0.15s ease', textAlign: 'left', width: '100%', fontFamily: FONT,
  })

  return (
    <ToolLayout toolId="split-pdf">
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.4rem',
            background: 'linear-gradient(to right, #ec4899, #f472b6)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
            ✂️ Split PDF
          </h1>
          <p style={{ color: colors.muted, fontSize: '0.9rem', margin: 0 }}>
            Extract specific pages or split a PDF into separate files — 100% in your browser.
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
            {!file ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{
                  ...card, padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                  border: `2px dashed ${dragging ? '#ec4899' : colors.border}`,
                  background: dragging ? (isDark ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                  transition: 'all 0.2s ease', marginBottom: '1.5rem',
                }}
              >
                <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📁</div>
                <div style={{ fontWeight: 600, color: colors.text, marginBottom: '0.25rem' }}>Drop a PDF here</div>
                <div style={{ color: colors.muted, fontSize: '0.85rem' }}>or click to browse</div>
              </div>
            ) : (
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: colors.text }}>{file.name}</div>
                  <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    {totalPages} pages detected · {formatBytes(file.size)}
                  </div>
                </div>
                <button onClick={reset} style={{ background: 'none', border: `1px solid ${colors.border}`,
                  color: colors.muted, padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                  cursor: 'pointer', fontSize: '0.8rem', fontFamily: FONT }}>✕ Remove</button>
              </div>
            )}

            {/* Mode selection */}
            {file && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: '0.75rem' }}>Split Mode</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {MODES.map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)} style={modeBtn(mode === m.id)}>
                      <span style={{ fontSize: '1.2rem', marginTop: '0.05rem' }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: mode === m.id ? '#ec4899' : colors.text, fontSize: '0.9rem' }}>{m.label}</div>
                        <div style={{ color: colors.muted, fontSize: '0.75rem' }}>{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom range inputs */}
                {mode === 'custom' && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem',
                    padding: '1rem', background: isDark ? 'rgba(236,72,153,0.06)' : 'rgba(236,72,153,0.04)',
                    border: '1px solid rgba(236,72,153,0.2)', borderRadius: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ color: colors.text, fontSize: '0.875rem', fontWeight: 600 }}>From page:</label>
                      <input type="number" min={1} max={totalPages} value={fromPage}
                        onChange={e => setFromPage(Number(e.target.value))}
                        style={{ width: '70px', padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
                          border: `1px solid ${colors.border}`, background: colors.surface,
                          color: colors.text, fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ color: colors.text, fontSize: '0.875rem', fontWeight: 600 }}>To page:</label>
                      <input type="number" min={fromPage} max={totalPages} value={toPage}
                        onChange={e => setToPage(Number(e.target.value))}
                        style={{ width: '70px', padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
                          border: `1px solid ${colors.border}`, background: colors.surface,
                          color: colors.text, fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }} />
                    </div>
                    <span style={{ color: colors.muted, fontSize: '0.8rem' }}>of {totalPages} pages</span>
                  </div>
                )}
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
              processing ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: colors.muted }}>Processing…</span>
                    <span style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%',
                      background: 'linear-gradient(to right, #ec4899, #f472b6)',
                      borderRadius: '99px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ) : (
                <button onClick={split} style={{
                  background: 'linear-gradient(to right, #ec4899, #f472b6)', color: '#fff',
                  border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem',
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT,
                  boxShadow: '0 4px 14px rgba(236,72,153,0.35)',
                }}>
                  ✂️ Split / Extract
                </button>
              )
            )}
          </>
        ) : (
          /* Results */
          <div style={{ ...card }}>
            <h2 style={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem' }}>
              ✅ Done!
            </h2>
            {result.type === 'single' ? (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Extracted Page</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{formatBytes(result.size)}</div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Pages Extracted</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ec4899' }}>{result.count} PDF files</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={download} style={{
                background: 'linear-gradient(to right, #ec4899, #f472b6)', color: '#fff',
                border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: FONT,
              }}>
                {result.type === 'single' ? '⬇️ Download PDF' : `⬇️ Download ZIP (${result.count} files)`}
              </button>
              <button onClick={reset} style={{
                background: 'none', border: `1px solid ${colors.border}`, color: colors.muted,
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
                fontSize: '0.9rem', fontFamily: FONT,
              }}>
                🔄 Split another
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
