export const BLOG_SECTIONS = {
  integration: {
    path: 'integration',
    label: 'Integration',
    description: 'MuleSoft, APIs, Runtime Fabric, gateways, deployment, and integration troubleshooting.',
  },
  'decision-support': {
    path: 'decision-support',
    label: 'Decision Support',
    description: 'Guides that help compare options, estimate tradeoffs, and make practical financial or life decisions.',
  },
  utilities: {
    path: 'utilities',
    label: 'Utilities',
    description: 'Practical how-to guides for everyday browser tools, documents, typing, privacy, and productivity.',
  },
}

const DECISION_KEYWORDS = [
  'solar',
  'tax',
  'loan',
  'emi',
  'invest',
  'investment',
  'rent',
  'buy',
  'house',
  'property',
  'salary',
  'job-offer',
  'freelance',
  'freelancer',
  'kameti',
  'committee',
  'ev',
  'hybrid',
  'petrol',
  'gold',
  'budget',
  'split',
]

function normalizeForRouteSection(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function containsKeywordPhrase(searchable, keyword) {
  const phrase = normalizeForRouteSection(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|\\s)${phrase}(\\s|$)`).test(searchable)
}

export function getBlogSection(post) {
  if (post?.section && BLOG_SECTIONS[post.section]) {
    return BLOG_SECTIONS[post.section]
  }

  if (post?.category === 'mulesoft') {
    return BLOG_SECTIONS.integration
  }

  const searchable = normalizeForRouteSection([
    post?.slug,
    post?.title,
    post?.description,
    post?.category,
    ...(post?.tags || []),
  ].join(' '))

  if (DECISION_KEYWORDS.some(keyword => containsKeywordPhrase(searchable, keyword))) {
    return BLOG_SECTIONS['decision-support']
  }

  return BLOG_SECTIONS.utilities
}

export function getBlogPostPath(post) {
  const section = getBlogSection(post)
  return `/blog/${section.path}/${post.slug}`
}

export function getBlogPostUrl(post) {
  return `https://rafiqy.app${getBlogPostPath(post)}`
}
