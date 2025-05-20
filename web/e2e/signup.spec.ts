import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should allow a user to sign up', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Pickleball Facility Owner Platform/);
    
    // Verify the registration form is visible
    const registrationForm = page.locator('form').filter({ hasText: 'Create your account' });
    await expect(registrationForm).toBeVisible();
    
    // Fill in the registration form
    const timestamp = Date.now();
    const email = `test-user-${timestamp}@example.com`;
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="organizationName"]', 'Test Organization');
    
    // Check the terms checkbox
    await page.check('input[name="acceptTerms"]');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the user is redirected to the verification page
    await expect(page).toHaveURL(/verification/);
    
    // Verify the verification message is displayed
    await expect(page.locator('text=Check your email')).toBeVisible();
  });
});

test.describe('Login Flow', () => {
  test('should allow a user to log in', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/signin');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Sign In/);
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the user is redirected to the dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify the dashboard is displayed
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('home page should be accessible', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check for accessibility issues
    const accessibilityViolations = await page.evaluate(() => {
      // This would normally use axe-core, but for simplicity we're just checking
      // a few basic things
      interface AccessibilityViolation {
        element: string;
        issue: string;
      }
      
      const violations: AccessibilityViolation[] = [];
      
      // Check for alt text on images
      document.querySelectorAll('img').forEach((img) => {
        if (!img.hasAttribute('alt')) {
          violations.push({
            element: img.outerHTML,
            issue: 'Image missing alt text',
          });
        }
      });
      
      // Check for form labels
      document.querySelectorAll('input').forEach((input) => {
        if (!input.hasAttribute('aria-label') && !document.querySelector(`label[for="${input.id}"]`)) {
          violations.push({
            element: input.outerHTML,
            issue: 'Input missing label',
          });
        }
      });
      
      return violations;
    });
    
    // Expect no accessibility violations
    expect(accessibilityViolations).toEqual([]);
  });
});