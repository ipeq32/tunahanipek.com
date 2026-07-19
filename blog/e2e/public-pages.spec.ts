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
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/en/about-me');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/en/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/en/terms');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('rss feed responds with valid xml', async ({ request }) => {
    const response = await request.get('/feed.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');
    expect(await response.text()).toContain('<rss');
  });

  test('health endpoint reports status and db', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('db');
  });
});
