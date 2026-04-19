import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import { TOOLS } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import { BLOG_POSTS } from '../data/blogPosts'

const CATEGORY_DATA = {
  'productivity-tools': {
    title: 'Productivity Tools Online',
    metaTitle: 'Free Productivity Tools Online | Rafiqy',
    metaDesc: 'Boost your productivity with free online tools — Pomodoro timer, daily planner, habit tracker, voice diary and more. No sign-up required.',
    intro: 'Rafiqy\'s productivity tools help you get more done every day. Whether you need to manage your time with the Pomodoro technique, track daily habits, plan your schedule, or take voice notes, our free browser-based tools have you covered. All tools work offline after first load, store data locally, and require zero sign-up. Used by students, freelancers, and professionals across Pakistan.',
    categories: ['productivity'],
  },
  'finance-tools': {
    title: 'Free Finance Tools Online',
    metaTitle: 'Free Finance & Tax Calculators Online | Rafiqy',
    metaDesc: 'Calculate loan EMI, Pakistan income tax, expense tracking, salary slips and more. Free finance tools built for Pakistan. No sign-up.',
    intro: 'Rafiqy\'s finance tools are designed for Pakistani users who need fast, accurate calculations. Calculate your monthly loan EMI, plan Kameti rotations, generate salary slips, track expenses, or optimize your FBR tax liability — all without sharing your financial data with any server. Tools are updated for FBR 2025-26 tax slabs.',
    categories: ['finance', 'pakistan'],
  },
  'pdf-tools': {
    title: 'Free PDF Tools Online',
    metaTitle: 'Free PDF Tools Online — Compress, Merge, Convert | Rafiqy',
    metaDesc: 'Compress, merge, split, convert and extract text from PDFs. All free, browser-based — your files never leave your device.',
    intro: 'Rafiqy offers a complete PDF toolkit that runs entirely in your browser using WebAssembly. Compress PDFs to reduce file size, merge multiple PDFs into one, split large documents, convert images to PDF, or extract text. Unlike cloud PDF tools, your files are never uploaded to any server — everything processes locally on your device.',
    categories: ['pdf'],
  },
  'developer-tools': {
    title: 'Free Developer Tools Online',
    metaTitle: 'Free Developer Tools Online — JSON, Regex, Data | Rafiqy',
    metaDesc: 'Free online developer tools — JSON formatter, regex tester, mock data generator, config converter, log analyzer and more.',
    intro: 'Rafiqy\'s developer toolkit gives you fast, no-frills tools for everyday coding tasks. Format and validate JSON, test regex patterns, generate mock data for testing, convert between config formats (JSON/YAML/TOML), analyze logs, and map database schemas — all without leaving your browser. No API keys, no rate limits, no accounts.',
    categories: ['developer'],
  },
  'pakistan-tools': {
    title: 'Free Pakistan Online Tools',
    metaTitle: 'Free Pakistan Tools Online — CNIC, Tax, Gold | Rafiqy',
    metaDesc: 'Pakistan-specific tools: CNIC decoder, FBR tax calculator, gold price tracker, Kameti planner, driving fines and more. Free, private.',
    intro: 'Rafiqy was built with Pakistani users in mind. Our Pakistan-specific tools help you decode CNIC numbers, calculate FBR income tax, check live gold prices in PKR, plan Kameti committee rotations, track driving fines, and generate professional salary slips compliant with Pakistani payroll standards. All tools are free, work in Urdu, and process data locally.',
    categories: ['pakistan'],
  },
  'writing-tools': {
    title: 'Free Writing Tools Online',
    metaTitle: 'Free Writing Tools Online — Word Count, Docs & More | Rafiqy',
    metaDesc: 'Free online writing tools — word counter, text formatter, doc composer, phonetic Urdu keyboard and more. Private, browser-based, no sign-up.',
    intro: 'Rafiqy\'s writing tools are built for writers, students, journalists, and content creators who need fast, reliable utilities without the bloat of a full word processor. Count words and characters, format and clean text, compose and export documents, type in Urdu phonetically, or convert documents between formats — all directly in your browser. Every tool processes your text locally, so your writing never leaves your device.',
    categories: ['writing'],
  },
  'image-tools': {
    title: 'Free Image Tools Online',
    metaTitle: 'Free Image Tools Online — Compress, Convert & Edit | Rafiqy',
    metaDesc: 'Compress, convert, rotate and watermark images online. Browser-based — your images never leave your device. Free, no sign-up.',
    intro: 'Rafiqy\'s image tools run entirely in your browser using WebAssembly and the Canvas API — your images are never uploaded to any server. Compress JPG and PNG files to reduce size, convert between image formats (JPG/PNG/WebP), rotate and flip images, add text watermarks, and resize images to exact dimensions. All operations happen locally on your device, making it the most private image tool available.',
    categories: ['media'],
  },
  'security-tools': {
    title: 'Free Security & Privacy Tools Online',
    metaTitle: 'Free Security & Privacy Tools Online | Rafiqy',
    metaDesc: 'Generate strong passwords, encrypt text, hash data and protect your privacy. All free, browser-based — nothing sent to any server.',
    intro: 'Rafiqy\'s security and privacy tools are designed for users who take their digital safety seriously. Generate cryptographically strong passwords with custom rules, encrypt and decrypt text using AES encryption, compute MD5/SHA hash values for file verification, and protect sensitive data — all without transmitting a single byte to any external server. Every operation runs locally in your browser using the Web Crypto API.',
    categories: ['security'],
  },
}

export default function CategoryPage({ category }) {
  const { colors } = useTheme()
  const data = CATEGORY_DATA[category]
  if (!data) return null

  const tools = TOOLS.filter(t => data.categories.includes(t.category))

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>{data.metaTitle}</title>
        <meta name="description" content={data.metaDesc} />
        <link rel="canonical" href={`https://rafiqy.app/category/${category}`} />
        <meta property="og:title" content={data.metaTitle} />
        <meta property="og:description" content={data.metaDesc} />
        <meta property="og:url" content={`https://rafiqy.app/category/${category}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': data.title,
          'url': `https://rafiqy.app/category/${category}`,
          'description': data.metaDesc,
        })}</script>
      </Helmet>
      <ToolsNav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <nav style={{ fontSize: '0.8rem', color: colors.textSecondary, marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: colors.textSecondary, textDecoration: 'none' }}>Home</Link>
          {' › '}
          <Link to="/tools" style={{ color: colors.textSecondary, textDecoration: 'none' }}>Tools</Link>
          {' › '}
          <span>{data.title}</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          {data.title}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 780, marginBottom: '3rem' }}>
          {data.intro}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {tools.map(tool => (
            <Link key={tool.id} to={tool.path} style={{ textDecoration: 'none' }}>
              <div style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '1.25rem',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = tool.color || '#06b6d4'}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{tool.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tool.name}</span>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '0.83rem', lineHeight: 1.5, margin: 0 }}>
                  {tool.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/tools" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>
            ← Browse all 63 tools
          </Link>
        </div>

        {/* Related Blog Posts */}
        {(() => {
          const related = BLOG_POSTS.filter(p => data.categories.includes(p.category?.toLowerCase())).slice(0, 3)
          if (!related.length) return null
          return (
            <div style={{ marginTop: '3rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: colors.text }}>
                📖 Related Guides
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '0.75rem' }}>
                {related.map(post => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.75rem',
                      padding: '1rem 1.1rem',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{post.hero}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: colors.text, marginBottom: '0.3rem', lineHeight: 1.4 }}>{post.title}</div>
                      <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>{post.readTime} · {post.tags.slice(0,2).join(', ')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}
      </main>
    </div>
  )
}
