import { useState, useEffect, useCallback, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#a855f7'
const STORAGE_KEY = 'typely_palettes'

/* ─── Color Math ─────────────────────────────────────────────────────────── */

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h, s
  const l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      default: h = ((rn - gn) / d + 4) / 6
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb({ h, s, l }) {
  const hn = h / 360, sn = s / 100, ln = l / 100
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p, q, t) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl))
}

function rotateHue(hsl, deg) {
  return { ...hsl, h: (hsl.h + deg + 360) % 360 }
}

function relativeLuminance({ r, g, b }) {
  const lin = v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1))
  const l2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/* ─── Palette Generators ─────────────────────────────────────────────────── */

const MODES = [
  { id: 'complementary', label: 'Complementary', count: 2 },
  { id: 'triadic', label: 'Triadic', count: 3 },
  { id: 'analogous', label: 'Analogous', count: 5 },
  { id: 'split-complementary', label: 'Split-Comp', count: 3 },
  { id: 'tetradic', label: 'Tetradic', count: 4 },
  { id: 'monochromatic', label: 'Monochromatic', count: 5 },
]

function generatePalette(seedHex, mode) {
  const rgb = hexToRgb(seedHex)
  const hsl = rgbToHsl(rgb)

  switch (mode) {
    case 'complementary':
      return [seedHex, hslToHex(rotateHue(hsl, 180))]
    case 'triadic':
      return [seedHex, hslToHex(rotateHue(hsl, 120)), hslToHex(rotateHue(hsl, 240))]
    case 'analogous':
      return [
        hslToHex(rotateHue(hsl, -60)),
        hslToHex(rotateHue(hsl, -30)),
        seedHex,
        hslToHex(rotateHue(hsl, 30)),
        hslToHex(rotateHue(hsl, 60)),
      ]
    case 'split-complementary':
      return [seedHex, hslToHex(rotateHue(hsl, 150)), hslToHex(rotateHue(hsl, 210))]
    case 'tetradic':
      return [
        seedHex,
        hslToHex(rotateHue(hsl, 90)),
        hslToHex(rotateHue(hsl, 180)),
        hslToHex(rotateHue(hsl, 270)),
      ]
    case 'monochromatic': {
      const lightnesses = [20, 35, hsl.l, 65, 80]
      return lightnesses.map(l => hslToHex({ ...hsl, l: Math.min(95, Math.max(5, l)) }))
    }
    default:
      return [seedHex]
  }
}

/* ─── CSS Color Name Lookup (~140 basic names) ───────────────────────────── */

