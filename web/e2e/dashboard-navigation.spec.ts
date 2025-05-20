import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  // Before each test, log in to the application
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/signin');
    
    // Fill in the login form with admin credentials
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the user is redirected to the dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify the dashboard is displayed
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should navigate to different dashboard sections', async ({ page }) => {
    // Test navigation to Facilities page
    await page.click('text=Facilities');
    await expect(page).toHaveURL(/dashboard\/facilities/);
    await expect(page.locator('h1')).toContainText('Facilities');
    
    // Test navigation to Organization page
    await page.click('text=Organization');
    await expect(page).toHaveURL(/dashboard\/organization/);
    await expect(page.locator('h1')).toContainText('Organization');
    
    // Test navigation to Users page
    await page.click('text=Users');
    await expect(page).toHaveURL(/dashboard\/users/);
    await expect(page.locator('h1')).toContainText('Users');
    
    // Test navigation to Profile page
    await page.click('text=Profile');
    await expect(page).toHaveURL(/dashboard\/profile/);
    await expect(page.locator('h1')).toContainText('Profile');
    
    // Test navigation back to Dashboard home
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/dashboard$/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display appropriate content on each dashboard page', async ({ page }) => {
    // Check Dashboard home content
    await expect(page.locator('text=Welcome to your dashboard')).toBeVisible();
    
    // Check Facilities page content
    await page.click('text=Facilities');
    await expect(page.locator('text=Manage your facilities')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Add Facility' })).toBeVisible();
    
    // Check Organization page content
    await page.click('text=Organization');
    await expect(page.locator('text=Organization Settings')).toBeVisible();
    await expect(page.locator('text=Organization Name')).toBeVisible();
    
    // Check Users page content
    await page.click('text=Users');
    await expect(page.locator('text=Manage Users')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Invite User' })).toBeVisible();
    
    // Check Profile page content
    await page.click('text=Profile');
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('text=Change Password')).toBeVisible();
  });

  test('should handle responsive layout on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the mobile menu button is visible
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
    
    // Open the mobile menu
    await page.click('button[aria-label="Toggle menu"]');
    
    // Check that the navigation links are visible in the mobile menu
    await expect(page.locator('text=Facilities')).toBeVisible();
    await expect(page.locator('text=Organization')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    
    // Navigate to Facilities page through the mobile menu
    await page.click('text=Facilities');
    await expect(page).toHaveURL(/dashboard\/facilities/);
    
    // Check that the mobile menu is closed after navigation
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
    await expect(page.locator('nav').locator('text=Facilities')).not.toBeVisible();
  });

  test('should enforce permissions for different sections', async ({ page }) => {
    // Note: This test assumes the admin user has access to all sections
    // In a real test, you would log in with different user roles and verify access
    
    // Check that admin can access all sections
    await page.click('text=Facilities');
    await expect(page).toHaveURL(/dashboard\/facilities/);
    
    await page.click('text=Organization');
    await expect(page).toHaveURL(/dashboard\/organization/);
    
    await page.click('text=Users');
    await expect(page).toHaveURL(/dashboard\/users/);
    
    await page.click('text=Profile');
    await expect(page).toHaveURL(/dashboard\/profile/);
    
    // For demonstration purposes, we'll check that certain admin-only actions are available
    await page.click('text=Users');
    await expect(page.locator('button', { hasText: 'Invite User' })).toBeVisible();
    
    await page.click('text=Organization');
    await expect(page.locator('button', { hasText: 'Edit Organization' })).toBeVisible();
  });
});