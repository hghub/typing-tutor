import { DIRECTORY_META } from '../data/toolsDirectory'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ToolsNav from '../components/ToolsNav'
import FeedbackButton from '../components/FeedbackButton'
import { useTheme } from '../hooks/useTheme'

const SECTIONS = [
  { id: 'privacy',  icon: '🔒', label: 'Privacy & Storage' },
  { id: 'sync',     icon: '☁️', label: 'Cloud Sync & Backup' },
  { id: 'pk-tools', icon: '🇵🇰', label: 'Pakistan Tools' },
  { id: 'urdu',     icon: 'اردو', label: 'Urdu Language' },
  { id: 'faq',      icon: '❓', label: 'FAQ' },
]

function Section({ id, icon, title, children, colors, isDark }) {
  return (
    <section id={id} style={{ marginBottom: '2.5rem', scrollMarginTop: '72px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        paddingBottom: '0.75rem', marginBottom: '1.25rem',
        borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: colors.text }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Card({ icon, title, body, color = '#06b6d4', isDark, colors }) {
  return (
    <div style={{
      background: isDark ? '#1e293b' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: '0.875rem', padding: '1.1rem 1.25rem',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: colors.text }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

function FAQ({ q, a, colors, isDark }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        padding: '0.9rem 0', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
      }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.text, lineHeight: 1.45 }}>{q}</span>
        <span style={{ fontSize: '1rem', color: '#06b6d4', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p style={{ margin: '0 0 0.9rem', fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>{a}</p>
      )}
    </div>
  )
}

export default function Help() {
  const { isDark, colors } = useTheme()

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Helmet>
        <title>Help & FAQ | Rafiqy</title>
        <meta name="description" content="Get help with Rafiqy tools, browser storage, cloud sync, Urdu support, Pakistan-specific tools and common questions about how the site works." />
        <link rel="canonical" href="https://rafiqy.app/help" />
        <meta property="og:title" content="Help & FAQ | Rafiqy" />
        <meta property="og:description" content="Get help with Rafiqy tools, browser storage, cloud sync, Urdu support and Pakistan-specific features." />
        <meta property="og:url" content="https://rafiqy.app/help" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Help & FAQ | Rafiqy" />
        <meta name="twitter:description" content="Get help with Rafiqy tools, browser storage, cloud sync, Urdu support and Pakistan-specific features." />
      </Helmet>
      <ToolsNav />

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.25rem 4rem' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #06b6d422, #3b82f622)', border: '1px solid #06b6d444', borderRadius: '2rem', padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Help & Guidance
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            How Rafiqy works
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textSecondary, margin: '0 0 1.5rem', lineHeight: 1.65, maxWidth: '580px' }}>
            {DIRECTORY_META.notice}
          </p>

          {/* Jump nav */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '2rem', padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem', fontWeight: 600, color: colors.text, cursor: 'pointer',
                }}>{s.icon} {s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Privacy & Storage ── */}
        <Section id="privacy" icon="🔒" title="Privacy & Storage" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', marginBottom: '1.25rem' }}>
            <Card icon="💾" title="Saved on this device only" color="#06b6d4" isDark={isDark} colors={colors}
              body="Some tools save selected records in browser storage; others keep inputs only until you leave the page. Online services, feedback and optional sync can send data to a backend. Check the individual tool." />
            <Card icon="🚫" title="Check each feature" color="#10b981" isDark={isDark} colors={colors}
              body="Many tools can be opened directly. Cloud-connected or future private features have separate connection and access requirements; a random browser identifier does not prove authorization." />
            <Card icon="👥" title="Shared browser warning" color="#f59e0b" isDark={isDark} colors={colors}
              body="If multiple people use the same browser profile, they can see each other's data. Use a private/incognito window for personal records, or use separate browser profiles." />
            <Card icon="🧹" title="Clearing your data" color="#ef4444" isDark={isDark} colors={colors}
              body='Clearing site storage can remove local saved records. Export supported local data before clearing it and keep the backup private. Page-only drafts and cloud records need separate handling.' />
          </div>

          <div style={{ background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>
            <strong style={{ color: '#06b6d4' }}>💡 Best practice:</strong> Export a backup regularly via the <strong style={{ color: colors.text }}>⚙️ gear icon → Export local data</strong>. Store the <code style={{ background: isDark ? '#334155' : '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '0.3rem', fontSize: '0.8rem' }}>typely-backup-*.json</code> file in a private location with appropriate access controls. Do not put personal backups in public repositories or posts.
          </div>
        </Section>

        {/* ── Cloud Sync & Backup ── */}
        <Section id="sync" icon="☁️" title="Cloud Sync & Backup" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', marginBottom: '1.25rem' }}>
            <Card icon="📴" title="Cloud Sync is OFF by default" color="#64748b" isDark={isDark} colors={colors}
              body="The Cloud Sync preference starts off. Enabling it requests sync for tools that support it; it does not confirm a connection, a successful backup or secure access controls." />
            <Card icon="☁️" title="When Cloud Sync is ON" color="#06b6d4" isDark={isDark} colors={colors}
              body="Supporting tools may send selected records to the configured backend. A session or recovery identifier is not a substitute for server-enforced authorization. Live access controls have not been verified in this review." />
            <Card icon="⬇️" title="Export supported local data" color="#0ea5e9" isDark={isDark} colors={colors}
              body='Use Preferences → Export local data for the listed local records, then Import on the destination browser. This does not include cloud records, every preference or page-only drafts. Review the file and destination first.' />
            <Card icon="🔑" title="Recovery / Session Code" color="#f97316" isDark={isDark} colors={colors}
              body="Some tools use a recovery or session identifier for cloud records. Treat it as private. It does not copy local browser storage and does not establish that backend access controls or recovery have been verified." />
          </div>

          <div style={{ background: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>
            <strong style={{ color: '#f59e0b' }}>Cloud sync and recovery are separate:</strong> A recovery identifier does not copy local browser records. Turning sync off does not erase earlier cloud records or prove that no records exist there. Use <strong style={{ color: colors.text }}>Export local data</strong> for supported local records; page-only drafts need a separate copy.
          </div>
        </Section>

        {/* ── Pakistan Tools ── */}
        <Section id="pk-tools" icon="🇵🇰" title="Pakistan Tools" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', marginBottom: '1.25rem' }}>
            <Card icon="🇵🇰" title="What are Pakistan Tools?" color="#10b981" isDark={isDark} colors={colors}
              body="Pakistan Tools are tools designed specifically for Pakistani users — including Tax Calculator (FBR slabs), CNIC/NTN validator, Salary Slip Generator, Gold Price (local rates), Kameti tracker, and more." />
            <Card icon="👁️" title="Showing / hiding Pakistan Tools" color="#10b981" isDark={isDark} colors={colors}
              body="Pakistan Tools can be toggled on or off from ⚙️ → Pakistan Tools toggle, or from the filter pill on the Tools home page. They're visible by default." />
            <Card icon="📋" title="Pakistan Tool list" color="#10b981" isDark={isDark} colors={colors}
              body="Pakistan Tax Calculator · Salary Slip Generator · Pakistan ID & Tax Hub (CNIC/NTN/STRN) · Kameti Tracker · Gold & Silver Calculator · Tax Shield Optimizer · Driving Fine Tracker · Loan Manager" />
          </div>
        </Section>

        {/* ── Urdu ── */}
        <Section id="urdu" icon="اردو" title="Urdu Language Support" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', marginBottom: '1rem' }}>
            <Card icon="🔤" title="Urdu Labels toggle" color="#f59e0b" isDark={isDark} colors={colors}
              body="Enable ⚙️ → Urdu Labels to see tool names and taglines in Urdu on the tools grid. Only tools with Urdu translations will show Urdu — others remain in English." />
            <Card icon="⌨️" title="Urdu Keyboard tool" color="#f59e0b" isDark={isDark} colors={colors}
              body="The Urdu Keyboard tool lets you type in Urdu using a phonetic Roman-to-Urdu input system. No special keyboard or IME required — works entirely in the browser." />
            <Card icon="🗣️" title="Roman Urdu search" color="#f59e0b" isDark={isDark} colors={colors}
              body='The search bar on the Tools page understands Roman Urdu. Type "tez typing" to find Typing Tutor, "hisab" to find calculators, etc.' />
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section id="faq" icon="❓" title="Frequently Asked Questions" colors={colors} isDark={isDark}>
          <div>
            {[
              { q: "Does Rafiqy work offline?", a: "Offline availability varies by tool, loaded assets and browser storage. Online data and cloud features need a connection. Loading or installing the site does not guarantee offline operation; test with non-sensitive examples first." },
              { q: "Will my data survive if I close the browser?", a: "Some tools save records in localStorage, which can persist across browser sessions. Page-only drafts may disappear. Clearing storage, private browsing, browser limits or errors can cause loss; do not assume every input was saved." },
              { q: "Can I use Rafiqy on multiple devices?", a: "For supported local records, use Preferences → Export local data and then Import on the destination browser. Cloud records and page-only drafts are outside that backup. Review the destination and keep the file private." },
              { q: "What is the Recovery Code shown in some tools?", a: "It is an identifier used by certain cloud features. Treat it as private; it does not transfer local storage or replace server-enforced authorization. Connection and recovery must be verified for the specific tool." },
              { q: "Is my data shared with anyone?", a: "Data handling varies. Online lookups, optional cloud sync and submitted feedback can contact backend services. Review the tool details and privacy information before entering private content." },
              { q: "Why do some tools show \"Saved on this device only\"?", a: "That message describes local storage for the relevant tool, not a verified cloud backup or a security guarantee. Other users of the browser profile may see local records. Do not enable sync just to dismiss a warning." },
              { q: "How do I report a bug or suggest a feature?", a: "Use the feedback button and check the submission result. Include a synthetic example and omit passwords, personal records and private documents. A submission attempt is not proof it was received or reviewed." },
              { q: 'Can I install Rafiqy as an app?', a: 'Yes! Rafiqy is a PWA (Progressive Web App). In Chrome/Edge, look for the install icon in the address bar. On mobile, use "Add to Home Screen" in your browser menu.' },
            ].map(item => (
              <FAQ key={item.q} q={item.q} a={item.a} colors={colors} isDark={isDark} />
            ))}
          </div>
        </Section>

      </main>
      <FeedbackButton />

      <footer style={{ textAlign: 'center', padding: '1rem', color: colors.textSecondary, fontSize: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
        © {new Date().getFullYear()} Rafiqy ·{' '}
        <Link to="/tools" style={{ color: 'inherit', textDecoration: 'underline' }}>All Tools</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</Link>
      </footer>
    </div>
  )
}