const CSS_COLOR_NAMES = {
  '#f0f8ff': 'AliceBlue', '#faebd7': 'AntiqueWhite', '#00ffff': 'Aqua',
  '#7fffd4': 'Aquamarine', '#f0ffff': 'Azure', '#f5f5dc': 'Beige',
  '#ffe4c4': 'Bisque', '#000000': 'Black', '#ffebcd': 'BlanchedAlmond',
  '#0000ff': 'Blue', '#8a2be2': 'BlueViolet', '#a52a2a': 'Brown',
  '#deb887': 'BurlyWood', '#5f9ea0': 'CadetBlue', '#7fff00': 'Chartreuse',
  '#d2691e': 'Chocolate', '#ff7f50': 'Coral', '#6495ed': 'CornflowerBlue',
  '#fff8dc': 'Cornsilk', '#dc143c': 'Crimson', '#00008b': 'DarkBlue',
  '#008b8b': 'DarkCyan', '#b8860b': 'DarkGoldenRod', '#a9a9a9': 'DarkGray',
  '#006400': 'DarkGreen', '#bdb76b': 'DarkKhaki', '#8b008b': 'DarkMagenta',
  '#556b2f': 'DarkOliveGreen', '#ff8c00': 'DarkOrange', '#9932cc': 'DarkOrchid',
  '#8b0000': 'DarkRed', '#e9967a': 'DarkSalmon', '#8fbc8f': 'DarkSeaGreen',
  '#483d8b': 'DarkSlateBlue', '#2f4f4f': 'DarkSlateGray', '#00ced1': 'DarkTurquoise',
  '#9400d3': 'DarkViolet', '#ff1493': 'DeepPink', '#00bfff': 'DeepSkyBlue',
  '#696969': 'DimGray', '#1e90ff': 'DodgerBlue', '#b22222': 'FireBrick',
  '#fffaf0': 'FloralWhite', '#228b22': 'ForestGreen', '#ff00ff': 'Fuchsia',
  '#dcdcdc': 'Gainsboro', '#f8f8ff': 'GhostWhite', '#ffd700': 'Gold',
  '#daa520': 'GoldenRod', '#808080': 'Gray', '#008000': 'Green',
  '#adff2f': 'GreenYellow', '#f0fff0': 'HoneyDew', '#ff69b4': 'HotPink',
  '#cd5c5c': 'IndianRed', '#4b0082': 'Indigo', '#fffff0': 'Ivory',
  '#f0e68c': 'Khaki', '#e6e6fa': 'Lavender', '#fff0f5': 'LavenderBlush',
  '#7cfc00': 'LawnGreen', '#fffacd': 'LemonChiffon', '#add8e6': 'LightBlue',
  '#f08080': 'LightCoral', '#e0ffff': 'LightCyan', '#fafad2': 'LightGoldenRodYellow',
  '#d3d3d3': 'LightGray', '#90ee90': 'LightGreen', '#ffb6c1': 'LightPink',
  '#ffa07a': 'LightSalmon', '#20b2aa': 'LightSeaGreen', '#87cefa': 'LightSkyBlue',
  '#778899': 'LightSlateGray', '#b0c4de': 'LightSteelBlue', '#ffffe0': 'LightYellow',
  '#00ff00': 'Lime', '#32cd32': 'LimeGreen', '#faf0e6': 'Linen',
  '#800000': 'Maroon', '#66cdaa': 'MediumAquaMarine', '#0000cd': 'MediumBlue',
  '#ba55d3': 'MediumOrchid', '#9370db': 'MediumPurple', '#3cb371': 'MediumSeaGreen',
  '#7b68ee': 'MediumSlateBlue', '#00fa9a': 'MediumSpringGreen', '#48d1cc': 'MediumTurquoise',
  '#c71585': 'MediumVioletRed', '#191970': 'MidnightBlue', '#f5fffa': 'MintCream',
  '#ffe4e1': 'MistyRose', '#ffe4b5': 'Moccasin', '#ffdead': 'NavajoWhite',
  '#000080': 'Navy', '#fdf5e6': 'OldLace', '#808000': 'Olive',
  '#6b8e23': 'OliveDrab', '#ffa500': 'Orange', '#ff4500': 'OrangeRed',
  '#da70d6': 'Orchid', '#eee8aa': 'PaleGoldenRod', '#98fb98': 'PaleGreen',
  '#afeeee': 'PaleTurquoise', '#db7093': 'PaleVioletRed', '#ffefd5': 'PapayaWhip',
  '#ffdab9': 'PeachPuff', '#cd853f': 'Peru', '#ffc0cb': 'Pink',
  '#dda0dd': 'Plum', '#b0e0e6': 'PowderBlue', '#800080': 'Purple',
  '#ff0000': 'Red', '#bc8f8f': 'RosyBrown', '#4169e1': 'RoyalBlue',
  '#8b4513': 'SaddleBrown', '#fa8072': 'Salmon', '#f4a460': 'SandyBrown',
  '#2e8b57': 'SeaGreen', '#fff5ee': 'SeaShell', '#a0522d': 'Sienna',
  '#c0c0c0': 'Silver', '#87ceeb': 'SkyBlue', '#6a5acd': 'SlateBlue',
  '#708090': 'SlateGray', '#fffafa': 'Snow', '#00ff7f': 'SpringGreen',
  '#4682b4': 'SteelBlue', '#d2b48c': 'Tan', '#008080': 'Teal',
  '#d8bfd8': 'Thistle', '#ff6347': 'Tomato', '#40e0d0': 'Turquoise',
  '#ee82ee': 'Violet', '#f5deb3': 'Wheat', '#ffffff': 'White',
  '#f5f5f5': 'WhiteSmoke', '#ffff00': 'Yellow', '#9acd32': 'YellowGreen',
}

