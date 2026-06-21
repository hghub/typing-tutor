import path from 'node:path'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'blog')
const OUTPUT_FILE = path.join(REPO_ROOT, 'src', 'data', 'blogPosts.js')

const REQUIRED_FIELDS = ['slug', 'title', 'description', 'hero', 'category', 'readTime', 'publishDate', 'tags']

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function decodeHtml(value) {
  return String(value)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function kebabToWords(value) {
  return value.replace(/[-_]+/g, ' ').trim()
}

function normalizeWhitespace(value) {
  return value.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ')
}

function parseScalar(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    return JSON.parse(trimmed)
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontmatter(raw) {
  const normalized = normalizeWhitespace(raw)
  if (!normalized.startsWith('---\n')) {
    throw new Error('Markdown file is missing frontmatter')
  }

  const end = normalized.indexOf('\n---\n', 4)
  if (end === -1) {
    throw new Error('Markdown file frontmatter is not closed')
  }

  const frontmatterText = normalized.slice(4, end)
  const body = normalized.slice(end + 5).trim()
  const data = {}

  for (const line of frontmatterText.split('\n')) {
    if (!line.trim()) continue
    const separator = line.indexOf(':')
    if (separator === -1) {
      throw new Error(`Invalid frontmatter line: ${line}`)
    }
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1)
    data[key] = parseScalar(value)
  }

  return { data, body }
}

function formatFrontmatterValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value)
  return String(value)
}

function buildFrontmatter(data) {
  const lines = ['---']
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue
    lines.push(`${key}: ${formatFrontmatterValue(value)}`)
  }
  lines.push('---', '')
  return lines.join('\n')
}

function extractListItems(inner) {
  return [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(match => match[1].trim())
}

function convertTable(tableHtml) {
  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
  if (!rowMatches.length) return ''

  const rows = rowMatches.map(match => {
    const cells = [...match[1].matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map(cell => stripHtml(cell[2]).replace(/\|/g, '\\|').trim())
    return cells
  }).filter(row => row.length)

  if (!rows.length) return ''
  const header = `| ${rows[0].join(' | ')} |`
  const separator = `| ${rows[0].map(() => '---').join(' | ')} |`
  const body = rows.slice(1).map(row => `| ${row.join(' | ')} |`)
  return [header, separator, ...body].join('\n')
}

function convertListBlock(html, ordered) {
  const items = extractListItems(html)
  if (!items.length) return ''
  return items
    .map((item, index) => {
      const prefix = ordered ? `${index + 1}. ` : '- '
      return `${prefix}${htmlToMarkdownInline(item)}`
    })
    .join('\n')
}

function stripHtml(value) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).replace(/\n{3,}/g, '\n\n').trim()
}

function htmlToMarkdownInline(html) {
  return decodeHtml(
    html
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${stripHtml(text)}](${href})`)
      .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `**${stripHtml(text)}**`)
      .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `*${stripHtml(text)}*`)
      .replace(/<code>([\s\S]*?)<\/code>/gi, (_, code) => `\`${decodeHtml(code.trim())}\``)
      .replace(/<br\s*\/?>/gi, '  \n')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+\n/g, '\n').trim()
}

function htmlToMarkdown(html) {
  let md = normalizeWhitespace(html).trim()
  const codeBlockPlaceholders = []

  md = md.replace(/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/gi, (_, lang = '', code) => {
    const fence = ['```' + lang, decodeHtml(code).trim(), '```'].join('\n')
    const placeholder = `@@CODE_BLOCK_${codeBlockPlaceholders.length}@@`
    codeBlockPlaceholders.push(`\n\n${fence}\n\n`)
    return placeholder
  })

  md = md.replace(/<table[\s\S]*?<\/table>/gi, (table) => `\n\n${convertTable(table)}\n\n`)
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = stripHtml(inner)
    if (!text) return ''
    return `\n\n${text.split('\n').map(line => `> ${line}`).join('\n')}\n\n`
  })
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => `\n\n${convertListBlock(inner, true)}\n\n`)
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => `\n\n${convertListBlock(inner, false)}\n\n`)

  for (let level = 6; level >= 1; level -= 1) {
    const hashes = '#'.repeat(level)
    const regex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi')
    md = md.replace(regex, (_, inner) => `\n\n${hashes} ${htmlToMarkdownInline(inner)}\n\n`)
  }

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
    const text = htmlToMarkdownInline(inner)
    return text ? `\n\n${text}\n\n` : ''
  })

  md = md
    .replace(/<(div|section|article|main|span)[^>]*>/gi, '')
    .replace(/<\/(div|section|article|main|span)>/gi, '')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/gi, '\n\n![$1]($2)\n\n')
    .replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '\n\n![$2]($1)\n\n')
    .replace(/<[^>]+>/g, '')

  md = decodeHtml(md)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()

  for (let index = 0; index < codeBlockPlaceholders.length; index += 1) {
    md = md.replace(`@@CODE_BLOCK_${index}@@`, codeBlockPlaceholders[index].trim())
  }

  return `${md}\n`
}

