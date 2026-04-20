import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { TOOLS } from '../tools/registry'
import { BLOG_POSTS } from '../data/blogPosts'
import ToolsNav from '../components/ToolsNav'
import ShareBar from '../components/ShareBar'

const FEATURED_IDS = [
  'typing-tutor', 'loan-emi', 'tax-calculator',
  'compress-pdf', 'word-counter', 'expense-analyzer',
  'data-leak-detector', 'drug-checker',
]

const QUICK_ACTIONS = [
  { label: '⌨ Typing Tutor', path: '/tools/typing-tutor', desc: 'Typing tutor' },
  { label: '⏱ Pomodoro', path: '/tools/pomodoro', desc: 'Focus timer' },
  { label: '🌍 World Time', path: '/tools/world-time', desc: 'Time zones' },
  { label: '📄 Compress PDF', path: '/tools/compress-pdf', desc: 'Shrink files' },
  { label: '💰 EMI Calc', path: '/tools/loan-emi', desc: 'Loan calculator' },
  { label: '🧮 Tax Calc', path: '/tools/tax-calculator', desc: 'FBR 2025-26' },
]

const WHAT_YOU_CAN_DO = [
  {
    icon: '📝',
    title: 'Write & Format',
    desc: 'Word counter, text formatter, doc composer, Urdu keyboard — everything for your writing workflow.',
    tools: ['/tools/word-counter', '/tools/text-cleaner', '/tools/doc-composer'],
    labels: ['Word Counter', 'Text Formatter', 'Doc Composer'],
  },
  {
    icon: '💰',
    title: 'Finance & Tax',
    desc: 'Pakistan tax calculator, EMI planner, expense tracker, salary slip generator and more.',
    tools: ['/tools/tax-calculator', '/tools/loan-emi', '/tools/expense-analyzer'],
    labels: ['Tax Calculator', 'Loan EMI', 'Expense Analyzer'],
  },
  {
    icon: '📄',
    title: 'PDF Tools',
    desc: 'Compress, merge, split, convert and extract text from PDFs — all in your browser, nothing uploaded.',
    tools: ['/tools/compress-pdf', '/tools/merge-pdf', '/tools/text-extractor'],
    labels: ['Compress', 'Merge', 'Extract Text'],
  },
  {
    icon: '🔒',
    title: 'Privacy & Security',
    desc: 'Check for data leaks, encrypt text, redact sensitive documents — zero server interaction.',
    tools: ['/tools/data-leak-detector', '/tools/text-encryptor', '/tools/doc-redaction'],
    labels: ['Leak Detector', 'Encryptor', 'Doc Redaction'],
  },
  {
    icon: '🇵🇰',
    title: 'Pakistan Tools',
    desc: 'CNIC decoder, FBR tax hub, Kameti planner, gold price tracker and driving fine calculator.',
    tools: ['/tools/pk-id-tax-hub', '/tools/kameti', '/tools/gold-price'],
    labels: ['PK ID & Tax Hub', 'Kameti', 'Gold Price'],
  },
  {
    icon: '🛠',
    title: 'Developer Tools',
    desc: 'Regex tester, JSON formatter, mock data generator, config converter — for devs on the go.',
    tools: ['/tools/regex-tester', '/tools/json-formatter', '/tools/mock-data'],
    labels: ['Regex Tester', 'JSON Formatter', 'Mock Data'],
  },
]

