import { useState, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import RelatedTools from '../components/RelatedTools'

function downloadFile(bytes, filename, mime) {
  const blob = new Blob([bytes], { type: mime || 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function DocConverter() {
  const { isDark, colors } = useTheme()
  const [tab, setTab] = useState('docx2pdf')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [pageCount, setPageCount] = useState(0)
  const [resultBytes, setResultBytes] = useState(null)
  const [resultName, setResultName] = useState('')
  const [drag, setDrag] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const inputRef = useRef()

  const ff = 'system-ui,-apple-system,sans-serif'

  const reset = () => { setFile(null); setStatus('idle'); setResultBytes(null); setResultName(''); setPageCount(0); setExtractedText('') }

  const handleDrop = async (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (!f) return
    setFile(f); setStatus('idle'); setResultBytes(null)
    if (tab === 'pdf2docx') {
      try {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
        const arr = await f.arrayBuffer()
        const pdf = await getDocument({ data: arr }).promise
        setPageCount(pdf.numPages)
      } catch {}
    }
  }

  const convert = async () => {
    if (!file) return
    setStatus('loading')
    try {
      if (tab === 'docx2pdf') {
        const mammoth = (await import('mammoth')).default
        const { default: jsPDF } = await import('jspdf')
        const { default: html2canvas } = await import('html2canvas')
        const arr = await file.arrayBuffer()
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: arr })
        const div = document.createElement('div')
        div.innerHTML = html
        div.style.cssText = 'position:fixed;left:-9999px;top:0;width:750px;padding:40px;background:white;font-family:sans-serif;font-size:13px;line-height:1.7;color:#111;'
        document.body.appendChild(div)
        const canvas = await html2canvas(div, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' })
        document.body.removeChild(div)
        const pdf = new jsPDF({ format: 'a4', unit: 'pt' })
        const pw = pdf.internal.pageSize.getWidth()
        const ph = pdf.internal.pageSize.getHeight()
        const imgH = (canvas.height * pw) / canvas.width
        let y = 0
        while (y < imgH) {
          if (y > 0) pdf.addPage()
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, -y, pw, imgH)
          y += ph
        }
        const bytes = pdf.output('arraybuffer')
        setResultBytes(bytes); setResultName(file.name.replace(/\.docx$/i, '.pdf'))
      } else {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
        const { Document, Paragraph, TextRun, Packer } = await import('docx')
        const arr = await file.arrayBuffer()
        const pdf = await getDocument({ data: arr }).promise
        const items = []
        const pageTexts = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items.map(it => it.str).join(' ').trim()
          pageTexts.push(text)
          items.push(new Paragraph({ children: [new TextRun({ text: 'Page ' + i, bold: true, size: 26 })] }))
          if (text) {
            const paras = text.split(/\n\n+/).filter(p => p.trim())
            if (paras.length > 1) {
              for (const para of paras) {
                items.push(new Paragraph({ children: [new TextRun({ text: para.trim(), size: 22 })] }))
              }
            } else {
              items.push(new Paragraph({ children: [new TextRun({ text, size: 22 })] }))
            }
          }
          items.push(new Paragraph({ text: '' }))
        }
        const fullText = pageTexts.filter(t => t).join('\n\n')
        setExtractedText(fullText)
        const doc = new Document({ sections: [{ children: items }] })
        const blob = await Packer.toBlob(doc)
        const bytes = await blob.arrayBuffer()
        setResultBytes(bytes); setResultName(file.name.replace(/\.pdf$/i, '.docx'))
      }
      setStatus('done')
    } catch (e) {
      console.error(e); setStatus('error')
    }
  }

  const tabs = [
    { id: 'docx2pdf', label: '📝 DOCX to PDF', accept: '.docx' },
    { id: 'pdf2docx', label: '📄 PDF to DOCX', accept: '.pdf' },
  ]
  const activeTab = tabs.find(t => t.id === tab)

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: ff }}>
      <ToolsNav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>📝 Doc Converter</h1>
        <p style={{ color: colors.muted, marginBottom: '1.25rem' }}>Convert between DOCX and PDF — entirely in your browser.</p>

        <div style={{ display:'flex', gap:'0.5rem', padding:'0.25rem', background: isDark ? 'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', borderRadius:'10px', marginBottom:'1.5rem', width:'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); reset() }} style={{
              padding:'0.5rem 1.25rem', borderRadius:'8px', border:'none', cursor:'pointer',
              fontFamily: ff, fontSize:'0.875rem', fontWeight: tab===t.id ? 600 : 400,
              background: tab===t.id ? (isDark ? '#1e293b' : '#fff') : 'transparent',
              color: tab===t.id ? colors.text : colors.muted,
              boxShadow: tab===t.id ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.875rem',
          background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
          borderRadius:'999px', fontSize:'0.75rem', color:'#10b981', width:'fit-content', marginBottom:'1.5rem' }}>
          <span>📵</span><span>Processed locally — your file never leaves this device</span>
        </div>

        {tab === 'pdf2docx' && (
          <div style={{ padding:'0.75rem 1rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'8px', fontSize:'0.8rem', color: isDark ? '#fcd34d' : '#92400e', marginBottom:'1.25rem' }}>
            ⚠️ <strong>Note:</strong> Text content is preserved. Complex formatting (tables, images, columns) will not be reproduced.
          </div>
        )}

        {!file ? (
          <div
            onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            onClick={() => inputRef.current?.click()}
            style={{ border: '2px dashed ' + (drag ? '#06b6d4' : colors.border), borderRadius:'12px', padding:'3rem 2rem',
              textAlign:'center', cursor:'pointer', transition:'border-color 0.2s',
              background: drag ? (isDark?'rgba(6,182,212,0.06)':'rgba(6,182,212,0.04)') : 'transparent' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>{tab==='docx2pdf' ? '📝' : '📄'}</div>
            <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>Drop your {tab==='docx2pdf'?'DOCX':'PDF'} here</div>
            <div style={{ color: colors.muted, fontSize:'0.8rem' }}>or click to browse</div>
            <input ref={inputRef} type='file' accept={activeTab.accept} style={{ display:'none' }} onChange={handleDrop} />
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem',
              background: colors.surface, border:'1px solid '+colors.border, borderRadius:'8px', marginBottom:'1rem' }}>
              <span style={{ fontSize:'1.5rem' }}>{tab==='docx2pdf'?'📝':'📄'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{file.name}</div>
                <div style={{ color: colors.muted, fontSize:'0.75rem' }}>
                  {(file.size/1024/1024).toFixed(2)} MB{tab==='pdf2docx' && pageCount ? ' · '+pageCount+' pages' : ''}
                </div>
              </div>
              <button onClick={reset} style={{ background:'none', border:'none', color: colors.muted, cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            {status === 'idle' && (
              <button onClick={convert} style={{ padding:'0.625rem 1.5rem', background:'#3b82f6', color:'#fff',
                border:'none', borderRadius:'8px', fontFamily:ff, fontSize:'0.9rem', fontWeight:600, cursor:'pointer' }}>
                🔄 Convert
              </button>
            )}
            {status === 'loading' && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color: colors.muted, fontSize:'0.875rem' }}>
                <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⚙️</span> Converting...
              </div>
            )}
            {status === 'done' && resultBytes && (
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
                <button onClick={() => downloadFile(resultBytes, resultName, tab==='docx2pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
                  style={{ padding:'0.625rem 1.5rem', background:'#10b981', color:'#fff',
                    border:'none', borderRadius:'8px', fontFamily:ff, fontSize:'0.9rem', fontWeight:600, cursor:'pointer' }}>
                  ⬇️ Download {resultName}
                </button>
                <button onClick={reset} style={{ padding:'0.625rem 1rem', background:'transparent',
                  border:'1px solid '+colors.border, borderRadius:'8px', fontFamily:ff, fontSize:'0.875rem', cursor:'pointer', color: colors.text }}>
                  Convert another
                </button>
              </div>
            )}
            {status === 'error' && (
              <div style={{ color:'#ef4444', fontSize:'0.875rem' }}>❌ Conversion failed. Please try a different file.</div>
            )}
          </div>
        )}
      </div>

      {extractedText && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Extracted Text Preview</h3>
            <button
              onClick={() => navigator.clipboard.writeText(extractedText)}
              style={{ padding: '0.35rem 0.875rem', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: '1px solid ' + colors.border, borderRadius: '6px', cursor: 'pointer',
                fontFamily: ff, fontSize: '0.8rem', color: colors.text }}>
              📋 Copy Text
            </button>
          </div>
          <textarea
            readOnly
            value={extractedText}
            style={{ width: '100%', minHeight: '200px', fontFamily: 'monospace', fontSize: '0.82rem',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: '1px solid ' + colors.border, borderRadius: '8px', padding: '0.75rem',
              color: colors.text, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: '0.75rem', color: colors.muted, margin: '0.4rem 0 0' }}>
            ℹ️ PDF→DOCX preserves text content. Complex formatting (tables, columns) may be simplified.
          </p>
        </div>
      )}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'0 1rem 3rem' }}>
        <RelatedTools toolId='doc-converter' />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
