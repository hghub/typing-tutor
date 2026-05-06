import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import { TOOLS } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import FeedbackButton from '../components/FeedbackButton'
import { BLOG_POSTS } from '../data/blogPosts'
import { getToolScenarioLine } from '../lib/toolUsage'
import { getAccessibilityNote } from '../lib/pakistanAccessibility'

const CATEGORY_TOOL_PRIORITY = {
  'pakistan-tools': ['solar-planner','tax-calculator','investment-allocation-planner','loan-emi','rent-vs-buy-pakistan','car-powertrain-decision','salary-offer-evaluator','freelance-tax-planner','gold-price','pk-id-tax-hub','salary-slip','tax-optimizer','kameti','driving-fines'],
  'finance-tools': ['loan-emi','tax-calculator','investment-allocation-planner','expense-analyzer','loan-manager','gold-price','currency-converter','salary-slip','position-size-calc','budget-splitter','tax-optimizer'],
  'writing-tools': ['urdu-keyboard','word-counter','text-cleaner','doc-composer','image-suite'],
  'pdf-tools': ['compress-pdf','merge-pdf','split-pdf','pdf-convert','doc-converter','text-extractor','pdf-search'],
  'security-tools': ['data-leak-detector','text-encryptor','doc-redaction','password-generator'],
  'developer-tools': ['json-formatter','regex-tester','mock-data','data-transformer','config-converter','log-analyzer','schema-mapper','trace-correlator','markdown-scraper'],
  'productivity-tools': ['typing-tutor','pomodoro','world-time','daily-planner','habit-tracker','voice-diary','resume-builder','unit-converter','age-calculator'],
  'image-tools': ['image-suite','text-extractor','doc-redaction','doc-converter','pdf-convert'],
}

