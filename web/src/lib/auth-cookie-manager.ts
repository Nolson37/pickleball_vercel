/**
 * Authentication Cookie Management Utilities
 * Prevents stale cookie issues by providing clean cookie management
 */

import { trace, SpanStatusCode } from '@opentelemetry/api'

// Create auth cookie manager tracer
const tracer = trace.getTracer('auth-cookie-manager', '1.0.0')

export class AuthCookieManager {
  private static readonly NEXTAUTH_COOKIES = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    '__Secure-next-auth.callback-url'
  ]

  /**
   * Clear all NextAuth related cookies
   */
  static clearAllAuthCookies(): void {
    const span = tracer.startSpan('auth-cookie-clearAllAuthCookies', {
      attributes: {
        'function.name': 'clearAllAuthCookies',
        'environment.type': typeof document === 'undefined' ? 'server' : 'client',
        'cookies.target.count': this.NEXTAUTH_COOKIES.length
      }
    })

    try {
      if (typeof document === 'undefined') {
        span.setAttributes({
          'operation.result': 'skipped',
          'operation.reason': 'server_side',
          'function.result': 'success'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        return // Server-side safety
      }

      let clearedCount = 0
      const domains = ['/', 'localhost', typeof window !== 'undefined' ? window.location.hostname : '']

      this.NEXTAUTH_COOKIES.forEach(cookieName => {
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        
        // Clear for localhost (development)
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
        
        // Clear for current hostname
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`
        }
        clearedCount++
      })

      span.setAttributes({
        'cookies.cleared.count': clearedCount,
        'cookies.domains': domains.filter(Boolean).join(','),
        'operation.result': 'completed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })

      console.log('[AUTH] Cleared all authentication cookies')
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Failed to clear auth cookies'
      })
      span.setAttributes({
        'operation.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Clear all browser storage related to authentication
   */
  static clearAllAuthStorage(): void {
    const span = tracer.startSpan('auth-cookie-clearAllAuthStorage', {
      attributes: {
        'function.name': 'clearAllAuthStorage',
        'environment.type': typeof window === 'undefined' ? 'server' : 'client'
      }
    })

    try {
      if (typeof window === 'undefined') {
        span.setAttributes({
          'operation.result': 'skipped',
          'operation.reason': 'server_side',
          'function.result': 'success'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        return // Server-side safety
      }

      let localStorageCleared = 0
      let sessionStorageCleared = 0

      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('auth')) {
          localStorage.removeItem(key)
          localStorageCleared++
        }
      })

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('auth')) {
          sessionStorage.removeItem(key)
          sessionStorageCleared++
        }
      })

      span.setAttributes({
        'storage.localStorage.cleared': localStorageCleared,
        'storage.sessionStorage.cleared': sessionStorageCleared,
        'storage.total.cleared': localStorageCleared + sessionStorageCleared,
        'operation.result': 'completed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })

      console.log('[AUTH] Cleared all authentication storage')
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Failed to clear auth storage'
      })
      span.setAttributes({
        'operation.result': 'error',
        'function.result': 'error'
      })
      console.warn('[AUTH] Failed to clear storage:', error)
    } finally {
      span.end()
    }
  }

  /**
   * Perform complete authentication cleanup
   */
  static performCompleteCleanup(): void {
    const span = tracer.startSpan('auth-cookie-performCompleteCleanup', {
      attributes: {
        'function.name': 'performCompleteCleanup',
        'cleanup.type': 'complete',
        'environment.type': typeof window === 'undefined' ? 'server' : 'client'
      }
    })

    try {
      this.clearAllAuthCookies()
      this.clearAllAuthStorage()
      
      // Force reload to ensure clean state
      if (typeof window !== 'undefined') {
        span.setAttributes({
          'cleanup.reload_scheduled': true,
          'cleanup.reload_delay': 100
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }

      span.setAttributes({
        'operation.result': 'completed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Failed to perform complete cleanup'
      })
      span.setAttributes({
        'operation.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Check if there are potentially stale authentication cookies
   */
  static hasStaleAuthCookies(): boolean {
    const span = tracer.startSpan('auth-cookie-hasStaleAuthCookies', {
      attributes: {
        'function.name': 'hasStaleAuthCookies',
        'environment.type': typeof document === 'undefined' ? 'server' : 'client'
      }
    })

    try {
      if (typeof document === 'undefined') {
        span.setAttributes({
          'cookies.stale': false,
          'operation.result': 'skipped',
          'operation.reason': 'server_side',
          'function.result': 'success'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        return false
      }

      const cookies = document.cookie.split(';').map(c => c.trim())
      const authCookies = cookies.filter(cookie =>
        this.NEXTAUTH_COOKIES.some(authCookie =>
          cookie.startsWith(`${authCookie}=`)
        )
      )

      // If we have auth cookies but no valid session, they might be stale
      const hasStale = authCookies.length > 0

      span.setAttributes({
        'cookies.total': cookies.length,
        'cookies.auth.count': authCookies.length,
        'cookies.auth.names': authCookies.map(c => c.split('=')[0]).join(','),
        'cookies.stale': hasStale,
        'operation.result': 'completed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return hasStale
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Failed to check stale cookies'
      })
      span.setAttributes({
        'cookies.stale': false,
        'operation.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Initialize clean authentication state for new sessions
   */
  static initializeCleanState(): void {
    const span = tracer.startSpan('auth-cookie-initializeCleanState', {
      attributes: {
        'function.name': 'initializeCleanState',
        'initialization.type': 'clean_state'
      }
    })

    try {
      // Clear any existing auth state before starting new session
      this.clearAllAuthCookies()
      this.clearAllAuthStorage()
      
      span.setAttributes({
        'initialization.result': 'completed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      console.log('[AUTH] Initialized clean authentication state')
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Failed to initialize clean state'
      })
      span.setAttributes({
        'initialization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * React hook for authentication cleanup
 */
export function useAuthCleanup() {
  const span = tracer.startSpan('auth-cookie-useAuthCleanup', {
    attributes: {
      'function.name': 'useAuthCleanup',
      'hook.type': 'auth_cleanup'
    }
  })

  try {
    const result = {
      clearCookies: AuthCookieManager.clearAllAuthCookies,
      clearStorage: AuthCookieManager.clearAllAuthStorage,
      performCompleteCleanup: AuthCookieManager.performCompleteCleanup,
      hasStaleAuthCookies: AuthCookieManager.hasStaleAuthCookies,
      initializeCleanState: AuthCookieManager.initializeCleanState
    }

    span.setAttributes({
      'hook.methods.count': Object.keys(result).length,
      'hook.methods': Object.keys(result).join(','),
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Failed to create auth cleanup hook'
    })
    span.setAttributes({
      'function.result': 'error'
    })
    throw error
  } finally {
    span.end()
  }
}