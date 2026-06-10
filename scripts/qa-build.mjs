import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { PILOT_PRERENDER_ROUTES } from './prerender-routes.mjs'
import { BLOG_POSTS } from '../src/data/blogPosts.js'

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

  for (const post of BLOG_POSTS) {
    if (!post.slug) errors.push('blog post missing slug')
    if (post.slug && slugs.has(post.slug)) errors.push(`duplicate blog slug: ${post.slug}`)
    if (post.slug) slugs.add(post.slug)
    if (!post.title || post.title.length < 12) errors.push(`${post.slug}: title is missing or too short`)
    if (!post.description || post.description.length < 50) errors.push(`${post.slug}: description is missing or too short`)
    if (!post.category) errors.push(`${post.slug}: category is missing`)
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

async function main() {
  for (const route of PILOT_PRERENDER_ROUTES) {
    await checkPrerenderRoute(route)
  }

  checkBlogPosts()
  console.log(`QA passed: ${PILOT_PRERENDER_ROUTES.length} prerendered routes and ${BLOG_POSTS.length} blog posts checked`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
