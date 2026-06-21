import TOOL_SEO from '../src/data/toolSEO.js'
import { BLOG_POSTS } from '../src/data/blogPosts.js'
import { BLOG_SECTIONS, getBlogPostPath, getBlogPostUrl, getBlogSection } from '../src/data/blogRoutes.js'
import { CATEGORY_BLOG_PRIORITY, CATEGORY_DATA, CATEGORY_TOOL_PRIORITY } from '../src/data/categoryPages.js'
import { TOOLS } from '../src/tools/registry.js'

const SITE_URL = 'https://rafiqy.app'
const FEATURED_TOOL_IDS = ['solar-planner', 'tax-calculator', 'investment-allocation-planner', 'loan-emi', 'urdu-keyboard', 'typing-tutor', 'rent-vs-buy-pakistan', 'car-powertrain-decision']
const HOME_FEATURED_POST_SLUGS = ['solar-planner-pakistan', 'pakistan-income-tax-calculator', 'how-much-loan-can-i-afford', 'investment-allocation-planner-pakistan-guide', 'urdu-typing-online', 'rent-vs-buy-calculator-pakistan-guide']

const STATIC_PAGES = {
  '/': {
    title: 'Rafiqy | Your Everyday Digital Companion',
    description: 'Privacy-first browser tools and decision systems for typing, tax, solar, investing, PDFs, writing, and everyday digital work, with strong Pakistan-specific guidance where it matters.',
    type: 'home',
  },
  '/tools': {
    title: 'Free Online Tools for Pakistan, Typing, PDF & Privacy | Rafiqy',
    description: 'Browse free browser-based tools for Urdu typing, Pakistan tax, solar planning, investment allocation, PDFs, writing, productivity, developer work and privacy-first tasks.',
    type: 'tools-home',
  },
  '/blog': {
    title: 'Guides & Tips - Solar, Tax, Investing, Typing, PDFs & More | Rafiqy',
    description: 'Practical guides, simpler explainers, and decision support content for solar, tax, loans, investing, typing, PDFs, productivity, and digital workflows, with strong Pakistan context where it matters.',
    type: 'blog-home',
  },
  '/about': {
    title: 'About Rafiqy | Privacy-First Browser Tools',
    description: 'Learn why Rafiqy was built, who it serves, and how its privacy-first browser tools support typing, Pakistan workflows, writing, PDFs and daily digital work.',
    type: 'about',
  },
  '/help': {
    title: 'Help & FAQ | Rafiqy',
    description: 'Get help with Rafiqy tools, browser storage, cloud sync, Urdu support, Pakistan-specific tools and common questions about how the site works.',
    type: 'help',
  },
  '/privacy': {
    title: 'Privacy Policy | Rafiqy',
    description: 'Learn how Rafiqy handles your data, browser storage, optional cloud sync and feedback. Most tools run locally in your browser and do not upload your content.',
    type: 'privacy',
  },
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function uniqueBy(array, keyFn) {
  const seen = new Set()
  return array.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function absoluteUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

function list(items) {
  return `<ul>${items.join('')}</ul>`
}

function linkItem(label, href, desc = '') {
  const body = desc ? `${escapeHtml(label)}<span style="display:block; color:#64748b; font-size:0.92rem; margin-top:0.2rem;">${escapeHtml(desc)}</span>` : escapeHtml(label)
  return `<li><a href="${escapeHtml(href)}">${body}</a></li>`
}

function section(title, innerHtml) {
  return `<section><h2>${escapeHtml(title)}</h2>${innerHtml}</section>`
}

function renderSharedStyles() {
  return `<style>
    body { color: #0f172a; }
    .prerender-shell { max-width: 980px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.7; color: #0f172a; }
    .prerender-shell h1 { font-size: clamp(2rem, 5vw, 3rem); line-height: 1.18; margin: 0 0 1rem; }
    .prerender-shell h2 { font-size: 1.35rem; line-height: 1.3; margin: 2rem 0 0.75rem; }
    .prerender-shell h3 { font-size: 1.05rem; line-height: 1.4; margin: 1.35rem 0 0.45rem; }
    .prerender-shell p { margin: 0 0 1rem; }
    .prerender-shell ul, .prerender-shell ol { margin: 0 0 1rem; padding-left: 1.35rem; }
    .prerender-shell li { margin-bottom: 0.45rem; }
    .prerender-shell a { color: #0369a1; text-decoration: none; }
    .prerender-shell a:hover { text-decoration: underline; }
    .prerender-shell .lead { font-size: 1.05rem; color: #334155; max-width: 760px; }
    .prerender-shell .eyebrow { display: inline-block; border: 1px solid rgba(6,182,212,0.25); background: rgba(6,182,212,0.08); color: #0891b2; border-radius: 999px; padding: 0.28rem 0.8rem; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 1rem; }
    .prerender-shell .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 1.25rem 0 0; padding: 0; list-style: none; }
    .prerender-shell .card-grid li { margin: 0; }
    .prerender-shell .card-grid a, .prerender-shell .card-grid .card-static { display: block; height: 100%; border: 1px solid #cbd5e1; border-radius: 0.95rem; background: #ffffff; padding: 1rem 1rem 1.05rem; box-shadow: 0 10px 30px rgba(15,23,42,0.04); }
    .prerender-shell .card-grid strong { display: block; font-size: 1rem; color: #0f172a; }
    .prerender-shell .mini { color: #64748b; font-size: 0.92rem; }
    .prerender-shell .tool-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1.5rem 0 0; }
    .prerender-shell .tool-actions a { display: inline-block; border-radius: 0.9rem; padding: 0.82rem 1.1rem; font-weight: 700; }
    .prerender-shell .tool-actions a.primary { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; }
    .prerender-shell .tool-actions a.secondary { border: 1px solid #cbd5e1; color: #0f172a; background: #fff; }
    .prerender-shell .faq-list dt { font-weight: 700; margin-top: 1rem; }
    .prerender-shell .faq-list dd { margin: 0.3rem 0 0.9rem; color: #334155; }
    .prerender-shell .article-content code { background: #e2e8f0; padding: 0.1rem 0.3rem; border-radius: 0.25rem; }
    .prerender-shell .article-content pre { background: #0f172a; color: #e2e8f0; border-radius: 0.8rem; padding: 1rem; overflow-x: auto; }
    .prerender-shell .article-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .prerender-shell .article-content th, .prerender-shell .article-content td { border: 1px solid #cbd5e1; padding: 0.6rem 0.7rem; text-align: left; vertical-align: top; }
    .prerender-shell .article-content blockquote { margin: 1rem 0; padding: 0.85rem 1rem; border-left: 3px solid #06b6d4; background: rgba(6,182,212,0.06); color: #334155; }
    .prerender-shell nav.breadcrumbs { font-size: 0.82rem; color: #64748b; margin-bottom: 1.2rem; }
    .prerender-shell nav.breadcrumbs a { color: #64748b; }
  </style>`
}

function buildSchema(schema) {
  if (!schema) return ''
  return `\n    <script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

function buildHead(page) {
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const canonical = escapeHtml(page.canonical)
  const ogType = escapeHtml(page.ogType || 'website')
  const twitterCard = escapeHtml(page.twitterCard || 'summary_large_image')
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="${ogType}">
    <meta name="twitter:card" content="${twitterCard}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">${buildSchema(page.schema)}${renderSharedStyles()}`
}

function renderHomePage(route) {
  const featuredTools = FEATURED_TOOL_IDS.map(id => TOOLS.find(tool => tool.id === id)).filter(Boolean)
  const featuredPosts = HOME_FEATURED_POST_SLUGS.map(slug => BLOG_POSTS.find(post => post.slug === slug)).filter(Boolean)
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">Privacy-first browser tools</span>
      <h1>Your everyday digital toolbox for faster work online</h1>
      <p class="lead">A simple, fast, and secure collection of tools for productivity, learning, finance, and daily digital tasks.</p>
      <p class="mini">A simple digital companion for everyday tasks.</p>
      <div class="tool-actions">
        <a class="primary" href="/tools">Explore all tools</a>
        <a class="secondary" href="/blog">Read guides</a>
      </div>
      ${section('What Rafiqy helps with', `
        <p>Rafiqy is a browser-based platform for practical digital tools and decision support. Whether you need an Urdu keyboard online, a Pakistan income tax calculator, a solar planning estimate, or a private PDF tool, the work happens directly in your browser.</p>
        <p>From improving your typing speed and compressing a PDF to planning a home solar system or counting words, Rafiqy is built to make everyday digital work faster, simpler, and more private.</p>
        <p>The site is designed to stay accessible even if you search in simple English or Roman Urdu. Common search-style phrases include <strong>tax kitna banega</strong>, <strong>loan kitna lena chahiye</strong>, <strong>solar lagwana faida hai</strong>, and <strong>urdu mein type karna</strong>.</p>
      `)}
      ${section('Start with these high-value tools', list(featuredTools.map(tool => linkItem(`${tool.icon} ${tool.name}`, tool.path, tool.tagline || tool.description))))}
      ${section('Popular guide cluster', list(featuredPosts.map(post => linkItem(post.title, getBlogPostPath(post), post.description))))}
    </main>`
}

function renderToolsHome(route) {
  const featuredTools = FEATURED_TOOL_IDS.map(id => TOOLS.find(tool => tool.id === id)).filter(Boolean)
  const categoryLinks = Object.entries(CATEGORY_DATA).map(([slug, data]) => ({ label: data.title, href: `/category/${slug}`, desc: data.metaDesc }))
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">Tools directory</span>
      <h1>All Your Daily Tools in One Place</h1>
      <p class="lead">Browse Rafiqy’s browser-based tools for typing, writing, finance, privacy, documents, and Pakistan-first everyday workflows.</p>
      <div class="tool-actions">
        <a class="primary" href="/category/pakistan-tools">Browse Pakistan tools</a>
        <a class="secondary" href="/blog">Open blog guides</a>
      </div>
      ${section('Browse by need', `<ul class="card-grid">${categoryLinks.map(item => linkItem(item.label, item.href, item.desc)).join('')}</ul>`)}
      ${section('Flagship tools', `<ul class="card-grid">${featuredTools.map(tool => linkItem(`${tool.icon} ${tool.name}`, tool.path, tool.description)).join('')}</ul>`)}
    </main>`
}

function renderBlogHome(route, sectionPath = null) {
  const sectionData = sectionPath ? BLOG_SECTIONS[sectionPath] : null
  const posts = BLOG_POSTS
    .filter(post => !sectionData || getBlogSection(post).path === sectionData.path)
    .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0))
    .slice(0, 18)

  const title = sectionData ? `${sectionData.label} Guides` : 'Learn Smarter Ways to Use Digital Tools'
  const intro = sectionData?.description || 'Practical guides, simpler explainers, and decision support content to help people in Pakistan and beyond use digital tools with more confidence.'
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">${escapeHtml(sectionData ? sectionData.label : 'Guides and tips')}</span>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(intro)}</p>
      <div class="tool-actions">
        <a class="primary" href="/blog">All guides</a>
        <a class="secondary" href="/tools">Open tools</a>
      </div>
      ${section('Browse sections', list([
        linkItem('Integration guides', '/blog/integration', BLOG_SECTIONS.integration.description),
        linkItem('Decision support guides', '/blog/decision-support', BLOG_SECTIONS['decision-support'].description),
        linkItem('Utility guides', '/blog/utilities', BLOG_SECTIONS.utilities.description),
      ]))}
      ${section('Featured posts', `<ul class="card-grid">${posts.map(post => linkItem(post.title, getBlogPostPath(post), post.description)).join('')}</ul>`)}
    </main>`
}

function getCategoryTools(slug) {
  const data = CATEGORY_DATA[slug]
  if (!data) return []
  const priorityIds = CATEGORY_TOOL_PRIORITY[slug] || []
  const categoryIds = data.categories || []
  const tools = data.toolIds?.length
    ? TOOLS.filter(tool => data.toolIds.includes(tool.id))
    : TOOLS.filter(tool => categoryIds.includes(tool.category) || priorityIds.includes(tool.id))

  return [...tools].sort((a, b) => {
    const ai = priorityIds.indexOf(a.id)
    const bi = priorityIds.indexOf(b.id)
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1
      if (bi === -1) return -1
      if (ai !== bi) return ai - bi
    }
    return a.name.localeCompare(b.name)
  })
}

function renderCategoryPage(route, slug) {
  const data = CATEGORY_DATA[slug]
  const tools = getCategoryTools(slug)
  const relatedPosts = BLOG_POSTS
    .filter(post => {
      const priority = CATEGORY_BLOG_PRIORITY[slug] || []
      const categoryIds = data.categories || []
      return categoryIds.includes(post.category?.toLowerCase()) || priority.includes(post.slug)
    })
    .slice(0, 6)

  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/tools">Tools</a> › ${escapeHtml(data.title)}</nav>
      <h1>${escapeHtml(data.title)}</h1>
      <p class="lead">${escapeHtml(data.intro)}</p>
      ${section('Tools in this category', `<ul class="card-grid">${tools.map(tool => linkItem(`${tool.icon} ${tool.name}`, tool.path, tool.tagline || tool.description)).join('')}</ul>`)}
      ${relatedPosts.length ? section('Useful guides for this category', list(relatedPosts.map(post => linkItem(post.title, getBlogPostPath(post), post.description)))) : ''}
    </main>`
}

