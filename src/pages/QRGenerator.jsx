import { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import QRCode from 'qrcode'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
const ACCENT = '#6366f1'

const TYPES = [
  { id: 'url',   label: '🔗 URL',     placeholder: 'https://example.com' },
  { id: 'text',  label: '💬 Text',    placeholder: 'Any text or message…' },
  { id: 'email', label: '📧 Email',   placeholder: 'someone@example.com' },
  { id: 'phone', label: '📞 Phone',   placeholder: '+92 300 1234567' },
  { id: 'wifi',  label: '📶 WiFi',    placeholder: '' },
]

function buildQRData(type, inputs) {
  switch (type) {
    case 'url':   return inputs.text || ''
    case 'text':  return inputs.text || ''
    case 'email': return `mailto:${inputs.text || ''}`
    case 'phone': return `tel:${inputs.text || ''}`
    case 'wifi':
      return `WIFI:T:${inputs.wifiSec || 'WPA'};S:${inputs.ssid || ''};P:${inputs.wifiPass || ''};;`
    default: return inputs.text || ''
  }
}

export default function QRGenerator() {
  const { isDark, colors } = useTheme()
  const canvasRef = useRef(null)
  const [type, setType] = useState('url')
  const [inputs, setInputs] = useState({ text: 'https://rafiqy.app', ssid: '', wifiPass: '', wifiSec: 'WPA' })
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const qrData = buildQRData(type, inputs)

  useEffect(() => {
    if (!qrData.trim() || !canvasRef.current) { setError(''); return }
    QRCode.toCanvas(canvasRef.current, qrData, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'H',
    }).then(() => setError('')).catch(e => setError(e.message))
  }, [qrData, fgColor, bgColor, size])

  function downloadPNG() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'rafiqy-qr.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function copyImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true); setTimeout(() => setCopied(false), 2000)
      } catch { /* clipboard write not always supported */ }
    })
  }

  const inp = {
    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.6rem 0.85rem',
    color: colors.text,
    fontSize: '0.92rem',
    fontFamily: FONT,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const currentType = TYPES.find(t => t.id === type)

  return (
    <ToolLayout toolId="qr-generator">
      <div style={{ fontFamily: FONT, maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT, margin: '0 0 0.25rem' }}>⬛ QR Code Generator</h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>URL, text, email, phone, WiFi — download PNG</p>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '2rem',
              border: `1px solid ${type === t.id ? ACCENT : colors.border}`,
              background: type === t.id ? ACCENT : 'transparent',
              color: type === t.id ? '#fff' : colors.textSecondary,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
              transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ marginBottom: '1.25rem' }}>
          {type === 'wifi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input value={inputs.ssid} onChange={e => setInputs(p => ({ ...p, ssid: e.target.value }))}
                placeholder="Network name (SSID)" style={inp} />
              <input type="password" value={inputs.wifiPass} onChange={e => setInputs(p => ({ ...p, wifiPass: e.target.value }))}
                placeholder="WiFi password" style={inp} />
              <select value={inputs.wifiSec} onChange={e => setInputs(p => ({ ...p, wifiSec: e.target.value }))} style={inp}>
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password (open)</option>
              </select>
            </div>
          ) : (
            <input
              value={inputs.text}
              onChange={e => setInputs(p => ({ ...p, text: e.target.value }))}
              placeholder={currentType?.placeholder}
              style={inp}
            />
          )}
        </div>

        {/* QR canvas */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1rem',
        }}>
          {error ? (
            <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
          ) : (
            <canvas ref={canvasRef} style={{ borderRadius: '0.5rem', maxWidth: '100%' }} />
          )}

          {/* Download & Copy */}
          <div style={{ display: 'flex', gap: '0.6rem', width: '100%', maxWidth: 256 }}>
            <button onClick={downloadPNG} style={{
              flex: 1, padding: '0.65rem',
              borderRadius: '0.5rem', border: 'none',
              background: ACCENT, color: '#fff',
              fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: FONT,
            }}>⬇ Download PNG</button>
            <button onClick={copyImage} style={{
              flex: 1, padding: '0.65rem',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              background: copied ? '#10b981' : 'transparent',
              color: copied ? '#fff' : colors.textSecondary,
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
            }}>{copied ? '✅ Copied' : '📋 Copy'}</button>
          </div>
        </div>

        {/* Customization */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.75rem' }}>Customize</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Color</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                style={{ width: '100%', height: 36, borderRadius: '0.4rem', border: `1px solid ${colors.border}`, cursor: 'pointer', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={{ width: '100%', height: 36, borderRadius: '0.4rem', border: `1px solid ${colors.border}`, cursor: 'pointer', background: 'transparent' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>Size: {size}px</label>
              <input type="range" min={128} max={512} step={64} value={size}
                onChange={e => setSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: ACCENT }} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
