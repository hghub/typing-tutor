// Curated discovery; IDs and canonical destinations resolve through the registry.
export const HOME_META = {
  title: 'Rafiqy | Practical Tools, Business Demos & Guides',
  description: 'Find tools for PDFs, Urdu typing, money planning, privacy and developer work. Explore synthetic business demos for stock, order review and integration workflows.',
  heading: 'Find the right tool. Make everyday work easier.',
}
export const HOME_CATEGORIES = [
  { slug: 'pdf-tools', icon: '▤', label: 'PDFs & documents', description: 'Prepare files for work, applications and sharing.', tools: ['compress-pdf', 'merge-pdf', 'text-extractor'] },
  { slug: 'writing-tools', icon: 'Aa', label: 'Writing & Urdu', description: 'Type in Urdu, count words and clean up text.', tools: ['urdu-keyboard', 'word-counter', 'text-cleaner'] },
  { slug: 'finance-tools', icon: '＋', label: 'Money & decisions', description: 'Compare scenarios before a financial decision. Check each tool’s assumptions.', tools: ['tax-calculator', 'loan-emi', 'rent-vs-buy-pakistan'] },
  { slug: 'business-tools', icon: '▦', label: 'Business operations', description: 'Explore stock planning, order checks and shared-service contribution demos.', tools: ['stock-planner', 'order-review-demo', 'community-fund-demo'] },
  { slug: 'developer-tools', icon: '{ }', label: 'Development & integration', description: 'Format data, inspect logs and compare mapping behaviour.', tools: ['json-formatter', 'data-transformer', 'migration-evidence-demo'] },
  { slug: 'security-tools', icon: '◇', label: 'Privacy & sharing', description: 'Review sensitive text and prepare documents for sharing.', tools: ['data-leak-detector', 'doc-redaction', 'password-generator'] },
  { slug: 'productivity-tools', icon: '◷', label: 'Planning & productivity', description: 'Find focus, organize tasks and work across time zones.', tools: ['pomodoro', 'daily-planner', 'world-time'] },
  { slug: 'pakistan-tools', icon: 'اردو', label: 'Pakistan essentials', description: 'Local salary planning, Urdu input, solar and everyday references.', tools: ['tax-calculator', 'urdu-keyboard', 'solar-planner'] },
]
export const HOME_STARTERS = [
  { id: 'compress-pdf', label: 'Make a PDF smaller', description: 'Prepare a document for an upload limit.', category: 'Documents' },
  { id: 'urdu-keyboard', label: 'Type something in Urdu', description: 'Write and copy Urdu text in your browser.', category: 'Writing' },
  { id: 'tax-calculator', label: 'Estimate Pakistan salary tax', description: 'Choose a supported tax year and review the base estimate.', category: 'Money planning' },
  { id: 'rent-vs-buy-pakistan', label: 'Compare renting and buying', description: 'Explore assumptions, costs and tradeoffs.', category: 'Money planning' },
  { id: 'json-formatter', label: 'Format and validate JSON', description: 'Make a payload easier to read and check.', category: 'Developer tools' },
  { id: 'typing-tutor', label: 'Practice your typing', description: 'Build speed and accuracy with focused practice.', category: 'Learning' },
]
export const HOME_DEMOS = [
  { id: 'stock-planner', label: 'Stock & replenishment', description: 'Check shortages, delivery gaps and simple statistical forecasts.', type: 'Planning demo' },
  { id: 'order-review-demo', label: 'Order review before ERP', description: 'Resolve catalogue and price exceptions before exporting a draft.', type: 'Synthetic workflow' },
  { id: 'migration-evidence-demo', label: 'Migration evidence', description: 'Compare bounded mapping fixtures; inspect failures and remaining gaps.', type: 'Synthetic workflow' },
  { id: 'community-fund-demo', label: 'Shared services fund', description: 'Separate collection delays from a budget that still falls short.', type: 'Synthetic workflow' },
]
export const HOME_GUIDES = ['freelancing-in-the-ai-era', 'how-to-prioritize-stock-reorders', 'how-to-use-urdu-typing-for-whatsapp-cv-and-forms']
export const HOME_FAQS = [
  { q: 'Where should I start?', a: 'Search for a task or tool name, choose a category, or use one of the starting points above. The full tool directory includes every tool.' },
  { q: 'Are the business demos connected to my systems?', a: 'No. These demos use editable inputs and synthetic examples. ERP, POS, private AI and other connectors require a separately scoped implementation. Mapping demos do not compile or migrate real projects.' },
  { q: 'Are all tools local and available offline?', a: 'Many utilities process inputs in the browser. Cloud sync, online lookups and live data need a connection and may send requests off-device. Read each tool’s notes; do not enter private customer or patient records in public demos.' },
  { q: 'Is Urdu available?', a: 'The Urdu keyboard supports Urdu input. Selected tools have English and Urdu core views; the full site and every advanced feature are not translated.' },
]
