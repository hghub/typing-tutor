import { useState, useRef, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// Set pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

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

// ── PDF → JPG ──────────────────────────────────────────────────────────────

function PDFtoJPG({ colors, isDark }) {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [allPages, setAllPages] = useState(true)
  const [specificPage, setSpecificPage] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') { setError('Please drop a valid PDF file.'); return }
    setError(''); setResult(null); setThumbnail(null)
    try {
      const ab = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      setFile(f); setPageCount(pdf.numPages); setSpecificPage(1)
    } catch {
      setError('Could not read this PDF. It may be encrypted or damaged.')
    }
  }, [])

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  const convert = async () => {
    if (!file) return
    setProcessing(true); setProgress(0); setError('')
    try {
      const ab = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      const pagesToConvert = allPages
        ? Array.from({ length: pdf.numPages }, (_, i) => i + 1)
        : [Math.max(1, Math.min(specificPage, pdf.numPages))]

      const zip = new JSZip()
      let firstDataUrl = null

      for (let idx = 0; idx < pagesToConvert.length; idx++) {
        const pageNum = pagesToConvert[idx]
        setProgressLabel(`Converting page ${pageNum} of ${pagesToConvert.length}…`)
        setProgress(Math.round((idx / pagesToConvert.length) * 90))

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        if (idx === 0) firstDataUrl = canvas.toDataURL('image/jpeg', 0.9)

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
        const arrayBuf = await blob.arrayBuffer()
        zip.file(`page-${pageNum}.jpg`, arrayBuf)
      }

      setProgress(95); setProgressLabel('Creating ZIP…')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      setProgress(100); setProgressLabel('')
      setResult({ blob: zipBlob, count: pagesToConvert.length, filename: `${file.name.replace('.pdf', '')}-images.zip` })
      setThumbnail(firstDataUrl)
    } catch (e) {
      setError('Conversion failed: ' + e.message)
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => { setFile(null); setPageCount(0); setResult(null); setThumbnail(null); setError(''); setProgress(0) }

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1.5rem' }

  return (
    <>
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
                border: `2px dashed ${dragging ? '#06b6d4' : colors.border}`,
                background: dragging ? (isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
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
                <div style={{ color: '#06b6d4', fontSize: '0.85rem', fontWeight: 600 }}>{pageCount} pages detected</div>
              </div>
              <button onClick={reset} style={{ background: 'none', border: `1px solid ${colors.border}`,
                color: colors.muted, padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                cursor: 'pointer', fontSize: '0.8rem', fontFamily: FONT }}>✕ Remove</button>
            </div>
          )}

          {file && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pages to Convert</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="radio" checked={allPages} onChange={() => setAllPages(true)}
                    style={{ accentColor: '#06b6d4', width: '16px', height: '16px' }} />
                  <span style={{ color: colors.text, fontWeight: 600 }}>Convert all {pageCount} pages</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flexWrap: 'wrap' }}>
                  <input type="radio" checked={!allPages} onChange={() => setAllPages(false)}
                    style={{ accentColor: '#06b6d4', width: '16px', height: '16px' }} />
                  <span style={{ color: colors.text, fontWeight: 600 }}>Specific page:</span>
                  <input type="number" min={1} max={pageCount} value={specificPage}
                    onChange={e => { setAllPages(false); setSpecificPage(Number(e.target.value)) }}
                    style={{ width: '70px', padding: '0.35rem 0.6rem', borderRadius: '0.5rem',
                      border: `1px solid ${colors.border}`, background: colors.surface,
                      color: colors.text, fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }} />
                </label>
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
            processing ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: colors.muted }}>{progressLabel || 'Converting…'}</span>
                  <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%',
                    background: 'linear-gradient(to right, #06b6d4, #38bdf8)',
                    borderRadius: '99px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <button onClick={convert} style={{
                background: 'linear-gradient(to right, #06b6d4, #38bdf8)', color: '#fff',
                border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT,
                boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
              }}>
                🔄 Convert to JPG
              </button>
            )
          )}
        </>
      ) : (
        <div style={{ ...card }}>
          <h2 style={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem' }}>
            ✅ Conversion Complete
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {thumbnail && (
              <img src={thumbnail} alt="First page preview"
                style={{ width: '120px', height: 'auto', borderRadius: '0.5rem',
                  border: `1px solid ${colors.border}`, objectFit: 'contain', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.25rem' }}>Images Ready</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4' }}>{result.count}</div>
              <div style={{ color: colors.muted, fontSize: '0.82rem' }}>JPG file{result.count !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => downloadBlob(result.blob, result.filename)} style={{
              background: 'linear-gradient(to right, #06b6d4, #38bdf8)', color: '#fff',
              border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: FONT,
            }}>
              ⬇️ Download ZIP ({result.count} JPG{result.count !== 1 ? 's' : ''})
            </button>
            <button onClick={reset} style={{
              background: 'none', border: `1px solid ${colors.border}`, color: colors.muted,
              padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: FONT,
            }}>
              🔄 Convert another
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Images → PDF ───────────────────────────────────────────────────────────

function ImagesToPDF({ colors, isDark }) {
  const [images, setImages] = useState([]) // [{file, id, preview}]
  const [dragging, setDragging] = useState(false)
  const [dragOverId, setDragOverId] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const dragItem = useRef(null)

  const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const addImages = useCallback(async (files) => {
    const imgs = Array.from(files).filter(f => ACCEPTED.includes(f.type))
    if (!imgs.length) { setError('Please select JPG, PNG, or WebP images.'); return }
    setError('')
    const entries = await Promise.all(imgs.map(async (f) => {
      const preview = URL.createObjectURL(f)
      return { file: f, id: `${f.name}-${f.size}-${Math.random()}`, preview }
    }))
    setImages(prev => [...prev, ...entries])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = (e) => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files) }
  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id))

  const onDragStart = (id) => { dragItem.current = id }
  const onDragOver = (e, id) => { e.preventDefault(); setDragOverId(id) }
  const onDropItem = (e, targetId) => {
    e.preventDefault(); setDragOverId(null)
    if (!dragItem.current || dragItem.current === targetId) return
    setImages(prev => {
      const arr = [...prev]
      const fromIdx = arr.findIndex(i => i.id === dragItem.current)
      const toIdx = arr.findIndex(i => i.id === targetId)
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      return arr
    })
    dragItem.current = null
  }

  const convert = async () => {
    if (!images.length) return
    setProcessing(true); setProgress(5); setError('')
    try {
      const pdfDoc = await PDFDocument.create()
      for (let i = 0; i < images.length; i++) {
        const bytes = await images[i].file.arrayBuffer()
        let image
        if (images[i].file.type === 'image/png') {
          image = await pdfDoc.embedPng(bytes)
        } else {
          image = await pdfDoc.embedJpg(bytes)
        }
        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
        setProgress(5 + Math.round(((i + 1) / images.length) * 85))
      }
      const pdfBytes = await pdfDoc.save()
      setProgress(100)
      setResult({ bytes: pdfBytes, size: pdfBytes.byteLength, filename: 'images-to-pdf.pdf' })
    } catch (e) {
      setError('Conversion failed: ' + e.message)
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.preview))
    setImages([]); setResult(null); setError(''); setProgress(0)
  }

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1.5rem' }

  return (
    <>
      {!result ? (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              ...card, padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer',
              border: `2px dashed ${dragging ? '#06b6d4' : colors.border}`,
              background: dragging ? (isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
              transition: 'all 0.2s ease', marginBottom: '1rem',
            }}
          >
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple
              style={{ display: 'none' }} onChange={e => addImages(e.target.files)} />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
            <div style={{ fontWeight: 600, color: colors.text, marginBottom: '0.25rem' }}>Drop images here or click to browse</div>
            <div style={{ color: colors.muted, fontSize: '0.82rem' }}>JPG, PNG, WebP — drag thumbnails below to reorder</div>
          </div>

          {images.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Images ({images.length}) — drag ↕ to reorder
              </div>
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => onDragStart(img.id)}
                  onDragOver={(e) => onDragOver(e, img.id)}
                  onDrop={(e) => onDropItem(e, img.id)}
                  onDragEnd={() => setDragOverId(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 1rem', borderRadius: '0.75rem', cursor: 'grab',
                    background: dragOverId === img.id
                      ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.08)')
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    border: `1px solid ${dragOverId === img.id ? '#06b6d4' : colors.border}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: colors.muted, userSelect: 'none' }}>↕</span>
                  <img src={img.preview} alt={img.file.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.375rem',
                      border: `1px solid ${colors.border}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {idx + 1}. {img.file.name}
                    </div>
                    <div style={{ color: colors.muted, fontSize: '0.75rem' }}>{formatBytes(img.file.size)}</div>
                  </div>
                  <button onClick={() => removeImage(img.id)} style={{
                    background: 'none', border: 'none', color: colors.muted, cursor: 'pointer',
                    fontSize: '1rem', padding: '0.25rem', lineHeight: 1,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem',
              padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          {images.length > 0 && (
            processing ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: colors.muted }}>Converting…</span>
                  <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%',
                    background: 'linear-gradient(to right, #06b6d4, #38bdf8)',
                    borderRadius: '99px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <button onClick={convert} style={{
                background: 'linear-gradient(to right, #06b6d4, #38bdf8)', color: '#fff',
                border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT,
                boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
              }}>
                🔄 Convert to PDF
              </button>
            )
          )}
        </>
      ) : (
        <div style={{ ...card }}>
          <h2 style={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem' }}>
            ✅ PDF Created
          </h2>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>File Size</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{formatBytes(result.size)}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => downloadBlob(new Blob([result.bytes], { type: 'application/pdf' }), result.filename)} style={{
              background: 'linear-gradient(to right, #06b6d4, #38bdf8)', color: '#fff',
              border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: FONT,
            }}>
              ⬇️ Download PDF
            </button>
            <button onClick={reset} style={{
              background: 'none', border: `1px solid ${colors.border}`, color: colors.muted,
              padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: FONT,
            }}>
              🔄 Convert another set
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'pdf-to-jpg', label: '📄→🖼️ PDF to JPG' },
  { id: 'images-to-pdf', label: '🖼️→📄 Images to PDF' },
]

export default function PDFConvert() {
  const { isDark, colors } = useTheme()
  const [activeTab, setActiveTab] = useState('pdf-to-jpg')

  return (
    <ToolLayout toolId="pdf-convert">
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.4rem',
            background: 'linear-gradient(to right, #06b6d4, #38bdf8)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
            🔄 PDF Convert
          </h1>
          <p style={{ color: colors.muted, fontSize: '0.9rem', margin: 0 }}>
            Convert PDF pages to JPG images, or combine images into a PDF — 100% in your browser.
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          padding: '0.25rem', borderRadius: '0.75rem', width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '0.55rem 1.1rem', borderRadius: '0.6rem', cursor: 'pointer', fontFamily: FONT,
              border: 'none', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s ease',
              background: activeTab === tab.id ? (isDark ? '#1e293b' : '#fff') : 'transparent',
              color: activeTab === tab.id ? '#06b6d4' : colors.muted,
              boxShadow: activeTab === tab.id ? (isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)') : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'pdf-to-jpg'
          ? <PDFtoJPG colors={colors} isDark={isDark} />
          : <ImagesToPDF colors={colors} isDark={isDark} />
        }
      </div>
    </ToolLayout>
  )
}
