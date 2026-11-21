import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { SUPABASE_RUNTIME_ROUTE } from '../../vite.config.js'

test('Supabase data requests have no service-worker cache fallback or HTTP-cache reuse', () => {
  const route = SUPABASE_RUNTIME_ROUTE
  for (const path of ['rest/v1/loans?select=*', 'auth/v1/user', 'storage/v1/object/private/sample', 'rest/v1/passages']) {
    assert.ok(route.urlPattern.test(`https://synthetic-project.supabase.co/${path}`))
  }
  for (const url of ['https://example.com/supabase.co/private', 'https://synthetic.supabase.co.evil.example/rest/v1/loans', 'https://rafiqy.app/assets/app.js']) assert.ok(!route.urlPattern.test(url))
  assert.equal(route.method, 'GET')
  assert.equal(route.handler, 'NetworkOnly')
  assert.equal(route.options.fetchOptions.cache, 'no-store')
  assert.equal(route.options.cacheName, undefined)
  assert.equal(route.options.plugins, undefined)
})

const cleanup = await readFile(new URL('../../public/sw-cache-cleanup.js', import.meta.url), 'utf8')
function activate(remove) {
  const handlers = new Map()
  runInNewContext(cleanup, {
    self: { addEventListener: (name, fn) => handlers.set(name, fn) },
    caches: { delete: remove }, // No read/list/open/put methods available.
  })
  assert.deepEqual([...handlers.keys()], ['activate'])
  let completion
  handlers.get('activate')({ waitUntil: promise => { completion = promise } })
  assert.ok(completion instanceof Promise)
  return completion
}

test('activation removes only the named legacy cache and preserves app caches', async () => {
  const names = new Set(['supabase-cache', 'workbox-precache-v2-test', 'unrelated-cache'])
  const calls = []
  await activate(async name => { calls.push(name); return names.delete(name) })
  assert.deepEqual(calls, ['supabase-cache'])
  assert.deepEqual([...names], ['workbox-precache-v2-test', 'unrelated-cache'])
})

test('cleanup waits for deletion, is safe when absent and exposes deletion failure', async () => {
  let resolve
  const deletion = new Promise(done => { resolve = done })
  const completion = activate(() => deletion)
  assert.equal(completion, deletion)
  resolve(true)
  await completion
  assert.equal(await activate(async () => false), false)
  await assert.rejects(activate(async () => { throw new Error('Synthetic storage failure') }), /Synthetic storage failure/)
})