function getRelatedBlogsForTool(tool) {
  const toolTags = new Set(tool.tags || [])
  return uniqueBy(
    BLOG_POSTS
      .filter(post => post.category?.toLowerCase() === tool.category || (post.tags || []).some(tag => toolTags.has(tag)))
      .sort((a, b) => {
        const overlap = (post) => (post.tags || []).filter(tag => toolTags.has(tag)).length
        return overlap(b) - overlap(a) || new Date(b.publishDate || 0) - new Date(a.publishDate || 0)
      }),
    post => post.slug,
  ).slice(0, 6)
}

function renderToolPage(route, tool) {
  const seo = TOOL_SEO[tool.id]
  const relatedTools = (tool.related || []).map(id => TOOLS.find(candidate => candidate.id === id)).filter(Boolean)
  const relatedBlogs = getRelatedBlogsForTool(tool)
  const faqHtml = seo.faqs?.length
    ? `<dl class="faq-list">${seo.faqs.map(item => `<dt>${escapeHtml(item.q)}</dt><dd>${escapeHtml(item.a)}</dd>`).join('')}</dl>`
    : ''
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: absoluteUrl(route),
    description: seo.metaDesc || tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'Rafiqy', url: SITE_URL },
  }

  return {
    title: seo.metaTitle || `${tool.name} | Rafiqy`,
    description: seo.metaDesc || tool.description,
    canonical: absoluteUrl(route),
    ogType: 'website',
    schema,
    body: `
      <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
        <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/tools">Tools</a> › ${escapeHtml(tool.name)}</nav>
        <span class="eyebrow">${escapeHtml(tool.category)} tool</span>
        <h1>${escapeHtml(seo.heading || tool.name)}</h1>
        <p class="lead">${escapeHtml(seo.paras?.[0] || tool.description)}</p>
        <div class="tool-actions">
          <a class="primary" href="${escapeHtml(tool.path)}">Open the live tool</a>
          <a class="secondary" href="/blog">Read related guides</a>
        </div>
        ${section('What this tool helps you do', list((tool.features || [tool.description]).map(feature => `<li>${escapeHtml(feature)}</li>`)))}
        ${section('How it works', (seo.paras || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join(''))}
        ${faqHtml ? section('Frequently asked questions', faqHtml) : ''}
        ${relatedBlogs.length ? section('Related guides', list(relatedBlogs.map(post => linkItem(post.title, getBlogPostPath(post), post.description)))) : ''}
        ${relatedTools.length ? section('Related tools', list(relatedTools.map(item => linkItem(item.name, item.path, item.tagline || item.description)))) : ''}
      </main>`,
  }
}

