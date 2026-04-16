import { useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { TOOLS } from '../tools/registry'

export default function ToolHelpDialog({ toolId, onClose }) {
  const { isDark, colors } = useTheme()
  const { prefs } = usePreferences()
  const tool = TOOLS.find(t => t.id === toolId)
  if (!tool) return null

  const name = (prefs.urduLabels && tool.nameUrdu) ? tool.nameUrdu : tool.name
  const description = (prefs.urduLabels && tool.descriptionUrdu) ? tool.descriptionUrdu : tool.description
  const features = tool.features || []
  const privacyNote = prefs.urduLabels
    ? 'تمام پروسیسنگ آپ کے براؤزر میں ہوتی ہے۔ کوئی ڈیٹا یا فائل سرور پر نہیں جاتا۔'
    : 'All processing happens in your browser. No files or data are uploaded to any server.'

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1200, padding: '1rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div style={{
        background: isDark ? '#0f172a' : '#f8fafc',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '1.25rem',
        padding: '1.75rem',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '2.25rem', lineHeight: 1,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderRadius: '0.75rem', padding: '0.5rem', display: 'inline-flex',
            }}>{tool.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: colors.text,
                direction: prefs.urduLabels ? 'rtl' : 'ltr' }}>
                {name}
              </h2>
              <span style={{
                display: 'inline-block', marginTop: '0.25rem',
                fontSize: '0.65rem', fontWeight: 700,
                padding: '0.15rem 0.55rem', borderRadius: '999px',
                background: tool.color + '22', color: tool.color,
                border: `1px solid ${tool.color}44`,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{tool.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.1rem', color: colors.textSecondary, padding: '0.25rem',
              lineHeight: 1, borderRadius: '0.4rem' }}
            title="Close (Esc)"
          >✕</button>
        </div>

        {/* Description */}
        <p style={{
          margin: '0 0 1.25rem', fontSize: '0.9rem',
          color: colors.textSecondary, lineHeight: 1.65,
          direction: prefs.urduLabels ? 'rtl' : 'ltr',
        }}>{description}</p>

        {/* Features list */}
        {features.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textSecondary }}>
              {prefs.urduLabels ? 'خصوصیات اور استعمال کی تجاویز' : 'Features & Tips'}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {features.map((f, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  fontSize: '0.85rem', color: colors.text, lineHeight: 1.5,
                }}>
                  <span style={{ color: tool.color, fontSize: '0.65rem',
                    marginTop: '0.35rem', flexShrink: 0 }}>◆</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy note */}
        <div style={{
          padding: '0.75rem 1rem',
          background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.06)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '0.75rem',
          display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>🔒</span>
          <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textSecondary,
            lineHeight: 1.55, direction: prefs.urduLabels ? 'rtl' : 'ltr' }}>
            {privacyNote}
          </p>
        </div>
      </div>
    </div>
  )
}
