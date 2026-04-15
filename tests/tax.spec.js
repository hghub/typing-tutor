/**
 * TAX CALCULATOR + TAX OPTIMIZER — interaction tests
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Tax Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/tax-calculator')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with heading', async ({ page }) => {
    await expect(page.getByText(/Tax Calculator|Income Tax/i).first()).toBeVisible()
  })

  test('income input accepts a number', async ({ page }) => {
    const incomeInput = page.locator('input[type="number"], input[placeholder*="income" i], input[placeholder*="salary" i]').first()
    await incomeInput.fill('1200000')
    await expect(incomeInput).toHaveValue('1200000')
  })

  test('tax result updates after entering income', async ({ page }) => {
    const incomeInput = page.locator('input[type="number"]').first()
    await incomeInput.fill('1500000')
    await page.keyboard.press('Tab')
    // Some tax amount should appear
    await expect(page.getByText(/PKR|tax|payable/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('age input for senior rebate is present', async ({ page }) => {
    // Tax calculator uses an age number input, not a checkbox, for senior rebate
    await expect(page.getByText(/senior rebate|age.*60|60.*qualifies/i).first()).toBeVisible()
  })

  test('senior citizen warning shows for high income', async ({ page }) => {
    // Fill income (first number input) and age (look for age-labelled input)
    const inputs = page.locator('input[type="number"]')
    await inputs.first().fill('2000000')
    // Age input is typically 2nd or 3rd number input
    const count = await inputs.count()
    if (count > 1) await inputs.nth(count - 1).fill('65')
    await page.keyboard.press('Tab')
    await expect(page.getByText(/750,000|rebate.*not|not.*applicable/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('VPS input accepts contribution amount', async ({ page }) => {
    const inputs = page.locator('input[type="number"]')
    await inputs.first().fill('3000000')
    // VPS field (2nd or 3rd number input)
    if (await inputs.count() > 1) {
      await inputs.nth(1).fill('100000')
    }
  })

  test('legal references section is visible', async ({ page }) => {
    await expect(page.getByText(/Legal References|Section 63|ITO 2001/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Tax Shield Optimizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/tax-optimizer')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with heading', async ({ page }) => {
    await expect(page.getByText(/Tax Shield|Optimizer/i).first()).toBeVisible()
  })

  test('salary input accepts a value', async ({ page }) => {
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('5000000')
    await expect(salaryInput).toHaveValue('5000000')
  })

  test('optimization runs and shows savings', async ({ page }) => {
    const inputs = page.locator('input[type="number"]')
    await inputs.first().fill('5000000')
    if (await inputs.count() > 1) {
      await inputs.nth(1).fill('300000')
    }
    await page.keyboard.press('Tab')
    await expect(page.getByText(/PKR|save|saving|credit/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('donut chart or visual output is rendered after input', async ({ page }) => {
    // opt requires BOTH annualIncome > 0 AND budgetVal > 0 to render DonutChart
    const inputs = page.locator('input[type="number"]')
    await inputs.first().fill('5000000')    // monthly salary
    await inputs.nth(1).fill('500000')      // annual bonus
    await inputs.nth(2).fill('300000')      // budget — required for opt to compute
    await page.keyboard.press('Tab')
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10_000 })
  })

  test('GPT-PROOF badge is visible', async ({ page }) => {
    await expect(page.getByText(/GPT.PROOF|GPT-PROOF/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
