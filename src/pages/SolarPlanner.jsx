import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'

// ── Pakistan peak sun hours (daily average, kWh/m²) ──────────────────────────
const CITIES = [
  { name: 'Karachi',        sun: 5.5 },
  { name: 'Hyderabad',      sun: 5.5 },
  { name: 'Sukkur',         sun: 6.0 },
  { name: 'Multan',         sun: 5.5 },
  { name: 'Lahore',         sun: 5.0 },
  { name: 'Faisalabad',     sun: 5.0 },
  { name: 'Gujranwala',     sun: 5.0 },
  { name: 'Islamabad',      sun: 4.8 },
  { name: 'Rawalpindi',     sun: 4.8 },
  { name: 'Peshawar',       sun: 5.0 },
  { name: 'Quetta',         sun: 6.0 },
  { name: 'Other / Rural',  sun: 5.0 },
]

// ── Common Pakistan household appliances ─────────────────────────────────────
const DEFAULT_APPLIANCES = [
  { id: 'ac',       icon: '❄️',  name: 'AC (1.5 ton)',      watts: 1500, hours: 8,   qty: 1 },
  { id: 'fan',      icon: '💨',  name: 'Ceiling Fan',        watts: 75,   hours: 18,  qty: 3 },
  { id: 'fridge',   icon: '🧊',  name: 'Refrigerator',       watts: 150,  hours: 24,  qty: 1 },
  { id: 'lights',   icon: '💡',  name: 'LED Lights (×10)',   watts: 100,  hours: 5,   qty: 1 },
  { id: 'tv',       icon: '📺',  name: 'LED TV 40"',          watts: 80,   hours: 5,   qty: 1 },
  { id: 'washing',  icon: '🫧',  name: 'Washing Machine',    watts: 500,  hours: 1,   qty: 1 },
  { id: 'pump',     icon: '🚿',  name: 'Water Pump',         watts: 750,  hours: 2,   qty: 1 },
  { id: 'computer', icon: '💻',  name: 'Computer / Laptop',  watts: 150,  hours: 4,   qty: 1 },
  { id: 'micro',    icon: '📡',  name: 'Microwave / Iron',   watts: 1000, hours: 0.5, qty: 1 },
  { id: 'router',   icon: '📶',  name: 'Router / CCTV',      watts: 50,   hours: 24,  qty: 1 },
]

// ── Constants (2025 Pakistan baseline) ───────────────────────────────────────
const TARIFF_PKR    = 50        // avg residential PKR per kWh
const COST_LOW_PW   = 80        // PKR per watt installed (on-grid, low estimate)
const COST_HIGH_PW  = 120       // PKR per watt installed (on-grid, high estimate)
const DERATE        = 0.80      // system derating (dust, inverter loss, temperature)

function fmt(n) { return Math.round(n).toLocaleString('en-PK') }

