import { useState, useRef, useCallback, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import RelatedTools from '../components/RelatedTools'

function searchPages(pages, query) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results = []
  pages.forEach(({ page, text }) => {
    let idx = 0
    while (true) {
      const pos = text.toLowerCase().indexOf(q, idx)
      if (pos === -1) break
      const start = Math.max(0, pos - 60)
      const end = Math.min(text.length, pos + q.length + 60)
      results.push({ page, context: text.slice(start, end), matchStart: pos - start, matchLen: q.length })
      idx = pos + 1
    }
  })
  return results
}

function HighlightedText({ text, start, len }) {
  return (
    <span style={{ fontSize:'0.85rem', lineHeight:1.6 }}>
      {'...' + text.slice(0, start)}
      <span style={{ background:'#fef08a', borderRadius:'2px', padding:'0 2px', color:'#111', fontWeight:600 }}>
        {text.slice(start, start + len)}
      </span>
      {text.slice(start + len) + '...'}
    </span>
  )
}

export default function PDFSearch() {
  const { isDark, colors } = useTheme()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [noText, setNoText] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()
  const debounceRef = useRef()
  const ff = 'system-ui,-apple-system,sans-serif'

  const reset = () => { setFile(null); setPages([]); setQuery(''); setResults([]); setNoText(false) }

  const handleDrop = useCallback(async (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (!f) return
    setFile(f); setLoading(true); setPages([]); setNoText(false); setQuery(''); setResults([])
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
      const arr = await f.arrayBuffer()
      const pdf = await getDocument({ data: arr }).promise
      const extracted = []
      let totalWords = 0
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map(it => it.str).join(' ').trim()
        extracted.push({ page: i, text })
        totalWords += text.split(/\s+/).filter(Boolean).length
      }
      if (totalWords < 20) { setNoText(true) } else { setPages(extracted) }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (pages.length && query.trim()) setResults(searchPages(pages, query))
      else setResults([])
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, pages])

  const uniquePages = [...new Set(results.map(r => r.page))].length

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: ff }}>
      <ToolsNav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔎 PDF Search</h1>
        <p style={{ color: colors.muted, marginBottom: '1.25rem' }}>Upload a PDF and instantly search any keyword — see every match with context.</p>

        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.875rem',
          background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
          borderRadius:'999px', fontSize:'0.75rem', color:'#10b981', width:'fit-content', marginBottom:'1.5rem' }}>
          <span>📵</span><span>Processed locally — your file never leaves this device</span>
        </div>

        {!file ? (
          <div onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onClick={() => inputRef.current?.click()}
            style={{ border:'2px dashed '+(drag?'#f59e0b':colors.border), borderRadius:'12px', padding:'3rem 2rem',
              textAlign:'center', cursor:'pointer', transition:'border-color 0.2s',
              background: drag?(isDark?'rgba(245,158,11,0.06)':'rgba(245,158,11,0.04)'):'transparent' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🔎</div>
            <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>Drop a PDF to search</div>
            <div style={{ color: colors.muted, fontSize:'0.8rem' }}>Works on text-based PDFs</div>
            <input ref={inputRef} type='file' accept='.pdf' style={{ display:'none' }} onChange={handleDrop} />
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem',
              background: colors.surface, border:'1px solid '+colors.border, borderRadius:'8px', marginBottom:'1rem' }}>
              <span style={{ fontSize:'1.5rem' }}>📄</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{file.name}</div>
                <div style={{ color: colors.muted, fontSize:'0.75rem' }}>
                  {loading ? 'Indexing...' : noText ? 'Scanned PDF — no text found' : pages.length + ' pages indexed · ' + pages.reduce((a,p)=>a+p.text.split(/\s+/).filter(Boolean).length,0).toLocaleString() + ' words'}
                </div>
              </div>
              <button onClick={reset} style={{ background:'none', border:'none', color: colors.muted, cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            {loading && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color: colors.muted, fontSize:'0.875rem', marginBottom:'1rem' }}>
                <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span> Indexing PDF...
              </div>
            )}

            {noText && (
              <div style={{ padding:'0.875rem 1rem', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'8px', fontSize:'0.875rem', color: isDark?'#fcd34d':'#92400e' }}>
                ⚠️ This appears to be a scanned PDF with no embedded text. Use{' '}
                <a href='/tools/text-extractor' style={{ color:'#f59e0b' }}>Text Extractor (OCR)</a> to extract text first.
              </div>
            )}

            {pages.length > 0 && (
              <div>
                <input
                  type='text'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Search for any word or phrase...'
                  style={{ width:'100%', padding:'0.75rem 1rem', background: colors.surface,
                    border:'1px solid '+colors.border, borderRadius:'8px', color: colors.text,
                    fontFamily: ff, fontSize:'1rem', marginBottom:'0.75rem', boxSizing:'border-box' }}
                  autoFocus
                />

                {query.trim() && (
                  <div style={{ fontSize:'0.8rem', color: colors.muted, marginBottom:'0.75rem' }}>
                    {results.length === 0
                      ? 'No matches found'
                      : `Found ${results.length} match${results.length>1?'es':''} across ${uniquePages} page${uniquePages>1?'s':''}`
                    }
                  </div>
                )}

                {results.map((r, i) => (
                  <div key={i} style={{ padding:'0.75rem 1rem', background: colors.surface,
                    border:'1px solid '+colors.border, borderRadius:'8px', marginBottom:'0.5rem' }}>
                    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#f59e0b', marginBottom:'0.35rem' }}>
                      Page {r.page}
                    </div>
                    <HighlightedText text={r.context} start={r.matchStart} len={r.matchLen} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'0 1rem 3rem' }}>
        <RelatedTools toolId='pdf-search' />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
