import path from 'node:path'
import http from 'node:http'
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { chromium } from '@playwright/test'
import { PILOT_PRERENDER_ROUTES } from './prerender-routes.mjs'

const DIST_DIR = path.resolve('dist')
const HOST = '127.0.0.1'
const PORT = 4173
const BASE_URL = `http://${HOST}:${PORT}`
const SHELL_HTML_PATH = path.join(DIST_DIR, 'index.html')

function routeToFile(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html')
  const cleaned = route.replace(/^\//, '')
  return path.join(DIST_DIR, cleaned, 'index.html')
}

async function ensureServerReady(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Preview server did not become ready at ${url}`)
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.woff2': 'font/woff2',
  }
  return map[ext] || 'application/octet-stream'
}

async function resolveDistPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0])
  const normalized = cleanPath === '/' ? '/index.html' : cleanPath
  const candidate = path.join(DIST_DIR, normalized.replace(/^\//, ''))

  try {
    await access(candidate, fsConstants.F_OK)
    const candidateStat = await stat(candidate)
    if (candidateStat.isDirectory()) {
      const nestedIndex = path.join(candidate, 'index.html')
      await access(nestedIndex, fsConstants.F_OK)
      return nestedIndex
    }
    return candidate
  } catch {}

  try {
    const nestedIndex = path.join(candidate, 'index.html')
    await access(nestedIndex, fsConstants.F_OK)
    return nestedIndex
  } catch {}

  return null
}

async function startPreviewServer() {
  const shellHtml = await readFile(SHELL_HTML_PATH)

  const server = http.createServer(async (req, res) => {
    try {
      const filePath = await resolveDistPath(req.url || '/')
      const body = filePath ? await readFile(filePath) : shellHtml
      res.statusCode = 200
      res.setHeader('Content-Type', contentTypeFor(filePath || SHELL_HTML_PATH))
      res.end(body)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(`Preview server error: ${error.message}`)
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, HOST, resolve)
  })

  await ensureServerReady(BASE_URL)
  return server
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true })
  } catch {
    return chromium.launch({ headless: true })
  }
}

async function prerenderRoute(browser, route) {
  const context = await browser.newContext({ serviceWorkers: 'block' })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  try {
    console.log(`rendering ${route}...`)
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' })
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root')
        return !!root && root.innerHTML.trim().length > 0
      },
      { timeout: 15000 },
    )
    await page.waitForTimeout(400)

    await page.evaluate(() => {
      const dedupeKeepLast = (selector, keyFn) => {
        const nodes = Array.from(document.head.querySelectorAll(selector))
        const seen = new Set()
        for (let i = nodes.length - 1; i >= 0; i -= 1) {
          const node = nodes[i]
          const key = keyFn(node)
          if (!key) continue
          if (seen.has(key)) {
            node.remove()
          } else {
            seen.add(key)
          }
        }
      }

      dedupeKeepLast('title', () => 'title')
      dedupeKeepLast('meta[name]', (node) => `meta:name:${node.getAttribute('name')?.toLowerCase()}`)
      dedupeKeepLast('meta[property]', (node) => `meta:property:${node.getAttribute('property')?.toLowerCase()}`)
      dedupeKeepLast('link[rel]', (node) => {
        const rel = node.getAttribute('rel')?.toLowerCase()
        if (rel === 'canonical') return 'link:canonical'
        if (rel === 'manifest') return 'link:manifest'
        return null
      })
    })

    const html = (await page.content()).replace(/^<!DOCTYPE html>\s*/i, '')
    const outputFile = routeToFile(route)
    await mkdir(path.dirname(outputFile), { recursive: true })
    await writeFile(outputFile, `<!DOCTYPE html>\n${html}`, 'utf8')
    console.log(`prerendered ${route} -> ${path.relative(process.cwd(), outputFile)}`)
  } catch (error) {
    const currentHtml = await page.content().catch(() => '')
    console.error(`Failed to prerender ${route}`)
    if (pageErrors.length) console.error(`page errors for ${route}:`, pageErrors)
    if (consoleErrors.length) console.error(`console errors for ${route}:`, consoleErrors)
    if (currentHtml) {
      const debugFile = path.join(DIST_DIR, '__prerender-debug.html')
      await writeFile(debugFile, currentHtml, 'utf8')
      console.error(`saved debug HTML to ${path.relative(process.cwd(), debugFile)}`)
    }
    throw error
  } finally {
    await context.close()
  }
}

async function main() {
  const server = await startPreviewServer()
  let browser

  try {
    browser = await launchBrowser()
    for (const route of PILOT_PRERENDER_ROUTES) {
      await prerenderRoute(browser, route)
    }
  } finally {
    if (browser) await browser.close()
    if (server) {
      await new Promise(resolve => server.close(resolve))
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
