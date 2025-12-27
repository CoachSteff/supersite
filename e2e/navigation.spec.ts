import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    
    const aboutLink = page.getByRole('link', { name: /about/i });
    await aboutLink.click();
    
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to blog', async ({ page }) => {
    await page.goto('/');
    
    const blogLink = page.getByRole('link', { name: /blog/i });
    await blogLink.click();
    
    await expect(page).toHaveURL(/\/blog/);
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/about');
    
    const homeLink = page.getByRole('link', { name: /home/i }).first();
    await homeLink.click();
    
    await expect(page).toHaveURL('/');
  });
});

test.describe('Blog', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('should navigate to blog post', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('article').first();
    const readMoreLink = firstPost.getByRole('link', { name: /read more/i });
    
    if (await readMoreLink.count() > 0) {
      await readMoreLink.click();
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });
});
