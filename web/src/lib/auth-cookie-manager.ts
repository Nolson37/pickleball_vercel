/**
 * Authentication Cookie Management Utilities
 * Prevents stale cookie issues by providing clean cookie management
 */

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
    if (typeof document === 'undefined') return // Server-side safety

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
    })

    console.log('[AUTH] Cleared all authentication cookies')
  }

  /**
   * Clear all browser storage related to authentication
   */
  static clearAllAuthStorage(): void {
    if (typeof window === 'undefined') return // Server-side safety

    try {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('auth')) {
          localStorage.removeItem(key)
        }
      })

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('next-auth') || key.includes('auth')) {
          sessionStorage.removeItem(key)
        }
      })

      console.log('[AUTH] Cleared all authentication storage')
    } catch (error) {
      console.warn('[AUTH] Failed to clear storage:', error)
    }
  }

  /**
   * Perform complete authentication cleanup
   */
  static performCompleteCleanup(): void {
    this.clearAllAuthCookies()
    this.clearAllAuthStorage()
    
    // Force reload to ensure clean state
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  /**
   * Check if there are potentially stale authentication cookies
   */
  static hasStaleAuthCookies(): boolean {
    if (typeof document === 'undefined') return false

    const cookies = document.cookie.split(';').map(c => c.trim())
    const authCookies = cookies.filter(cookie => 
      this.NEXTAUTH_COOKIES.some(authCookie => 
        cookie.startsWith(`${authCookie}=`)
      )
    )

    // If we have auth cookies but no valid session, they might be stale
    return authCookies.length > 0
  }

  /**
   * Initialize clean authentication state for new sessions
   */
  static initializeCleanState(): void {
    // Clear any existing auth state before starting new session
    this.clearAllAuthCookies()
    this.clearAllAuthStorage()
    
    console.log('[AUTH] Initialized clean authentication state')
  }
}

/**
 * React hook for authentication cleanup
 */
export function useAuthCleanup() {
  return {
    clearCookies: AuthCookieManager.clearAllAuthCookies,
    clearStorage: AuthCookieManager.clearAllAuthStorage,
    performCompleteCleanup: AuthCookieManager.performCompleteCleanup,
    hasStaleAuthCookies: AuthCookieManager.hasStaleAuthCookies,
    initializeCleanState: AuthCookieManager.initializeCleanState
  }
}