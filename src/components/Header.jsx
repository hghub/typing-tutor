import { LANGUAGES } from '../constants/languages'

export default function Header({ language, onLanguageChange, isDark, onToggleTheme, colors, isMobile }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.2rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Typely ⚡
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.82rem', fontWeight: 400, margin: '0.25rem 0 0 0' }}>
          Your Smart Typing System
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            background: colors.difficulty,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'border-color 0.2s ease',
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
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.text,
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s ease',
            boxShadow: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0' }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
