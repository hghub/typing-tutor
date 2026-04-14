import { useState, useEffect } from 'react'
import { getThemeColors } from '../utils/theme'

const THEME_KEY = 'typingTutorTheme'
const THEME_EVENT = 'typely-theme-change'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved !== null ? JSON.parse(saved) : true
  })

  // When isDark changes: persist, update DOM, broadcast to all other instances
  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(isDark))
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: isDark }))
  }, [isDark])

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for changes broadcast by other instances (e.g. toggle in nav updates page)
  useEffect(() => {
    const handler = (e) => {
      setIsDark((prev) => (prev === e.detail ? prev : e.detail))
    }
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])

  return {
    isDark,
    toggleTheme: () => setIsDark((d) => !d),
    colors: getThemeColors(isDark),
  }
}
