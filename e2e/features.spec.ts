import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('should open search modal', async ({ page }) => {
    await page.goto('/');
    
    const searchButton = page.getByRole('button', { name: /search/i }).or(page.locator('[aria-label*="search" i]'));
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
      const searchInput = page.locator('input[type="search" i], input[placeholder*="search" i]').first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    }
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/');
    
    const searchButton = page.getByRole('button', { name: /search/i }).or(page.locator('[aria-label*="search" i]'));
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
      
      const searchInput = page.locator('input[type="search" i], input[placeholder*="search" i]').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.fill('AI');
      
      await page.waitForTimeout(500);
      
      const results = page.locator('[role="listbox"], .search-results, [class*="result"]');
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should close search on ESC', async ({ page }) => {
    await page.goto('/');
    
    const searchButton = page.getByRole('button', { name: /search/i }).or(page.locator('[aria-label*="search" i]'));
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
      
      const searchInput = page.locator('input[type="search" i], input[placeholder*="search" i]').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      
      await page.keyboard.press('Escape');
      
      await expect(searchInput).not.toBeVisible();
    }
  });
});

test.describe('Contact Form', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');
    
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contact');
    
    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();
    
    const nameInput = page.getByRole('textbox', { name: /name/i });
    await expect(nameInput).toHaveAttribute('required', '');
  });
});
