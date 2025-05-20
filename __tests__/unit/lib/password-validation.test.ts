import { expect, test, describe } from '@jest/globals';
import {
  meetsMinimumLength,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar,
  getValidationResults,
  meetsAllCriteria,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordValidationError,
  PasswordStrength,
  PASSWORD_CRITERIA
} from '@/lib/password-validation';

describe('Password Validation', () => {
  describe('meetsMinimumLength', () => {
    test('returns true for passwords meeting minimum length', () => {
      expect(meetsMinimumLength('password123')).toBe(true);
    });

    test('returns false for passwords not meeting minimum length', () => {
      expect(meetsMinimumLength('pass')).toBe(false);
    });

    test('returns true for passwords exactly at minimum length', () => {
      const minLength = PASSWORD_CRITERIA.MIN_LENGTH;
      const password = 'a'.repeat(minLength);
      expect(meetsMinimumLength(password)).toBe(true);
    });
  });

  describe('hasUppercase', () => {
    test('returns true for passwords with uppercase letters', () => {
      expect(hasUppercase('Password')).toBe(true);
    });

    test('returns false for passwords without uppercase letters', () => {
      expect(hasUppercase('password')).toBe(false);
    });
  });

  describe('hasLowercase', () => {
    test('returns true for passwords with lowercase letters', () => {
      expect(hasLowercase('Password')).toBe(true);
    });

    test('returns false for passwords without lowercase letters', () => {
      expect(hasLowercase('PASSWORD')).toBe(false);
    });
  });

  describe('hasNumber', () => {
    test('returns true for passwords with numbers', () => {
      expect(hasNumber('password123')).toBe(true);
    });

    test('returns false for passwords without numbers', () => {
      expect(hasNumber('password')).toBe(false);
    });
  });

  describe('hasSpecialChar', () => {
    test('returns true for passwords with special characters', () => {
      expect(hasSpecialChar('password!')).toBe(true);
      expect(hasSpecialChar('password@')).toBe(true);
      expect(hasSpecialChar('password#')).toBe(true);
      expect(hasSpecialChar('password$')).toBe(true);
    });

    test('returns false for passwords without special characters', () => {
      expect(hasSpecialChar('password123')).toBe(false);
    });
  });

  describe('getValidationResults', () => {
    test('returns correct validation results for a strong password', () => {
      const results = getValidationResults('Password123!');
      expect(results.meetsMinimumLength).toBe(true);
      expect(results.hasUppercase).toBe(true);
      expect(results.hasLowercase).toBe(true);
      expect(results.hasNumber).toBe(true);
      expect(results.hasSpecialChar).toBe(true);
    });

    test('returns correct validation results for a weak password', () => {
      const results = getValidationResults('password');
      expect(results.meetsMinimumLength).toBe(true);
      expect(results.hasUppercase).toBe(false);
      expect(results.hasLowercase).toBe(true);
      expect(results.hasNumber).toBe(false);
      expect(results.hasSpecialChar).toBe(false);
    });
  });

  describe('meetsAllCriteria', () => {
    test('returns true for passwords meeting all criteria', () => {
      expect(meetsAllCriteria('Password123!')).toBe(true);
    });

    test('returns false for passwords not meeting all criteria', () => {
      expect(meetsAllCriteria('password')).toBe(false);
      expect(meetsAllCriteria('PASSWORD123!')).toBe(false);
      expect(meetsAllCriteria('Password')).toBe(false);
      expect(meetsAllCriteria('Password!')).toBe(false);
      expect(meetsAllCriteria('password123!')).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    test('returns VERY_WEAK for empty passwords', () => {
      expect(calculatePasswordStrength('')).toBe(PasswordStrength.VERY_WEAK);
    });

    test('returns appropriate strength for various passwords', () => {
      // Medium password (meets 2 criteria - length and lowercase)
      expect(calculatePasswordStrength('password')).toBe(PasswordStrength.MEDIUM);
      
      // Strong password (meets 3 criteria - length, uppercase, and lowercase)
      expect(calculatePasswordStrength('Password')).toBe(PasswordStrength.STRONG);
      
      // Very strong password (meets 4 criteria)
      expect(calculatePasswordStrength('Password1')).toBe(PasswordStrength.VERY_STRONG);
      
      // Strong password (meets 4 criteria)
      expect(calculatePasswordStrength('Password1!')).toBe(PasswordStrength.VERY_STRONG);
      
      // Very strong password (meets all criteria and is longer)
      expect(calculatePasswordStrength('Password123!@#$')).toBe(PasswordStrength.VERY_STRONG);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    test('returns correct labels for each strength level', () => {
      expect(getPasswordStrengthLabel(PasswordStrength.VERY_WEAK)).toBe('Very Weak');
      expect(getPasswordStrengthLabel(PasswordStrength.WEAK)).toBe('Weak');
      expect(getPasswordStrengthLabel(PasswordStrength.MEDIUM)).toBe('Medium');
      expect(getPasswordStrengthLabel(PasswordStrength.STRONG)).toBe('Strong');
      expect(getPasswordStrengthLabel(PasswordStrength.VERY_STRONG)).toBe('Very Strong');
    });
  });

  describe('getPasswordStrengthColor', () => {
    test('returns correct colors for each strength level', () => {
      expect(getPasswordStrengthColor(PasswordStrength.VERY_WEAK)).toBe('red');
      expect(getPasswordStrengthColor(PasswordStrength.WEAK)).toBe('orange');
      expect(getPasswordStrengthColor(PasswordStrength.MEDIUM)).toBe('yellow');
      expect(getPasswordStrengthColor(PasswordStrength.STRONG)).toBe('green');
      expect(getPasswordStrengthColor(PasswordStrength.VERY_STRONG)).toBe('green');
    });
  });

  describe('getPasswordValidationError', () => {
    test('returns error for empty password', () => {
      expect(getPasswordValidationError('')).toBe('Password is required');
    });

    test('returns appropriate error messages for various password issues', () => {
      expect(getPasswordValidationError('pass')).toBe(`Password must be at least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`);
      expect(getPasswordValidationError('password')).toBe('Password must contain at least one uppercase letter');
      expect(getPasswordValidationError('PASSWORD')).toBe('Password must contain at least one lowercase letter');
      expect(getPasswordValidationError('Password')).toBe('Password must contain at least one number');
      expect(getPasswordValidationError('Password123')).toBe('Password must contain at least one special character');
    });

    test('returns null for valid passwords', () => {
      expect(getPasswordValidationError('Password123!')).toBeNull();
    });
  });
});