import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import { BLOG_POSTS } from '../data/blogPosts'

export default function BlogPost() {
  const { slug } = useParams()
  const { isDark, colors } = useTheme()

  const post = BLOG_POSTS.find(p => p.slug === slug)

  if (!post) {
    return (
      <>
        <ToolsNav />
        <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <h1 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700 }}>Post Not Found</h1>
          <p style={{ color: colors.textSecondary }}>This blog post doesn&apos;t exist or has been moved.</p>
          <Link to="/blogs" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>← Back to all guides</Link>
        </div>
      </>
    )
  }

  // Related posts: same category, excluding current, up to 3
  const related = BLOG_POSTS
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 3)
  const fallbackRelated = related.length < 3
    ? [...related, ...BLOG_POSTS.filter(p => p.slug !== slug && !related.includes(p)).slice(0, 3 - related.length)]
    : related

  return (
    <>
      <Helmet>
        <title>{post.title} | Rafiqy Blog</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`https://rafiqy.app/blogs/tools/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={`https://rafiqy.app/blogs/tools/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
      </Helmet>

      <ToolsNav />

      <main style={{ background: colors.bg, minHeight: '100vh' }}>
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: colors.muted, marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{ color: colors.muted, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={e => e.currentTarget.style.color = colors.muted}
            >Home</Link>
            <span>›</span>
            <Link
              to="/blogs"
              style={{ color: colors.muted, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={e => e.currentTarget.style.color = colors.muted}
            >Blog</Link>
            <span>›</span>
            <span style={{ color: colors.text, fontWeight: 500 }}>{post.title}</span>
          </nav>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>{post.hero}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                color: '#06b6d4', background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)',
                padding: '0.25rem 0.75rem', borderRadius: '999px',
              }}>{post.category}</span>
              <span style={{ fontSize: '0.8rem', color: colors.muted }}>· {post.readTime}</span>
              <span style={{ fontSize: '0.8rem', color: colors.muted }}>· {new Date(post.publishDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: colors.text, lineHeight: 1.3, margin: '0 0 1rem' }}>
              {post.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: colors.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
              {post.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.75rem', color: colors.muted,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  padding: '0.25rem 0.65rem', borderRadius: '999px', border: `1px solid ${colors.border}`,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '2rem 0' }} />

          {/* Global styles for blog content */}
          <style>{`
            .blog-content h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; }
            .blog-content h3 { font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
            .blog-content p { margin: 0 0 1.25rem; }
            .blog-content ul, .blog-content ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
            .blog-content li { margin-bottom: 0.4rem; }
            .blog-content a { color: #06b6d4; text-decoration: none; }
            .blog-content a:hover { text-decoration: underline; }
            .blog-content strong { font-weight: 700; }
            .blog-content code { font-family: monospace; background: rgba(0,0,0,0.08); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
          `}</style>

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              color: colors.text,
              lineHeight: 1.8,
              fontSize: '1rem',
            }}
          />

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '2.5rem 0' }} />

          {/* Back button */}
          <div style={{ marginBottom: '2rem' }}>
            <Link
              to="/blogs"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ← Back to all guides
            </Link>
          </div>

          {/* Related posts */}
          {fallbackRelated.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>
                Related Guides
              </h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {fallbackRelated.map(rel => (
                  <Link key={rel.slug} to={`/blogs/tools/${rel.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: colors.card, border: `1px solid ${colors.border}`,
                        borderRadius: '0.75rem', padding: '1rem',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
                    >
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{rel.hero}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.text, lineHeight: 1.4, marginBottom: '0.4rem' }}>{rel.title}</div>
                      <div style={{ fontSize: '0.75rem', color: colors.muted }}>{rel.readTime}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA */}
          <div style={{
            marginTop: '3rem', padding: '1.5rem', borderRadius: '1rem',
            background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.05)',
            border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)'}`,
            textAlign: 'center',
          }}>
            <p style={{ color: colors.text, fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>
              Ready to try these tools?
            </p>
            <Link
              to="/tools"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
              }}
            >
              ⚡ Explore all 54 tools →
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