function calcResults(bill, cityObj, loadshedding, appliances, selected) {
  const sunHours = cityObj.sun

  // Daily kWh from bill
  const dailyFromBill = bill / TARIFF_PKR / 30

  // Daily kWh from selected appliances
  let dailyFromAppliances = 0
  appliances.forEach(a => {
    if (selected[a.id]) {
      dailyFromAppliances += (a.watts * a.hours * a.qty) / 1000
    }
  })

  const anySelected = Object.values(selected).some(Boolean)
  const dailyKwh = anySelected ? dailyFromAppliances : dailyFromBill

  // System size in kW, rounded to nearest 0.5
  const rawKw   = dailyKwh / sunHours / DERATE
  const sysKw   = Math.round(rawKw * 2) / 2   // round to 0.5
  const sysKwLo = Math.max(1, sysKw - 0.5)
  const sysKwHi = sysKw + 0.5

  // Cost
  const costLo = sysKw * 1000 * COST_LOW_PW
  const costHi = sysKw * 1000 * COST_HIGH_PW

  // Monthly generation & savings
  const monthlyGen     = sysKw * sunHours * 30 * DERATE      // kWh generated/month
  const monthlySavings = Math.min(monthlyGen * TARIFF_PKR, bill)
  const annualSavings  = monthlySavings * 12

  // Payback
  const avgCost    = (costLo + costHi) / 2
  const paybackYrs = avgCost / annualSavings

  // Battery recommendation
  const needsBattery = loadshedding >= 4 || bill >= 25000

  // "Is Solar Worth It?" verdict
  let verdict, verdictColor, verdictIcon
  if      (bill >= 25000) { verdict = 'Strongly Recommended'; verdictColor = '#22c55e'; verdictIcon = '✅' }
  else if (bill >= 10000) { verdict = 'Recommended';          verdictColor = '#86efac'; verdictIcon = '✅' }
  else if (bill >= 5000)  { verdict = 'Depends on Usage';     verdictColor = '#fbbf24'; verdictIcon = '⚠️' }
  else                    { verdict = 'Not Ideal (Low Bill)';  verdictColor = '#f87171'; verdictIcon = '❌' }

  return {
    dailyKwh: dailyKwh.toFixed(1),
    sysKw,
    sysKwLo,
    sysKwHi,
    costLo,
    costHi,
    monthlySavings,
    paybackYrs: paybackYrs.toFixed(1),
    needsBattery,
    verdict,
    verdictColor,
    verdictIcon,
    monthlyGen: monthlyGen.toFixed(0),
  }
}

const ACCENT = '#f59e0b'
const FONT   = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

