/**
 * Password validation utility functions
 *
 * This module provides functions for validating password strength
 * and calculating a password strength score.
 */

import { trace, SpanStatusCode } from '@opentelemetry/api'

// Create password validation tracer
const tracer = trace.getTracer('password-validation', '1.0.0')

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
  const span = tracer.startSpan('password-meetsMinimumLength', {
    attributes: {
      'function.name': 'meetsMinimumLength',
      'password.length': password.length,
      'criteria.min_length': PASSWORD_CRITERIA.MIN_LENGTH
    }
  })

  try {
    const result = password.length >= PASSWORD_CRITERIA.MIN_LENGTH
    span.setAttributes({
      'validation.result': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if password contains at least one uppercase letter
 */
export function hasUppercase(password: string): boolean {
  const span = tracer.startSpan('password-hasUppercase', {
    attributes: {
      'function.name': 'hasUppercase',
      'password.length': password.length
    }
  })

  try {
    const result = /[A-Z]/.test(password)
    span.setAttributes({
      'validation.result': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if password contains at least one lowercase letter
 */
export function hasLowercase(password: string): boolean {
  const span = tracer.startSpan('password-hasLowercase', {
    attributes: {
      'function.name': 'hasLowercase',
      'password.length': password.length
    }
  })

  try {
    const result = /[a-z]/.test(password)
    span.setAttributes({
      'validation.result': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if password contains at least one number
 */
export function hasNumber(password: string): boolean {
  const span = tracer.startSpan('password-hasNumber', {
    attributes: {
      'function.name': 'hasNumber',
      'password.length': password.length
    }
  })

  try {
    const result = /[0-9]/.test(password)
    span.setAttributes({
      'validation.result': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if password contains at least one special character
 */
export function hasSpecialChar(password: string): boolean {
  const span = tracer.startSpan('password-hasSpecialChar', {
    attributes: {
      'function.name': 'hasSpecialChar',
      'password.length': password.length
    }
  })

  try {
    const result = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    span.setAttributes({
      'validation.result': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Get all validation results for a password
 */
export function getValidationResults(password: string): Record<string, boolean> {
  const span = tracer.startSpan('password-getValidationResults', {
    attributes: {
      'function.name': 'getValidationResults',
      'password.length': password.length
    }
  })

  try {
    const results = {
      meetsMinimumLength: meetsMinimumLength(password),
      hasUppercase: hasUppercase(password),
      hasLowercase: hasLowercase(password),
      hasNumber: hasNumber(password),
      hasSpecialChar: hasSpecialChar(password),
    }

    const passedCount = Object.values(results).filter(Boolean).length
    span.setAttributes({
      'validation.passed_count': passedCount,
      'validation.total_count': Object.keys(results).length,
      'validation.all_passed': passedCount === Object.keys(results).length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return results
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if password meets all required criteria
 */
export function meetsAllCriteria(password: string): boolean {
  const span = tracer.startSpan('password-meetsAllCriteria', {
    attributes: {
      'function.name': 'meetsAllCriteria',
      'password.length': password.length
    }
  })

  try {
    const results = getValidationResults(password)
    
    const meetsAll = (
      results.meetsMinimumLength &&
      (PASSWORD_CRITERIA.HAS_UPPERCASE ? results.hasUppercase : true) &&
      (PASSWORD_CRITERIA.HAS_LOWERCASE ? results.hasLowercase : true) &&
      (PASSWORD_CRITERIA.HAS_NUMBER ? results.hasNumber : true) &&
      (PASSWORD_CRITERIA.HAS_SPECIAL ? results.hasSpecialChar : true)
    )

    span.setAttributes({
      'validation.meets_all_criteria': meetsAll,
      'validation.length_ok': results.meetsMinimumLength,
      'validation.uppercase_ok': results.hasUppercase,
      'validation.lowercase_ok': results.hasLowercase,
      'validation.number_ok': results.hasNumber,
      'validation.special_ok': results.hasSpecialChar,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return meetsAll
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Calculate password strength score (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Medium, 3 = Strong, 4 = Very Strong
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const span = tracer.startSpan('password-calculatePasswordStrength', {
    attributes: {
      'function.name': 'calculatePasswordStrength',
      'password.length': password.length
    }
  })

  try {
    if (!password) {
      span.setAttributes({
        'password.strength': PasswordStrength.VERY_WEAK,
        'password.strength_label': 'VERY_WEAK',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return PasswordStrength.VERY_WEAK
    }
    
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
    const finalScore = Math.min(score, 4) as PasswordStrength
    const strengthLabels = ['VERY_WEAK', 'WEAK', 'MEDIUM', 'STRONG', 'VERY_STRONG']

    span.setAttributes({
      'password.strength': finalScore,
      'password.strength_label': strengthLabels[finalScore],
      'password.score_raw': score,
      'password.score_final': finalScore,
      'password.bonus_length_12': password.length >= 12,
      'password.bonus_length_16': password.length >= 16,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return finalScore
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Get password strength label based on score
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  const span = tracer.startSpan('password-getPasswordStrengthLabel', {
    attributes: {
      'function.name': 'getPasswordStrengthLabel',
      'password.strength': strength
    }
  })

  try {
    let label: string
    switch (strength) {
      case PasswordStrength.VERY_WEAK:
        label = "Very Weak"
        break
      case PasswordStrength.WEAK:
        label = "Weak"
        break
      case PasswordStrength.MEDIUM:
        label = "Medium"
        break
      case PasswordStrength.STRONG:
        label = "Strong"
        break
      case PasswordStrength.VERY_STRONG:
        label = "Very Strong"
        break
      default:
        label = "Unknown"
        break
    }

    span.setAttributes({
      'password.strength_label': label,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return label
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Get password strength color based on score
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  const span = tracer.startSpan('password-getPasswordStrengthColor', {
    attributes: {
      'function.name': 'getPasswordStrengthColor',
      'password.strength': strength
    }
  })

  try {
    let color: string
    switch (strength) {
      case PasswordStrength.VERY_WEAK:
        color = "red"
        break
      case PasswordStrength.WEAK:
        color = "orange"
        break
      case PasswordStrength.MEDIUM:
        color = "yellow"
        break
      case PasswordStrength.STRONG:
        color = "green"
        break
      case PasswordStrength.VERY_STRONG:
        color = "green"
        break
      default:
        color = "gray"
        break
    }

    span.setAttributes({
      'password.strength_color': color,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return color
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Get validation error message for password
 */
export function getPasswordValidationError(password: string): string | null {
  const span = tracer.startSpan('password-getPasswordValidationError', {
    attributes: {
      'function.name': 'getPasswordValidationError',
      'password.length': password.length
    }
  })

  try {
    if (!password) {
      const errorMessage = "Password is required"
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'required',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }
    
    const results = getValidationResults(password)
    
    if (!results.meetsMinimumLength) {
      const errorMessage = `Password must be at least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'min_length',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }
    
    if (PASSWORD_CRITERIA.HAS_UPPERCASE && !results.hasUppercase) {
      const errorMessage = "Password must contain at least one uppercase letter"
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'uppercase',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }
    
    if (PASSWORD_CRITERIA.HAS_LOWERCASE && !results.hasLowercase) {
      const errorMessage = "Password must contain at least one lowercase letter"
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'lowercase',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }
    
    if (PASSWORD_CRITERIA.HAS_NUMBER && !results.hasNumber) {
      const errorMessage = "Password must contain at least one number"
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'number',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }
    
    if (PASSWORD_CRITERIA.HAS_SPECIAL && !results.hasSpecialChar) {
      const errorMessage = "Password must contain at least one special character"
      span.setAttributes({
        'validation.error': errorMessage,
        'validation.error_type': 'special',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return errorMessage
    }

    span.setAttributes({
      'validation.error_type': 'none',
      'validation.passed': true,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return null
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}