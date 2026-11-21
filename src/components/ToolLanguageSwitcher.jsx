import { useToolLanguage } from '../hooks/useToolLanguage'
import './ToolLanguageSwitcher.css'

export default function ToolLanguageSwitcher({ colors }) {
  const { language, setLanguage } = useToolLanguage()
  return <div className="tool-language-switch" dir="ltr" role="group" aria-label="Tool language / ٹول کی زبان">
    <span style={{ color: colors.textSecondary }}>Language / زبان</span>
    {[['en', 'English'], ['ur', 'اردو']].map(([code, name]) => <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => setLanguage(code)} style={{ color: colors.text, background: language === code ? `${colors.primary || '#06b6d4'}22` : colors.card, borderColor: colors.border }}>{name}</button>)}
  </div>
}
