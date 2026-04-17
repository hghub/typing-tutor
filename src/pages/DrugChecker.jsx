import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#10b981'
const MAX_DRUGS = 8
const MIN_DRUGS = 2

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', icon: '🔴' },
  major:    { label: 'Major',    color: '#f97316', icon: '🟠' },
  moderate: { label: 'Moderate', color: '#eab308', icon: '🟡' },
  minor:    { label: 'Minor',    color: '#22c55e', icon: '🟢' },
}

const SUPPLEMENT_WARNINGS = [
  { supplement: 'St. John\'s Wort', effect: 'interferes with antidepressants, birth control, blood thinners' },
  { supplement: 'Fish Oil / Omega-3', effect: 'increases bleeding risk with blood thinners (Warfarin)' },
  { supplement: 'Garlic supplements', effect: 'may affect blood thinners and HIV medications' },
  { supplement: 'Calcium', effect: 'can block absorption of antibiotics (take 2 hours apart)' },
]

function parseSeverity(description = '', severity = '') {
  const text = (description + ' ' + severity).toLowerCase()
  if (text.includes('critical') || text.includes('contraindicated')) return 'critical'
  if (text.includes('major') || text.includes('serious') || text.includes('severe')) return 'major'
  if (text.includes('moderate')) return 'moderate'
  if (text.includes('minor') || text.includes('mild')) return 'minor'
  return null
}

async function lookupRxCUI(drugName) {
  const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const ids = data?.idGroup?.rxnormId
  return (ids && ids.length > 0) ? ids[0] : null
}

async function getCanonicalName(rxcui) {
  try {
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/property.json?propName=RxNorm%20Name`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.propConceptGroup?.propConcept?.[0]?.propValue ?? null
  } catch { return null }
}

// Fetch drug interaction text from OpenFDA label API
// Strategy: use RxNorm canonical name (generic) → brand name → partial text search
async function fetchDrugInteractionText(drugName) {
  let searchNames = [drugName]

  // Step 1: resolve to canonical generic name via RxNorm (handles brand names like Rivotril → clonazepam)
  try {
    const rxcui = await lookupRxCUI(drugName)
    if (rxcui) {
      const canonical = await getCanonicalName(rxcui)
      if (canonical && canonical.toLowerCase() !== drugName.toLowerCase()) {
        searchNames = [canonical, drugName] // try generic first
      }
    }
  } catch { /* proceed with original name */ }

  for (const name of searchNames) {
    const queries = [
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(name)}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(name)}&limit=1`,
    ]
    for (const url of queries) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const data = await res.json()
        const result = data?.results?.[0]
        if (!result) continue
        const text = (result.drug_interactions ?? result.warnings ?? [])[0]
        if (text) return { found: true, text, drugName, resolvedAs: name }
      } catch { continue }
    }
  }
  return { found: false, text: null, drugName }
}

