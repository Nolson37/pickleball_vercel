import { expect, test, describe, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator';

// Import the actual constants and enums
import {
  PasswordStrength,
  PASSWORD_CRITERIA
} from '@/lib/password-validation';

describe('PasswordStrengthIndicator', () => {
  beforeEach(() => {
    // Reset all spies
    jest.clearAllMocks();
  });

  test('renders with default state for empty password', () => {
    render(<PasswordStrengthIndicator password="" />);
    
    // Should show "Very Weak" initially
    expect(screen.getByText('Password Strength:')).toBeInTheDocument();
    expect(screen.getByText('Very Weak')).toBeInTheDocument();
    
    // Should show all criteria as not met
    expect(screen.getByText(`○ At least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`)).toBeInTheDocument();
    if (PASSWORD_CRITERIA.HAS_UPPERCASE) {
      expect(screen.getByText('○ At least one uppercase letter')).toBeInTheDocument();
    }
    if (PASSWORD_CRITERIA.HAS_LOWERCASE) {
      expect(screen.getByText('○ At least one lowercase letter')).toBeInTheDocument();
    }
    if (PASSWORD_CRITERIA.HAS_NUMBER) {
      expect(screen.getByText('○ At least one number')).toBeInTheDocument();
    }
    if (PASSWORD_CRITERIA.HAS_SPECIAL) {
      expect(screen.getByText('○ At least one special character')).toBeInTheDocument();
    }
  });

  test('updates strength indicator based on password', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="Password" />);
    
    // Check that the UI reflects the strong strength (3 criteria: length, uppercase, lowercase)
    expect(screen.getByText('Strong')).toBeInTheDocument();
    
    // Check that the criteria are correctly displayed
    expect(screen.getByText(`✓ At least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`)).toBeInTheDocument();
    expect(screen.getByText('✓ At least one uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('✓ At least one lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('○ At least one number')).toBeInTheDocument();
    expect(screen.getByText('○ At least one special character')).toBeInTheDocument();

    // Now test with a very strong password
    rerender(<PasswordStrengthIndicator password="Password123!" />);
    
    // Check that the UI reflects the very strong strength
    expect(screen.getByText('Very Strong')).toBeInTheDocument();
    
    // Check that all criteria are met
    expect(screen.getByText(`✓ At least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`)).toBeInTheDocument();
    expect(screen.getByText('✓ At least one uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('✓ At least one lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('✓ At least one number')).toBeInTheDocument();
    expect(screen.getByText('✓ At least one special character')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="Password" className="custom-class space-y-2" />
    );
    
    // Check that the custom class is applied to the root container
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('space-y-2');
    expect(rootElement).toHaveClass('custom-class');
  });
});