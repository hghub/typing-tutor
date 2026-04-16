import { useState, useRef, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import RelatedTools from '../components/RelatedTools'

export default function TextExtractor() {
  const { isDark, colors } = useTheme()
  const [tab, setTab] = useState('image')
  const [file, setFile] = useState(null)
  const [lang, setLang] = useState('eng')
  const [status, setStatus] = useState('idle') // idle|init|loading|done|error
  const [progress, setProgress] = useState(0)
  const [pageInfo, setPageInfo] = useState(null)
  const [result, setResult] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()
  const ff = 'system-ui,-apple-system,sans-serif'

  const langs = [
    { value: 'eng', label: 'English' },
    { value: 'urd', label: 'Urdu' },
    { value: 'ara', label: 'Arabic' },
    { value: 'eng+urd', label: 'English + Urdu' },
  ]

  const reset = () => { setFile(null); setStatus('idle'); setResult(''); setProgress(0); setPageInfo(null) }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (f) { setFile(f); setStatus('idle'); setResult('') }
  }, [])

  const copyText = () => navigator.clipboard?.writeText(result)

  const downloadTxt = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = (file?.name || 'extracted') + '.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const extract = async () => {
    if (!file) return
    setStatus('loading'); setProgress(0); setResult('')
    try {
      if (tab === 'image') {
        setStatus('init')
        const { createWorker } = await import('tesseract.js')
        setStatus('loading')
        const worker = await createWorker(lang, 1, {
          logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)) }
        })
        const { data: { text } } = await worker.recognize(file)
        await worker.terminate()
        setResult(text.trim()); setStatus('done')
      } else if (tab === 'pdftext') {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
        const arr = await file.arrayBuffer()
        const pdf = await getDocument({ data: arr }).promise
        let full = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items.map(it => it.str).join(' ').trim()
          full += '=== Page ' + i + ' ===\n' + (text || '(no text)') + '\n\n'
          setProgress(Math.round((i / pdf.numPages) * 100))
        }
        const hasText = full.replace(/=== Page \d+ ===\n/g, '').replace(/\(no text\)\n\n/g, '').trim().length > 20
        setResult(hasText ? full.trim() : '__NO_TEXT__'); setStatus('done')
      } else {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
        const arr = await file.arrayBuffer()
        const pdf = await getDocument({ data: arr }).promise
        setStatus('init')
        const { createWorker } = await import('tesseract.js')
        setStatus('loading')
        const worker = await createWorker(lang)
        let full = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          setPageInfo({ current: i, total: pdf.numPages })
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width; canvas.height = viewport.height
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
          const { data: { text } } = await worker.recognize(canvas)
          full += '=== Page ' + i + ' ===\n' + text.trim() + '\n\n'
          setProgress(Math.round((i / pdf.numPages) * 100))
        }
        await worker.terminate()
        setResult(full.trim()); setStatus('done')
      }
    } catch (err) { console.error(err); setStatus('error') }
  }

  const tabDefs = [
    { id: 'image',   label: '🖼️ Image OCR',    accept: '.jpg,.jpeg,.png,.webp,.bmp' },
    { id: 'pdftext', label: '📄 PDF Text',      accept: '.pdf' },
    { id: 'scanned', label: '🔍 Scanned PDF',   accept: '.pdf' },
  ]
  const activeTab = tabDefs.find(t => t.id === tab)

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: ff }}>
      <ToolsNav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔬 Text Extractor (OCR)</h1>
        <p style={{ color: colors.muted, marginBottom: '1.25rem' }}>
          Extract text from images, PDFs or scanned docs. Supports English, Urdu & Arabic.
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.4rem', padding:'0.25rem', background: isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', borderRadius:'10px', marginBottom:'1.5rem', width:'fit-content', flexWrap:'wrap' }}>
          {tabDefs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); reset() }} style={{
              padding:'0.45rem 1rem', borderRadius:'7px', border:'none', cursor:'pointer',
              fontFamily: ff, fontSize:'0.825rem', fontWeight: tab===t.id ? 600 : 400,
              background: tab===t.id ? (isDark?'#1e293b':'#fff') : 'transparent',
              color: tab===t.id ? colors.text : colors.muted,
              boxShadow: tab===t.id ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Privacy badge */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.875rem',
          background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
          borderRadius:'999px', fontSize:'0.75rem', color:'#10b981', width:'fit-content', marginBottom:'1.25rem' }}>
          <span>📵</span><span>Processed locally — your file never leaves this device</span>
        </div>

        {tab === 'scanned' && (
          <div style={{ padding:'0.75rem 1rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'8px', fontSize:'0.8rem', color: isDark?'#fcd34d':'#92400e', marginBottom:'1.25rem' }}>
            ⚠️ OCR renders each page — may take 30–90 seconds for multi-page documents.
          </div>
        )}

        {/* Language selector */}
        {(tab === 'image' || tab === 'scanned') && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
            <label style={{ fontSize:'0.85rem', color: colors.muted, fontWeight:500 }}>Language:</label>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{
              padding:'0.375rem 0.75rem', background: colors.surface, border:'1px solid '+colors.border,
              borderRadius:'6px', color: colors.text, fontFamily: ff, fontSize:'0.85rem' }}>
              {langs.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        )}

        {/* Drop zone */}
        {!file ? (
          <div onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onClick={() => inputRef.current?.click()}
            style={{ border:'2px dashed '+(drag?'#06b6d4':colors.border), borderRadius:'12px',
              padding:'3rem 2rem', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s',
              background: drag?(isDark?'rgba(6,182,212,0.06)':'rgba(6,182,212,0.04)'):'transparent' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>{tab==='image'?'🖼️':'📄'}</div>
            <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>Drop your file here</div>
            <div style={{ color: colors.muted, fontSize:'0.8rem' }}>Accepts: {activeTab.accept}</div>
            <input ref={inputRef} type='file' accept={activeTab.accept} style={{ display:'none' }} onChange={handleDrop} />
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem',
              background: colors.surface, border:'1px solid '+colors.border, borderRadius:'8px', marginBottom:'1rem' }}>
              <span style={{ fontSize:'1.5rem' }}>{tab==='image'?'🖼️':'📄'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{file.name}</div>
                <div style={{ color: colors.muted, fontSize:'0.75rem' }}>{(file.size/1024/1024).toFixed(2)} MB</div>
              </div>
              <button onClick={reset} style={{ background:'none', border:'none', color: colors.muted, cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            {/* Status indicators */}
            {status === 'idle' && (
              <button onClick={extract} style={{ padding:'0.625rem 1.5rem', background:'#10b981', color:'#fff',
                border:'none', borderRadius:'8px', fontFamily:ff, fontSize:'0.9rem', fontWeight:600, cursor:'pointer' }}>
                🔬 Extract Text
              </button>
            )}
            {status === 'init' && (
              <div style={{ padding:'1rem', background: colors.surface, border:'1px solid '+colors.border, borderRadius:'8px', fontSize:'0.875rem', color: colors.muted }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span>
                  Loading OCR engine... First load may take a few seconds.
                </div>
                <div style={{ marginTop:'0.5rem', height:4, background: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:'30%', background:'#10b981', borderRadius:2, animation:'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            )}
            {status === 'loading' && (
              <div style={{ padding:'1rem', background: colors.surface, border:'1px solid '+colors.border, borderRadius:'8px', fontSize:'0.875rem' }}>
                <div style={{ marginBottom:'0.5rem', color: colors.muted }}>
                  {pageInfo ? `Processing page ${pageInfo.current} of ${pageInfo.total}...` : `Recognizing text... ${progress}%`}
                </div>
                <div style={{ height:6, background: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)', borderRadius:3 }}>
                  <div style={{ height:'100%', width: progress+'%', background:'#10b981', borderRadius:3, transition:'width 0.3s' }} />
                </div>
              </div>
            )}
            {status === 'done' && result === '__NO_TEXT__' && (
              <div style={{ padding:'0.875rem 1rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'8px', fontSize:'0.875rem', color: isDark?'#fcd34d':'#92400e' }}>
                ⚠️ No embedded text found in this PDF. Try the <strong>Scanned PDF</strong> tab to run OCR.
              </div>
            )}
            {status === 'done' && result && result !== '__NO_TEXT__' && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                  <span style={{ fontSize:'0.85rem', color: colors.muted }}>Extracted text:</span>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button onClick={copyText} style={{ padding:'0.3rem 0.75rem', background:'transparent',
                      border:'1px solid '+colors.border, borderRadius:'6px', fontFamily:ff, fontSize:'0.8rem', cursor:'pointer', color: colors.text }}>
                      📋 Copy
                    </button>
                    <button onClick={downloadTxt} style={{ padding:'0.3rem 0.75rem', background:'transparent',
                      border:'1px solid '+colors.border, borderRadius:'6px', fontFamily:ff, fontSize:'0.8rem', cursor:'pointer', color: colors.text }}>
                      ⬇️ .txt
                    </button>
                  </div>
                </div>
                <textarea readOnly value={result} style={{
                  width:'100%', height:300, padding:'0.75rem', background: colors.surface,
                  border:'1px solid '+colors.border, borderRadius:'8px', color: colors.text,
                  fontFamily: 'monospace', fontSize:'0.85rem', lineHeight:1.6, resize:'vertical',
                  boxSizing:'border-box'
                }} />
              </div>
            )}
            {status === 'error' && (
              <div style={{ color:'#ef4444', fontSize:'0.875rem' }}>❌ Extraction failed. Please try a different file.</div>
            )}
          </div>
        )}
      </div>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'0 1rem 3rem' }}>
        <RelatedTools toolId='text-extractor' />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  )
}
