import { test, expect } from '@playwright/test'

test.describe('Nearest Episode Feature', () => {
  test.describe('API Endpoint', () => {
    test('should return valid episode data from /api/nearest-episode', async ({
      request,
    }) => {
      const response = await request.get('/api/nearest-episode')

      expect(response.status()).toBe(200)

      const data = await response.json()

      // Validate response structure
      expect(data).toHaveProperty('episodeId')
      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('startTime')
      expect(data).toHaveProperty('description')

      // Validate data types
      expect(typeof data.episodeId).toBe('string')
      expect(typeof data.title).toBe('string')
      expect(typeof data.startTime).toBe('string')
      expect(typeof data.description).toBe('string')

      // Validate that startTime is a valid ISO string
      expect(() => new Date(data.startTime)).not.toThrow()
      expect(new Date(data.startTime).toISOString()).toBe(data.startTime)

      // Validate non-empty values
      expect(data.episodeId.length).toBeGreaterThan(0)
      expect(data.title.length).toBeGreaterThan(0)
      expect(data.description.length).toBeGreaterThan(0)
    })

    test('should handle CORS and content-type correctly', async ({
      request,
    }) => {
      const response = await request.get('/api/nearest-episode')

      expect(response.headers()['content-type']).toContain('application/json')
    })
  })

  test.describe('React Component', () => {
    test('should display the nearest episode card with proper content', async ({
      page,
    }) => {
      await page.goto('/')

      // Wait for the component to load
      await expect(page.locator('article')).toBeVisible()

      // Check that the main heading exists
      await expect(page.locator('h1')).toHaveText('Series Episode Viewer')
      await expect(page.locator('h1 + p')).toHaveText(
        'Discover the nearest episode from the latest series'
      )

      // Check that the episode card contains required elements
      const article = page.locator('article')
      await expect(article.locator('h3')).toBeVisible()
      await expect(article.locator('time')).toBeVisible()

      // Verify semantic HTML structure
      const episodeTitle = article.locator('h3')
      await expect(episodeTitle).toHaveText(/\S+/) // Non-empty text

      const timeElement = article.locator('time')
      await expect(timeElement).toBeVisible()
      await expect(timeElement).toHaveAttribute('datetime')

      // Check that description content is present
      const description = article.locator('div').last()
      await expect(description).toBeVisible()
    })

    test('should format the time correctly', async ({ page }) => {
      await page.goto('/')

      // Wait for the time element to be visible
      const timeElement = page.locator('time')
      await expect(timeElement).toBeVisible()

      // Get the datetime attribute and formatted text
      const datetimeAttr = await timeElement.getAttribute('datetime')
      const formattedText = await timeElement.textContent()

      expect(datetimeAttr).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/) // ISO format
      expect(formattedText).toMatch(/\w{3} \d{1,2}, \d{4}, \d{2}:\d{2}/) // "Jun 16, 2025, 01:00" format
    })

    test('should have accessible markup', async ({ page }) => {
      await page.goto('/')

      // Check for proper ARIA roles and semantic HTML
      const article = page.locator('article')
      await expect(article).toBeVisible()

      // Verify heading hierarchy
      await expect(page.locator('h1')).toBeVisible()
      await expect(article.locator('h3')).toBeVisible()

      // Check that time element has proper datetime attribute
      const timeElement = article.locator('time')
      await expect(timeElement).toHaveAttribute('datetime')
      await expect(timeElement).toHaveAttribute('title')
    })

    test('should handle loading state', async ({ page }) => {
      // Intercept the API call to simulate delay
      await page.route('/api/nearest-episode', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await route.continue()
      })

      await page.goto('/')

      // Should show loading state with spinner
      const loadingArticle = page
        .locator('article')
        .filter({ hasText: 'Loading episode information' })
      await expect(loadingArticle).toBeVisible({ timeout: 1000 })

      // Wait for actual content to load
      await expect(
        page
          .locator('article')
          .filter({ hasText: 'Loading episode information' })
      ).toBeHidden({
        timeout: 10000,
      })

      // Verify content has loaded
      await expect(page.locator('article h3')).toBeVisible({ timeout: 2000 })
    })

    test('should handle error state', async ({ page }) => {
      // Intercept the API call to simulate error
      await page.route('/api/nearest-episode', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      })

      await page.goto('/')

      // Should show error message with correct text from component
      await expect(
        page.locator('article').filter({ hasText: 'Error Loading Episode' })
      ).toBeVisible()
      await expect(
        page.locator('text=Server error occurred. Please try again later.')
      ).toBeVisible()
    })

    test('should handle no data state', async ({ page }) => {
      // Intercept the API call to simulate 404
      await page.route('/api/nearest-episode', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'No series with episodes found' }),
        })
      })

      await page.goto('/')

      // Should show no episode message
      await expect(
        page.locator('article').filter({ hasText: 'No Episode Found' })
      ).toBeVisible()
      await expect(
        page.locator('text=No upcoming episodes available at the moment.')
      ).toBeVisible()
    })
  })

  test.describe('Integration', () => {
    test('should have responsive design', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      const article = page.locator('article')
      await expect(article).toBeVisible()

      // Test desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 })
      await expect(article).toBeVisible()
    })

    test('should match visual snapshot', async ({ page }) => {
      await page.goto('/')

      // Wait for content to load
      await expect(page.locator('article h3')).toBeVisible()

      // Take screenshot of the episode card
      const article = page.locator('article')
      await expect(article).toHaveScreenshot('episode-card.png')
    })
  })
})
