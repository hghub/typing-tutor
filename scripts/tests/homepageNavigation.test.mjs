import test from 'node:test'
import assert from 'node:assert/strict'
import { TOOLS } from '../../src/tools/registry.js'
import { CATEGORY_DATA, CATEGORY_TOOL_PRIORITY } from '../../src/data/categoryPages.js'
import { BLOG_INDEX } from '../../src/data/blogIndex.js'
import { getBlogPostPath } from '../../src/data/blogRoutes.js'
import { HOME_META, HOME_CATEGORIES, HOME_STARTERS, HOME_DEMOS, HOME_GUIDES } from '../../src/data/homepage.js'
import { searchTools } from '../../src/lib/toolSearch.js'
import { getPrerenderPage } from '../prerender-content.mjs'

test('homepage routes resolve and each curated tool belongs to the linked category', () => {
  const ids = new Set(TOOLS.map(tool => tool.id))
  for (const group of HOME_CATEGORIES) {
    const data = CATEGORY_DATA[group.slug]
    assert.ok(data, group.slug)
    for (const id of group.tools) {
      assert.ok(ids.has(id), id)
      const tool = TOOLS.find(item => item.id === id)
      assert.ok(data.toolIds?.includes(id) || data.categories?.includes(tool.category) || CATEGORY_TOOL_PRIORITY[group.slug]?.includes(id), `${id} absent from ${group.slug}`)
    }
  }
  for (const item of [...HOME_STARTERS,...HOME_DEMOS]) assert.ok(ids.has(item.id), item.id)
  for (const slug of HOME_GUIDES) assert.ok(BLOG_INDEX.some(post => post.slug === slug), slug)
})
test('home and directory search share vocabulary and handle empty or unmatched queries', () => {
  assert.deepEqual(searchTools(TOOLS, ''), [])
  assert.deepEqual(searchTools(TOOLS, 'x'), [])
  assert.deepEqual(searchTools(TOOLS, 'zzzzzznonexistentzzzzzz'), [])
  assert.equal(searchTools(TOOLS, 'JSON Formatter')[0].id, 'json-formatter')
  assert.equal(searchTools(TOOLS, 'JSON')[0].id, 'json-formatter')
  assert.ok(searchTools(TOOLS, 'urdu mein type').some(tool => tool.id === 'urdu-keyboard'))
  assert.ok(searchTools(TOOLS, 'stock').some(tool => tool.id === 'stock-planner'))
})
test('prerendered homepage matches discovery metadata and all its links resolve', () => {
  const page = getPrerenderPage('/')
  assert.equal(page.title, HOME_META.title)
  assert.ok(page.body.includes(HOME_META.heading))
  const routes = new Set(['/', '/tools', '/blog', '/about', '/help', '/privacy', ...TOOLS.map(tool => tool.path), ...Object.keys(CATEGORY_DATA).map(slug=>`/category/${slug}`), ...BLOG_INDEX.map(getBlogPostPath)])
  for (const [,href] of page.body.matchAll(/href="([^"]+)"/g)) assert.ok(routes.has(href), href)
  for (const item of HOME_DEMOS) assert.ok(page.body.includes(TOOLS.find(tool=>tool.id===item.id).path))
  assert.ok(!page.body.includes('100% Private'))
})
