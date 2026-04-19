import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import ToolsNav from '../components/ToolsNav'
import { BLOG_POSTS } from '../data/blogPosts'

function slugify(text) {
  return text.replace(/<[^>]+>/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function useHeadings(content) {
  return useMemo(() => {
    const matches = [...content.matchAll(/<(h2|h3)[^>]*>(.*?)<\/(h2|h3)>/gi)]
    return matches.map(m => ({ level: m[1].toLowerCase(), text: m[2].replace(/<[^>]+>/g, '').trim(), id: slugify(m[2]) }))
  }, [content])
}

// Build tree: [{h2, children:[h3,h3]}, ...]
function buildTocTree(headings) {
  const tree = []
  let current = null
  for (const h of headings) {
    if (h.level === 'h2') {
      current = { ...h, children: [] }
      tree.push(current)
    } else if (h.level === 'h3' && current) {
      current.children.push(h)
    }
  }
  return tree
}

function processContent(content) {
  return content
    .replace(/<h2>(.*?)<\/h2>/gi, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`)
    .replace(/<h3>(.*?)<\/h3>/gi, (_, t) => `<h3 id="${slugify(t)}">${t}</h3>`)
}

function TocTree({ tree, activeId, colors, onClickItem }) {
  return (
    <>
      {tree.map(({ id, text, children }) => {
        const parentActive = activeId === id || children.some(c => c.id === activeId)
        return (
          <div key={id}>
            <a
              href={`#${id}`}
              className={`toc-link${parentActive ? ' active' : ''}`}
              style={{ color: parentActive ? '#06b6d4' : colors.textSecondary, fontWeight: parentActive ? 600 : 400 }}
              onClick={e => { e.preventDefault(); onClickItem(id) }}
            >
              {text.replace(/^\d+\.\s*/, '')}
            </a>
            {children.length > 0 && (
              <div style={{ borderLeft: `1px solid ${parentActive ? 'rgba(6,182,212,0.35)' : 'rgba(128,128,128,0.2)'}`, marginLeft: '0.85rem', paddingLeft: '0.1rem' }}>
                {children.map(c => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className={`toc-link toc-h3${activeId === c.id ? ' active' : ''}`}
                    style={{ color: activeId === c.id ? '#06b6d4' : colors.muted }}
                    onClick={e => { e.preventDefault(); onClickItem(c.id) }}
                  >
                    {c.text.replace(/^\d+\.\s*/, '')}
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  const { isDark, colors } = useTheme()
  const [activeId, setActiveId] = useState('')
  const [tocOpen, setTocOpen] = useState(false)

  const post = BLOG_POSTS.find(p => p.slug === slug)
  const headings = useHeadings(post?.content ?? '')
  const processedContent = useMemo(() => post ? processContent(post.content) : '', [post])

  useEffect(() => {
    if (!headings.length) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0% -70% 0%', threshold: 0 }
    )
    headings.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [headings])

  if (!post) {
    return (
      <>
        <ToolsNav />
        <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <h1 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700 }}>Post Not Found</h1>
          <p style={{ color: colors.textSecondary }}>This blog post doesn&apos;t exist or has been moved.</p>
          <Link to="/blog" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>← Back to all guides</Link>
        </div>
      </>
    )
  }

  const related = BLOG_POSTS.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)
  const fallbackRelated = related.length < 3
    ? [...related, ...BLOG_POSTS.filter(p => p.slug !== slug && !related.includes(p)).slice(0, 3 - related.length)]
    : related

  const tocTree = useMemo(() => buildTocTree(headings), [headings])
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <Helmet>
        <title>{post.title} | Rafiqy Blog</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`https://rafiqy.app/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={`https://rafiqy.app/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.publishDate,
          "author": { "@type": "Organization", "name": "Rafiqy", "url": "https://rafiqy.app" },
          "publisher": { "@type": "Organization", "name": "Rafiqy", "url": "https://rafiqy.app" },
          "url": `https://rafiqy.app/blog/${post.slug}`
        })}</script>
      </Helmet>

      <ToolsNav />

      <style>{`
        .blog-content h2 { font-size: 1.45rem; font-weight: 700; margin: 2rem 0 0.75rem; scroll-margin-top: 5rem; }
        .blog-content h3 { font-size: 1.15rem; font-weight: 600; margin: 1.5rem 0 0.5rem; scroll-margin-top: 5rem; }
        .blog-content p { margin: 0 0 1.25rem; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
        .blog-content li { margin-bottom: 0.4rem; }
        .blog-content a { color: #06b6d4; text-decoration: none; }
        .blog-content a:hover { text-decoration: underline; }
        .blog-content strong { font-weight: 700; }
        .blog-content code { font-family: monospace; background: rgba(0,0,0,0.08); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
        .toc-link { display: block; font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 0.4rem; border-left: 2px solid transparent; text-decoration: none; transition: all 0.15s; line-height: 1.4; }
        .toc-link:hover { background: rgba(6,182,212,0.08); color: #06b6d4 !important; }
        .toc-link.active { border-left-color: #06b6d4; background: rgba(6,182,212,0.1); color: #06b6d4 !important; font-weight: 600; }
        .toc-h3 { padding-left: 1.2rem; font-size: 0.75rem; }
        @media (max-width: 900px) { .blog-toc-sidebar { display: none !important; } .blog-mobile-toc { display: block !important; } }
      `}</style>

      <main style={{ background: colors.bg, minHeight: '100vh' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.5rem 4rem', display: 'grid', gridTemplateColumns: tocTree.length ? '220px 1fr' : '1fr', gap: '2.5rem', alignItems: 'start' }}>

          {/* Sticky TOC sidebar — desktop only */}
          {tocTree.length > 0 && (
            <aside className="blog-toc-sidebar" style={{ position: 'sticky', top: '5rem' }}>
              <div style={{
                background: colors.card, border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem', padding: '1rem 0.75rem',
                maxHeight: 'calc(100vh - 7rem)',
                overflowY: 'auto',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, margin: '0 0 0.75rem 0.6rem' }}>Contents</p>
                <nav>
                  <TocTree tree={tocTree} activeId={activeId} colors={colors} onClickItem={scrollTo} />
                </nav>
              </div>
            </aside>
          )}

          {/* Article */}
          <article style={{ maxWidth: '720px', width: '100%' }}>

            {/* Mobile TOC toggle */}
            {tocTree.length > 0 && (
              <div className="blog-mobile-toc" style={{ display: 'none', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setTocOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem',
                    padding: '0.75rem 1rem', cursor: 'pointer', color: colors.text, fontSize: '0.85rem', fontWeight: 600,
                  }}
                >
                  <span>📋 Table of Contents</span>
                  <span>{tocOpen ? '▲' : '▼'}</span>
                </button>
                {tocOpen && (
                  <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 0.75rem 0.75rem', padding: '0.5rem 0.75rem 0.75rem' }}>
                    <TocTree tree={tocTree} activeId={activeId} colors={colors} onClickItem={(id) => { setTocOpen(false); scrollTo(id) }} />
                  </div>
                )}
              </div>
            )}

            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: colors.muted, marginBottom: '2rem', flexWrap: 'wrap' }}>
              <Link to="/" style={{ color: colors.muted, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'} onMouseLeave={e => e.currentTarget.style.color = colors.muted}>Home</Link>
              <span>›</span>
              <Link to="/blog" style={{ color: colors.muted, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'} onMouseLeave={e => e.currentTarget.style.color = colors.muted}>Blog</Link>
              <span>›</span>
              <span style={{ color: colors.text, fontWeight: 500 }}>{post.title}</span>
            </nav>

            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>{post.hero}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#06b6d4', background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>{post.category}</span>
                <span style={{ fontSize: '0.8rem', color: colors.muted }}>· {post.readTime}</span>
                <span style={{ fontSize: '0.8rem', color: colors.muted }}>· {new Date(post.publishDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: colors.text, lineHeight: 1.3, margin: '0 0 1rem' }}>{post.title}</h1>
              <p style={{ fontSize: '1.1rem', color: colors.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>{post.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                {(post.tags || []).map(tag => (
                  <span key={tag} style={{ fontSize: '0.75rem', color: colors.muted, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: `1px solid ${colors.border}` }}>{tag}</span>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '2rem 0' }} />

            {/* Content */}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: processedContent }} style={{ color: colors.text, lineHeight: 1.8, fontSize: '1rem' }} />

            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '2.5rem 0' }} />

            <div style={{ marginBottom: '2rem' }}>
              <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >← Back to all guides</Link>
            </div>

            {fallbackRelated.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>Related Guides</h2>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {fallbackRelated.map(rel => (
                    <Link key={rel.slug} to={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1rem', transition: 'border-color 0.2s ease' }}
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

            <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '1rem', background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.05)', border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)'}`, textAlign: 'center' }}>
              <p style={{ color: colors.text, fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>Ready to try these tools?</p>
              <Link to="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                ⚡ Explore all 62 tools →
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  )
}