function renderBlogPostPage(route, post) {
  const postSection = getBlogSection(post)
  const related = BLOG_POSTS
    .filter(candidate => candidate.slug !== post.slug && getBlogSection(candidate).path === postSection.path)
    .slice(0, 4)

  return {
    title: `${post.title} | Rafiqy Blog`,
    description: post.description,
    canonical: getBlogPostUrl(post),
    ogType: 'article',
    twitterCard: 'summary',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.publishDate,
      mainEntityOfPage: getBlogPostUrl(post),
      author: { '@type': 'Organization', name: 'Rafiqy', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Rafiqy',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/favicon-32.png` },
      },
      url: getBlogPostUrl(post),
    },
    body: `
      <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
        <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/blog">Blog</a> › <a href="/blog/${escapeHtml(postSection.path)}">${escapeHtml(postSection.label)}</a> › ${escapeHtml(post.title)}</nav>
        <span class="eyebrow">${escapeHtml(postSection.label)}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="lead">${escapeHtml(post.description)}</p>
        <p class="mini">Published ${escapeHtml(post.publishDate || '')} · ${escapeHtml(post.readTime || '')}</p>
        <div class="article-content">${post.content}</div>
        ${related.length ? section('Related reading', list(related.map(item => linkItem(item.title, getBlogPostPath(item), item.description)))) : ''}
      </main>`,
  }
}

