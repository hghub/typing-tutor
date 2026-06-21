import { BLOG_CONTENT_LOADERS } from './blogContentLoaders'

const cache = new Map()

export async function loadBlogPostContent(slug) {
  if (!slug) return null
  if (cache.has(slug)) return cache.get(slug)

  const loader = BLOG_CONTENT_LOADERS[slug]
  if (!loader) return null

  const module = await loader()
  const content = module?.default ?? null
  if (content) {
    cache.set(slug, content)
  }
  return content
}
