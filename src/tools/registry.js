/**
 * Tool registry — single source of truth for all Typely tools.
 * Adding a new tool = adding one object here.
 * Nav, landing cards, related tools, breadcrumbs, and sitemap all read from this array.
 */
export const TOOLS = [
  {
    id: 'typing-tutor',
    name: 'Typing Tutor',
    tagline: 'Test & improve your typing speed',
    description: 'Personalized typing practice with weak-key detection, multiple languages, and real-time feedback.',
    icon: '⌨️',
    path: '/',
    color: '#06b6d4',
    tags: ['typing', 'speed', 'accuracy', 'wpm'],
    related: ['word-counter', 'text-cleaner'],
    isHome: true,
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    tagline: 'Analyze any text instantly',
    description: 'Count words, characters, sentences, and paragraphs. Get readability scores and keyword density — all in your browser.',
    icon: '📊',
    path: '/tools/word-counter',
    color: '#8b5cf6',
    tags: ['writing', 'analysis', 'word count', 'readability'],
    related: ['text-cleaner', 'doc-composer'],
  },
  {
    id: 'text-cleaner',
    name: 'Text Formatter',
    tagline: 'Clean and format text in one click',
    description: 'Remove extra spaces, fix capitalization, convert case, strip formatting — paste and clean instantly.',
    icon: '✨',
    path: '/tools/text-cleaner',
    color: '#10b981',
    tags: ['formatting', 'cleaning', 'case conversion'],
    related: ['word-counter', 'doc-composer'],
  },
  {
    id: 'urdu-keyboard',
    name: 'Urdu Keyboard',
    tagline: 'Type Urdu phonetically on any device',
    description: 'Type Urdu using English phonetics — no Urdu keyboard needed. Copy and use anywhere.',
    icon: '🌍',
    path: '/tools/urdu-keyboard',
    color: '#f59e0b',
    tags: ['urdu', 'keyboard', 'phonetic', 'pakistan'],
    related: ['typing-tutor', 'doc-composer'],
  },
  {
    id: 'text-encryptor',
    name: 'Text Encryptor',
    tagline: 'Encrypt private messages locally',
    description: 'AES-256 encryption powered by your browser. Your text and password never leave your device.',
    icon: '🔒',
    path: '/tools/text-encryptor',
    color: '#ef4444',
    tags: ['security', 'encryption', 'privacy'],
    related: ['text-cleaner', 'doc-composer'],
  },
  {
    id: 'doc-composer',
    name: 'Doc Composer',
    tagline: 'Create professional documents instantly',
    description: 'Fill smart templates for CVs, cover letters, emails, and contracts. Export to PDF — no internet needed.',
    icon: '📄',
    path: '/tools/doc-composer',
    color: '#3b82f6',
    tags: ['documents', 'pdf', 'cv', 'templates', 'freelancing'],
    related: ['word-counter', 'text-cleaner'],
  },
]

/** Lookup a tool by id. */
export function getToolById(id) {
  return TOOLS.find((t) => t.id === id) || null
}

/** Get related tool objects for a given tool id. */
export function getRelatedTools(id) {
  const tool = getToolById(id)
  if (!tool) return []
  return (tool.related || []).map(getToolById).filter(Boolean)
}
