import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { getPrerenderPage } from './prerender-content.mjs'
import { PRERENDER_ROUTES } from './prerender-routes.mjs'

const DIST_DIR = path.resolve('dist')
const SHELL_HTML_PATH = path.join(DIST_DIR, 'index.html')

function routeToFile(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html')
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildHead(meta) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const canonical = escapeHtml(meta.canonical)
  const ogType = escapeHtml(meta.ogType || 'website')
  const twitterCard = escapeHtml(meta.twitterCard || 'summary_large_image')
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
    <meta name="twitter:description" content="${description}">`
}

function removeManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:title["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:description["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:url["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:type["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:card["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/gi, '')
}

function renderRoute(shellHtml, route) {
  const page = getPrerenderPage(route)

  const html = removeManagedHead(shellHtml)
    .replace('</head>', `${buildHead(page)}\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${page.body}</div>`)

  return html
}

async function main() {
  const shellHtml = await readFile(SHELL_HTML_PATH, 'utf8')

  for (const route of PRERENDER_ROUTES) {
    const outputFile = routeToFile(route)
    await mkdir(path.dirname(outputFile), { recursive: true })
    await writeFile(outputFile, renderRoute(shellHtml, route), 'utf8')
    console.log(`prerendered ${route} -> ${path.relative(process.cwd(), outputFile)}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
