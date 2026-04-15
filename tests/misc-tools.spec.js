/**
 * MISC TOOLS — Travel, Health, Business, Language, Education, Legal
 * Urdu Keyboard, Packing List, Drug Checker, Symptom Tracker,
 * Student Groups, Timeline Builder, Voice Invoice, Property Comp,
 * Refrigerant Calc, Freelancer Risk, Warranty Tracker
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Urdu Keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/urdu-keyboard')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Urdu Keyboard|Urdu/i).first()).toBeVisible()
  })

  test('phonetic input field is visible', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first()
    await expect(input).toBeVisible()
  })

  test('type English phonetic and get Urdu output', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first()
    await input.fill('aap kaise hain')
    await expect(page.getByText(/آپ|کیسے|ہیں|urdu|output/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Smart Packing List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/packing-list')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Packing List|packing/i).first()).toBeVisible()
  })

  test('destination input is visible', async ({ page }) => {
    const input = page.locator('input[type="text"], input[placeholder*="destination" i]').first()
    await expect(input).toBeVisible()
  })

  test('travel dates input is present', async ({ page }) => {
    await expect(page.locator('input[type="date"], input[placeholder*="date" i]').first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Drug Interaction Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/drug-checker')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Drug Interaction|medication/i).first()).toBeVisible()
  })

  test('drug name input is visible', async ({ page }) => {
    const input = page.locator('input[type="text"], input[placeholder*="drug" i], input[placeholder*="medication" i]').first()
    await expect(input).toBeVisible()
  })

  test('add drug button is present', async ({ page }) => {
    await expect(page.getByText(/Add|add drug|\+/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Symptom Context Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/symptom-tracker')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Symptom|symptom/i).first()).toBeVisible()
  })

  test('log symptom button or input is visible', async ({ page }) => {
    await expect(page.locator('input, textarea, button').first()).toBeVisible()
  })

  test('weather context section is present', async ({ page }) => {
    await expect(page.getByText(/weather|temperature|pressure|context/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Student Group Randomizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/student-groups')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Student Group|Randomizer|classroom/i).first()).toBeVisible()
  })

  test('student name input is visible', async ({ page }) => {
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible()
  })

  test('generate groups button is present', async ({ page }) => {
    await expect(page.getByText(/Generate Groups|Randomize/i).first()).toBeVisible()
  })
})

test.describe('Contextual Timeline Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/timeline-builder')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Timeline|timeline/i).first()).toBeVisible()
  })

  test('events textarea is visible', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await expect(ta).toBeVisible()
  })

  test('paste events and build timeline', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('Jan 1 2024 - Project started\nFeb 15 2024 - First milestone reached\nMar 30 2024 - Beta launched')
    await expect(page.getByText(/timeline|event|date|Jan|Feb|Mar/i).first()).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('Voice Invoice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/voice-invoice')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Voice.*Invoice|invoice/i).first()).toBeVisible()
  })

  test('microphone / record button is visible', async ({ page }) => {
    await expect(page.getByText(/record|speak|microphone|start/i).first()).toBeVisible()
  })

  test('invoice line items section is visible', async ({ page }) => {
    await expect(page.getByText(/item|invoice|line|amount/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Property Comp Adjuster', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/property-comp')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Property Comp|Adjuster|valuation/i).first()).toBeVisible()
  })

  test('bedroom / bathroom toggles are visible', async ({ page }) => {
    await expect(page.getByText(/bedroom|bathroom|bed|bath/i).first()).toBeVisible()
  })

  test('valuation delta is shown', async ({ page }) => {
    await expect(page.getByText(/value|delta|adjust|price/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Refrigerant Leak Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/refrigerant-calc')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Refrigerant|Leak|EPA/i).first()).toBeVisible()
  })

  test('system charge input is visible', async ({ page }) => {
    const input = page.locator('input[type="number"]').first()
    await expect(input).toBeVisible()
  })

  test('calculates leak rate', async ({ page }) => {
    const inputs = page.locator('input[type="number"]')
    await inputs.nth(0).fill('100') // total charge
    await inputs.nth(1).fill('15')  // refrigerant added
    await page.keyboard.press('Tab')
    await expect(page.getByText(/15%|leak rate|annual/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('EPA threshold comparison is shown', async ({ page }) => {
    await expect(page.getByText(/EPA|threshold|compliance|repair/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Freelancer Risk Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/freelancer-risk')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Freelancer Risk|risk score/i).first()).toBeVisible()
  })

  test('questionnaire items are visible', async ({ page }) => {
    await expect(page.locator('input[type="radio"], select, input[type="checkbox"]').first()).toBeVisible()
  })

  test('risk score section is present', async ({ page }) => {
    await expect(page.getByText(/score|risk|0.*100|assessment/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Warranty Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/warranty-tracker')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Warranty Tracker|warranty/i).first()).toBeVisible()
  })

  test('add product button is visible', async ({ page }) => {
    await expect(page.getByText(/\+ Add Product|Add Product/i).first()).toBeVisible()
  })

  test('expiry countdown section is visible', async ({ page }) => {
    await expect(page.getByText(/expir|countdown|days left|status/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
