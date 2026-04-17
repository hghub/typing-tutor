import { useState } from 'react'
import { Link } from 'react-router-dom'
import ToolsNav from '../components/ToolsNav'
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
      <ToolsNav />

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.25rem 4rem' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #06b6d422, #3b82f622)', border: '1px solid #06b6d444', borderRadius: '2rem', padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Help & Guidance
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: colors.text }}>
            How Typely works
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textSecondary, margin: '0 0 1.5rem', lineHeight: 1.65, maxWidth: '580px' }}>
            Everything runs in your browser. No account, no uploads, no tracking. Here's what you need to know about your data, privacy, and settings.
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
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '1.25rem' }}>
            <Card icon="💾" title="Saved on this device only" color="#06b6d4" isDark={isDark} colors={colors}
              body="All your data (loans, habits, diary entries, fines, etc.) is saved in your browser's localStorage. Nothing is ever sent to a server unless you explicitly turn on Cloud Sync." />
            <Card icon="🚫" title="No account or login needed" color="#10b981" isDark={isDark} colors={colors}
              body="Typely never asks you to sign up or log in. All tools work immediately, anonymously, and locally." />
            <Card icon="👥" title="Shared browser warning" color="#f59e0b" isDark={isDark} colors={colors}
              body="If multiple people use the same browser profile, they can see each other's data. Use a private/incognito window for personal records, or use separate browser profiles." />
            <Card icon="🧹" title="Clearing your data" color="#ef4444" isDark={isDark} colors={colors}
              body='Clearing browser storage or cookies will permanently delete your Typely data. Always export a backup first via ⚙️ → "Export All" before clearing your browser.' />
          </div>

          <div style={{ background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>
            <strong style={{ color: '#06b6d4' }}>💡 Best practice:</strong> Export a backup regularly via the <strong style={{ color: colors.text }}>⚙️ gear icon → Export All</strong>. Store the <code style={{ background: isDark ? '#334155' : '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '0.3rem', fontSize: '0.8rem' }}>typely-backup-*.json</code> file somewhere safe (cloud drive, email to yourself).
          </div>
        </Section>

        {/* ── Cloud Sync & Backup ── */}
        <Section id="sync" icon="☁️" title="Cloud Sync & Backup" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '1.25rem' }}>
            <Card icon="📴" title="Cloud Sync is OFF by default" color="#64748b" isDark={isDark} colors={colors}
              body="Cloud Sync is disabled by default to protect your privacy. Your data stays local unless you opt in. Enable it in ⚙️ → Cloud Sync toggle." />
            <Card icon="☁️" title="When Cloud Sync is ON" color="#06b6d4" isDark={isDark} colors={colors}
              body="Data from tools like Loan Manager, Habit Tracker, Voice Diary, Kameti and Daily Planner syncs to a secure anonymous cloud session — identified only by a random ID, no email needed." />
            <Card icon="⬇️" title="Export All — move to another device" color="#8b5cf6" isDark={isDark} colors={colors}
              body='Click ⚙️ → "Export All" to download a single JSON backup of all your tool data. Then open Typely on any other browser/device, click ⚙️ → "Import" and pick that file.' />
            <Card icon="🔑" title="Recovery / Session Code" color="#f97316" isDark={isDark} colors={colors}
              body="Some tools show a Recovery Code (a random UUID). This code links your local browser to your cloud session. It only works for cloud sync — it does NOT transfer your localStorage data to another device." />
          </div>

          <div style={{ background: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.83rem', color: colors.textSecondary, lineHeight: 1.65 }}>
            <strong style={{ color: '#f59e0b' }}>⚠️ Cloud Sync off + Recovery Code:</strong> If Cloud Sync is <em>off</em>, the Recovery Code shown in tools cannot restore data on another device — because nothing has been backed up to the cloud. Use <strong style={{ color: colors.text }}>Export All</strong> instead.
          </div>
        </Section>

        {/* ── Pakistan Tools ── */}
        <Section id="pk-tools" icon="🇵🇰" title="Pakistan Tools" colors={colors} isDark={isDark}>
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '1.25rem' }}>
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
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '1rem' }}>
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
              { q: 'Does Typely work offline?', a: 'Yes. Most tools work fully offline once the page has loaded. A few tools that fetch live data (currency rates, gold prices, weather) require an internet connection for fresh data, but still load the UI offline.' },
              { q: 'Will my data survive if I close the browser?', a: 'Yes — data is saved in localStorage which persists across browser sessions. It will only be lost if you clear browser data/cookies, or uninstall the browser.' },
              { q: 'Can I use Typely on multiple devices?', a: 'Yes. Use ⚙️ → Export All on your current device to download a backup file, then on the new device go to ⚙️ → Import and pick that file. All your data will be restored instantly.' },
              { q: 'What is the Recovery Code shown in some tools?', a: 'It\'s a random anonymous session ID used for optional cloud sync. It\'s NOT a password and it does NOT transfer your data unless Cloud Sync is turned ON. For moving data between devices, use Export/Import instead.' },
              { q: 'Is my data shared with anyone?', a: 'No. All tool processing is done entirely in your browser. No data is sent to any server unless you explicitly enable Cloud Sync. Even then, it\'s tied only to an anonymous random ID — no email, no name.' },
              { q: 'Why do some tools show "Saved on this device only"?', a: 'This message reminds you that your data is in this browser only, not backed up to the cloud. It appears in tools that store significant personal data (fines, loans, diary, habits). You can dismiss it by enabling Cloud Sync or just ignoring it — your data is safe locally.' },
              { q: 'How do I report a bug or suggest a feature?', a: 'Use the feedback button (💬 floating at the bottom of every page) to send us a quick 👍/👎 or a written note. We read all feedback.' },
              { q: 'Can I install Typely as an app?', a: 'Yes! Typely is a PWA (Progressive Web App). In Chrome/Edge, look for the install icon in the address bar. On mobile, use "Add to Home Screen" in your browser menu.' },
            ].map(item => (
              <FAQ key={item.q} q={item.q} a={item.a} colors={colors} isDark={isDark} />
            ))}
          </div>
        </Section>

      </main>

      <footer style={{ textAlign: 'center', padding: '1rem', color: colors.textSecondary, fontSize: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
        © {new Date().getFullYear()} Typely ·{' '}
        <Link to="/tools" style={{ color: 'inherit', textDecoration: 'underline' }}>All Tools</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link to="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</Link>
      </footer>
    </div>
  )
}
