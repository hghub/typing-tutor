import { Link } from 'react-router-dom'
import ToolLayout from '../components/ToolLayout'
import ShareBar from '../components/ShareBar'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#06b6d4'

const WHO_FOR = [
  {
    icon: '🎓',
    title: 'Students',
    desc: 'Type faster, write cleaner essays, build timelines, and form study groups — all without installing anything.',
    color: '#8b5cf6',
  },
  {
    icon: '💻',
    title: 'Developers',
    desc: 'Transform data formats, scan code for leaked secrets, scrape Markdown, analyze logs, convert configs, and generate mock data instantly.',
    color: '#06b6d4',
  },
  {
    icon: '🏫',
    title: 'Teachers',
    desc: 'Create balanced student groups, generate practice passages, and assess typing skills in the classroom.',
    color: '#ec4899',
  },
  {
    icon: '💼',
    title: 'Freelancers',
    desc: 'Score client risk before you start, generate voice-driven invoices, analyze expenses, and stay on top of your finances.',
    color: '#f97316',
  },
  {
    icon: '📊',
    title: 'Finance Professionals',
    desc: 'FBR tax calculator, expense pattern analyzer, currency converter, driving fine tracker, warranty tracker, and budget splitter.',
    color: '#10b981',
  },
  {
    icon: '🏥',
    title: 'Healthcare Workers',
    desc: 'Check drug interactions, track symptoms over time, and calculate refrigerant leak rates for compliance.',
    color: '#ef4444',
  },
  {
    icon: '🔒',
    title: 'Privacy-conscious Users',
    desc: 'Redact PII from documents before sharing, detect leaked API keys and secrets in logs, and encrypt sensitive text — all locally.',
    color: '#6366f1',
  },
  {
    icon: '✈️',
    title: 'Travellers',
    desc: 'Build smart packing lists with weather context, convert currencies, and track expenses across trips.',
    color: '#3b82f6',
  },
]

const PRINCIPLES = [
  { icon: '🔒', title: 'No login required', desc: 'Every tool works without an account. Ever.' },
  { icon: '🌐', title: 'Works offline', desc: 'Installed as a PWA, it runs even without internet.' },
  { icon: '🇵🇰', title: 'Local context built-in', desc: 'PKR, Urdu, FBR tax brackets, local drug names — not an afterthought.' },
  { icon: '⚡', title: 'Browser-only processing', desc: 'Your data never leaves your device. No uploads, no servers.' },
  { icon: '🆓', title: 'Always free', desc: 'No premium tier, no paywalls, no ads. Just tools.' },
]

export default function About() {
  const { isDark, colors } = useTheme()

  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.5rem',
  }

  return (
    <ToolLayout toolId={null}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '1rem 0 3rem',
        color: colors.text,
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
      }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #06b6d422, #3b82f622)',
            border: '1px solid #06b6d444',
            borderRadius: '2rem',
            padding: '0.3rem 1rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            🔒 Privacy-first · Open for everyone
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 1rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Privacy-first tools that run in your browser
          </h1>
          <p style={{ fontSize: '1.05rem', color: colors.textSecondary, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Rafiqy started as a typing tutor and grew into a collection of 63 free, browser-native tools —
            built for developers, professionals and students everywhere, with local tools for Pakistan.
          </p>
        </div>

        {/* The story */}
        <div style={card}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: colors.text }}>
            Why we built this
          </h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: colors.textSecondary, lineHeight: 1.75 }}>
            Most productivity tools are built for the US market — dollar defaults, English-only, and paywalled.
            Users everywhere are left patching together spreadsheets and random websites that sell their data.
          </p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: colors.textSecondary, lineHeight: 1.75 }}>
            Rafiqy is different. Every tool runs entirely in your browser — no uploads, no servers, no tracking.
            We also ship local context for Pakistan: <strong style={{ color: colors.text }}>PKR defaults</strong>,{' '}
            <strong style={{ color: colors.text }}>Urdu support</strong>,{' '}
            <strong style={{ color: colors.text }}>FBR tax brackets</strong>, local drug names, city data, and more.
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: colors.textSecondary, lineHeight: 1.75 }}>
            Everything runs in your browser. No account. No upload. No tracking. No cost.
          </p>
        </div>

        {/* Who it's for */}
        <div>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: colors.text }}>
            Who uses Rafiqy?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {WHO_FOR.map(({ icon, title, desc, color }) => (
              <div key={title} style={{
                ...card,
                borderLeft: `3px solid ${color}`,
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{icon}</div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 700, color: colors.text }}>
                  {title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textSecondary, lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Principles */}
        <div>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: colors.text }}>
            Our principles
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {PRINCIPLES.map(({ icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                ...card,
                padding: '1rem 1.25rem',
              }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '0.1rem' }}>{icon}</span>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: colors.text }}>{title}</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: colors.textSecondary }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          ...card,
          background: isDark ? 'linear-gradient(135deg, #06b6d410, #3b82f610)' : 'linear-gradient(135deg, #06b6d408, #3b82f608)',
          border: `1px solid ${ACCENT}33`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '1.75rem',
        }}>
          {[
            { value: '63', label: 'Free Tools' },
            { value: '11', label: 'Categories' },
            { value: '0', label: 'Logins Required' },
            { value: '100%', label: 'Browser-only' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: ACCENT }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Share */}
        <ShareBar url="https://rafiqy.app/about" title="About Rafiqy — Free Privacy-First Tools for Pakistan" />

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/tools"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
              color: '#fff',
              borderRadius: '0.75rem',
              padding: '0.85rem 2rem',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Explore All Tools →
          </Link>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: colors.textSecondary }}>
            No signup needed. Just open and use.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
