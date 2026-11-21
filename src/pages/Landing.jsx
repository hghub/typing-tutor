import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { TOOLS } from '../tools/registry'
import { BLOG_INDEX } from '../data/blogIndex'
import { getBlogPostPath } from '../data/blogRoutes'
import { CATEGORY_DATA } from '../data/categoryPages'
import { HOME_META, HOME_CATEGORIES, HOME_STARTERS, HOME_DEMOS, HOME_GUIDES, HOME_FAQS } from '../data/homepage'
import { searchTools } from '../lib/toolSearch'
import ToolsNav from '../components/ToolsNav'
import './Landing.css'

const byId = id => TOOLS.find(tool => tool.id === id)
export default function Landing() {
  const [query, setQuery] = useState('')
  const matches = query.trim().length >= 2 ? searchTools(TOOLS, query) : []
  const guides = HOME_GUIDES.map(slug => BLOG_INDEX.find(post => post.slug === slug)).filter(Boolean)
  return <div className="rafiqy-home">
    <Helmet>
      <title>{HOME_META.title}</title><meta name="description" content={HOME_META.description} />
      <link rel="canonical" href="https://rafiqy.app/" />
      <meta property="og:title" content={HOME_META.title} /><meta property="og:description" content={HOME_META.description} />
      <meta property="og:url" content="https://rafiqy.app/" /><meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={HOME_META.title} /><meta name="twitter:description" content={HOME_META.description} />
      <script type="application/ld+json">{JSON.stringify({'@context':'https://schema.org','@type':'WebSite', name:'Rafiqy',url:'https://rafiqy.app/',description:HOME_META.description})}</script>
      <script type="application/ld+json">{JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:HOME_FAQS.map(faq=>({'@type':'Question',name:faq.q,acceptedAnswer:{'@type':'Answer',text:faq.a}}))})}</script>
    </Helmet>
    <a className="home-skip" href="#main-content">Skip to content</a>
    <ToolsNav />
    <main id="main-content">
      <section className="home-hero home-container">
        <div className="home-hero-copy">
          <p className="home-eyebrow">A practical companion for work & everyday life</p>
          <h1>Find the right tool.<br /><span>Make everyday work easier.</span></h1>
          <p className="home-lead">Useful tools for documents, writing and decisions. Working demos for better business workflows. One clear place to start.</p>
          <div className="home-actions"><a className="home-button home-primary" href="#categories">Browse by category</a><a className="home-button" href="#business">Explore business demos</a></div>
          <p className="home-hero-note">Free browser tools · Pakistan & international use · English / اردو on selected tools</p>
        </div>
        <section className="home-search-panel" role="search" aria-labelledby="search-heading">
          <p className="home-eyebrow">Start with what you need</p><h2 id="search-heading">What would you like to do?</h2>
          <label htmlFor="home-tool-search">Search tools and tasks</label>
          <input id="home-tool-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try PDF, Urdu, tax, stock or JSON" autoComplete="off" aria-describedby="home-search-help" aria-controls="home-search-results" />
          <p id="home-search-help" className="home-small">English and Roman Urdu task phrases work too. Search stays on this page.</p>
          {query.trim().length >= 2 ? <div id="home-search-results"><p role="status" className="home-small">{matches.length ? `${matches.length} matching tools${matches.length > 5 ? ' · showing the first 5' : ''}` : 'No matching tools. Try a shorter task or browse a category.'}</p><ul className="home-search-results">{matches.slice(0,5).map(tool=><li key={tool.id}><Link to={tool.path}><span aria-hidden="true">{tool.icon}</span><span>{tool.name}</span></Link></li>)}</ul><Link className="home-text-link" to="/tools">Browse the complete tool directory</Link></div> : <div id="home-search-results"><div className="home-search-picks">{['compress-pdf','urdu-keyboard','stock-planner'].map(id=><Link key={id} to={byId(id).path}>{byId(id).name}</Link>)}</div><Link className="home-text-link" to="/tools">View all {TOOLS.length} tools</Link></div>}
        </section>
      </section>
      <nav className="home-jumps home-container" aria-label="On this page"><a href="#categories">Categories</a><a href="#starting-points">Starting points</a><a href="#business">Business demos</a><a href="#guides">Practical guides</a></nav>
      <section id="categories" className="home-section home-container">
        <div className="home-section-heading"><div><p className="home-eyebrow">Choose a task, not a long list</p><h2>Everything in the right place</h2></div><Link className="home-text-link" to="/tools">Full tool directory</Link></div>
        <div className="home-category-grid">{HOME_CATEGORIES.map(group=><article className="home-category" key={group.slug}><span className="home-category-icon" aria-hidden="true">{group.icon}</span><h3><Link to={`/category/${group.slug}`}>{group.label}</Link></h3><p>{group.description}</p><ul>{group.tools.map(id=><li key={id}><Link to={byId(id).path}>{byId(id).name}</Link></li>)}</ul><Link className="home-category-browse" to={`/category/${group.slug}`}>Browse category</Link></article>)}</div>
        <details className="home-all-categories"><summary>More categories: typing, images, travel, education and more</summary><div>{Object.entries(CATEGORY_DATA).map(([slug,data])=><Link key={slug} to={`/category/${slug}`}>{data.title.replace(/^Free /,'').replace(/ Online$/,'')}</Link>)}</div></details>
      </section>
      <section id="starting-points" className="home-section home-container"><div className="home-section-heading"><div><p className="home-eyebrow">A few useful starting points</p><h2>Get something done today</h2></div><p>Everyday tasks, with a direct route to the tool.</p></div><div className="home-starter-grid">{HOME_STARTERS.map(item=><Link className="home-starter" key={item.id} to={byId(item.id).path}><span className="home-small">{item.category}</span><h3>{item.label}</h3><p>{item.description}</p></Link>)}</div></section>
      <section id="business" className="home-business"><div className="home-container"><div className="home-section-heading"><div><p className="home-eyebrow">For businesses & integration teams</p><h2>Small demos. Real workflow questions.</h2></div><Link className="home-text-link" to="/category/business-tools">All business tools</Link></div><p className="home-business-intro">Explore how stock planning, order review and integration checks could fit around your existing systems. Start with a focused problem and a measurable pilot.</p><div className="home-demo-grid">{HOME_DEMOS.map(item=><Link className="home-demo" key={item.id} to={byId(item.id).path}><span className="home-demo-label">{item.type}</span><h3>{item.label}</h3><p>{item.description}</p><span className="home-text-link">Open demo</span></Link>)}</div><div className="home-business-note"><p>These demos use synthetic examples. Live POS/ERP connections, private AI workers and implementation services require separate scoping; no autonomous purchasing or real project migration is enabled.</p><Link to="/about">About Rafiqy</Link></div></div></section>
      <section id="guides" className="home-section home-container"><div className="home-section-heading"><div><p className="home-eyebrow">Understand the problem, then use the tool</p><h2>Practical guides for the next step</h2></div><Link className="home-text-link" to="/blog">All guides</Link></div><div className="home-guide-grid">{guides.map(post=><Link className="home-guide" key={post.slug} to={getBlogPostPath(post)}><span className="home-small">{post.section === 'integration' ? 'Integration' : 'Practical guide'} · {post.readTime}</span><h3>{post.title}</h3><p>{post.description}</p><span className="home-text-link">Read guide</span></Link>)}</div></section>
      <section className="home-section home-container home-faq"><div><p className="home-eyebrow">Good to know</p><h2>Clear expectations, useful results.</h2><p>Review assumptions, data handling and limitations on each tool before using the result.</p><Link className="home-text-link" to="/privacy">Privacy information</Link></div><div>{HOME_FAQS.map(faq=><details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div></section>
    </main>
    <footer className="home-footer home-container"><Link className="home-footer-brand" to="/">Rafiqy</Link><p>Useful tools. Clearer decisions. Better workflows.</p><nav aria-label="Footer"><Link to="/tools">All tools</Link><Link to="/category/business-tools">Business tools</Link><Link to="/blog">Guides</Link><Link to="/about">About</Link><Link to="/help">Help</Link><Link to="/privacy">Privacy</Link></nav><small>© {new Date().getFullYear()} Rafiqy</small></footer>
  </div>
}
