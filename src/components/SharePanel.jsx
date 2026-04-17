import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

/**
 * Reusable share panel — Export PDF, WhatsApp, Email.
 * Props:
 *   getBlob: async () => ArrayBuffer  — generates PDF bytes
 *   filename: string                  — e.g. "expense-report.pdf"
 *   textSummary: string               — plain text for WhatsApp/email fallback
 */
export default function SharePanel({ getBlob, filename, textSummary }) {
  const { isDark, colors } = useTheme()
  const [loading, setLoading] = useState(null) // 'download' | 'whatsapp' | 'email'

  const withBlob = async (action, key) => {
    setLoading(key)
    try {
      const bytes = await getBlob()
      await action(bytes)
    } catch (e) {
      console.error('SharePanel error:', e)
    } finally {
      setLoading(null)
    }
  }

  const downloadPDF = (bytes) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareViaWebShare = async (bytes, fallback) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
    } else {
      fallback()
    }
  }

  const whatsapp = (bytes) =>
    shareViaWebShare(bytes, () =>
      window.open('https://wa.me/?text=' + encodeURIComponent(textSummary), '_blank')
    )

  const email = (bytes) =>
    shareViaWebShare(bytes, () => {
      const subject = encodeURIComponent(filename.replace('.pdf', '') + ' — Rafiqy Report')
      const body = encodeURIComponent(textSummary)
      window.open('mailto:?subject=' + subject + '&body=' + body)
    })

  const buttons = [
    { key: 'download', icon: '⬇️', label: 'Download PDF', action: downloadPDF },
    { key: 'whatsapp', icon: '📱', label: 'WhatsApp',     action: whatsapp },
    { key: 'email',    icon: '📧', label: 'Email',        action: email },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
      padding: '0.625rem 0.875rem',
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      border: '1px solid ' + colors.border,
      borderRadius: '8px',
    }}>
      <span style={{ fontSize: '0.75rem', color: colors.muted, marginRight: '0.25rem' }}>
        📤 Share
      </span>
      {buttons.map(({ key, icon, label, action }) => {
        const isLoading = loading === key
        return (
          <button
            key={key}
            onClick={() => withBlob(action, key)}
            disabled={!!loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              background: isLoading
                ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                : 'transparent',
              border: '1px solid ' + colors.border,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading && !isLoading ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {isLoading
              ? <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⏳</span>
              : icon
            }
            {label}
          </button>
        )
      })}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
