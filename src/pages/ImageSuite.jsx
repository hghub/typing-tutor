import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const TABS = ['Compress/Resize', 'Format Convert', 'Rotate & Flip', 'Watermark']
const POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageSuite() {
  const { isDark, colors } = useTheme()
  const [tab, setTab] = useState(0)

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
  }

  return (
    <ToolLayout toolId="image-suite">
      <div style={{ color: colors.text }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>🖼️ Image Tools Suite</h1>
        <p style={{ color: colors.textSecondary, marginBottom: '1rem', fontSize: '0.9rem' }}>
          Compress, convert, rotate &amp; watermark images — 100% in your browser.
        </p>
        {/* Privacy notice */}
        <div style={{ ...cardStyle, background: isDark ? '#0f2' + '01a' : '#f0fdf4', border: '1px solid #22c55e', padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span>🔒</span>
          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>Your image never leaves your device — all processing happens in the browser.</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              background: tab === i ? '#8b5cf6' : colors.card,
              color: tab === i ? '#fff' : colors.text,
              outline: tab === i ? '2px solid #8b5cf6' : `1px solid ${colors.border}`,
            }}>{t}</button>
          ))}
        </div>

        {tab === 0 && <CompressTab colors={colors} cardStyle={cardStyle} />}
        {tab === 1 && <ConvertTab colors={colors} cardStyle={cardStyle} />}
        {tab === 2 && <RotateTab colors={colors} cardStyle={cardStyle} />}
        {tab === 3 && <WatermarkTab colors={colors} cardStyle={cardStyle} />}
      </div>
    </ToolLayout>
  )
}

function UploadArea({ onFile, label = 'Click or drag an image here' }) {
  const { colors } = useTheme()
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onFile(f) }}
      style={{
        border: `2px dashed ${dragging ? '#8b5cf6' : colors.border}`,
        borderRadius: '10px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        color: colors.textSecondary,
        fontSize: '0.9rem',
        marginBottom: '1rem',
        background: dragging ? (colors.card) : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
      {label}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }} />
    </div>
  )
}

function SizeComparison({ origSize, outSize, colors }) {
  if (!origSize || !outSize) return null
  const saved = origSize - outSize
  const pct = Math.round((saved / origSize) * 100)
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.85rem' }}>
      <span style={{ color: colors.textSecondary }}>Original: <b style={{ color: colors.text }}>{formatBytes(origSize)}</b></span>
      <span style={{ color: colors.textSecondary }}>Output: <b style={{ color: '#22c55e' }}>{formatBytes(outSize)}</b></span>
      {saved > 0 && <span style={{ color: '#22c55e', fontWeight: 600 }}>Saved {pct}% ({formatBytes(saved)})</span>}
      {saved <= 0 && outSize && <span style={{ color: '#f59e0b', fontWeight: 600 }}>No size reduction</span>}
    </div>
  )
}

