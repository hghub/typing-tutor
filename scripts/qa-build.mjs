import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { PRERENDER_ROUTES } from './prerender-routes.mjs'
import { BLOG_POSTS } from '../src/data/blogPosts.js'
import { BLOG_SECTIONS, getBlogPostPath, getBlogPostUrl } from '../src/data/blogRoutes.js'

const DIST_DIR = path.resolve('dist')

function routeToFile(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html')
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html')
}

function count(html, regex) {
  return [...html.matchAll(regex)].length
}

function textMatch(html, regex) {
  return html.match(regex)?.[1]?.trim() || ''
}

async function checkPrerenderRoute(route) {
  const file = routeToFile(route)
  const html = await readFile(file, 'utf8')
  const title = textMatch(html, /<title>(.*?)<\/title>/is)
  const titleCount = count(html, /<title>/gi)
  const descriptionCount = count(html, /<meta[^>]+name=["']description["']/gi)
  const canonicalCount = count(html, /<link[^>]+rel=["']canonical["']/gi)
  const h1Count = count(html, /<h1\b/gi)
  const linkCount = count(html, /<a\b/gi)

  const errors = []
  if (titleCount !== 1) errors.push(`expected exactly one title, found ${titleCount}`)
  if (!title || title === 'Rafiqy') errors.push(`title is too generic: ${title || '(missing)'}`)
  if (descriptionCount !== 1) errors.push(`expected exactly one meta description, found ${descriptionCount}`)
  if (canonicalCount !== 1) errors.push(`expected exactly one canonical, found ${canonicalCount}`)
  if (h1Count < 1) errors.push('missing H1')
  if (linkCount < 1) errors.push('missing internal links')

  if (errors.length) {
    throw new Error(`${route}: ${errors.join('; ')}`)
  }
}

function checkBlogPosts() {
  const errors = []
  const slugs = new Set()
  const validSections = new Set(Object.keys(BLOG_SECTIONS))

  for (const post of BLOG_POSTS) {
    if (!post.slug) errors.push('blog post missing slug')
    if (post.slug && slugs.has(post.slug)) errors.push(`duplicate blog slug: ${post.slug}`)
    if (post.slug) slugs.add(post.slug)
    if (!post.title || post.title.length < 12) errors.push(`${post.slug}: title is missing or too short`)
    if (!post.description || post.description.length < 50) errors.push(`${post.slug}: description is missing or too short`)
    if (!post.category) errors.push(`${post.slug}: category is missing`)
    if (post.section && !validSections.has(post.section)) errors.push(`${post.slug}: invalid blog section ${post.section}`)
    if (!Array.isArray(post.tags) || post.tags.length < 3) errors.push(`${post.slug}: add at least 3 tags`)
    if (!post.content || !/<h2\b/i.test(post.content)) errors.push(`${post.slug}: content needs at least one H2`)
    if (post.category === 'mulesoft' && /<code\b/i.test(post.content) && !/<pre>\s*<code\b/i.test(post.content)) {
      errors.push(`${post.slug}: MuleSoft code examples should use <pre><code class="language-...">`)
    }
  }

  if (errors.length) {
    throw new Error(`Blog QA failed:\n- ${errors.join('\n- ')}`)
  }
}

async function checkBlogRoutes() {
  const errors = []
  const mainRoutes = await readFile(path.resolve('src/main.jsx'), 'utf8')
  const sitemap = await readFile(path.resolve('public/sitemap.xml'), 'utf8')
  const sourceFiles = [
    'src/App.jsx',
    'src/components/ToolLayout.jsx',
    'src/pages/BlogHome.jsx',
    'src/pages/BlogPost.jsx',
    'src/pages/CategoryPage.jsx',
    'src/pages/Landing.jsx',
    'src/pages/RentVsBuyPakistan.jsx',
    'src/pages/SolarPlanner.jsx',
  ]

  if (mainRoutes.includes('path="/blog/:slug"')) errors.push('remove legacy /blog/:slug route')
  if (mainRoutes.includes('/blogs/tools/:slug')) errors.push('remove legacy /blogs/tools/:slug route')
  if (mainRoutes.includes('BlogPostRedirect')) errors.push('remove BlogPostRedirect fallback')

  const sourceText = (await Promise.all(sourceFiles.map(async file => `${file}\n${await readFile(path.resolve(file), 'utf8')}`))).join('\n')

  for (const post of BLOG_POSTS) {
    const flatPath = `/blog/${post.slug}`
    const flatUrl = `https://rafiqy.app${flatPath}`
    const canonicalPath = getBlogPostPath(post)
    const canonicalUrl = getBlogPostUrl(post)

    if (sitemap.includes(flatUrl)) errors.push(`${post.slug}: sitemap contains flat blog URL`)
    if (!sitemap.includes(canonicalUrl)) errors.push(`${post.slug}: sitemap missing canonical sectioned URL ${canonicalUrl}`)
    if (sourceText.includes(`"${flatPath}"`) || sourceText.includes(`'${flatPath}'`) || sourceText.includes(`href="${flatPath}"`)) {
      errors.push(`${post.slug}: source contains hardcoded flat blog path; use ${canonicalPath}`)
    }
  }

  if (errors.length) {
    throw new Error(`Blog route QA failed:\n- ${errors.join('\n- ')}`)
  }
}

async function main() {
  for (const route of PRERENDER_ROUTES) {
    await checkPrerenderRoute(route)
  }

  checkBlogPosts()
  await checkBlogRoutes()
  console.log(`QA passed: ${PRERENDER_ROUTES.length} prerendered routes and ${BLOG_POSTS.length} blog posts checked`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
