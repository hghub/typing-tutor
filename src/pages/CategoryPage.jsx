import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { TOOLS } from '../tools/registry'
import ToolsNav from '../components/ToolsNav'
import FeedbackButton from '../components/FeedbackButton'
import { BLOG_POSTS } from '../data/blogPosts'
import { getBlogPostPath } from '../data/blogRoutes'
import { CATEGORY_BLOG_PRIORITY, CATEGORY_DATA, CATEGORY_TOOL_PRIORITY } from '../data/categoryPages'
import { getToolScenarioLine } from '../lib/toolUsage'
import { getAccessibilityNote } from '../lib/pakistanAccessibility'

export default function CategoryPage({ category }) {
  const { colors } = useTheme()
  const { prefs } = usePreferences()
  const data = CATEGORY_DATA[category]
  if (!data) return null

  const categoryIds = data.categories || []
  const priorityIds = CATEGORY_TOOL_PRIORITY[category] || []
  const tools = data.toolIds?.length
    ? TOOLS.filter(t => data.toolIds.includes(t.id))
    : TOOLS.filter(t => categoryIds.includes(t.category) || priorityIds.includes(t.id))
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

  const getDisplayName = (tool) => (prefs.urduLabels && tool.nameUrdu ? tool.nameUrdu : tool.name)
  const getDisplayTagline = (tool) => (prefs.urduLabels && tool.taglineUrdu ? tool.taglineUrdu : tool.tagline)

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
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', direction: prefs.urduLabels && tool.nameUrdu ? 'rtl' : 'ltr' }}>{getDisplayName(tool)}</span>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '0.83rem', lineHeight: 1.5, margin: 0 }}>
                  {getDisplayTagline(tool)}
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
          const priority = CATEGORY_BLOG_PRIORITY[category] || []
          const related = BLOG_POSTS
            .filter(p => categoryIds.includes(p.category?.toLowerCase()) || priority.includes(p.slug))
            .sort((a, b) => {
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
                  <Link key={post.slug} to={getBlogPostPath(post)} style={{ textDecoration: 'none' }}>
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
