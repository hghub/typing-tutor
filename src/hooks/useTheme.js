import { useState, useEffect } from 'react'
import { getThemeColors } from '../utils/theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('typingTutorTheme')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('typingTutorTheme', JSON.stringify(isDark))
    // Apply CSS custom property theme so tool pages and TOKENS work automatically
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  // Set initial theme on mount without waiting for state change
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isDark,
    toggleTheme: () => setIsDark((d) => !d),
    colors: getThemeColors(isDark),
  }
}
