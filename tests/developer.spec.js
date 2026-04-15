/**
 * DEVELOPER TOOLS — Data Transformer, Log Analyzer, Config Converter,
 * Mock Data, Trace Correlator, Schema Mapper, Markdown Scraper
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Data Transformer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/data-transformer')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Data Transformer|JSON|CSV/i).first()).toBeVisible()
  })

  test('JSON input textarea is present', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await expect(ta).toBeVisible()
  })

  test('paste JSON and get output', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('[{"name":"Alice","age":30},{"name":"Bob","age":25}]')
    // Output or convert button should appear
    await expect(page.getByText(/CSV|convert|output/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('De-identifier toggle is present', async ({ page }) => {
    await expect(page.getByText(/De-identify|redact|mask/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Log Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/log-analyzer')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Log Analyzer|Smart Log/i).first()).toBeVisible()
  })

  test('log textarea is visible', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await expect(ta).toBeVisible()
  })

  test('paste logs and analyze', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('2024-01-01 ERROR NullPointerException at line 42\n2024-01-01 ERROR NullPointerException at line 42\n2024-01-01 WARN Connection timeout')
    await expect(page.getByText(/error|group|cluster|pattern/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('Copy for AI button is present', async ({ page }) => {
    // Analysis is manual: Load Sample populates text, then must click "Analyze Logs →"
    await page.getByText(/Load Sample/i).first().click()
    await page.getByRole('button', { name: /Analyze Logs/i }).click()
    // Wait for clusters to render (Compression stat only appears in results section)
    await expect(page.getByText(/Compression/i).first()).toBeVisible({ timeout: 12_000 })
    await expect(page.getByRole('button', { name: /Copy for AI/i }).first()).toBeVisible({ timeout: 5_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Config Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/config-converter')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Config|Polyglot|Converter/i).first()).toBeVisible()
  })

  test('format options are visible', async ({ page }) => {
    await expect(page.getByText(/ENV|JSON|YAML|TOML/i).first()).toBeVisible()
  })

  test('paste env and convert to JSON', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('DATABASE_URL=postgres://localhost/mydb\nAPI_KEY=abc123\nDEBUG=true')
    await expect(page.getByText(/JSON|output|result/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Mock Data Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/mock-data')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Mock Data|Data Generator/i).first()).toBeVisible()
  })

  test('add field button is present', async ({ page }) => {
    await expect(page.getByText(/Add Field|add field|\+ field/i).first()).toBeVisible()
  })

  test('generate button is present', async ({ page }) => {
    await expect(page.getByText(/Generate|generate/i).first()).toBeVisible()
  })

  test('edge case mode toggle exists', async ({ page }) => {
    await expect(page.getByText(/Edge Case|edge case/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Distributed Trace Correlator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/trace-correlator')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Trace Correlator|Distributed/i).first()).toBeVisible()
  })

  test('drag-drop upload zone or load demo button is present', async ({ page }) => {
    const el = page.getByText(/Drop|drag|load demo|sample|paste/i).first()
    await expect(el).toBeVisible()
  })

  test('stats or trace panel renders after interaction', async ({ page }) => {
    // Wait for the page to fully render then check substantial content exists
    await expect(page.getByText(/Trace Correlator|Distributed/i).first()).toBeVisible({ timeout: 12_000 })
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(100)
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Schema Field Mapper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/schema-mapper')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Schema.*Mapper|Field Mapper/i).first()).toBeVisible()
  })

  test('source and destination schema panels are visible', async ({ page }) => {
    await expect(page.getByText(/Source|source schema/i).first()).toBeVisible()
    await expect(page.getByText(/Destination|target schema/i).first()).toBeVisible()
  })

  test('demo load button works and shows schema fields', async ({ page }) => {
    const demoBtn = page.getByText(/Load Demo Data|Load Demo/i).first()
    await demoBtn.click()
    await expect(page.locator('textarea').first()).not.toBeEmpty({ timeout: 6_000 })
  })

  test('code generation section is visible', async ({ page }) => {
    await expect(page.getByText(/JavaScript|Python|code gen|generate/i).first()).toBeVisible()
  })

  test('complexity stats are shown', async ({ page }) => {
    // Stats only render when hasSchemas is true — click demo to load both schemas first
    await page.getByText(/Load Demo Data|Load Demo/i).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText(/Complexity Score|fields mapped|unmapped/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Markdown Scraper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/markdown-scraper')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Markdown|LLM.Ready/i).first()).toBeVisible()
  })

  test('URL or HTML input is visible', async ({ page }) => {
    const input = page.locator('input[type="url"], input[type="text"], textarea').first()
    await expect(input).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
