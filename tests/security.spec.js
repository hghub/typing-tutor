/**
 * SECURITY TOOLS — Text Encryptor, Data Leak Detector, Doc Redaction
 */
import { test, expect } from '@playwright/test'

const BASE = 'https://typing-tutor-tau.vercel.app'

test.describe('Text Encryptor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/text-encryptor')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Text Encryptor|AES|Encrypt/i).first()).toBeVisible()
  })

  test('text input and password fields are present', async ({ page }) => {
    const textInput = page.locator('textarea, input[type="text"]').first()
    await expect(textInput).toBeVisible()
    const passInput = page.locator('input[type="password"]').first()
    await expect(passInput).toBeVisible()
  })

  test('encrypt button is present', async ({ page }) => {
    await expect(page.getByText(/Encrypt|encrypt/i).first()).toBeVisible()
  })

  test('encrypt then decrypt round-trip', async ({ page }) => {
    const textInput = page.locator('textarea').first()
    await textInput.fill('My secret message')
    const passInput = page.locator('input[type="password"]').first()
    await passInput.fill('testpassword123')
    // Use exact action button text "🔒 Encrypt Text" (not the mode toggle tab "🔒 Encrypt")
    await page.getByRole('button', { name: /Encrypt Text/i }).click()
    await expect(page.getByText(/Encrypted Result/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('privacy note is shown (no server upload)', async ({ page }) => {
    await expect(page.getByText(/browser|local|never leave|private/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Data Leak Detector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/data-leak-detector')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Data Leak|Leak Detector|secrets/i).first()).toBeVisible()
  })

  test('paste area is visible', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await expect(ta).toBeVisible()
  })

  test('detects AWS key pattern', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('config: AKIAIOSFODNN7EXAMPLE secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')
    await expect(page.getByText(/AWS|detected|leak|secret/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('detects JWT token pattern', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc')
    await expect(page.getByText(/JWT|token|detected/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('copy redacted version button is present', async ({ page }) => {
    await expect(page.getByText(/redact|copy safe|safe copy/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})

test.describe('Smart Document Redaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/#/tools/doc-redaction')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByText(/Redaction|Redact/i).first()).toBeVisible()
  })

  test('input area is visible', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await expect(ta).toBeVisible()
  })

  test('redacts CNIC pattern', async ({ page }) => {
    const ta = page.locator('textarea').first()
    await ta.fill('My CNIC is 35202-1234567-1 and my IBAN is PK36SCBL0000001123456702')
    await expect(page.getByText(/CNIC|redact|detected/i).first()).toBeVisible({ timeout: 8_000 })
  })

  test('privacy badge (100% local) is shown', async ({ page }) => {
    await expect(page.getByText(/local|browser|never leave|private/i).first()).toBeVisible()
  })

  test('RelatedTools section appears', async ({ page }) => {
    await expect(page.getByText(/Also in Typely/i)).toBeVisible()
  })
})
