import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test('should allow a user to request a password reset', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/signin');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Sign In/);
    
    // Click on the "Forgot password?" link
    await page.click('text=Forgot password?');
    
    // Verify the user is redirected to the forgot password page
    await expect(page).toHaveURL(/auth\/forgot-password/);
    
    // Verify the forgot password form is visible
    const forgotPasswordForm = page.locator('form').filter({ hasText: 'Reset Password' });
    await expect(forgotPasswordForm).toBeVisible();
    
    // Fill in the forgot password form
    const email = 'test@example.com';
    await page.fill('input[name="email"]', email);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the success message is displayed
    await expect(page.locator('text=Check your email')).toBeVisible();
    await expect(page.locator(`text=We've sent a password reset link to ${email}`)).toBeVisible();
  });

  test('should validate email format on forgot password form', async ({ page }) => {
    // Navigate to the forgot password page
    await page.goto('/auth/forgot-password');
    
    // Try to submit the form with an empty email
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Email is required')).toBeVisible();
    
    // Fill in an invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should allow a user to reset their password with a valid token', async ({ page }) => {
    // Note: In a real test, you would need to generate a valid reset token
    // For this test, we'll simulate navigating to the reset password page with a token
    
    // Navigate to the reset password page with a mock token
    await page.goto('/auth/reset-password?token=mock-valid-token');
    
    // Verify the reset password form is visible
    const resetPasswordForm = page.locator('form').filter({ hasText: 'Set New Password' });
    await expect(resetPasswordForm).toBeVisible();
    
    // Fill in the new password
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the user is redirected to the login page
    await expect(page).toHaveURL(/auth\/signin/);
    
    // Verify the success message is displayed
    await expect(page.locator('text=Password reset successful')).toBeVisible();
  });

  test('should validate password strength on reset password form', async ({ page }) => {
    // Navigate to the reset password page with a mock token
    await page.goto('/auth/reset-password?token=mock-valid-token');
    
    // Try to submit the form with an empty password
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Password is required')).toBeVisible();
    
    // Fill in a weak password
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    
    // Fill in a password without uppercase
    await page.fill('input[name="password"]', 'password123!');
    await page.fill('input[name="confirmPassword"]', 'password123!');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Password must contain at least one uppercase letter')).toBeVisible();
    
    // Fill in a password without a number
    await page.fill('input[name="password"]', 'Password!');
    await page.fill('input[name="confirmPassword"]', 'Password!');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Password must contain at least one number')).toBeVisible();
    
    // Fill in a password without a special character
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Password123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Password must contain at least one special character')).toBeVisible();
  });

  test('should validate password confirmation on reset password form', async ({ page }) => {
    // Navigate to the reset password page with a mock token
    await page.goto('/auth/reset-password?token=mock-valid-token');
    
    // Fill in mismatched passwords
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify the validation error is displayed
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should handle invalid or expired tokens', async ({ page }) => {
    // Navigate to the reset password page with an invalid token
    await page.goto('/auth/reset-password?token=invalid-token');
    
    // Verify the error message is displayed
    await expect(page.locator('text=Invalid or expired token')).toBeVisible();
    
    // Verify there's a link to request a new reset link
    await expect(page.locator('text=Request a new reset link')).toBeVisible();
    
    // Click on the link to request a new reset link
    await page.click('text=Request a new reset link');
    
    // Verify the user is redirected to the forgot password page
    await expect(page).toHaveURL(/auth\/forgot-password/);
  });

  test('should show password strength indicator', async ({ page }) => {
    // Navigate to the reset password page with a mock token
    await page.goto('/auth/reset-password?token=mock-valid-token');
    
    // Check that the password strength indicator is initially visible
    await expect(page.locator('text=Password Strength:')).toBeVisible();
    await expect(page.locator('text=Very Weak')).toBeVisible();
    
    // Type a weak password
    await page.fill('input[name="password"]', 'password');
    
    // Check that the password strength indicator updates
    await expect(page.locator('text=Medium')).toBeVisible();
    
    // Type a stronger password
    await page.fill('input[name="password"]', 'Password1');
    
    // Check that the password strength indicator updates
    await expect(page.locator('text=Strong')).toBeVisible();
    
    // Type a very strong password
    await page.fill('input[name="password"]', 'Password123!');
    
    // Check that the password strength indicator updates
    await expect(page.locator('text=Very Strong')).toBeVisible();
  });
});