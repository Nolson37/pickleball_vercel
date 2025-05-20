import { useState, useEffect, useCallback } from "react"

/**
 * Hook for managing CSRF tokens in forms
 * 
 * This hook fetches a CSRF token from the server and provides
 * functions to include it in form submissions.
 * 
 * @returns Object with CSRF token and utility functions
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Fetch a new CSRF token from the server
  const fetchCsrfToken = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/csrf")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCsrfToken(data.csrfToken)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch CSRF token"))
      setLoading(false)
    }
  }, [])
  
  // Fetch the CSRF token on mount
  useEffect(() => {
    fetchCsrfToken()
  }, [fetchCsrfToken])
  
  // Add CSRF token to fetch options
  const withCsrf = useCallback(
    (options: RequestInit = {}): RequestInit => {
      if (!csrfToken) {
        console.warn("CSRF token not available")
        return options
      }
      
      const headers = new Headers(options.headers || {})
      headers.set("x-csrf-token", csrfToken)
      
      return {
        ...options,
        headers,
      }
    },
    [csrfToken]
  )
  
  // Create a fetch function that includes the CSRF token
  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!csrfToken) {
        await fetchCsrfToken()
      }
      
      return fetch(url, withCsrf(options))
    },
    [csrfToken, fetchCsrfToken, withCsrf]
  )
  
  return {
    csrfToken,
    loading,
    error,
    fetchCsrfToken,
    withCsrf,
    fetchWithCsrf,
  }
}