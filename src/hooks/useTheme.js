import { useState, useEffect } from 'react'
import { getThemeColors } from '../utils/theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('typingTutorTheme')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('typingTutorTheme', JSON.stringify(isDark))
  }, [isDark])

  return {
    isDark,
    toggleTheme: () => setIsDark((d) => !d),
    colors: getThemeColors(isDark),
  }
}
