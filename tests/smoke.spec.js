/**
 * SMOKE TESTS — All 32 Typely tools
 * Verifies every route loads without crash and has a visible heading/title.
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

const TOOLS = [
  { id: 'typing-tutor',       url: '/#/',                              label: 'Typing Tutor' },
  { id: 'word-counter',       url: '/#/tools/word-counter',            label: 'Word Counter' },
  { id: 'text-cleaner',       url: '/#/tools/text-cleaner',            label: 'Text Formatter' },
  { id: 'doc-composer',       url: '/#/tools/doc-composer',            label: 'Doc Composer' },
  { id: 'urdu-keyboard',      url: '/#/tools/urdu-keyboard',           label: 'Urdu Keyboard' },
  { id: 'tax-calculator',     url: '/#/tools/tax-calculator',          label: 'Tax Calculator' },
  { id: 'tax-optimizer',      url: '/#/tools/tax-optimizer',           label: 'Tax Shield Optimizer' },
  { id: 'text-encryptor',     url: '/#/tools/text-encryptor',          label: 'Text Encryptor' },
  { id: 'data-leak-detector', url: '/#/tools/data-leak-detector',      label: 'Data Leak Detector' },
  { id: 'currency-converter', url: '/#/tools/currency-converter',      label: 'Currency Converter' },
  { id: 'packing-list',       url: '/#/tools/packing-list',            label: 'Packing List' },
  { id: 'budget-splitter',    url: '/#/tools/budget-splitter',         label: 'Budget Splitter' },
  { id: 'drug-checker',       url: '/#/tools/drug-checker',            label: 'Drug Interaction' },
  { id: 'symptom-tracker',    url: '/#/tools/symptom-tracker',         label: 'Symptom' },
  { id: 'data-transformer',   url: '/#/tools/data-transformer',        label: 'Data Transformer' },
  { id: 'markdown-scraper',   url: '/#/tools/markdown-scraper',        label: 'Markdown Scraper' },
  { id: 'log-analyzer',       url: '/#/tools/log-analyzer',            label: 'Log Analyzer' },
  { id: 'config-converter',   url: '/#/tools/config-converter',        label: 'Config' },
  { id: 'mock-data',          url: '/#/tools/mock-data',               label: 'Mock Data' },
  { id: 'trace-correlator',   url: '/#/tools/trace-correlator',        label: 'Trace Correlator' },
  { id: 'schema-mapper',      url: '/#/tools/schema-mapper',           label: 'Schema' },
  { id: 'student-groups',     url: '/#/tools/student-groups',          label: 'Student Group' },
  { id: 'timeline-builder',   url: '/#/tools/timeline-builder',        label: 'Timeline' },
  { id: 'position-size-calc', url: '/#/tools/position-size-calc',      label: 'Position Size' },
  { id: 'voice-invoice',      url: '/#/tools/voice-invoice',           label: 'Voice' },
  { id: 'property-comp',      url: '/#/tools/property-comp',           label: 'Property Comp' },
  { id: 'refrigerant-calc',   url: '/#/tools/refrigerant-calc',        label: 'Refrigerant' },
  { id: 'freelancer-risk',    url: '/#/tools/freelancer-risk',         label: 'Freelancer Risk' },
  { id: 'warranty-tracker',   url: '/#/tools/warranty-tracker',        label: 'Warranty' },
  { id: 'driving-fines',      url: '/#/tools/driving-fines',           label: 'Driving Fine' },
  { id: 'expense-analyzer',   url: '/#/tools/expense-analyzer',        label: 'Expense' },
  { id: 'doc-redaction',      url: '/#/tools/doc-redaction',           label: 'Redaction' },
]

for (const tool of TOOLS) {
  test(`[smoke] ${tool.id} — page loads`, async ({ page }) => {
    await page.goto(BASE + tool.url)
    // Wait for React to hydrate (lazy loaded)
    await page.waitForLoadState('domcontentloaded')
    // No crash: no "Something went wrong" or blank body
    const body = await page.textContent('body')
    expect(body).not.toContain('Something went wrong')
    expect(body).not.toBe('')
    // Tool label appears somewhere on page
    await expect(page.getByText(tool.label, { exact: false }).first()).toBeVisible({ timeout: 12_000 })
  })
}

test('[smoke] tools home page loads with tool grid', async ({ page }) => {
  await page.goto(BASE + '/#/tools')
  await page.waitForLoadState('domcontentloaded')
  // Should show multiple tool cards
  const cards = page.locator('a[href]').filter({ hasText: /Counter|Formatter|Encryptor|Calculator/ })
  await expect(cards.first()).toBeVisible()
})

test('[smoke] 404 route does not crash', async ({ page }) => {
  await page.goto(BASE + '/#/tools/does-not-exist')
  await page.waitForLoadState('domcontentloaded')
  const body = await page.textContent('body')
  expect(body).not.toBe('')
})
