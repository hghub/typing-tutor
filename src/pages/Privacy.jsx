import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ToolsNav from '../components/ToolsNav'
import { useTheme } from '../hooks/useTheme'

export default function Privacy() {
  const { colors } = useTheme()

  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.9rem',
    padding: '1.1rem 1.2rem',
  }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Helmet>
        <title>Privacy Policy | Rafiqy</title>
        <meta name="description" content="Learn how Rafiqy handles your data, browser storage, optional cloud sync and feedback. Most tools run locally in your browser and do not upload your content." />
        <link rel="canonical" href="https://rafiqy.app/privacy" />
        <meta property="og:title" content="Privacy Policy | Rafiqy" />
        <meta property="og:description" content="Learn how Rafiqy handles your data, browser storage, optional cloud sync and feedback." />
        <meta property="og:url" content="https://rafiqy.app/privacy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy | Rafiqy" />
        <meta name="twitter:description" content="Learn how Rafiqy handles your data, browser storage, optional cloud sync and feedback." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'Privacy Policy',
          'url': 'https://rafiqy.app/privacy',
          'description': 'Rafiqy privacy policy covering local browser storage, optional cloud sync and feedback handling.'
        })}</script>
      </Helmet>

      <ToolsNav />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.25rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>Privacy Policy</h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.98rem', lineHeight: 1.7, margin: '0 0 2rem' }}>
          Rafiqy is built to keep most work in your browser. This page explains what stays on your device, what optional features can send data out, and what to expect when you use feedback or cloud-sync features.
        </p>

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <section style={card}>
            <h2 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: 700 }}>What stays on your device</h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.7 }}>
              Most Rafiqy tools process text, files, calculator inputs and personal notes locally in your browser. Local-only tool data is typically stored in your browser&apos;s localStorage so it remains available on your device.
            </p>
          </section>

          <section style={card}>
            <h2 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: 700 }}>Optional cloud sync and feedback</h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.7 }}>
              Some tools offer optional cloud sync or feedback submission. If you explicitly use those features, the relevant data is sent to the configured backend so it can be saved or reviewed. If you do not opt in, that data is not transmitted.
            </p>
          </section>

          <section style={card}>
            <h2 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: 700 }}>Analytics and third-party requests</h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.7 }}>
              Some tools may call third-party APIs only when the feature requires live data, such as exchange rates, weather or medical reference lookups. Those requests are limited to what the feature needs. If analytics are enabled on the site, they measure aggregate page usage rather than the contents of your files or notes.
            </p>
          </section>

          <section style={card}>
            <h2 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: 700 }}>Your control</h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.88rem', lineHeight: 1.7 }}>
              You can clear local data from your browser at any time, but that will permanently remove saved tool state. Export backups before doing so. For practical guidance, see the <Link to="/help" style={{ color: '#06b6d4', textDecoration: 'none' }}>Help page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
