import { useState, useEffect, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
const ACCENT = '#06b6d4'
const STORAGE_KEY = 'rafiqy_unit_recent'

const CATEGORIES = {
  length: {
    label: '📏 Length',
    units: [
      { id: 'mm',   label: 'Millimeter (mm)',   factor: 0.001 },
      { id: 'cm',   label: 'Centimeter (cm)',   factor: 0.01 },
      { id: 'm',    label: 'Meter (m)',          factor: 1 },
      { id: 'km',   label: 'Kilometer (km)',     factor: 1000 },
      { id: 'in',   label: 'Inch (in)',          factor: 0.0254 },
      { id: 'ft',   label: 'Foot (ft)',          factor: 0.3048 },
      { id: 'yd',   label: 'Yard (yd)',          factor: 0.9144 },
      { id: 'mi',   label: 'Mile (mi)',          factor: 1609.344 },
    ],
  },
  weight: {
    label: '⚖️ Weight',
    units: [
      { id: 'mg',    label: 'Milligram (mg)',    factor: 0.000001 },
      { id: 'g',     label: 'Gram (g)',          factor: 0.001 },
      { id: 'kg',    label: 'Kilogram (kg)',     factor: 1 },
      { id: 'tonne', label: 'Tonne (t)',         factor: 1000 },
      { id: 'oz',    label: 'Ounce (oz)',        factor: 0.0283495 },
      { id: 'lb',    label: 'Pound (lb)',        factor: 0.453592 },
    ],
  },
  temperature: {
    label: '🌡️ Temperature',
    units: [
      { id: 'c', label: 'Celsius (°C)' },
      { id: 'f', label: 'Fahrenheit (°F)' },
      { id: 'k', label: 'Kelvin (K)' },
    ],
  },
  area: {
    label: '🗺️ Area',
    units: [
      { id: 'mm2',  label: 'mm²',       factor: 0.000001 },
      { id: 'cm2',  label: 'cm²',       factor: 0.0001 },
      { id: 'm2',   label: 'm²',        factor: 1 },
      { id: 'km2',  label: 'km²',       factor: 1e6 },
      { id: 'ft2',  label: 'ft²',       factor: 0.092903 },
      { id: 'yd2',  label: 'yd²',       factor: 0.836127 },
      { id: 'acre', label: 'Acre',      factor: 4046.86 },
      { id: 'ha',   label: 'Hectare',   factor: 10000 },
      { id: 'marla',label: 'Marla (PK)',factor: 25.2929 },
      { id: 'kanal',label: 'Kanal (PK)',factor: 505.857 },
    ],
  },
  volume: {
    label: '🫙 Volume',
    units: [
      { id: 'ml',   label: 'Milliliter (ml)',    factor: 0.001 },
      { id: 'l',    label: 'Liter (L)',          factor: 1 },
      { id: 'm3',   label: 'Cubic Meter (m³)',   factor: 1000 },
      { id: 'floz', label: 'Fl. Ounce (fl oz)',  factor: 0.0295735 },
      { id: 'cup',  label: 'Cup (US)',            factor: 0.236588 },
      { id: 'pt',   label: 'Pint (pt)',           factor: 0.473176 },
      { id: 'qt',   label: 'Quart (qt)',          factor: 0.946353 },
      { id: 'gal',  label: 'Gallon (gal)',        factor: 3.78541 },
    ],
  },
  speed: {
    label: '🚀 Speed',
    units: [
      { id: 'ms',   label: 'm/s',     factor: 1 },
      { id: 'kmh',  label: 'km/h',    factor: 1 / 3.6 },
      { id: 'mph',  label: 'mph',     factor: 0.44704 },
      { id: 'knot', label: 'Knot',    factor: 0.514444 },
      { id: 'mach', label: 'Mach',    factor: 343 },
    ],
  },
}

function convertTemp(val, from, to) {
  let celsius
  if (from === 'c') celsius = val
  else if (from === 'f') celsius = (val - 32) * 5 / 9
  else celsius = val - 273.15

  if (to === 'c') return celsius
  if (to === 'f') return celsius * 9 / 5 + 32
  return celsius + 273.15
}

function convert(val, fromId, toId, catKey) {
  const cat = CATEGORIES[catKey]
  if (!cat) return ''
  const n = parseFloat(val)
  if (isNaN(n)) return ''

  if (catKey === 'temperature') {
    const r = convertTemp(n, fromId, toId)
    return parseFloat(r.toFixed(8)).toString()
  }
  const from = cat.units.find(u => u.id === fromId)
  const to = cat.units.find(u => u.id === toId)
  if (!from || !to) return ''
  const inBase = n * from.factor
  const result = inBase / to.factor
  if (Math.abs(result) < 0.0001 && result !== 0) return result.toExponential(4)
  return parseFloat(result.toFixed(8)).toString()
}

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function saveRecent(item) {
  let arr = loadRecent()
  arr = arr.filter(r => !(r.cat === item.cat && r.from === item.from && r.to === item.to))
  arr.unshift(item)
  arr = arr.slice(0, 6)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
}

export default function UnitConverter() {
  const { isDark, colors } = useTheme()
  const [cat, setCat] = useState('length')
  const [from, setFrom] = useState('cm')
  const [to, setTo] = useState('in')
  const [inputVal, setInputVal] = useState('1')
  const [result, setResult] = useState('')
  const [recent, setRecent] = useState(loadRecent)

  const catDef = CATEGORIES[cat]
  const units = catDef.units

  useEffect(() => {
    const firstTwo = units.slice(0, 2)
    setFrom(firstTwo[0].id)
    setTo(firstTwo[1].id)
    setInputVal('1')
  }, [cat])

  useEffect(() => {
    const r = convert(inputVal, from, to, cat)
    setResult(r)
    if (inputVal && r) {
      const item = { cat, from, to }
      saveRecent(item)
      setRecent(loadRecent())
    }
  }, [inputVal, from, to, cat])

  function swap() {
    setFrom(to)
    setTo(from)
    setInputVal(result || '1')
  }

  function applyRecent(r) {
    setCat(r.cat)
    setTimeout(() => { setFrom(r.from); setTo(r.to) }, 10)
  }

  const unitLabel = (id) => units.find(u => u.id === id)?.label?.split(' ')[0] || id

  const sel = {
    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.55rem 0.75rem',
    color: colors.text,
    fontSize: '0.9rem',
    fontFamily: FONT,
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  }

  const inp = {
    ...sel,
    fontSize: '1.3rem',
    fontWeight: 700,
    padding: '0.65rem 0.9rem',
  }

  return (
    <ToolLayout toolId="unit-converter">
      <div style={{ fontFamily: FONT, maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT, margin: '0 0 0.25rem' }}>📐 Unit Converter</h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Length, weight, temperature, speed and more</p>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {Object.entries(CATEGORIES).map(([key, def]) => (
            <button key={key} onClick={() => setCat(key)} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '2rem',
              border: `1px solid ${cat === key ? ACCENT : colors.border}`,
              background: cat === key ? ACCENT : 'transparent',
              color: cat === key ? '#000' : colors.textSecondary,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
              transition: 'all 0.15s',
            }}>{def.label}</button>
          ))}
        </div>

        {/* Converter card */}
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          {/* From */}
          <div style={{ marginBottom: '0.75rem' }}>
            <select value={from} onChange={e => setFrom(e.target.value)} style={sel}>
              {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Enter value"
            style={inp}
          />

          {/* Swap */}
          <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
            <button onClick={swap} style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: `1px solid ${colors.border}`,
              borderRadius: '50%',
              width: 40, height: 40,
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: ACCENT,
            }}>⇅</button>
          </div>

          {/* To */}
          <div style={{ marginBottom: '0.75rem' }}>
            <select value={to} onChange={e => setTo(e.target.value)} style={sel}>
              {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>

          {/* Result */}
          <div style={{
            background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)',
            border: `1px solid ${ACCENT}40`,
            borderRadius: '0.65rem',
            padding: '1rem',
            textAlign: 'center',
          }}>
            {result !== '' ? (
              <>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: ACCENT, lineHeight: 1.1 }}>{result}</div>
                <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                  {inputVal} {unitLabel(from)} = {result} {unitLabel(to)}
                </div>
              </>
            ) : (
              <div style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Enter a value above</div>
            )}
          </div>
        </div>

        {/* Recently used */}
        {recent.length > 0 && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.5rem' }}>Recently Used</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {recent.map((r, i) => (
                <button key={i} onClick={() => applyRecent(r)} style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: '2rem',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}>
                  {CATEGORIES[r.cat]?.label?.split(' ')[0]} {r.from} → {r.to}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
