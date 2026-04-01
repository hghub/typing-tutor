import { LANGUAGES } from '../constants/languages'

export default function Header({ language, onLanguageChange, isDark, onToggleTheme, colors }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '3rem',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          background: 'linear-gradient(to right, #22d3ee, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
        }}>
          TypeMaster
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '1.125rem', fontWeight: 300, margin: '0.5rem 0 0 0' }}>
          Master your typing speed and accuracy
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            background: colors.difficulty,
            border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <option key={key} value={key}>{lang.flag} {lang.name}</option>
          ))}
        </select>

        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: colors.difficulty,
            border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: colors.buttonShadow,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#06b6d4' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0' }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
