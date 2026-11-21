import { usePreferences } from './usePreferences'

export const BILINGUAL_TOOLS = ['stock-planner', 'tax-calculator', 'freelance-tax-planner', 'rent-vs-buy-pakistan']

export function useToolLanguage() {
  const { prefs, setPref } = usePreferences()
  const language = prefs.toolLanguage === 'ur' ? 'ur' : 'en'
  return { language, isUrdu: language === 'ur', setLanguage: value => setPref('toolLanguage', value === 'ur' ? 'ur' : 'en') }
}
