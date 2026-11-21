// Delete only the former API-response cache; never inspect its contents.
// This runs on activation of the reviewed worker, not during page data entry.
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('supabase-cache'))
})
