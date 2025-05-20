import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should be accessible', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should be accessible', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/signin');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('forgot password page should be accessible', async ({ page }) => {
    // Navigate to the forgot password page
    await page.goto('/auth/forgot-password');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('reset password page should be accessible', async ({ page }) => {
    // Navigate to the reset password page with a mock token
    await page.goto('/auth/reset-password?token=mock-token');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should be accessible', async ({ page }) => {
    // Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('facilities page should be accessible', async ({ page }) => {
    // Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to facilities page
    await page.click('text=Facilities');
    await expect(page).toHaveURL(/dashboard\/facilities/);
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('organization page should be accessible', async ({ page }) => {
    // Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to organization page
    await page.click('text=Organization');
    await expect(page).toHaveURL(/dashboard\/organization/);
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('users page should be accessible', async ({ page }) => {
    // Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to users page
    await page.click('text=Users');
    await expect(page).toHaveURL(/dashboard\/users/);
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('profile page should be accessible', async ({ page }) => {
    // Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to profile page
    await page.click('text=Profile');
    await expect(page).toHaveURL(/dashboard\/profile/);
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be navigable using keyboard only', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Tab to the first link (usually the logo or home link)
    await page.keyboard.press('Tab');
    
    // Check that something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY'); // If body is focused, nothing is actually focused
    
    // Tab to the login link
    let foundLoginLink = false;
    for (let i = 0; i < 10; i++) { // Try up to 10 tabs to find the login link
      await page.keyboard.press('Tab');
      const linkText = await page.evaluate(() => document.activeElement?.textContent);
      if (linkText?.includes('Sign In')) {
        foundLoginLink = true;
        break;
      }
    }
    expect(foundLoginLink).toBe(true);
    
    // Press Enter to navigate to the login page
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/auth\/signin/);
    
    // Tab to the email field
    await page.keyboard.press('Tab');
    const emailFieldFocused = await page.evaluate(() => 
      document.activeElement?.getAttribute('name') === 'email'
    );
    expect(emailFieldFocused).toBe(true);
    
    // Type an email
    await page.keyboard.type('test@example.com');
    
    // Tab to the password field
    await page.keyboard.press('Tab');
    const passwordFieldFocused = await page.evaluate(() => 
      document.activeElement?.getAttribute('name') === 'password'
    );
    expect(passwordFieldFocused).toBe(true);
    
    // Type a password
    await page.keyboard.type('password123');
    
    // Tab to the submit button
    await page.keyboard.press('Tab');
    const submitButtonFocused = await page.evaluate(() => 
      document.activeElement?.tagName === 'BUTTON' && 
      document.activeElement?.getAttribute('type') === 'submit'
    );
    expect(submitButtonFocused).toBe(true);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Run axe accessibility tests with a focus on color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    // Expect no color contrast violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Tab to focus on an element
    await page.keyboard.press('Tab');
    
    // Take a screenshot of the focused element
    const focusedElementScreenshot = await page.screenshot();
    
    // This is a visual test that would normally be compared to a baseline
    // For this test, we'll just verify that something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Check that the focused element has a visible focus indicator
    // This is a simplified check - in a real test, you would use visual comparison
    const hasFocusStyle = await page.evaluate(() => {
      const focusedEl = document.activeElement;
      if (!focusedEl) return false;
      
      const styles = window.getComputedStyle(focusedEl);
      return styles.outlineWidth !== '0px' || 
             styles.boxShadow !== 'none' ||
             styles.borderColor !== window.getComputedStyle(document.body).borderColor;
    });
    
    expect(hasFocusStyle).toBe(true);
  });
});