const CATEGORY_BLOG_PRIORITY = {
  'pakistan-tools': ['how-to-check-cnic-ntn-and-tax-reference-details-in-one-place','how-to-file-salaried-tax-return-in-pakistan','legal-ways-to-save-salary-tax-in-pakistan','how-tax-shield-optimizer-helps-you-see-what-actually-saves-tax','pakistan-income-tax-calculator','investment-allocation-planner-pakistan-guide','rent-vs-buy-calculator-pakistan-guide','solar-planner-pakistan','is-ev-worth-it-in-pakistan','how-to-run-a-kameti-or-committee-without-confusion'],
  'finance-tools': ['how-much-loan-can-i-afford','should-you-pay-off-a-loan-early','how-to-calculate-emi','how-to-manage-multiple-loans-without-losing-track','how-to-file-salaried-tax-return-in-pakistan','legal-ways-to-save-salary-tax-in-pakistan','how-tax-shield-optimizer-helps-you-see-what-actually-saves-tax','investment-allocation-planner-pakistan-guide'],
  'writing-tools': ['how-to-write-a-clean-letter-or-cv-fast-without-word','how-to-use-urdu-typing-for-whatsapp-cv-and-forms','urdu-typing-online','type-urdu-online-without-inpage','word-count-for-seo','writing-tools'],
  'pdf-tools': ['compress-pdf-online','pdf-tools-guide'],
  'security-tools': ['how-to-check-a-cv-or-document-for-sensitive-data-before-sending','how-to-redact-sensitive-info-before-sharing-documents','password-generator-security','security-privacy-tools'],
  'developer-tools': ['how-to-convert-csv-json-and-tsv-without-uploading-private-data','how-to-convert-env-json-yaml-and-toml-without-breaking-config','how-to-turn-a-web-page-into-clean-markdown-for-ai-or-notes','how-to-build-an-accessible-color-palette-without-guessing','how-to-format-and-validate-json-before-sharing-or-importing','how-to-read-logs-and-find-errors-faster','how-to-map-fields-between-two-systems-without-confusion','how-to-trace-one-request-across-multiple-services','how-to-compare-two-versions-of-text-and-see-exact-changes','developer-tools'],
  'productivity-tools': ['how-to-find-a-good-meeting-time-across-pakistan-dubai-uk-and-us','how-to-split-family-trip-or-friend-expenses','productivity-tools'],
  'health-tools': ['how-to-track-symptoms-with-weather-and-real-life-context','how-to-track-weight-blood-pressure-or-any-measurement-over-time','how-to-check-medicine-interactions-before-taking-two-medicines','health-wellness-tools'],
  'business-tools': ['how-to-track-money-you-lent-or-borrowed-without-forgetting-payments','how-to-track-warranties-before-the-claim-window-closes','how-to-spot-risky-freelance-clients-before-you-start-work','how-to-use-voice-invoice-for-freelancers-and-small-shops','business-tools'],
  'travel-tools': ['how-to-budget-a-trip-when-prices-are-in-aed-sar-usd-and-pkr','how-to-pack-for-weather-and-travel-documents-without-forgetting-essentials','how-to-find-a-good-meeting-time-across-pakistan-dubai-uk-and-us','how-to-split-family-trip-or-friend-expenses','travel-tools'],
  'education-tools': ['how-to-make-fair-student-groups-without-favoritism','student-group-randomizer-for-teachers'],
}

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
    metaDesc: 'Calculate loan EMI, Pakistan income tax, investment allocation, expense tracking, salary slips and more. Free finance tools built for Pakistan. No sign-up.',
    intro: 'Rafiqy\'s finance tools are designed for Pakistani users who need fast, practical answers. Calculate monthly loan EMI, check tax, split investment money, generate salary slips, track expenses, or compare borrowing decisions — all without sharing your financial data with any server. The important finance tools are written to be understandable even if you search in simpler English or Roman Urdu.',
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
    metaDesc: 'Pakistan-specific tools: tax calculator, solar planner, investment allocation, loan EMI, salary tools, CNIC decoder, gold price tracker and more. Free and private.',
    intro: 'Rafiqy was built with Pakistani users in mind. Our Pakistan-specific tools help you calculate tax, judge solar, plan investments, compare renting vs buying, evaluate job offers, check gold price, estimate safer loans, decode CNIC numbers, and manage salary or local planning tasks. The goal is not just calculation, but making the answer easier to understand for everyday users in Pakistan.',
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
    title: 'Free Image, OCR & Visual Document Tools',
    metaTitle: 'Free Image, OCR & Visual Document Tools | Rafiqy',
    metaDesc: 'Edit images, extract text, convert visual files and prepare documents privately in your browser. Free, no sign-up, no uploads.',
    intro: 'Rafiqy\'s visual document tools help you prepare images and scanned files without sending them anywhere. Clean up images, extract text from screenshots, convert document formats, and prepare files for sharing or archiving directly in your browser.',
    toolIds: ['image-suite', 'text-extractor', 'doc-converter', 'pdf-convert', 'doc-redaction'],
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

  const categoryIds = data.categories || []
  const tools = data.toolIds?.length
    ? TOOLS.filter(t => data.toolIds.includes(t.id))
    : TOOLS.filter(t => categoryIds.includes(t.category))
  const toolPriority = CATEGORY_TOOL_PRIORITY[category] || []
  const sortedTools = [...tools].sort((a, b) => {
    const ai = toolPriority.indexOf(a.id)
    const bi = toolPriority.indexOf(b.id)
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1
      if (bi === -1) return -1
      if (ai !== bi) return ai - bi
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>{data.metaTitle}</title>
        <meta name="description" content={data.metaDesc} />
        <link rel="canonical" href={`https://rafiqy.app/category/${category}`} />
        <meta property="og:title" content={data.metaTitle} />
        <meta property="og:description" content={data.metaDesc} />
        <meta property="og:url" content={`https://rafiqy.app/category/${category}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={data.metaTitle} />
        <meta name="twitter:description" content={data.metaDesc} />
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
          {sortedTools.map(tool => (
            <Link key={tool.id} to={tool.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              {(() => {
                const scenarioLine = getToolScenarioLine(tool)
                return (
              <div style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '1.25rem',
                transition: 'border-color .15s, transform .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = colors.textSecondary
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{tool.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tool.name}</span>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '0.83rem', lineHeight: 1.5, margin: 0 }}>
                  {tool.tagline}
                </p>
                <p style={{ color: colors.textSecondary, fontSize: '0.74rem', lineHeight: 1.55, margin: '0.55rem 0 0', opacity: 0.85 }}>
                  {getAccessibilityNote(tool.id)?.simple || scenarioLine}
                </p>
              </div>
                )
              })()}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/tools" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>
            ← Browse all 68 tools
          </Link>
        </div>

        {/* Related Blog Posts */}
        {(() => {
          const related = BLOG_POSTS
            .filter(p => categoryIds.includes(p.category?.toLowerCase()))
            .sort((a, b) => {
              const priority = CATEGORY_BLOG_PRIORITY[category] || []
              const ai = priority.indexOf(a.slug)
              const bi = priority.indexOf(b.slug)
              if (ai !== -1 || bi !== -1) {
                if (ai === -1) return 1
                if (bi === -1) return -1
                if (ai !== bi) return ai - bi
              }
              return new Date(b.publishDate || 0) - new Date(a.publishDate || 0)
            })
            .slice(0, 4)
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
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
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
      <FeedbackButton />
    </div>
  )
}
