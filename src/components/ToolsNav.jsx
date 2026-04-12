import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import { useTheme } from '../hooks/useTheme'

export default function ToolsNav() {
  const { isDark, colors } = useTheme()
  const { pathname } = useLocation()

  const navStyle = {
    background: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }
  const innerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  }
  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: 800,
    fontSize: '1rem',
    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
    padding: '0.75rem 0.5rem',
    whiteSpace: 'nowrap',
    marginRight: '0.5rem',
    flexShrink: 0,
  }
  const dividerStyle = {
    width: '1px',
    height: '20px',
    background: colors.border,
    flexShrink: 0,
    marginRight: '0.5rem',
  }

  return (
    <nav style={navStyle} aria-label="Typely tools navigation">
      <div style={innerStyle}>
        <Link to="/tools" style={brandStyle}>⚡ Typely</Link>
        <div style={dividerStyle} />
        {TOOLS.map((tool) => {
          const isActive = tool.isHome
            ? pathname === '/'
            : pathname === tool.path || pathname.startsWith(tool.path + '/')
          return (
            <Link
              key={tool.id}
              to={tool.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.75rem 0.6rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? tool.color : colors.textSecondary,
                background: isActive ? `${tool.color}18` : 'transparent',
                borderBottom: isActive ? `2px solid ${tool.color}` : '2px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = colors.text
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = colors.textSecondary
              }}
            >
              <span>{tool.icon}</span>
              <span>{tool.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