function renderAboutPage(route) {
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">About Rafiqy</span>
      <h1>Privacy-first tools that run in your browser</h1>
      <p class="lead">Rafiqy started as a typing tutor and grew into a collection of free, browser-native tools built for developers, professionals and students everywhere, with local tools for Pakistan.</p>
      ${section('Why we built this', `
        <p>Most productivity tools are built for English-first, cloud-first workflows. Users everywhere are left stitching together spreadsheets and random websites that either miss local needs or do not respect privacy.</p>
        <p>Rafiqy is different. Most tools run directly in the browser with no upload requirement, while local context like PKR defaults, Urdu support, FBR tax brackets, city realities and everyday Pakistan workflows are treated as first-class product requirements.</p>
      `)}
      ${section('Who Rafiqy serves', list([
        '<li>Students who need typing, writing and study support</li>',
        '<li>Developers who need quick browser utilities for data, logs and formatting</li>',
        '<li>Freelancers and salaried professionals comparing offers, taxes, invoices and cashflow</li>',
        '<li>Pakistan-first users who need Urdu, tax, salary, solar and local money tools</li>',
      ]))}
      ${section('Useful next pages', list([
        linkItem('Browse all tools', '/tools', 'Open the full tool directory'),
        linkItem('Read practical guides', '/blog', 'Decision support and utility articles'),
        linkItem('Get help', '/help', 'Storage, sync and common questions'),
      ]))}
    </main>`
}

function renderHelpPage(route) {
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">Help and FAQ</span>
      <h1>How Rafiqy works</h1>
      <p class="lead">Everything runs in your browser. No account, no uploads, no tracking. This page covers storage, cloud sync, Urdu support, Pakistan tools and common questions.</p>
      ${section('Privacy and storage', list([
        '<li>Most tool data is saved only in your browser local storage.</li>',
        '<li>If multiple people share the same browser profile, they may see the same saved data.</li>',
        '<li>Export backups before clearing browser data.</li>',
      ]))}
      ${section('Cloud sync and backup', list([
        '<li>Cloud sync is optional and off by default.</li>',
        '<li>Export and import remain the safest way to move local data between devices.</li>',
        '<li>Recovery codes only matter for tools that explicitly support cloud sync.</li>',
      ]))}
      ${section('Pakistan and Urdu support', list([
        '<li>Pakistan-first tools include tax, salary, solar, loans, investment planning and ID reference helpers.</li>',
        '<li>Urdu labels and Urdu keyboard support are available where useful.</li>',
        '<li>Some search and discovery surfaces intentionally bridge simpler English and Roman Urdu intent.</li>',
      ]))}
      ${section('Useful next pages', list([
        linkItem('Browse all tools', '/tools', 'Open the tool directory'),
        linkItem('Read the privacy policy', '/privacy', 'See what stays on your device'),
        linkItem('Open the Urdu keyboard', '/tools/urdu-keyboard', 'Type Urdu without installing software'),
      ]))}
    </main>`
}

