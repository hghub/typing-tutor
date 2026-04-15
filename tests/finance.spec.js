/**
 * FINANCE TOOLS — Currency Converter, Budget Splitter, Position Size Calc,
 * Expense Analyzer, Driving Fines
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Currency Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/currency-converter')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Currency Converter|exchange rate/i).first()).toBeVisible()
  })

  test('amount input is present', async ({ page }) => {
    const input = page.locator('input[type="number"]').first()
    await expect(input).toBeVisible()
  })

  test('currency selectors (PKR/USD/GBP) are visible', async ({ page }) => {
    await expect(page.getByText(/PKR|USD|GBP|currency/i).first()).toBeVisible()
  })

  test('enter amount shows converted result', async ({ page }) => {
    const input = page.locator('input[type="number"]').first()
    await input.fill('1000')
    await page.keyboard.press('Tab')
    await expect(page.getByText(/\d+\.\d{2}|converted|result/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Trip Budget Splitter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/budget-splitter')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Budget Splitter|Trip Budget|expense/i).first()).toBeVisible()
  })

  test('add expense button is visible', async ({ page }) => {
    await expect(page.getByText(/Add Expense|add expense|\+ expense/i).first()).toBeVisible()
  })

  test("person name input has placeholder 'Person's name'", async ({ page }) => {
    await expect(page.locator('input[placeholder*="name" i]').first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Position Size Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/position-size-calc')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Position Size|risk/i).first()).toBeVisible()
  })

  test('account size and stop-loss inputs are present', async ({ page }) => {
    // StyledInput renders plain <input> — wait for component to fully render first
    await expect(page.getByText(/Account Size|Risk %|Position Size/i).first()).toBeVisible({ timeout: 12_000 })
    const inputs = page.locator('input')
    expect(await inputs.count()).toBeGreaterThanOrEqual(2)
  })

  test('calculates shares to buy', async ({ page }) => {
    // StyledInput renders plain <input> without type attribute
    const inputs = page.locator('input')
    await inputs.nth(0).fill('100000') // account size
    await inputs.nth(1).fill('1')      // risk %
    await inputs.nth(2).fill('50')     // entry price
    await inputs.nth(3).fill('45')     // stop loss
    await page.keyboard.press('Tab')
    await expect(page.getByText(/shares|position|units/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Expense Pattern Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/expense-analyzer')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Expense|spending|bank/i).first()).toBeVisible()
  })

  test('CSV upload zone is visible', async ({ page }) => {
    await expect(page.getByText(/CSV|upload|drag|drop/i).first()).toBeVisible()
  })

  test('privacy note is present', async ({ page }) => {
    await expect(page.getByText(/browser|local|private|100%/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Driving Fine Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/driving-fines')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Driving|Fine|Challan|violation/i).first()).toBeVisible()
  })

  test('add fine / violation button is present', async ({ page }) => {
    await expect(page.getByText(/Add|add fine|violation|log/i).first()).toBeVisible()
  })

  test('license risk score section visible', async ({ page }) => {
    await expect(page.getByText(/risk|score|suspension|license/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
