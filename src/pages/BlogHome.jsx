import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import { BLOG_POSTS } from '../data/blogPosts'

export default function BlogHome() {
  const { isDark, colors } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = ['all', ...new Set(BLOG_POSTS.map(p => p.category))]

  const filtered = activeCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Rafiqy Blog — Guides, Tips & Tool Tutorials</title>
        <meta name="description" content="In-depth guides, tutorials and tips for all 54 Rafiqy tools. Learn about Pakistani tax tools, Urdu features, developer utilities and more." />
        <link rel="canonical" href="https://rafiqy.app/blogs" />
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
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: colors.text, margin: '0 0 0.75rem' }}>
              Rafiqy Blog
            </h1>
            <p style={{ fontSize: '1.1rem', color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>
              In-depth guides, tutorials and tips for all 54 tools. Built for Pakistani professionals, developers and students.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
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

          {/* Posts grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filtered.map(post => (
              <Link
                key={post.slug}
                to={`/blogs/tools/${post.slug}`}
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

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${colors.border}` }}>
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
              ⚡ Explore all 54 tools →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
