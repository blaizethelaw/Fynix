import { test, expect } from '@playwright/test'

test('home page shows tagline and byline', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'From ashes to assets' })).toBeVisible()
  await expect(page.getByText('Welcome to Fynix.')).toBeVisible()
})

test('navigates to dashboard when clicking Get Started', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Get Started' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
})