export default function SolarPlanner() {
  const [step, setStep]           = useState(1)
  const [bill, setBill]           = useState('')
  const [cityIdx, setCityIdx]     = useState(0)
  const [loadshed, setLoadshed]   = useState(4)
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES)
  const [selected, setSelected]   = useState({})
  const [results, setResults]     = useState(null)
  const [copied, setCopied]       = useState(false)

  const billNum = parseFloat(bill) || 0

  function toggleAppliance(id) {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }
  function changeQty(id, delta) {
    setAppliances(prev => prev.map(a =>
      a.id === id ? { ...a, qty: Math.max(1, a.qty + delta) } : a
    ))
  }
  function changeHours(id, val) {
    setAppliances(prev => prev.map(a =>
      a.id === id ? { ...a, hours: Math.max(0.5, Math.min(24, parseFloat(val) || 0.5)) } : a
    ))
  }

  function goToStep2() {
    if (billNum <= 0) return
    setStep(2)
  }
  function goToStep3() {
    const r = calcResults(billNum, CITIES[cityIdx], loadshed, appliances, selected)
    setResults(r)
    setStep(3)
  }

  function copyText() {
    if (!results) return
    const r = results
    const city = CITIES[cityIdx].name
    const text = `☀️ Solar Planning Estimate — Rafiqy Solar Planner
Generated: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}

📍 City: ${city}
💡 Monthly Bill: PKR ${fmt(billNum)}
⚡ Est. Daily Usage: ${r.dailyKwh} kWh/day

🔆 Recommended System: ${r.sysKwLo}–${r.sysKwHi} kW (on-grid)
💰 Cost Estimate: PKR ${fmt(r.costLo)} – ${fmt(r.costHi)}
📉 Monthly Savings: ~PKR ${fmt(r.monthlySavings)}
📆 Payback Period: ~${r.paybackYrs} years
🔋 Battery: ${r.needsBattery ? 'Recommended (loadshedding/night use)' : 'Optional'}

${r.verdictIcon} Verdict: ${r.verdict}

⚠️ Estimates based on avg Pakistan market rates 2025. Actual costs vary by installer, location & system design. Get 2–3 quotes before deciding.

🌐 rafiqy.app/tools/solar-planner`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const card = {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #334155',
    marginBottom: '1rem',
  }
  const btn = {
    background: ACCENT,
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: FONT,
  }
  const outlineBtn = {
    ...btn,
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    marginRight: '0.75rem',
  }

  return (
    <ToolLayout toolId="solar-planner">
      <div style={{ fontFamily: FONT, maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', alignItems: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? ACCENT : '#334155',
                color: step >= s ? '#000' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.875rem',
              }}>{s}</div>
              <span style={{ color: step >= s ? '#e2e8f0' : '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                {s === 1 ? 'Bill & Location' : s === 2 ? 'Appliances' : 'Results'}
              </span>
              {s < 3 && <span style={{ color: '#475569', margin: '0 0.25rem' }}>›</span>}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem' }}>
              ☀️ Tell us about your electricity usage
            </h2>
            <div style={card}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Monthly Electricity Bill (PKR)
              </label>
              <input
                type="number"
                value={bill}
                onChange={e => setBill(e.target.value)}
                placeholder="e.g. 15000"
                min="0"
                style={{
                  width: '100%', padding: '0.75rem 1rem', fontSize: '1.1rem',
                  borderRadius: '8px', border: '1px solid #475569',
                  background: '#0f172a', color: '#f1f5f9', fontFamily: FONT,
                  boxSizing: 'border-box', marginBottom: '1.25rem',
                }}
              />

              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Your City
              </label>
              <select
                value={cityIdx}
                onChange={e => setCityIdx(Number(e.target.value))}
                style={{
                  width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                  borderRadius: '8px', border: '1px solid #475569',
                  background: '#0f172a', color: '#f1f5f9', fontFamily: FONT,
                  boxSizing: 'border-box', marginBottom: '1.25rem', cursor: 'pointer',
                }}
              >
                {CITIES.map((c, i) => (
                  <option key={c.name} value={i}>{c.name} ({c.sun} sun hrs/day)</option>
                ))}
              </select>

              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Daily Load-shedding (hours)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[0, 2, 4, 6, 8, 10].map(h => (
                  <button
                    key={h}
                    onClick={() => setLoadshed(h)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                      border: loadshed === h ? `2px solid ${ACCENT}` : '1px solid #334155',
                      background: loadshed === h ? '#451a03' : '#1e293b',
                      color: loadshed === h ? ACCENT : '#94a3b8',
                      fontWeight: 600, fontSize: '0.9rem',
                    }}
                  >{h === 0 ? '0 hrs' : `${h} hrs`}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button style={{ ...btn, opacity: billNum > 0 ? 1 : 0.4 }} onClick={goToStep2} disabled={billNum <= 0}>
                Next: Add Appliances →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              🔌 Select your main appliances
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: 0 }}>
              Toggle appliances you use. This improves accuracy over the bill-only estimate. Skip to use bill only.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {appliances.map(a => {
                const on = !!selected[a.id]
                return (
                  <div
                    key={a.id}
                    style={{
                      background: on ? '#172554' : '#1e293b',
                      border: `1px solid ${on ? '#3b82f6' : '#334155'}`,
                      borderRadius: '10px', padding: '0.75rem 1rem',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                         onClick={() => toggleAppliance(a.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
                        <div>
                          <div style={{ color: on ? '#e2e8f0' : '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>{a.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{a.watts}W</div>
                        </div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: on ? '#3b82f6' : '#334155',
                        border: `2px solid ${on ? '#3b82f6' : '#475569'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.75rem', flexShrink: 0,
                      }}>{on ? '✓' : ''}</div>
                    </div>

                    {on && (
                      <div style={{ marginTop: '0.625rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Qty</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button onClick={() => changeQty(a.id, -1)} style={{ ...smallBtn }}>−</button>
                            <span style={{ color: '#e2e8f0', minWidth: 20, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{a.qty}</span>
                            <button onClick={() => changeQty(a.id, +1)} style={{ ...smallBtn }}>+</button>
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Hours/day</div>
                          <input
                            type="number"
                            value={a.hours}
                            min="0.5" max="24" step="0.5"
                            onChange={e => changeHours(a.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: '4rem', padding: '0.25rem 0.4rem',
                              borderRadius: '6px', border: '1px solid #475569',
                              background: '#0f172a', color: '#f1f5f9',
                              fontFamily: FONT, fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div style={{ alignSelf: 'flex-end', color: '#64748b', fontSize: '0.75rem' }}>
                          {((a.watts * a.hours * a.qty) / 1000).toFixed(1)} kWh/day
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button style={outlineBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={btn} onClick={goToStep3}>Calculate Results →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTS ── */}
        {step === 3 && results && (
          <div>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem' }}>
              📊 Your Solar Estimate
            </h2>

            {/* Verdict badge */}
            <div style={{
              ...card,
              border: `1px solid ${results.verdictColor}40`,
              background: `${results.verdictColor}10`,
              display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '2.5rem' }}>{results.verdictIcon}</span>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Is Solar Worth It?</div>
                <div style={{ color: results.verdictColor, fontWeight: 700, fontSize: '1.25rem' }}>{results.verdict}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Based on PKR {fmt(billNum)}/month bill — {CITIES[cityIdx].name}
                </div>
              </div>
            </div>

            {/* Key metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { icon: '🔆', label: 'System Size',     value: `${results.sysKwLo}–${results.sysKwHi} kW`,     sub: 'Recommended on-grid' },
                { icon: '💰', label: 'Installation Cost', value: `PKR ${fmt(results.costLo)}–${fmt(results.costHi)}`, sub: '2025 market estimate' },
                { icon: '📉', label: 'Monthly Savings',  value: `~PKR ${fmt(results.monthlySavings)}`,           sub: `~${results.monthlyGen} kWh generated` },
                { icon: '📆', label: 'Payback Period',   value: `~${results.paybackYrs} years`,                  sub: 'At current tariff' },
              ].map(m => (
                <div key={m.label} style={{ ...card, marginBottom: 0 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{m.icon}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{m.label}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{m.value}</div>
                  <div style={{ color: '#475569', fontSize: '0.75rem' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Battery recommendation */}
            <div style={{
              ...card,
              border: `1px solid ${results.needsBattery ? '#fbbf2440' : '#33415580'}`,
              background: results.needsBattery ? '#451a0310' : '#1e293b',
              display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.75rem', marginTop: '0.1rem' }}>🔋</span>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Battery Storage — {results.needsBattery ? 'Recommended' : 'Optional'}
                </div>
                {results.needsBattery
                  ? <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                      With {loadshed}+ hrs of load-shedding or high bill, a 5–10 kWh lithium battery (PKR 1.5–4 lakh extra)
                      will give you backup power and maximise savings. Discuss with your installer.
                    </p>
                  : <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                      Your usage pattern is grid-friendly. A battery adds cost but can be added later if load-shedding increases.
                    </p>
                }
              </div>
            </div>

            {/* Daily usage note */}
            <div style={{ ...card, background: '#0f172a', border: '1px solid #1e293b', marginTop: '0.75rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                📐 <strong style={{ color: '#94a3b8' }}>How we calculated:</strong> Your estimated {results.dailyKwh} kWh/day need,
                divided by {CITIES[cityIdx].sun} peak sun hours ({CITIES[cityIdx].name}) × 0.80 efficiency = {results.sysKw} kW system.
                Installation at PKR {COST_LOW_PW}–{COST_HIGH_PW}/W (2025 Pakistan avg).
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#451a0318', border: '1px solid #451a0340', borderRadius: '8px', padding: '0.875rem 1rem', marginTop: '0.75rem' }}>
              <p style={{ color: '#92400e', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
                ⚠️ <strong>Disclaimer:</strong> These are rough planning estimates based on average Pakistan market data (2025).
                Actual system sizes, costs, and savings depend on your installer, roof type, shading, panel brand, and electricity tariff.
                Always get 2–3 quotes before deciding.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button style={outlineBtn} onClick={() => { setStep(1); setResults(null) }}>← Start Over</button>
              <button
                style={{ ...btn, background: copied ? '#22c55e' : ACCENT }}
                onClick={copyText}
              >
                {copied ? '✓ Copied!' : '📋 Copy Estimate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

// small +/- button style
const smallBtn = {
  width: 24, height: 24, borderRadius: '4px',
  background: '#334155', border: 'none', color: '#e2e8f0',
  cursor: 'pointer', fontSize: '0.9rem', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
  padding: 0,
}
