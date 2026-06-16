import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { PILOT_PRERENDER_ROUTES } from './prerender-routes.mjs'

const DIST_DIR = path.resolve('dist')
const SHELL_HTML_PATH = path.join(DIST_DIR, 'index.html')

const ROUTES = {
  '/': {
    title: 'Rafiqy | Your Everyday Digital Companion',
    description: 'Privacy-first browser tools and decision systems for typing, tax, solar, investing, PDFs, writing, and everyday digital work, with strong Pakistan-specific guidance where it matters.',
    canonical: 'https://rafiqy.app/',
    h1: 'Your everyday digital toolbox for faster work online',
    intro: 'A simple, fast, and secure collection of tools for productivity, learning, finance, and daily digital tasks.',
    links: [
      ['Open tools', '/tools'],
      ['Read guides', '/blog'],
      ['Solar calculator', '/tools/solar-planner'],
      ['Income tax calculator', '/tools/tax-calculator'],
    ],
  },
  '/tools': {
    title: 'Free Online Tools for Pakistan, Typing, PDF & Privacy | Rafiqy',
    description: 'Browse 68 free browser-based tools for Urdu typing, Pakistan tax, solar planning, investment allocation, PDFs, writing, productivity, developer work and privacy-first tasks.',
    canonical: 'https://rafiqy.app/tools',
    h1: 'All Your Daily Tools in One Place',
    intro: 'Rafiqy tools help you get everyday tasks done faster, from typing and productivity to finance, writing, privacy, and file management.',
    links: [
      ['Pakistan tools', '/category/pakistan-tools'],
      ['Finance tools', '/category/finance-tools'],
      ['PDF tools', '/category/pdf-tools'],
      ['Developer tools', '/category/developer-tools'],
      ['Blog guides', '/blog'],
    ],
  },
  '/blog': {
    title: 'Guides & Tips - Solar, Tax, Investing, Typing, PDFs & More | Rafiqy',
    description: 'Practical guides, simpler explainers, and decision support content for solar, tax, loans, investing, typing, PDFs, productivity, and digital workflows, with strong Pakistan context where it matters.',
    canonical: 'https://rafiqy.app/blog',
    h1: 'Learn Smarter Ways to Use Digital Tools',
    intro: 'Practical guides, simpler explainers, and decision support content to help people in Pakistan and beyond use digital tools with more confidence.',
    links: [
      ['Integration guides', '/blog/integration'],
      ['Decision support guides', '/blog/decision-support'],
      ['Utility guides', '/blog/utilities'],
      ['Solar guide', '/blog/decision-support/solar-planner-pakistan'],
    ],
  },
  '/tools/solar-planner': {
    title: 'Solar Calculator - Estimate System Size, Cost & Payback | Rafiqy',
    description: 'Estimate solar system size, installation cost, monthly savings and payback for your electricity bill with Pakistan-focused assumptions and net billing context.',
    canonical: 'https://rafiqy.app/tools/solar-planner',
    h1: 'Solar Calculator',
    intro: 'Estimate system size, cost, savings, payback, net billing impact, and battery need before you talk to an installer.',
    links: [
      ['5kW solar system price guide', '/blog/decision-support/5kw-solar-system-price-in-pakistan'],
      ['10kW solar system price guide', '/blog/decision-support/10kw-solar-system-price-in-pakistan'],
      ['Hybrid vs on-grid solar', '/blog/decision-support/hybrid-vs-on-grid-solar-in-pakistan'],
      ['All tools', '/tools'],
    ],
  },
  '/tools/tax-calculator': {
    title: 'Income Tax Calculator | Salary Tax Estimate for Pakistan (2025-26) | Rafiqy',
    description: 'Estimate salary income tax using current FBR slabs for FY 2025-26. Check annual tax, monthly impact, VPS, charity credits and senior rebate with a private browser calculator.',
    canonical: 'https://rafiqy.app/tools/tax-calculator',
    h1: 'Pakistan Income Tax Calculator',
    intro: 'Estimate salary tax for FY 2025-26, monthly deduction impact, and planning scenarios with browser-based privacy.',
    links: [
      ['Tax filing guide', '/blog/decision-support/how-to-file-salaried-tax-return-in-pakistan'],
      ['Legal ways to save salary tax', '/blog/decision-support/legal-ways-to-save-salary-tax-in-pakistan'],
      ['Tax shield optimizer', '/tools/tax-optimizer'],
      ['All finance tools', '/category/finance-tools'],
    ],
  },
}

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
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">`
}

function buildBody(meta) {
  const links = meta.links
    .map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('')

  return `
    <main data-prerender-route="${escapeHtml(meta.canonical)}" style="max-width: 920px; margin: 0 auto; padding: 3rem 1.25rem; font-family: system-ui, sans-serif; line-height: 1.65;">
      <h1>${escapeHtml(meta.h1)}</h1>
      <p>${escapeHtml(meta.intro)}</p>
      <nav aria-label="Important links">
        <ul>${links}</ul>
      </nav>
      <p>This page is enhanced by the Rafiqy app after loading. The core title, description, heading and links are available in this static HTML for search engines and no-JavaScript crawlers.</p>
    </main>`
}

function removeManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:title["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:description["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:url["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/gi, '')
}

function renderRoute(shellHtml, route) {
  const meta = ROUTES[route]
  if (!meta) throw new Error(`Missing prerender metadata for ${route}`)

  const html = removeManagedHead(shellHtml)
    .replace('</head>', `${buildHead(meta)}\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${buildBody(meta)}</div>`)

  return html
}

async function main() {
  const shellHtml = await readFile(SHELL_HTML_PATH, 'utf8')

  for (const route of PILOT_PRERENDER_ROUTES) {
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