function closestColorName(hex) {
  const { r: r1, g: g1, b: b1 } = hexToRgb(hex)
  let bestName = 'Custom'
  let bestDist = Infinity
  for (const [knownHex, name] of Object.entries(CSS_COLOR_NAMES)) {
    const { r: r2, g: g2, b: b2 } = hexToRgb(knownHex)
    const dist = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
    if (dist < bestDist) {
      bestDist = dist
      bestName = name
    }
  }
  return bestName
}

/* ─── Luminance helper for text contrast on swatches ────────────────────── */

function isDarkColor(hex) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */

function Toast({ msg }) {
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', color: '#fff', padding: '0.6rem 1.4rem',
      borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 9999,
      pointerEvents: 'none', whiteSpace: 'nowrap',
      animation: 'fadeInUp 0.2s ease',
    }}>
      {msg}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ColorPalette() {
  const { colors } = useTheme()

  const [seedHex, setSeedHex] = useState('#a855f7')
  const [hexInput, setHexInput] = useState('#a855f7')
  const [mode, setMode] = useState('complementary')
  const [palette, setPalette] = useState(() => generatePalette('#a855f7', 'complementary'))
  const [toast, setToast] = useState(null)
  const [contrastA, setContrastA] = useState(null)
  const [contrastB, setContrastB] = useState(null)
  const [recentPalettes, setRecentPalettes] = useState([])
  const toastTimer = useRef(null)

  /* Load recent palettes from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setRecentPalettes(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  /* Regenerate palette when seed or mode changes */
  useEffect(() => {
    const newPalette = generatePalette(seedHex, mode)
    setPalette(newPalette)
    // Save to recent palettes
    setRecentPalettes(prev => {
      const entry = { seed: seedHex, mode, colors: newPalette, ts: Date.now() }
      const deduped = prev.filter(p => !(p.seed === seedHex && p.mode === mode))
      const next = [entry, ...deduped].slice(0, 5)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    setContrastA(null)
    setContrastB(null)
  }, [seedHex, mode])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const copyToClipboard = useCallback(async (text, msg = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(msg)
    } catch {
      showToast('Copy failed')
    }
  }, [showToast])

  /* Sync color picker → hex input */
  const handlePickerChange = (e) => {
    const val = e.target.value
    setSeedHex(val)
    setHexInput(val)
  }

  /* Sync hex text → color picker */
  const handleHexInput = (e) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setSeedHex(val.toLowerCase())
    }
  }

  /* Swatch click: copy hex, or select for contrast checker */
  const handleSwatchClick = (hex) => {
    if (contrastA === null) {
      copyToClipboard(hex)
    } else if (contrastA !== null && contrastB === null) {
      if (hex !== contrastA) setContrastB(hex)
    }
  }

  /* Export helpers */
  const exportCSS = () => {
    const vars = palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')
    copyToClipboard(`:root {\n${vars}\n}`, 'CSS variables copied!')
  }

  const exportJSON = () => {
    copyToClipboard(JSON.stringify(palette, null, 2), 'JSON copied!')
  }

  const exportTailwind = () => {
    const obj = palette.reduce((acc, c, i) => {
      acc[`palette-${i + 1}`] = c
      return acc
    }, {})
    const str = `colors: ${JSON.stringify(obj, null, 2)}`
    copyToClipboard(str, 'Tailwind config copied!')
  }

  /* Derived info */
  const seedRgb = hexToRgb(seedHex)
  const seedHsl = rgbToHsl(seedRgb)
  const colorName = closestColorName(seedHex)
  const complementHex = hslToHex(rotateHue(seedHsl, 180))

  const contrastInfo = contrastA && contrastB
    ? (() => {
        const ratio = contrastRatio(contrastA, contrastB)
        const r = Math.round(ratio * 100) / 100
        return {
          ratio: r,
          normalAA: ratio >= 4.5,
          normalAAA: ratio >= 7,
          largeAA: ratio >= 3,
          largeAAA: ratio >= 4.5,
        }
      })()
    : null

  /* ── Styles ────────────────────────────────────────────────────────────── */

  const sectionStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  }

  const labelStyle = {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: '0.5rem',
    display: 'block',
  }

  const btnBase = {
    padding: '0.45rem 1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }

  const activeBtnStyle = {
    ...btnBase,
    background: ACCENT,
    color: '#fff',
    border: `1px solid ${ACCENT}`,
  }

  const exportBtnStyle = {
    ...btnBase,
    background: colors.cardBg,
    color: ACCENT,
    border: `1px solid ${ACCENT}`,
    fontSize: '0.8rem',
  }

  const pillBadge = (pass, label) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: pass ? '#16a34a22' : '#dc262622',
    color: pass ? '#16a34a' : '#dc2626',
    border: `1px solid ${pass ? '#16a34a44' : '#dc262644'}`,
  })

  return (
    <ToolLayout toolId="color-palette">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .cp-swatch:hover { transform: translateY(-4px) scale(1.03); }
        .cp-swatch:active { transform: scale(0.97); }
        .cp-mode-btn:hover { opacity: 0.85; }
        .cp-export-btn:hover { background: ${ACCENT} !important; color: #fff !important; }
        .cp-recent-swatch:hover { transform: scale(1.08); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.text, margin: 0 }}>
          🎨 Color Palette Generator
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '0.4rem', fontSize: '0.9rem' }}>
          Generate beautiful color harmonies, check contrast, and export for your projects.
        </p>
      </div>

      {/* ── Section 1: Seed Color + Mode ──────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Seed color picker */}
          <div>
            <span style={labelStyle}>Seed Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: '3rem', height: '3rem' }}>
                <input
                  type="color"
                  value={seedHex}
                  onChange={handlePickerChange}
                  style={{
                    width: '3rem', height: '3rem', borderRadius: '0.5rem',
                    border: `2px solid ${colors.inputBorder}`,
                    cursor: 'pointer', padding: '2px',
                    background: 'none',
                  }}
                  title="Pick a seed color"
                />
              </div>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInput}
                maxLength={7}
                placeholder="#a855f7"
                style={{
                  width: '7rem', padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem', border: `1px solid ${colors.inputBorder}`,
                  background: colors.input, color: colors.text,
                  fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600,
                  outline: 'none',
                }}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Palette mode buttons */}
          <div style={{ flex: 1, minWidth: '20rem' }}>
            <span style={labelStyle}>Harmony Mode</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  className="cp-mode-btn"
                  onClick={() => setMode(m.id)}
                  style={mode === m.id ? activeBtnStyle : btnBase}
                  title={`${m.label} (${m.count} colors)`}
                >
                  {m.label}
                  <span style={{ marginLeft: '0.3rem', opacity: 0.6, fontSize: '0.72rem' }}>
                    ×{m.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Palette Swatches ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={labelStyle}>
            Generated Palette
            <span style={{ color: ACCENT, marginLeft: '0.4rem' }}>
              ({MODES.find(m => m.id === mode)?.label})
            </span>
          </span>
          {contrastA === null && (
            <span style={{ fontSize: '0.75rem', color: colors.muted }}>
              Click a swatch to copy its hex
            </span>
          )}
          {contrastA !== null && contrastB === null && (
            <span style={{ fontSize: '0.75rem', color: ACCENT }}>
              🎯 Now click a second swatch for contrast check
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${palette.length}, minmax(120px, 1fr))`,
          gap: '1rem',
        }}>
          {palette.map((hex, i) => {
            const rgb = hexToRgb(hex)
            const hsl = rgbToHsl(rgb)
            const textCol = isDarkColor(hex) ? '#ffffff' : '#000000'
            const isSelectedA = contrastA === hex
            const isSelectedB = contrastB === hex
            const highlight = isSelectedA || isSelectedB

            return (
              <div
                key={i}
                className="cp-swatch"
                onClick={() => handleSwatchClick(hex)}
                style={{
                  background: hex,
                  borderRadius: '0.75rem',
                  padding: '1rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: highlight
                    ? `0 0 0 3px ${ACCENT}, 0 4px 16px rgba(0,0,0,0.2)`
                    : '0 2px 8px rgba(0,0,0,0.15)',
                  minHeight: '9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  position: 'relative',
                }}
                title={`Click to copy ${hex}`}
              >
                {highlight && (
                  <div style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: ACCENT, color: '#fff',
                    borderRadius: '50%', width: '1.4rem', height: '1.4rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                  }}>
                    {isSelectedA ? 'A' : 'B'}
                  </div>
                )}
                <div style={{ color: textCol, fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  <div style={{ fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{hex.toUpperCase()}</div>
                  <div style={{ opacity: 0.8 }}>rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                  <div style={{ opacity: 0.8 }}>hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Contrast Checker ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Contrast Checker (WCAG)</span>
        <p style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: 0, marginBottom: '1rem' }}>
          Select two swatches above (they'll be labelled A and B) to check WCAG compliance.
        </p>

        {!contrastA && (
          <button
            onClick={() => setContrastA('__awaiting__')}
            style={{ ...btnBase, background: ACCENT, color: '#fff', border: 'none' }}
          >
            Start Contrast Check
          </button>
        )}

        {contrastA === '__awaiting__' && (
          <p style={{ color: ACCENT, fontSize: '0.85rem', fontWeight: 600 }}>
            👆 Click any swatch above to select color A
          </p>
        )}

        {contrastA && contrastA !== '__awaiting__' && !contrastB && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.5rem',
              background: contrastA, border: `2px solid ${colors.border}`,
            }} />
            <span style={{ color: colors.text, fontSize: '0.85rem' }}>
              Color A: <strong style={{ fontFamily: 'monospace' }}>{contrastA}</strong>
            </span>
            <button onClick={() => { setContrastA(null); setContrastB(null) }}
              style={{ ...btnBase, fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
              Reset
            </button>
          </div>
        )}

        {contrastInfo && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.4rem', background: contrastA, border: `2px solid ${colors.border}` }} />
                <span style={{ fontSize: '0.75rem', color: colors.textSecondary, fontFamily: 'monospace' }}>{contrastA}</span>
              </div>
              <span style={{ color: colors.muted, fontSize: '1.2rem' }}>↔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.4rem', background: contrastB, border: `2px solid ${colors.border}` }} />
                <span style={{ fontSize: '0.75rem', color: colors.textSecondary, fontFamily: 'monospace' }}>{contrastB}</span>
              </div>
              <div style={{
                marginLeft: '0.5rem',
                fontSize: '1.6rem', fontWeight: 800, color: colors.text,
              }}>
                {contrastInfo.ratio}:1
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={pillBadge(contrastInfo.normalAA, 'Normal AA')}>
                {contrastInfo.normalAA ? '✓' : '✗'} Normal AA (4.5:1)
              </span>
              <span style={pillBadge(contrastInfo.normalAAA, 'Normal AAA')}>
                {contrastInfo.normalAAA ? '✓' : '✗'} Normal AAA (7:1)
              </span>
              <span style={pillBadge(contrastInfo.largeAA, 'Large AA')}>
                {contrastInfo.largeAA ? '✓' : '✗'} Large AA (3:1)
              </span>
              <span style={pillBadge(contrastInfo.largeAAA, 'Large AAA')}>
                {contrastInfo.largeAAA ? '✓' : '✗'} Large AAA (4.5:1)
              </span>
            </div>

            <div style={{
              borderRadius: '0.5rem', padding: '1rem', background: contrastA,
              border: `2px solid ${colors.border}`, marginBottom: '0.75rem',
            }}>
              <span style={{ color: contrastB, fontWeight: 700, fontSize: '0.9rem' }}>
                Sample text on background A with foreground B
              </span>
            </div>
            <div style={{
              borderRadius: '0.5rem', padding: '1rem', background: contrastB,
              border: `2px solid ${colors.border}`,
            }}>
              <span style={{ color: contrastA, fontWeight: 700, fontSize: '0.9rem' }}>
                Sample text on background B with foreground A
              </span>
            </div>

            <button onClick={() => { setContrastA(null); setContrastB(null) }}
              style={{ ...btnBase, marginTop: '1rem', fontSize: '0.78rem' }}>
              Reset Contrast Check
            </button>
          </div>
        )}
      </div>

      {/* ── Section 4: Export Options ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Export Palette</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="cp-export-btn" onClick={exportCSS} style={exportBtnStyle}>
            📋 Copy as CSS Variables
          </button>
          <button className="cp-export-btn" onClick={exportJSON} style={exportBtnStyle}>
            📋 Copy as JSON Array
          </button>
          <button className="cp-export-btn" onClick={exportTailwind} style={exportBtnStyle}>
            📋 Copy as Tailwind Config
          </button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <span style={{ ...labelStyle, marginBottom: '0.4rem' }}>Preview</span>
          <pre style={{
            background: colors.cardBg, border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem', padding: '0.75rem 1rem',
            fontSize: '0.75rem', fontFamily: 'monospace',
            color: colors.textSecondary, overflowX: 'auto',
            margin: 0, lineHeight: 1.6,
          }}>
            {`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`}
          </pre>
        </div>
      </div>

      {/* ── Section 5: Color Info Panel ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Seed Color Info</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Big swatch */}
          <div style={{
            width: '6rem', height: '6rem', borderRadius: '1rem',
            background: seedHex, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            border: `2px solid ${colors.border}`,
          }} />

          {/* Details */}
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr',
              gap: '0.35rem 1rem', fontSize: '0.82rem',
            }}>
              {[
                ['Name', colorName],
                ['HEX', seedHex.toUpperCase()],
                ['RGB', `rgb(${seedRgb.r}, ${seedRgb.g}, ${seedRgb.b})`],
                ['HSL', `hsl(${seedHsl.h}°, ${seedHsl.s}%, ${seedHsl.l}%)`],
              ].map(([k, v]) => (
                <>
                  <span key={k + '_k'} style={{ color: colors.muted, fontWeight: 600 }}>{k}</span>
                  <span
                    key={k + '_v'}
                    style={{ color: colors.text, fontFamily: 'monospace', cursor: 'pointer' }}
                    onClick={() => copyToClipboard(v, `${k} copied!`)}
                    title={`Click to copy ${k}`}
                  >
                    {v}
                  </span>
                </>
              ))}
            </div>
          </div>

          {/* Complementary preview */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ ...labelStyle, textAlign: 'center', display: 'block', marginBottom: '0.6rem' }}>
              Complement
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <div style={{
                width: '2.8rem', height: '2.8rem', borderRadius: '0.5rem',
                background: seedHex, border: `2px solid ${colors.border}`,
                cursor: 'pointer',
              }} onClick={() => copyToClipboard(seedHex)} title={seedHex} />
              <div style={{
                width: '2.8rem', height: '2.8rem', borderRadius: '0.5rem',
                background: complementHex, border: `2px solid ${colors.border}`,
                cursor: 'pointer',
              }} onClick={() => copyToClipboard(complementHex)} title={complementHex} />
            </div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: colors.muted, marginTop: '0.4rem' }}>
              {complementHex.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6: Recent Palettes ────────────────────────────────────── */}
      {recentPalettes.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Recent Palettes</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentPalettes.map((entry, i) => (
              <div
                key={entry.ts}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', borderRadius: '0.6rem',
                  background: colors.cardBg, border: `1px solid ${colors.border}`,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onClick={() => {
                  setSeedHex(entry.seed)
                  setHexInput(entry.seed)
                  setMode(entry.mode)
                }}
                title="Click to restore this palette"
              >
                <div style={{ display: 'flex', gap: '3px' }}>
                  {entry.colors.map((c, ci) => (
                    <div
                      key={ci}
                      className="cp-recent-swatch"
                      style={{
                        width: '1.4rem', height: '1.4rem',
                        borderRadius: '0.25rem', background: c,
                        transition: 'transform 0.15s',
                        border: `1px solid ${colors.border}`,
                      }}
                      title={c}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: colors.muted, fontFamily: 'monospace' }}>
                  {entry.seed}
                </span>
                <span style={{
                  fontSize: '0.7rem', color: colors.textSecondary,
                  background: colors.surface, border: `1px solid ${colors.border}`,
                  padding: '0.15rem 0.4rem', borderRadius: '0.3rem',
                }}>
                  {MODES.find(m => m.id === entry.mode)?.label ?? entry.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} />}
    </ToolLayout>
  )
}
