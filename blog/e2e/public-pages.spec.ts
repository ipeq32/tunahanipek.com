import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('blog list loads', async ({ page }) => {
    await page.goto('/en/blog');
    await expect(page.locator('body')).toContainText(/Blog/i);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByRole('button')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/en/about-me');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('rss feed responds with valid xml', async ({ request }) => {
    const response = await request.get('/feed.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');
    expect(await response.text()).toContain('<rss');
  });
});