function renderPrivacyPage(route) {
  return `
    <main class="prerender-shell" data-prerender-route="${escapeHtml(route)}">
      <span class="eyebrow">Privacy policy</span>
      <h1>Privacy Policy</h1>
      <p class="lead">Rafiqy is built to keep most work in your browser. This page explains what stays on your device, what optional features can send data out, and what to expect when you use feedback or cloud-sync features.</p>
      ${section('What stays on your device', '<p>Most Rafiqy tools process text, files, calculator inputs and personal notes locally in your browser. Local-only tool data is typically stored in your browser local storage so it remains available on your device.</p>')}
      ${section('Optional cloud sync and feedback', '<p>Some tools offer optional cloud sync or feedback submission. If you explicitly use those features, the relevant data is sent to the configured backend so it can be saved or reviewed. If you do not opt in, that data is not transmitted.</p>')}
      ${section('Live data and analytics', '<p>Some tools call third-party APIs only when the feature requires live data such as exchange rates, weather, or medical reference lookups. If analytics are enabled, they measure aggregate usage rather than the contents of your files or notes.</p>')}
      ${section('Useful next pages', list([
        linkItem('Help and FAQ', '/help', 'Understand storage, sync and backups'),
        linkItem('Browse privacy-first tools', '/category/security-tools', 'Leak detection, encryption and redaction'),
        linkItem('Return to the homepage', '/', 'See the main product entry points'),
      ]))}
    </main>`
}

