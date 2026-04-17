import { Suspense, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import ToolsNav from './ToolsNav'
import RelatedTools from './RelatedTools'
import TrustBadge from './TrustBadge'
import FeedbackButton from './FeedbackButton'
import ToolHelpDialog from './ToolHelpDialog'
import ToolSEOFooter from './ToolSEOFooter'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { TOOLS } from '../tools/registry'
import TOOL_SEO from '../data/toolSEO'

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
          <title>{tool.name} — Free Online Tool | Rafiqy</title>
          <meta name="description" content={seo.paras[0]} />
          <link rel="canonical" href={`https://rafiqy.app${tool.path}`} />
          <meta property="og:title" content={`${tool.name} — Free Online Tool | Rafiqy`} />
          <meta property="og:description" content={seo.paras[0]} />
          <meta property="og:url" content={`https://rafiqy.app${tool.path}`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`${tool.name} — Free Online Tool | Rafiqy`} />
          <meta name="twitter:description" content={seo.paras[0]} />
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

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: colors.textSecondary,
        fontSize: '0.75rem',
        borderTop: `1px solid ${colors.border}`,
      }}>
        © {new Date().getFullYear()} Rafiqy · Privacy-first browser tools &nbsp;·&nbsp;
        <a href="/blogs" style={{ color: 'inherit', textDecoration: 'underline' }}>Blog</a>
        &nbsp;·&nbsp;
        <a href="/about" style={{ color: 'inherit', textDecoration: 'underline' }}>About</a>
      </footer>
    </div>
  )
}
