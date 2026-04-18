import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import { TOOLS } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'

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
            ← Browse all 57 tools
          </Link>
        </div>
      </main>
    </div>
  )
}
