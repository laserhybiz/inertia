import test, { expect } from '@playwright/test'
import { consoleMessages } from './support'

const scenarios = ['pagesWithEagerLoading', 'pagesWithoutEagerLoading']

test.describe('createInertiaApp', () => {
  test.skip(process.env.PACKAGE === 'svelte', 'Skipping Svelte for now')

  for (const scenario of scenarios) {
    test(`createInertiaApp scenario: ${scenario}`, async ({ page }) => {
      await page.goto(`/?createInertiaApp=${scenario}`)

      await expect(page.locator('#app')).toContainText('This is the Test App Entrypoint page')
    })
  }

  test('createInertiaApp requires a pages or resolve option', async ({ page }) => {
    consoleMessages.listen(page)

    await page.goto('/?createInertiaApp=invalid')
    await page.waitForTimeout(100)

    await expect(consoleMessages.errors).toHaveLength(1)
    await expect(consoleMessages.errors[0]).toBe('You must provide either a `resolve` function or a `pages` object.')
  })
})
