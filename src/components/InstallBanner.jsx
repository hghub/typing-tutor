import { useState, useEffect } from 'react'

export default function InstallBanner({ isDark, colors }) {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwaInstallDismissed') === 'true'
  )
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || installed || !prompt) return null

  const handleInstall = async () => {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwaInstallDismissed', 'true')
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.97)',
      border: `1px solid ${isDark ? 'rgba(6,182,212,0.35)' : 'rgba(6,182,212,0.4)'}`,
      borderRadius: '1rem',
      padding: '0.875rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(12px)',
      maxWidth: '420px',
      width: 'calc(100vw - 2rem)',
    }}>
      <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📲</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
          Install Rafiqy
        </p>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: colors.textSecondary }}>
          Works offline · Opens like an app · No App Store needed
        </p>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.45rem 0.9rem',
          fontWeight: 700,
          fontSize: '0.82rem',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: colors.textSecondary,
          cursor: 'pointer',
          fontSize: '1.1rem',
          padding: '0.25rem',
          flexShrink: 0,
          lineHeight: 1,
        }}
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
