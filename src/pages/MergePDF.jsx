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

async function getPageCount(file) {
  try {
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    return doc.getPageCount()
  } catch {
    return '?'
  }
}

export default function MergePDF() {
  const { isDark, colors } = useTheme()
  const [files, setFiles] = useState([]) // [{file, id, pages}]
  const [dragging, setDragging] = useState(false)
  const [dragOverId, setDragOverId] = useState(null)
  const [compressForWA, setCompressForWA] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const dragItem = useRef(null)

  const addFiles = useCallback(async (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf')
    if (!pdfs.length) { setError('Please select PDF files only.'); return }
    setError('')
    const entries = await Promise.all(pdfs.map(async (f) => ({
      file: f,
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      pages: await getPageCount(f),
    })))
    setFiles(prev => [...prev, ...entries])
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))

  // HTML5 drag-to-reorder
  const onDragStart = (id) => { dragItem.current = id }
  const onDragOver = (e, id) => { e.preventDefault(); setDragOverId(id) }
  const onDropItem = (e, targetId) => {
    e.preventDefault(); setDragOverId(null)
    if (!dragItem.current || dragItem.current === targetId) return
    setFiles(prev => {
      const arr = [...prev]
      const fromIdx = arr.findIndex(f => f.id === dragItem.current)
      const toIdx = arr.findIndex(f => f.id === targetId)
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      return arr
    })
    dragItem.current = null
  }

  const merge = async () => {
    if (files.length < 2) { setError('Add at least 2 PDF files to merge.'); return }
    setProcessing(true); setProgress(5); setError('')
    try {
      const merged = await PDFDocument.create()
      for (let i = 0; i < files.length; i++) {
        const bytes = await files[i].file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const pages = await merged.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(p => merged.addPage(p))
        setProgress(5 + Math.round(((i + 1) / files.length) * 75))
      }
      setProgress(82)

      if (compressForWA) {
        merged.setTitle('')
        merged.setAuthor('')
        merged.setSubject('')
        merged.setKeywords([])
        merged.setProducer('')
        merged.setCreator('')
      }

      const mergedBytes = await merged.save({ useObjectStreams: compressForWA })
      setProgress(100)
      setResult({
        bytes: mergedBytes,
        totalPages: merged.getPageCount(),
        size: mergedBytes.byteLength,
        filename: `merged-${files.length}-files.pdf`,
      })
    } catch (e) {
      setError('Merge failed. One or more PDFs may be encrypted or corrupted.')
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

  const reset = () => { setFiles([]); setResult(null); setError(''); setProgress(0) }

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1.5rem' }

  return (
    <ToolLayout toolId="merge-pdf">
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.4rem',
            background: 'linear-gradient(to right, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
            📎 Merge PDF
          </h1>
          <p style={{ color: colors.muted, fontSize: '0.9rem', margin: 0 }}>
            Combine multiple PDFs into one file — drag to reorder, then merge.
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
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                ...card, padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer',
                border: `2px dashed ${dragging ? '#8b5cf6' : colors.border}`,
                background: dragging ? (isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                transition: 'all 0.2s ease', marginBottom: '1rem',
              }}
            >
              <input ref={inputRef} type="file" accept="application/pdf" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
              <div style={{ fontWeight: 600, color: colors.text, marginBottom: '0.25rem' }}>Drop PDFs here or click to browse</div>
              <div style={{ color: colors.muted, fontSize: '0.82rem' }}>Select multiple files — you can reorder them below</div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Files ({files.length}) — drag ↕ to reorder
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {files.map((entry, idx) => (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={() => onDragStart(entry.id)}
                      onDragOver={(e) => onDragOver(e, entry.id)}
                      onDrop={(e) => onDropItem(e, entry.id)}
                      onDragEnd={() => setDragOverId(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        background: dragOverId === entry.id
                          ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)')
                          : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                        border: `1px solid ${dragOverId === entry.id ? '#8b5cf6' : colors.border}`,
                        cursor: 'grab', transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: colors.muted, fontSize: '1.1rem', cursor: 'grab', userSelect: 'none' }}>↕</span>
                      <span style={{ fontSize: '1.1rem' }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {entry.file.name}
                        </div>
                        <div style={{ color: colors.muted, fontSize: '0.75rem' }}>
                          {formatBytes(entry.file.size)} · {entry.pages} page{entry.pages !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <button onClick={() => removeFile(entry.id)} style={{
                        background: 'none', border: 'none', color: colors.muted, cursor: 'pointer',
                        fontSize: '1rem', padding: '0.25rem', lineHeight: 1, flexShrink: 0,
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp compress toggle */}
            {files.length >= 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${colors.border}`, borderRadius: '0.75rem', marginBottom: '1.25rem',
                cursor: 'pointer' }} onClick={() => setCompressForWA(v => !v)}>
                <div style={{
                  width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0,
                  background: compressForWA ? '#10b981' : (isDark ? '#334155' : '#cbd5e1'),
                  position: 'relative', transition: 'background 0.2s ease',
                }}>
                  <div style={{
                    position: 'absolute', top: '3px', left: compressForWA ? '21px' : '3px',
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: colors.text, fontSize: '0.875rem' }}>
                    📱 Also compress for WhatsApp after merge
                  </div>
                  <div style={{ color: colors.muted, fontSize: '0.75rem' }}>Apply extra compression to keep file under 16 MB</div>
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

            {files.length >= 2 && (
              processing ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: colors.muted }}>Merging…</span>
                    <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div style={{ background: colors.border, borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%',
                      background: 'linear-gradient(to right, #8b5cf6, #a78bfa)',
                      borderRadius: '99px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ) : (
                <button onClick={merge} style={{
                  background: 'linear-gradient(to right, #8b5cf6, #a78bfa)', color: '#fff',
                  border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem',
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT,
                  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                }}>
                  📎 Merge PDFs
                </button>
              )
            )}
          </>
        ) : (
          /* Results */
          <div style={{ ...card }}>
            <h2 style={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem' }}>
              ✅ Merge Complete
            </h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Filename</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>{result.filename}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Pages</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>{result.totalPages}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>File Size</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{formatBytes(result.size)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={download} style={{
                background: 'linear-gradient(to right, #8b5cf6, #a78bfa)', color: '#fff',
                border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: FONT,
              }}>
                ⬇️ Download merged PDF
              </button>
              <button onClick={reset} style={{
                background: 'none', border: `1px solid ${colors.border}`, color: colors.muted,
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
                fontSize: '0.9rem', fontFamily: FONT,
              }}>
                🔄 Merge another set
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
