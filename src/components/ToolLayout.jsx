import { Suspense } from 'react'
import ToolsNav from './ToolsNav'
import RelatedTools from './RelatedTools'
import TrustBadge from './TrustBadge'
import { useTheme } from '../hooks/useTheme'

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

  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
    data-theme={isDark ? 'dark' : 'light'}
    >
      <ToolsNav />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Suspense fallback={<LoadingSpinner colors={colors} />}>
          {children}
        </Suspense>
      </main>

      <RelatedTools toolId={toolId} />
      <TrustBadge />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: colors.textSecondary,
        fontSize: '0.75rem',
        borderTop: `1px solid ${colors.border}`,
      }}>
        © {new Date().getFullYear()} Typely · Your Smart Typing System
      </footer>
    </div>
  )
}