export function getPrerenderPage(route) {
  if (STATIC_PAGES[route]) {
    const page = STATIC_PAGES[route]
    const base = {
      title: page.title,
      description: page.description,
      canonical: absoluteUrl(route),
      ogType: 'website',
      schema: {
        '@context': 'https://schema.org',
        '@type': route === '/tools' || route === '/blog' ? 'CollectionPage' : 'WebPage',
        name: page.title.replace(/\s+\|\s+Rafiqy$/, ''),
        url: absoluteUrl(route),
        description: page.description,
      },
    }

    if (page.type === 'home') {
      return { ...base, body: renderHomePage(route) }
    }
    if (page.type === 'tools-home') {
      return { ...base, body: renderToolsHome(route) }
    }
    if (page.type === 'blog-home') {
      return { ...base, body: renderBlogHome(route) }
    }
    if (page.type === 'about') {
      return { ...base, body: renderAboutPage(route) }
    }
    if (page.type === 'help') {
      return { ...base, body: renderHelpPage(route) }
    }
    if (page.type === 'privacy') {
      return { ...base, body: renderPrivacyPage(route) }
    }
  }

  if (route.startsWith('/blog/')) {
    const post = BLOG_POSTS.find(item => getBlogPostPath(item) === route)
    if (post) return renderBlogPostPage(route, post)

    const sectionPath = route.replace('/blog/', '')
    if (BLOG_SECTIONS[sectionPath]) {
      return {
        title: `${BLOG_SECTIONS[sectionPath].label} Guides | Rafiqy Blog`,
        description: BLOG_SECTIONS[sectionPath].description,
        canonical: absoluteUrl(route),
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Rafiqy ${BLOG_SECTIONS[sectionPath].label} Guides`,
          url: absoluteUrl(route),
          description: BLOG_SECTIONS[sectionPath].description,
        },
        body: renderBlogHome(route, sectionPath),
      }
    }
  }

  if (route.startsWith('/category/')) {
    const slug = route.replace('/category/', '')
    const data = CATEGORY_DATA[slug]
    if (data) {
      return {
        title: data.metaTitle,
        description: data.metaDesc,
        canonical: absoluteUrl(route),
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: data.title,
          url: absoluteUrl(route),
          description: data.metaDesc,
        },
        body: renderCategoryPage(route, slug),
      }
    }
  }

  const tool = TOOLS.find(item => item.path === route)
  if (tool && TOOL_SEO[tool.id]) {
    return renderToolPage(route, tool)
  }

  throw new Error(`Missing prerender content for ${route}`)
}

export function renderPrerenderBody(route) {
  return getPrerenderPage(route).body
}
