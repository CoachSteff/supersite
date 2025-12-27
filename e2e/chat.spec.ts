import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  test('should display chat button', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await expect(chatButton.first()).toBeVisible();
  });

  test('should open chat window', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await chatButton.first().click();
    
    await expect(page.locator('textarea, input[type="text"]').filter({ hasText: /ask/i }).or(page.locator('[placeholder*="ask"]'))).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await chatButton.first().click();
    
    await expect(page.getByText(/hi/i).or(page.getByText(/help/i))).toBeVisible();
  });

  test('should close chat window', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await chatButton.first().click();
    
    const closeButton = page.getByRole('button', { name: /close|minimize/i });
    if (await closeButton.count() > 0) {
      await closeButton.click();
      
      const chatInput = page.locator('textarea, input[type="text"]').filter({ hasText: /ask/i }).or(page.locator('[placeholder*="ask"]'));
      await expect(chatInput).not.toBeVisible();
    }
  });
});