export default function DrugChecker() {
  const { isDark, colors } = useTheme()

  const [drugs, setDrugs] = useState(['', ''])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [interactions, setInteractions] = useState([])
  const [notFound, setNotFound] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  const updateDrug = useCallback((index, value) => {
    setDrugs(prev => prev.map((d, i) => i === index ? value : d))
  }, [])

  const addDrug = useCallback(() => {
    setDrugs(prev => prev.length < MAX_DRUGS ? [...prev, ''] : prev)
  }, [])

  const removeDrug = useCallback((index) => {
    setDrugs(prev => prev.length > MIN_DRUGS ? prev.filter((_, i) => i !== index) : prev)
  }, [])

  const checkInteractions = useCallback(async () => {
    const names = drugs.map(d => d.trim()).filter(Boolean)
    if (names.length < 2) return

    setStatus('loading')
    setInteractions([])
    setNotFound([])
    setErrorMsg('')

    try {
      // Fetch interaction text from OpenFDA for each drug in parallel
      const fdaResults = await Promise.all(names.map(name => fetchDrugInteractionText(name)))

      const missing = fdaResults.filter(r => !r.found).map(r => r.drugName)
      const found   = fdaResults.filter(r => r.found)

      setNotFound(missing)

      // Convert to interaction cards — show resolved generic name if different
      const pairs = found.map(r => ({
        drug1: r.resolvedAs && r.resolvedAs !== r.drugName ? `${r.drugName} (${r.resolvedAs})` : r.drugName,
        drug2: 'other medications',
        description: r.text,
        severity: parseSeverity(r.text),
      }))

      setInteractions(pairs)
      setStatus('done')

    } catch {
      setErrorMsg('Could not reach the drug database. Please check your connection and try again.')
      setStatus('error')
    }
  }, [drugs])

  // ── Styles ──────────────────────────────────────────────────────────────────

  const inputStyle = {
    flex: 1,
    background: colors.input ?? (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
    border: `1.5px solid ${colors.inputBorder ?? colors.border}`,
    borderRadius: '0.6rem',
    color: colors.text,
    fontSize: '0.95rem',
    padding: '0.6rem 0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
    minWidth: 0,
  }

  const btnBase = {
    borderRadius: '0.6rem',
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '0.875rem',
    padding: '0.55rem 1rem',
    border: 'none',
  }

  const hasEnoughDrugs = drugs.filter(d => d.trim()).length >= 2

  return (
    <ToolLayout toolId="drug-checker">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: `linear-gradient(to right, ${ACCENT}, #059669)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          💊 Drug Interaction Checker
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Powered by the{' '}
          <span style={{ color: ACCENT, fontWeight: 600 }}>NIH RxNav API</span>
          {' '}— free, no key required.
        </p>
      </div>

      {/* ── Disclaimer Banner ─────────────────────────────────────────────── */}
      <div style={{
        background: isDark ? 'rgba(239,68,68,0.13)' : 'rgba(239,68,68,0.08)',
        border: '2px solid #ef4444',
        borderRadius: '0.85rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1.3 }}>⚠️</span>
        <p style={{
          margin: 0,
          color: isDark ? '#fca5a5' : '#b91c1c',
          fontWeight: 700,
          fontSize: '0.925rem',
          lineHeight: 1.5,
        }}>
          This tool is for information only and does <em>NOT</em> replace professional medical
          advice. Always consult your doctor or pharmacist before combining medications.
        </p>
      </div>

      {/* ── Input Section ─────────────────────────────────────────────────── */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '1rem',
        padding: '1.75rem',
        maxWidth: '640px',
        marginBottom: '1.75rem',
      }}>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: '0 0 0.85rem',
        }}>
          Enter Medications
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {drugs.map((drug, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
              <input
                type="text"
                value={drug}
                onChange={(e) => updateDrug(index, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && hasEnoughDrugs) checkInteractions() }}
                placeholder={index === 0 ? 'e.g. Paracetamol' : index === 1 ? 'e.g. Ibuprofen' : 'e.g. Aspirin'}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = colors.inputBorder ?? colors.border }}
                aria-label={`Medication ${index + 1}`}
              />
              {drugs.length > MIN_DRUGS && (
                <button
                  onClick={() => removeDrug(index)}
                  title="Remove"
                  style={{
                    ...btnBase,
                    padding: '0.5rem 0.7rem',
                    background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                    color: '#ef4444',
                    border: '1.5px solid rgba(239,68,68,0.3)',
                    flexShrink: 0,
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {drugs.length < MAX_DRUGS && (
            <button
              onClick={addDrug}
              style={{
                ...btnBase,
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)',
                color: ACCENT,
                border: `1.5px solid ${ACCENT}55`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}20` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)' }}
            >
              + Add Medication
            </button>
          )}

          <button
            onClick={checkInteractions}
            disabled={!hasEnoughDrugs || status === 'loading'}
            style={{
              ...btnBase,
              background: hasEnoughDrugs && status !== 'loading' ? ACCENT : (isDark ? '#374151' : '#d1d5db'),
              color: hasEnoughDrugs && status !== 'loading' ? '#fff' : (isDark ? '#6b7280' : '#9ca3af'),
              cursor: hasEnoughDrugs && status !== 'loading' ? 'pointer' : 'not-allowed',
              padding: '0.6rem 1.4rem',
              fontSize: '0.95rem',
            }}
            onMouseEnter={(e) => { if (hasEnoughDrugs && status !== 'loading') e.currentTarget.style.background = '#059669' }}
            onMouseLeave={(e) => { if (hasEnoughDrugs && status !== 'loading') e.currentTarget.style.background = ACCENT }}
          >
            {status === 'loading' ? '⏳ Checking…' : '🔍 Check Interactions'}
          </button>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {status === 'loading' && (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.85rem',
          padding: '1.5rem 1.25rem',
          maxWidth: '640px',
          textAlign: 'center',
          color: colors.textSecondary,
          fontSize: '0.95rem',
          marginBottom: '1.5rem',
        }}>
          <span style={{ display: 'inline-block', fontSize: '1.4rem', animation: 'spin 1s linear infinite' }}>🔄</span>
          <p style={{ margin: '0.5rem 0 0' }}>Looking up medications in the NIH drug database…</p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {status === 'error' && (
        <div style={{
          background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
          border: `1.5px solid #ef4444`,
          borderRadius: '0.85rem',
          padding: '1rem 1.25rem',
          maxWidth: '640px',
          color: isDark ? '#fca5a5' : '#b91c1c',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {status === 'done' && (
        <div style={{ maxWidth: '640px', marginBottom: '1.75rem' }}>

          {/* Not-found warnings */}
          {notFound.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {notFound.map((name) => (
                <div key={name} style={{
                  background: isDark ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.07)',
                  border: '1.5px solid #ca8a04',
                  borderRadius: '0.7rem',
                  padding: '0.7rem 1rem',
                  color: isDark ? '#fde047' : '#92400e',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}>
                  ⚠️ &ldquo;{name}&rdquo; was not found in the drug database. Check the spelling or try the generic name.
                </div>
              ))}
            </div>
          )}

          {/* No interactions */}
          {interactions.length === 0 && notFound.length === 0 && (
            <div style={{
              background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)',
              border: `1.5px solid ${ACCENT}`,
              borderRadius: '0.85rem',
              padding: '1.25rem',
              color: isDark ? '#6ee7b7' : '#065f46',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              ✅ No known interactions found between these medications. Always confirm with your pharmacist.
            </div>
          )}

          {/* No interactions with partial not-found */}
          {interactions.length === 0 && notFound.length > 0 && drugs.filter(d => d.trim()).length - notFound.length < 2 && (
            <div style={{
              background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)',
              border: `1.5px solid ${ACCENT}`,
              borderRadius: '0.85rem',
              padding: '1.25rem',
              color: isDark ? '#6ee7b7' : '#065f46',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              ℹ️ Not enough recognized drugs to check interactions. Please verify the drug names above.
            </div>
          )}

          {/* Interaction cards */}
          {interactions.length > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
                {interactions.map((pair, i) => {
                  const sev = pair.severity ? SEVERITY_CONFIG[pair.severity] : null
                  return (
                    <div key={i} style={{
                      background: colors.card,
                      border: `1px solid ${sev ? sev.color + '55' : colors.border}`,
                      borderLeft: `4px solid ${sev ? sev.color : colors.border}`,
                      borderRadius: '0.85rem',
                      padding: '1rem 1.1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: colors.text,
                          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '0.4rem',
                        }}>
                          {pair.drug1}
                        </span>
                        <span style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>↔</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: colors.text,
                          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '0.4rem',
                        }}>
                          {pair.drug2}
                        </span>
                        {sev && (
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: sev.color,
                            background: sev.color + '18',
                            border: `1px solid ${sev.color}44`,
                            padding: '0.15rem 0.6rem',
                            borderRadius: '2rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {sev.icon} {sev.label}
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        color: colors.textSecondary,
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                      }}>
                        {pair.description}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Urgent warning */}
              <div style={{
                background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
                border: '1.5px solid #ef4444',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                color: isDark ? '#fca5a5' : '#b91c1c',
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.5,
              }}>
                🚨 Discuss these interactions with your doctor or pharmacist immediately if you are taking these medications together.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Supplement Shield ─────────────────────────────────────────────── */}
      {(status === 'done' || status === 'idle') && (
        <div style={{
          background: isDark ? 'rgba(234,179,8,0.07)' : 'rgba(234,179,8,0.05)',
          border: `1.5px solid #ca8a04`,
          borderRadius: '1rem',
          padding: '1.25rem 1.5rem',
          maxWidth: '640px',
        }}>
          <p style={{
            margin: '0 0 0.85rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: isDark ? '#fde047' : '#92400e',
            letterSpacing: '0.01em',
          }}>
            ⚠️ Common supplements that interact with medications:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {SUPPLEMENT_WARNINGS.map(({ supplement, effect }) => (
              <li key={supplement} style={{
                color: colors.textSecondary,
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 700, color: isDark ? '#fde047' : '#92400e' }}>
                  {supplement}
                </span>
                {' '}→ {effect}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolLayout>
  )
}
