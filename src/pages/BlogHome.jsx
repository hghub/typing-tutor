import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import ShareBar from '../components/ShareBar'
import { BLOG_POSTS } from '../data/blogPosts'

export default function BlogHome() {
  const { isDark, colors } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const categories = ['all', ...new Set(BLOG_POSTS.map(p => p.category))]

  const q = query.trim().toLowerCase()
  const filtered = BLOG_POSTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchQ = !q ||
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    return matchCat && matchQ
  })

  return (
    <>
      <Helmet>
        <title>Guides & Tips – Productivity, Tools & Digital Workflows | Rafiqy</title>
        <meta name="description" content="Practical guides, tutorials, and productivity tips to help you work faster using digital tools. From typing and PDFs to finance and developer tools." />
        <link rel="canonical" href="https://rafiqy.app/blog" />
        <meta property="og:title" content="Guides & Tips – Productivity, Tools & Digital Workflows | Rafiqy" />
        <meta property="og:description" content="Practical guides, tutorials, and productivity tips to help you work faster using digital tools. From typing and PDFs to finance and developer tools." />
        <meta property="og:url" content="https://rafiqy.app/blog" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Guides & Tips – Productivity, Tools & Digital Workflows | Rafiqy" />
        <meta name="twitter:description" content="Practical guides, tutorials, and productivity tips to help you work faster using digital tools." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Rafiqy Blog',
          'url': 'https://rafiqy.app/blog',
          'description': 'Practical guides, tutorials, and productivity tips to help you work faster using digital tools.'
        })}</script>
      </Helmet>

      <ToolsNav />

      <main style={{ background: colors.bg, minHeight: '100vh' }}>
        {/* Hero header */}
        <div style={{
          background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderBottom: `1px solid ${colors.border}`,
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Learn Smarter Ways to Use Digital Tools
            </h1>
            <p style={{ fontSize: '1.1rem', color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
              Practical guides, tutorials, and productivity tips to help you work faster using digital tools.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Search bar */}
          <div style={{ maxWidth: 520, margin: '0 auto 1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none', opacity: 0.45 }}>🔍</span>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts — solar, typing, PDF…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.7rem 2.5rem 0.7rem 2.4rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${query ? '#06b6d4' : colors.border}`,
                background: colors.card, color: colors.text,
                fontSize: '0.92rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = query ? '#06b6d4' : colors.border}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                color: colors.textSecondary, padding: '0 0.2rem', lineHeight: 1,
              }}>✕</button>
            )}
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  border: `1px solid ${activeCategory === cat ? '#06b6d4' : colors.border}`,
                  background: activeCategory === cat ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)') : colors.card,
                  color: activeCategory === cat ? '#06b6d4' : colors.textSecondary,
                  fontSize: '0.83rem',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'all' ? 'All Posts' : cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          {(q || activeCategory !== 'all') && (
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: colors.muted, marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
              {filtered.length === 0 ? 'No posts found' : `${filtered.length} post${filtered.length === 1 ? '' : 's'} found`}
              {q && <> for <strong style={{ color: colors.textSecondary }}>"{query}"</strong></>}
            </p>
          )}

          {/* Posts grid */}
          {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filtered.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <article
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)'
                    e.currentTarget.style.borderColor = '#06b6d4'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = colors.border
                  }}
                >
                  {/* Hero emoji */}
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{post.hero}</div>

                  {/* Category + read time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: '#06b6d4', background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)',
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                    }}>{post.category}</span>
                    <span style={{ fontSize: '0.75rem', color: colors.muted }}>· {post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1.4 }}>
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0, lineHeight: 1.6, flex: 1 }}>
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.7rem', color: colors.muted,
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        padding: '0.2rem 0.55rem', borderRadius: '999px',
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.75rem', color: colors.muted, borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
                    {new Date(post.publishDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </article>
              </Link>
            ))}
          </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.muted }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <p style={{ fontSize: '0.95rem', margin: '0 0 1rem' }}>No posts match <strong>"{query}"</strong></p>
              <button onClick={() => { setQuery(''); setActiveCategory('all') }} style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.6rem', border: `1px solid ${colors.border}`,
                background: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.85rem',
              }}>Clear search</button>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${colors.border}` }}>
            <ShareBar url="https://rafiqy.app/blog" title="Rafiqy Blog — Practical guides for digital tools" />
            <Link
              to="/tools"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ⚡ Explore all 63 tools →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
