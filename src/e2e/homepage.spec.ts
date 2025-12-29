import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Supersite/);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/');
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display page actions', async ({ page }) => {
    await page.goto('/');
    
    const copyButton = page.getByRole('button', { name: /copy as markdown/i });
    await expect(copyButton).toBeVisible();
    
    const starButton = page.getByRole('button', { name: /favorites/i });
    await expect(starButton).toBeVisible();
    
    const shareButton = page.getByRole('button', { name: /share page/i });
    await expect(shareButton).toBeVisible();
  });
});

test.describe('Page Actions', () => {
  test('should toggle favorite', async ({ page }) => {
    await page.goto('/');
    
    const starButton = page.getByRole('button', { name: /add to favorites/i });
    await starButton.click();
    
    await expect(page.getByRole('button', { name: /remove from favorites/i })).toBeVisible();
  });

  test('should open share popup', async ({ page }) => {
    await page.goto('/');
    
    const shareButton = page.getByRole('button', { name: /share page/i });
    await shareButton.click();
    
    await expect(page.getByText(/share this page/i)).toBeVisible();
    await expect(page.getByText(/copy link/i)).toBeVisible();
    await expect(page.getByText(/share on x/i)).toBeVisible();
  });

  test('should close share popup on ESC', async ({ page }) => {
    await page.goto('/');
    
    const shareButton = page.getByRole('button', { name: /share page/i });
    await shareButton.click();
    
    await expect(page.getByText(/share this page/i)).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByText(/share this page/i)).not.toBeVisible();
  });
});