// ── Compress / Resize ──────────────────────────────────────────────────────────
function CompressTab({ colors, cardStyle }) {
  const [origFile, setOrigFile] = useState(null)
  const [origImg, setOrigImg] = useState(null)
  const [quality, setQuality] = useState(80)
  const [maxW, setMaxW] = useState(1920)
  const [maxH, setMaxH] = useState(1080)
  const [format, setFormat] = useState('image/jpeg')
  const [outputBlob, setOutputBlob] = useState(null)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef()

  async function handleFile(f) {
    setOrigFile(f)
    setOutputBlob(null)
    const img = await loadImageFromFile(f)
    setOrigImg(img)
  }

  async function process() {
    if (!origImg) return
    setProcessing(true)
    const canvas = canvasRef.current
    let w = origImg.naturalWidth
    let h = origImg.naturalHeight
    const mw = parseInt(maxW) || w
    const mh = parseInt(maxH) || h
    if (w > mw) { h = Math.round(h * (mw / w)); w = mw }
    if (h > mh) { w = Math.round(w * (mh / h)); h = mh }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(origImg, 0, 0, w, h)
    canvas.toBlob(blob => {
      setOutputBlob(blob)
      setProcessing(false)
    }, format, quality / 100)
  }

  function download() {
    if (!outputBlob) return
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp'
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a')
    a.href = url; a.download = `compressed.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={cardStyle}>
        <UploadArea onFile={handleFile} />
        {origImg && (
          <>
            <img src={origImg.src} alt="preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '1rem', objectFit: 'contain' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>JPEG Quality: {quality}%</label>
                <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Max Width (px)</label>
                <input type="number" value={maxW} onChange={e => setMaxW(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Max Height (px)</label>
                <input type="number" value={maxH} onChange={e => setMaxH(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Output Format</label>
                <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text }}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={process} disabled={processing} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{processing ? 'Processing…' : 'Compress'}</button>
              {outputBlob && <button onClick={download} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>⬇ Download</button>}
            </div>
            <SizeComparison origSize={origFile?.size} outSize={outputBlob?.size} colors={colors} />
          </>
        )}
      </div>
    </div>
  )
}

// ── Format Convert ─────────────────────────────────────────────────────────────
function ConvertTab({ colors, cardStyle }) {
  const [origImg, setOrigImg] = useState(null)
  const [targetFmt, setTargetFmt] = useState('image/webp')
  const [outputBlob, setOutputBlob] = useState(null)
  const [origFile, setOrigFile] = useState(null)
  const canvasRef = useRef()

  async function handleFile(f) {
    setOrigFile(f); setOutputBlob(null)
    const img = await loadImageFromFile(f)
    setOrigImg(img)
  }

  function convert() {
    if (!origImg) return
    const canvas = canvasRef.current
    canvas.width = origImg.naturalWidth
    canvas.height = origImg.naturalHeight
    canvas.getContext('2d').drawImage(origImg, 0, 0)
    canvas.toBlob(blob => setOutputBlob(blob), targetFmt, 0.92)
  }

  function download() {
    if (!outputBlob) return
    const ext = targetFmt === 'image/jpeg' ? 'jpg' : targetFmt === 'image/png' ? 'png' : 'webp'
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a'); a.href = url; a.download = `converted.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={cardStyle}>
        <UploadArea onFile={handleFile} />
        {origImg && (
          <>
            <img src={origImg.src} alt="preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '1rem', objectFit: 'contain' }} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Convert to:</label>
              {[['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']].map(([v, l]) => (
                <button key={v} onClick={() => setTargetFmt(v)} style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: targetFmt === v ? '#8b5cf6' : colors.card, color: targetFmt === v ? '#fff' : colors.text, outline: targetFmt === v ? '2px solid #8b5cf6' : `1px solid ${colors.border}` }}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={convert} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Convert</button>
              {outputBlob && <button onClick={download} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>⬇ Download</button>}
            </div>
            <SizeComparison origSize={origFile?.size} outSize={outputBlob?.size} colors={colors} />
          </>
        )}
      </div>
    </div>
  )
}

// ── Rotate & Flip ──────────────────────────────────────────────────────────────
function RotateTab({ colors, cardStyle }) {
  const [origImg, setOrigImg] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [outputUrl, setOutputUrl] = useState(null)
  const [outputBlob, setOutputBlob] = useState(null)
  const canvasRef = useRef()

  async function handleFile(f) {
    setOutputUrl(null); setOutputBlob(null); setRotation(0); setFlipH(false); setFlipV(false)
    const img = await loadImageFromFile(f)
    setOrigImg(img)
  }

  useEffect(() => {
    if (!origImg) return
    const canvas = canvasRef.current
    const r = (rotation * Math.PI) / 180
    const sw = origImg.naturalWidth, sh = origImg.naturalHeight
    const isRotated90 = rotation === 90 || rotation === 270
    canvas.width = isRotated90 ? sh : sw
    canvas.height = isRotated90 ? sw : sh
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(r)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(origImg, -sw / 2, -sh / 2)
    ctx.restore()
    const url = canvas.toDataURL()
    setOutputUrl(url)
    canvas.toBlob(b => setOutputBlob(b))
  }, [origImg, rotation, flipH, flipV])

  function download() {
    if (!outputBlob) return
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a'); a.href = url; a.download = 'rotated.png'; a.click()
    URL.revokeObjectURL(url)
  }

  const btnStyle = (active) => ({
    padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    background: active ? '#8b5cf6' : colors.card,
    color: active ? '#fff' : colors.text,
    outline: active ? '2px solid #8b5cf6' : `1px solid ${colors.border}`,
  })

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={cardStyle}>
        <UploadArea onFile={handleFile} />
        {origImg && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: colors.textSecondary, alignSelf: 'center' }}>Rotate:</span>
              {[90, 180, 270].map(d => (
                <button key={d} onClick={() => setRotation(d)} style={btnStyle(rotation === d)}>{d}°</button>
              ))}
              <button onClick={() => setRotation(0)} style={btnStyle(rotation === 0)}>Reset</button>
              <span style={{ fontSize: '0.85rem', color: colors.textSecondary, alignSelf: 'center', marginLeft: '0.5rem' }}>Flip:</span>
              <button onClick={() => setFlipH(v => !v)} style={btnStyle(flipH)}>↔ Horizontal</button>
              <button onClick={() => setFlipV(v => !v)} style={btnStyle(flipV)}>↕ Vertical</button>
            </div>
            {outputUrl && <img src={outputUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginBottom: '1rem', objectFit: 'contain', border: `1px solid ${colors.border}` }} />}
            {outputBlob && <button onClick={download} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>⬇ Download</button>}
          </>
        )}
      </div>
    </div>
  )
}