export default function Landing() {
  const featured = FEATURED_IDS.map(id => TOOLS.find(t => t.id === id)).filter(Boolean)
  const recentPosts = BLOG_POSTS.slice(-3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>Rafiqy – A Simple Digital Companion for Everyday Tasks</title>
        <meta name="description" content="Fast, free, and secure online tools for everyday tasks — typing, PDFs, finance, timers, productivity and more. All in one simple digital toolbox. No sign-up." />
        <link rel="canonical" href="https://rafiqy.app/" />
        <meta property="og:title" content="Rafiqy – A Simple Digital Companion for Everyday Tasks" />
        <meta property="og:description" content="Fast, free, and secure online tools for everyday tasks — typing, PDFs, finance, timers, productivity and more. All in one simple digital toolbox. No sign-up." />
        <meta property="og:url" content="https://rafiqy.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'Rafiqy',
          'url': 'https://rafiqy.app',
          'description': 'A simple digital companion for everyday tasks — 63 free browser-based tools for productivity, finance, PDF, typing, and more.',
          'potentialAction': { '@type': 'SearchAction', 'target': 'https://rafiqy.app/tools?q={search_term_string}', 'query-input': 'required name=search_term_string' }
        })}</script>
      </Helmet>

      {/* ── Nav ── */}
      <ToolsNav />

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
          🔒 Files never leave your browser · 100% Private · No sign-up
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
          Your everyday digital toolbox<br />
          <span style={{ color: 'var(--color-primary)' }}>for faster work online</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', maxWidth: 580, margin: '0 auto 0.5rem' }}>
          A simple, fast, and secure collection of tools for productivity, learning, finance, and daily digital tasks.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: 520, margin: '0 auto 2.5rem', opacity: 0.65, fontStyle: 'italic' }}>
          A simple digital companion for everyday tasks.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/tools" style={{ background: 'var(--color-primary)', color: '#0f172a', padding: '0.8rem 2.25rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
            Open Tools →
          </Link>
          <Link to="/tools/typing-tutor" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.8rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
            ⌨ Try Typing Tutor
          </Link>
        </div>
      </section>

      {/* SEO Intro */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.8 }}>
          Rafiqy is a modern digital toolbox designed to help you complete everyday tasks faster. Whether you're a student, professional, developer or freelancer — there's a tool for your daily digital needs. Every tool runs entirely in your browser, so your files and data never leave your device.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.8, marginTop: '0.75rem' }}>
          From{' '}
          <Link to="/tools/typing-tutor" style={{ color: 'var(--color-primary)' }}>improving your typing speed</Link>,{' '}
          <Link to="/tools/compress-pdf" style={{ color: 'var(--color-primary)' }}>compressing a PDF</Link>,{' '}
          <Link to="/tools/loan-emi" style={{ color: 'var(--color-primary)' }}>calculating your loan EMI</Link>, or{' '}
          <Link to="/tools/word-counter" style={{ color: 'var(--color-primary)', marginLeft: 4 }}>counting words</Link>{' '}
          — Rafiqy has a tool for it. All free, all instant, all private.
        </p>
      </section>

      {/* ── Quick Actions ── */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', textAlign: 'center' }}>
          Jump right in
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {QUICK_ACTIONS.map(qa => (
            <Link key={qa.path} to={qa.path} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 999, padding: '0.5rem 1.1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)' }}>
                {qa.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── What You Can Do ── */}
      <section style={{ padding: '3rem 2rem', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
            What you can do with Rafiqy
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            No clutter. No distractions. Just useful tools — all running in your browser.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {WHAT_YOU_CAN_DO.map(cat => (
              <div key={cat.title} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{cat.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{cat.desc}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {cat.tools.map((path, i) => (
                    <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 999, padding: '0.2rem 0.65rem', fontWeight: 500 }}>
                        {cat.labels[i]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/tools" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Browse all 63 tools →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Tools ── */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Popular tools
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {featured.map(tool => (
            <Link key={tool.id} to={tool.path} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'var(--color-surface)', border: tool.id === 'typing-tutor' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem', transition: 'border-color .2s', cursor: 'pointer', position: 'relative' }}
                onMouseEnter={e => { if (tool.id !== 'typing-tutor') e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={e => { if (tool.id !== 'typing-tutor') e.currentTarget.style.borderColor = 'var(--color-border)' }}>
                {tool.id === 'typing-tutor' && (
                  <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.65rem', background: 'var(--color-primary)', color: '#0f172a', borderRadius: 999, padding: '0.15rem 0.5rem', fontWeight: 700 }}>
                    FLAGSHIP
                  </span>
                )}
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tool.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{tool.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/tools" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            View all 63 tools →
          </Link>
        </div>
      </section>

      {/* ── Companion strip ── */}
      <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Your simple digital companion
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            A digital toolbox built to help you get everyday tasks done — fast, free, and private.
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              ['🔒', 'Zero Uploads', 'All processing happens in your browser — documents, data, everything.'],
              ['📵', 'No Tracking', 'No analytics or fingerprinting on tool pages. Your data stays yours.'],
              ['⚡', 'Instant Results', 'No server round-trips — results appear in milliseconds.'],
              ['🌐', 'Works Offline', 'Once loaded, most tools work without an internet connection.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: 'center', minWidth: 190, maxWidth: 210 }}>
                <div style={{ fontSize: '1.75rem' }}>{icon}</div>
                <div style={{ fontWeight: 600, marginTop: '0.5rem', marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── From Our Blog ── */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>📖 From Our Blog</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Tips, guides and tool walkthroughs for getting the most out of Rafiqy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {recentPosts.map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.5rem', height: '100%', boxSizing: 'border-box', transition: 'border-color .2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{post.hero}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 999, padding: '0.15rem 0.6rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{post.readTime}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                  {post.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                  {post.description.length > 100 ? post.description.slice(0, 100) + '…' : post.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/blog" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Read all articles →
          </Link>
        </div>
      </section>

      {/* ── Share ── */}
      <div style={{ textAlign: 'center', padding: '0 2rem 1.5rem' }}>
        <ShareBar url="https://rafiqy.app" title="Rafiqy — Free Privacy-First Online Tools for Pakistan" />
      </div>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <Link to="/tools" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>Tools</Link>
        <Link to="/blog" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>Blog</Link>
        <Link to="/help" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>Help</Link>
        <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>About</Link>
        <span>© {new Date().getFullYear()} Rafiqy — A simple digital companion for everyday tasks</span>
      </footer>
    </div>
  )
}

