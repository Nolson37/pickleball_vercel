/**
 * Password validation utility functions
 * 
 * This module provides functions for validating password strength
 * and calculating a password strength score.
 */

/**
 * Password strength criteria
 */
export const PASSWORD_CRITERIA = {
  MIN_LENGTH: 8,
  HAS_UPPERCASE: true,
  HAS_LOWERCASE: true,
  HAS_NUMBER: true,
  HAS_SPECIAL: true,
}

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4,
}

/**
 * Check if password meets minimum length requirement
 */
export function meetsMinimumLength(password: string): boolean {
  return password.length >= PASSWORD_CRITERIA.MIN_LENGTH
}

/**
 * Check if password contains at least one uppercase letter
 */
export function hasUppercase(password: string): boolean {
  return /[A-Z]/.test(password)
}

/**
 * Check if password contains at least one lowercase letter
 */
export function hasLowercase(password: string): boolean {
  return /[a-z]/.test(password)
}

/**
 * Check if password contains at least one number
 */
export function hasNumber(password: string): boolean {
  return /[0-9]/.test(password)
}

/**
 * Check if password contains at least one special character
 */
export function hasSpecialChar(password: string): boolean {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
}

/**
 * Get all validation results for a password
 */
export function getValidationResults(password: string): Record<string, boolean> {
  return {
    meetsMinimumLength: meetsMinimumLength(password),
    hasUppercase: hasUppercase(password),
    hasLowercase: hasLowercase(password),
    hasNumber: hasNumber(password),
    hasSpecialChar: hasSpecialChar(password),
  }
}

/**
 * Check if password meets all required criteria
 */
export function meetsAllCriteria(password: string): boolean {
  const results = getValidationResults(password)
  
  return (
    results.meetsMinimumLength &&
    (PASSWORD_CRITERIA.HAS_UPPERCASE ? results.hasUppercase : true) &&
    (PASSWORD_CRITERIA.HAS_LOWERCASE ? results.hasLowercase : true) &&
    (PASSWORD_CRITERIA.HAS_NUMBER ? results.hasNumber : true) &&
    (PASSWORD_CRITERIA.HAS_SPECIAL ? results.hasSpecialChar : true)
  )
}

/**
 * Calculate password strength score (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Medium, 3 = Strong, 4 = Very Strong
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return PasswordStrength.VERY_WEAK
  
  const results = getValidationResults(password)
  let score = 0
  
  // Add points for each criteria met
  if (results.meetsMinimumLength) score++
  if (results.hasUppercase) score++
  if (results.hasLowercase) score++
  if (results.hasNumber) score++
  if (results.hasSpecialChar) score++
  
  // Adjust score based on password length
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  
  // Cap score at 4 (Very Strong)
  return Math.min(score, 4) as PasswordStrength
}

/**
 * Get password strength label based on score
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return "Very Weak"
    case PasswordStrength.WEAK:
      return "Weak"
    case PasswordStrength.MEDIUM:
      return "Medium"
    case PasswordStrength.STRONG:
      return "Strong"
    case PasswordStrength.VERY_STRONG:
      return "Very Strong"
    default:
      return "Unknown"
  }
}

/**
 * Get password strength color based on score
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return "red"
    case PasswordStrength.WEAK:
      return "orange"
    case PasswordStrength.MEDIUM:
      return "yellow"
    case PasswordStrength.STRONG:
      return "green"
    case PasswordStrength.VERY_STRONG:
      return "green"
    default:
      return "gray"
  }
}

/**
 * Get validation error message for password
 */
export function getPasswordValidationError(password: string): string | null {
  if (!password) return "Password is required"
  
  const results = getValidationResults(password)
  
  if (!results.meetsMinimumLength) {
    return `Password must be at least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`
  }
  
  if (PASSWORD_CRITERIA.HAS_UPPERCASE && !results.hasUppercase) {
    return "Password must contain at least one uppercase letter"
  }
  
  if (PASSWORD_CRITERIA.HAS_LOWERCASE && !results.hasLowercase) {
    return "Password must contain at least one lowercase letter"
  }
  
  if (PASSWORD_CRITERIA.HAS_NUMBER && !results.hasNumber) {
    return "Password must contain at least one number"
  }
  
  if (PASSWORD_CRITERIA.HAS_SPECIAL && !results.hasSpecialChar) {
    return "Password must contain at least one special character"
  }
  
  return null
}