function tokenizeInline(text) {
  const tokens = []
  let index = 0
  while (index < text.length) {
    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1)
      if (end !== -1) {
        tokens.push({ type: 'code', value: text.slice(index + 1, end) })
        index = end + 1
        continue
      }
    }
    if (text[index] === '!' && text[index + 1] === '[') {
      const close = text.indexOf(']', index + 2)
      const openParen = text.indexOf('(', close)
      const closeParen = text.indexOf(')', openParen)
      if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
        tokens.push({
          type: 'image',
          alt: text.slice(index + 2, close),
          href: text.slice(openParen + 1, closeParen),
        })
        index = closeParen + 1
        continue
      }
    }
    if (text[index] === '[') {
      const close = text.indexOf(']', index + 1)
      const openParen = text.indexOf('(', close)
      const closeParen = text.indexOf(')', openParen)
      if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
        tokens.push({
          type: 'link',
          label: text.slice(index + 1, close),
          href: text.slice(openParen + 1, closeParen),
        })
        index = closeParen + 1
        continue
      }
    }
    if (text[index] === '*' && text[index + 1] === '*') {
      const end = text.indexOf('**', index + 2)
      if (end !== -1) {
        tokens.push({ type: 'strong', value: text.slice(index + 2, end) })
        index = end + 2
        continue
      }
    }
    if (text[index] === '*') {
      const end = text.indexOf('*', index + 1)
      if (end !== -1) {
        tokens.push({ type: 'em', value: text.slice(index + 1, end) })
        index = end + 1
        continue
      }
    }

    let next = text.length
    for (const candidate of ['`', '[', '*', '![' ]) {
      const found = text.indexOf(candidate, index + 1)
      if (found !== -1 && found < next) next = found
    }
    tokens.push({ type: 'text', value: text.slice(index, next) })
    index = next
  }
  return tokens
}

function renderInline(text) {
  return tokenizeInline(text).map(token => {
    if (token.type === 'text') return escapeHtml(token.value)
    if (token.type === 'code') return `<code>${escapeHtml(token.value)}</code>`
    if (token.type === 'strong') return `<strong>${renderInline(token.value)}</strong>`
    if (token.type === 'em') return `<em>${renderInline(token.value)}</em>`
    if (token.type === 'link') return `<a href="${escapeHtml(token.href)}">${renderInline(token.label)}</a>`
    if (token.type === 'image') return `<img src="${escapeHtml(token.href)}" alt="${escapeHtml(token.alt)}">`
    return ''
  }).join('')
}

function isTableSeparator(line) {
  return /^\|\s*[-:| ]+\|\s*$/.test(line.trim())
}

function renderMarkdown(markdown) {
  const lines = normalizeWhitespace(markdown).split('\n')
  const html = []
  let index = 0

  while (index < lines.length) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line) {
      index += 1
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      html.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`)
      index += 1
      continue
    }

    const fenceMatch = line.match(/^```([\w-]*)\s*$/)
    if (fenceMatch) {
      const lang = fenceMatch[1]
      const codeLines = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      html.push(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(codeLines.join('\n')).trim()}</code></pre>`)
      continue
    }

    if (line.startsWith('>')) {
      const quoteLines = []
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      html.push(`<blockquote>${renderMarkdown(quoteLines.join('\n'))}</blockquote>`)
      continue
    }

    if (line.startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const tableLines = [line]
      index += 2
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index].trim())
        index += 1
      }
      const rows = tableLines.map(row => row.slice(1, -1).split('|').map(cell => cell.trim()))
      const [header, ...body] = rows
      const thead = `<thead><tr>${header.map(cell => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead>`
      const tbody = body.length
        ? `<tbody>${body.map(row => `<tr>${row.map(cell => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`
        : ''
      html.push(`<table>${thead}${tbody}</table>`)
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''))
        index += 1
      }
      html.push(`<ul>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }
      html.push(`<ol>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ol>`)
      continue
    }

    if (line.startsWith('<') && line.endsWith('>')) {
      const htmlBlock = []
      while (index < lines.length && lines[index].trim()) {
        htmlBlock.push(lines[index])
        index += 1
      }
      html.push(htmlBlock.join('\n'))
      continue
    }

    const paragraphLines = []
    while (index < lines.length) {
      const candidate = lines[index].trim()
      if (!candidate) break
      if (/^(#{1,6})\s+/.test(candidate)) break
      if (/^```/.test(candidate)) break
      if (candidate.startsWith('>')) break
      if ((candidate.startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) break
      if (candidate.startsWith('<') && candidate.endsWith('>')) break
      paragraphLines.push(candidate)
      index += 1
    }
    html.push(`<p>${renderInline(paragraphLines.join(' '))}</p>`)
  }

  return html.join('\n')
}