// ── Watermark ──────────────────────────────────────────────────────────────────
function WatermarkTab({ colors, cardStyle }) {
  const [origImg, setOrigImg] = useState(null)
  const [text, setText] = useState('© My Brand')
  const [position, setPosition] = useState('bottom-right')
  const [fontSize, setFontSize] = useState(32)
  const [opacity, setOpacity] = useState(70)
  const [color, setColor] = useState('#ffffff')
  const [outputUrl, setOutputUrl] = useState(null)
  const [outputBlob, setOutputBlob] = useState(null)
  const canvasRef = useRef()

  async function handleFile(f) {
    setOutputUrl(null); setOutputBlob(null)
    const img = await loadImageFromFile(f)
    setOrigImg(img)
  }

  const applyWatermark = useCallback(() => {
    if (!origImg || !text) return
    const canvas = canvasRef.current
    canvas.width = origImg.naturalWidth
    canvas.height = origImg.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(origImg, 0, 0)
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity / 100
    const metrics = ctx.measureText(text)
    const tw = metrics.width
    const th = fontSize
    const pad = 20
    const w = canvas.width, h = canvas.height
    let x, y
    const col = position.includes('left') ? 'left' : position.includes('right') ? 'right' : 'center'
    const row = position.includes('top') ? 'top' : position.includes('bottom') ? 'bottom' : 'middle'
    x = col === 'left' ? pad : col === 'right' ? w - tw - pad : (w - tw) / 2
    y = row === 'top' ? th + pad : row === 'bottom' ? h - pad : (h + th) / 2
    ctx.fillText(text, x, y)
    ctx.globalAlpha = 1
    const url = canvas.toDataURL()
    setOutputUrl(url)
    canvas.toBlob(b => setOutputBlob(b))
  }, [origImg, text, position, fontSize, opacity, color])

  useEffect(() => { applyWatermark() }, [applyWatermark])

  function download() {
    if (!outputBlob) return
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a'); a.href = url; a.download = 'watermarked.png'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={cardStyle}>
        <UploadArea onFile={handleFile} />
        {origImg && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Watermark Text</label>
                <input value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Font Size: {fontSize}px</label>
                <input type="range" min={10} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Opacity: {opacity}%</label>
                <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '36px', borderRadius: '6px', border: `1px solid ${colors.border}`, cursor: 'pointer' }} />
              </div>
            </div>
            {/* 3x3 position grid */}
            <label style={{ fontSize: '0.8rem', color: colors.textSecondary, display: 'block', marginBottom: '0.5rem' }}>Position</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px', width: '150px', marginBottom: '1rem' }}>
              {POSITIONS.map(p => (
                <button key={p} onClick={() => setPosition(p)} title={p} style={{ height: '40px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: position === p ? '#8b5cf6' : colors.card, outline: position === p ? '2px solid #8b5cf6' : `1px solid ${colors.border}` }} />
              ))}
            </div>
            {outputUrl && <img src={outputUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginBottom: '1rem', objectFit: 'contain', border: `1px solid ${colors.border}` }} />}
            {outputBlob && <button onClick={download} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>⬇ Download</button>}
          </>
        )}
      </div>
    </div>
  )
}
