import { useState, useEffect, useCallback } from 'react'

const PREFS_KEY = 'typely_prefs'
const PREFS_EVENT = 'typely-prefs-change'

const DEFAULTS = {
  showPkTools: true,   // show Pakistan-specific tools in ToolsHome
  urduLabels: false,   // show Urdu names/taglines on tool cards + Urdu disclaimers
  cloudSync: false,    // sync data to cloud; when false, localStorage only (opt-in)
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(load)

  // Persist + broadcast whenever prefs change
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: prefs }))
  }, [prefs])

  // Sync with changes broadcast from other instances (e.g. header settings popover)
  useEffect(() => {
    const handler = (e) => {
      setPrefs((prev) => {
        const same = JSON.stringify(prev) === JSON.stringify(e.detail)
        return same ? prev : e.detail
      })
    }
    window.addEventListener(PREFS_EVENT, handler)
    return () => window.removeEventListener(PREFS_EVENT, handler)
  }, [])

  const setPref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const togglePref = useCallback((key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return { prefs, setPref, togglePref }
}