async function walkMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMarkdownFiles(fullPath)
    if (entry.isFile() && entry.name.endsWith('.md')) return [fullPath]
    return []
  }))
  return files.flat()
}

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function buildGeneratedModule(posts) {
  const rows = posts.map(post => `  ${JSON.stringify(post, null, 2).replace(/\n/g, '\n  ')}`)
  return `// Generated by scripts/sync-blog-posts.mjs\n// Do not edit this file directly. Edit markdown files in content/blog instead.\n\nexport const BLOG_POSTS = [\n${rows.join(',\n')}\n]\n`
}

async function syncFromMarkdown() {
  const files = await walkMarkdownFiles(CONTENT_DIR)
  const posts = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, body } = parseFrontmatter(raw)
    const relative = toPosix(path.relative(CONTENT_DIR, file))
    const pathParts = relative.split('/')
    const fileSlug = path.basename(file, '.md')
    const inferredSection = pathParts[0]
    const post = {
      ...data,
      slug: data.slug || fileSlug,
      section: data.section || inferredSection,
      content: renderMarkdown(body),
    }

    for (const field of REQUIRED_FIELDS) {
      if (!post[field] || (Array.isArray(post[field]) && !post[field].length)) {
        throw new Error(`${relative}: missing required field ${field}`)
      }
    }

    if (!post.content.includes('<h2')) {
      throw new Error(`${relative}: content must include at least one H2`)
    }

    posts.push(post)
  }

  posts.sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0))
  await writeFile(OUTPUT_FILE, buildGeneratedModule(posts), 'utf8')
  console.log(`Synced ${posts.length} blog posts from markdown`)
}

async function migrateLegacyPosts() {
  const legacyFileArg = process.argv.find(arg => arg.startsWith('--legacy-file='))
  const providedLegacyFile = legacyFileArg ? legacyFileArg.slice('--legacy-file='.length) : null
  const tempLegacyFile = path.join(REPO_ROOT, '.tmp-blog-posts-legacy.mjs')
  const activeLegacyFile = providedLegacyFile || tempLegacyFile

  if (!providedLegacyFile) {
    const legacySnapshot = execFileSync('git', ['show', 'HEAD:src/data/blogPosts.js'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    })
    await writeFile(tempLegacyFile, legacySnapshot, 'utf8')
  }

  const legacyUrl = pathToFileURL(activeLegacyFile).href
  const routesUrl = pathToFileURL(path.join(REPO_ROOT, 'src', 'data', 'blogRoutes.js')).href
  try {
    const legacyModule = await import(`${legacyUrl}?legacy=${Date.now()}`)
    const routesModule = await import(routesUrl)
    const posts = legacyModule.BLOG_POSTS || []
    const getBlogSection = routesModule.getBlogSection

    for (const post of posts) {
      const section = post.section || getBlogSection(post).path
      const targetDir = path.join(CONTENT_DIR, section)
      const targetFile = path.join(targetDir, `${post.slug}.md`)
      await mkdir(targetDir, { recursive: true })

      const frontmatter = buildFrontmatter({
        slug: post.slug,
        title: post.title,
        description: post.description,
        hero: post.hero,
        category: post.category,
        section,
        readTime: post.readTime,
        publishDate: post.publishDate,
        tags: post.tags,
      })

      const markdown = htmlToMarkdown(post.content)
      await writeFile(targetFile, `${frontmatter}${markdown}`, 'utf8')
    }

    console.log(`Migrated ${posts.length} legacy blog posts to markdown`)
    await syncFromMarkdown()
  } finally {
    if (!providedLegacyFile) {
      await rm(tempLegacyFile, { force: true })
    }
  }
}

async function main() {
  const migrate = process.argv.includes('--migrate-legacy')
  if (migrate) {
    await migrateLegacyPosts()
    return
  }
  await syncFromMarkdown()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
