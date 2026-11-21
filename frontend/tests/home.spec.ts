// E2E for the main flow: form on Home → POST /api/aggregate → Results / History.
// The regions API and /api/aggregate are mocked with page.route, so no Gemini call is made.
import { test, expect } from '@playwright/test'
import { Shared } from '@app/shared'
import { aggregateResult, mockApis } from './fixtures'

const submitButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: Shared.pages.home.buttonText })

/** Open a Headless UI Combobox by typing, then pick an option. */
async function pick(page: import('@playwright/test').Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label }).fill(option)
  await page.getByRole('option', { name: option }).click()
}

test.describe('Home form', () => {
  test('shows default values and can be submitted', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await expect(page.getByRole('combobox', { name: '狙う魚種' })).toHaveValue('ブリ')
    await expect(page.getByRole('combobox', { name: '都道府県' })).toHaveValue('静岡県')
    await expect(page.getByRole('combobox', { name: '市町村' })).toHaveValue('伊東市')
    await expect(page.getByRole('button', { name: /^3/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(submitButton(page)).toBeEnabled()
  })

  test('changing the prefecture resets the city', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await pick(page, '都道府県', '東京都')
    await expect(page.getByRole('combobox', { name: '市町村' })).toHaveValue('')
    await expect(submitButton(page)).toBeDisabled()

    await pick(page, '市町村', '八丈町')
    await expect(submitButton(page)).toBeEnabled()
  })
})

test.describe('Aggregation', () => {
  test('sends the form values and shows the result', async ({ page }) => {
    await mockApis(page, { status: 201, body: aggregateResult })
    await page.goto('/')

    await page.getByRole('button', { name: /^7/ }).click()
    const requestPromise = page.waitForRequest('**/api/aggregate')
    await submitButton(page).click()

    const request = await requestPromise
    expect(request.postDataJSON()).toEqual({
      targetFish: 'ブリ',
      prefecture: '静岡県',
      city: '伊東市',
      lookbackDays: 7,
    })

    await expect(page).toHaveURL(/\/results$/)
    await expect(page.getByText('ブリ・伊東市・過去3日').filter({ visible: true }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: '宇佐美港' })).toBeVisible()
    await expect(page.getByRole('button', { name: '伊東港の詳細を表示' })).toBeVisible()
    await expect(page.getByText('八幡野港')).toBeVisible()
    // 「結果」 appears in the nav once this session has aggregated
    await expect(page.getByRole('link', { name: '結果' })).toBeVisible()
  })

  test('selecting another spot shows its details', async ({ page }) => {
    await mockApis(page, { status: 201, body: aggregateResult })
    await page.goto('/')
    await submitButton(page).click()
    await expect(page).toHaveURL(/\/results$/)

    await page.getByRole('button', { name: '伊東港の詳細を表示' }).click()
    await expect(page.getByRole('heading', { name: '伊東港', level: 3 }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '宇佐美港の詳細を表示' })).toBeVisible()
  })

  test('shows an error toast and stays on Home when aggregation fails', async ({ page }) => {
    await mockApis(page, { status: 502, body: { errorMessage: Shared.messages.error.aggregationFailed } })
    await page.goto('/')
    await submitButton(page).click()

    await expect(page.getByText(Shared.messages.error.aggregationFailed)).toBeVisible()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('link', { name: '結果' })).toHaveCount(0)
  })
})

test.describe('Results and History', () => {
  test('show empty states before any aggregation', async ({ page }) => {
    await mockApis(page)

    await page.goto('/results')
    await expect(page.getByText('まだ集計結果がありません')).toBeVisible()

    await page.goto('/history')
    await expect(page.getByText('履歴はまだありません')).toBeVisible()
  })

  test('History lists a saved aggregation', async ({ page }) => {
    await mockApis(page, { status: 201, body: aggregateResult })
    await page.goto('/')
    await submitButton(page).click()
    await expect(page).toHaveURL(/\/results$/)

    await page.getByRole('link', { name: '履歴' }).click()
    await expect(page).toHaveURL(/\/history$/)
    await expect(page.getByText('ブリ・伊東市・過去3日').filter({ visible: true }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: '宇佐美港' })).toBeVisible()
  })
})
