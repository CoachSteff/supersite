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
    
    const chatInput = page.locator('textarea[placeholder*="ask" i], input[placeholder*="ask" i]').first();
    await expect(chatInput).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await chatButton.first().click();
    
    const welcomeMessage = page.locator('.Chat_welcomeMessage__dCpjp, [class*="welcomeMessage"]').first();
    await expect(welcomeMessage).toBeVisible();
    await expect(welcomeMessage).toContainText(/hi|hello|welcome/i);
  });

  test('should close chat window', async ({ page }) => {
    await page.goto('/');
    
    const chatButton = page.locator('[aria-label*="chat"]').or(page.locator('button').filter({ hasText: /chat/i }));
    await chatButton.first().click();
    
    const closeButton = page.getByRole('button', { name: 'Close chat' });
    await closeButton.click();
    
    const chatInput = page.locator('textarea[placeholder*="ask" i], input[placeholder*="ask" i]').first();
    await expect(chatInput).not.toBeVisible();
  });
});
