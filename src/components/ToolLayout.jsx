import { Suspense, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ToolsNav from './ToolsNav'
import RelatedTools from './RelatedTools'
import TrustBadge from './TrustBadge'
import FeedbackButton from './FeedbackButton'
import ToolHelpDialog from './ToolHelpDialog'
import ToolSEOFooter from './ToolSEOFooter'
import ShareBar from './ShareBar'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { TOOLS } from '../tools/registry'
import TOOL_SEO from '../data/toolSEO'
import { BLOG_POSTS } from '../data/blogPosts'

function LoadingSpinner({ colors }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      color: colors.textSecondary,
      fontSize: '0.9rem',
      gap: '0.5rem',
    }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</span>
      Loading…
    </div>
  )
}

/**
 * Shared wrapper for every tool page.
 * Renders: sticky nav → tool content → related tools → trust badge
 *
 * @param {string} toolId  - id from the registry (used for RelatedTools)
 * @param {ReactNode} children - the tool's actual UI
 */
export default function ToolLayout({ toolId, children }) {
  const { isDark, colors } = useTheme()
  const { prefs } = usePreferences()
  const [helpOpen, setHelpOpen] = useState(false)
  const tool = TOOLS.find(t => t.id === toolId)
  const seo = TOOL_SEO[toolId]

  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
    data-theme={isDark ? 'dark' : 'light'}
    >
      {tool && seo && (
        <Helmet>
          <title>{seo.metaTitle || `${tool.name} — Free Online Tool | Rafiqy`}</title>
          <meta name="description" content={seo.metaDesc || seo.paras[0].slice(0, 155)} />
          <link rel="canonical" href={`https://rafiqy.app${tool.path}`} />
          <meta property="og:title" content={seo.metaTitle || `${tool.name} — Free Online Tool | Rafiqy`} />
          <meta property="og:description" content={seo.metaDesc || seo.paras[0].slice(0, 155)} />
          <meta property="og:url" content={`https://rafiqy.app${tool.path}`} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Rafiqy" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={seo.metaTitle || `${tool.name} — Free Online Tool | Rafiqy`} />
          <meta name="twitter:description" content={seo.metaDesc || seo.paras[0].slice(0, 155)} />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': tool.name,
            'url': `https://rafiqy.app${tool.path}`,
            'description': seo.metaDesc || seo.paras[0],
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Web Browser',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'provider': { '@type': 'Organization', 'name': 'Rafiqy', 'url': 'https://rafiqy.app' }
          })}</script>
          {seo.faqs && seo.faqs.length > 0 && (
            <script type="application/ld+json">{JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': seo.faqs.map(faq => ({
                '@type': 'Question',
                'name': faq.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': faq.a }
              }))
            })}</script>
          )}
        </Helmet>
      )}
      <ToolsNav />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Tool header row with "About this tool" hint */}
        {tool && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button
              onClick={() => setHelpOpen(true)}
              title={prefs.urduLabels ? 'اس ٹول کے بارے میں' : 'About this tool'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: '2rem',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer',
                color: colors.textSecondary,
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = tool.color
                e.currentTarget.style.color = tool.color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>ℹ️</span>
              {prefs.urduLabels ? 'اس ٹول کے بارے میں' : 'About this tool'}
            </button>
          </div>
        )}

        <Suspense fallback={<LoadingSpinner colors={colors} />}>
          {children}
        </Suspense>

        {/* Share bar — below tool content */}
        {tool && seo && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
            <ShareBar
              url={`https://rafiqy.app${tool.path}`}
              title={seo.metaTitle || `${tool.name} — Free Online Tool | Rafiqy`}
            />
          </div>
        )}
      </main>

      <RelatedTools toolId={toolId} />
      <TrustBadge />
      <FeedbackButton />

      {helpOpen && <ToolHelpDialog toolId={toolId} onClose={() => setHelpOpen(false)} />}

      {seo && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 2rem' }}>
          <ToolSEOFooter heading={seo.heading} paras={seo.paras} faqs={seo.faqs} />
        </div>
      )}

      {/* Related Blog Posts */}
      {tool && (() => {
        const toolTags = tool.tags || []
        const related = BLOG_POSTS
          .filter(p =>
            p.category?.toLowerCase() === tool.category ||
            p.tags?.some(t => toolTags.includes(t)) ||
            (tool.id === 'typing-tutor' && p.slug === 'typing-learning')
          )
          .sort((a, b) => {
            const overlapScore = (post) => {
              const overlap = (post.tags || []).filter(t => toolTags.includes(t)).length
              const own = post.slug.startsWith(tool.id) ? 3 : 0
              const sameCategory = post.category?.toLowerCase() === tool.category ? 0.5 : 0
              return own + overlap + sameCategory
            }
            const scoreDiff = overlapScore(b) - overlapScore(a)
            if (scoreDiff !== 0) return scoreDiff
            return new Date(b.publishDate || 0) - new Date(a.publishDate || 0)
          })
          .slice(0, 3)
        if (!related.length) return null
        return (
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 2.5rem' }}>
            <h3 style={{ color: colors.text, fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              📖 Related Guides
            </h3>
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
                    <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>{post.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: colors.textSecondary,
        fontSize: '0.75rem',
        borderTop: `1px solid ${colors.border}`,
      }}>
        © {new Date().getFullYear()} Rafiqy · Privacy-first browser tools &nbsp;·&nbsp;
        <a href="/tools" style={{ color: 'inherit', textDecoration: 'underline' }}>Tools</a>
        &nbsp;·&nbsp;
        <a href="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}>Blog</a>
        &nbsp;·&nbsp;
        <a href="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</a>
        &nbsp;·&nbsp;
        <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</a>
      </footer>
    </div>
  )
}
