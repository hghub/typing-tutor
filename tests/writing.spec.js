/**
 * WRITING TOOLS — Word Counter, Text Formatter, Doc Composer
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Word Counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/word-counter')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with heading', async ({ page }) => {
    await expect(page.getByText(/Word Counter/i).first()).toBeVisible()
  })

  test('textarea accepts input', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('Hello world this is a test sentence.')
    await expect(ta).toHaveValue(/Hello world/)
  })

  test('word count updates after input', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('one two three four five')
    await expect(page.getByText(/5|five/i).first()).toBeVisible({ timeout: 6_000 })
  })

  test('character count is shown', async ({ page }) => {
    await expect(page.getByText(/character/i).first()).toBeVisible()
  })

  test('readability score section visible', async ({ page }) => {
    await expect(page.getByText(/readability|grade|score/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Text Formatter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/text-cleaner')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with heading', async ({ page }) => {
    await expect(page.getByText(/Text Formatter|Text Cleaner/i).first()).toBeVisible()
  })

  test('textarea accepts input', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('  hello   world  ')
    await expect(ta).toHaveValue(/hello/)
  })

  test('uppercase/lowercase conversion button exists', async ({ page }) => {
    await expect(page.getByText(/UPPER|Upper|uppercase|lower/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Doc Composer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/doc-composer')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with heading', async ({ page }) => {
    await expect(page.getByText(/Doc Composer|Document/i).first()).toBeVisible()
  })

  test('template selector is visible', async ({ page }) => {
    await expect(page.getByText(/CV|Cover Letter|Email|Contract|template/i).first()).toBeVisible()
  })

  test('form fields appear', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="email"], textarea')
    await expect(inputs.first()).toBeVisible({ timeout: 10_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
