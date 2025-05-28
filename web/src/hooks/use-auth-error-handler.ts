import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuthErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    // Listen for authentication errors
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent
      
      if (customEvent.detail?.error === 'CSRFError' || 
          customEvent.detail?.error === 'SessionRequired') {
        
        // Clear all NextAuth cookies
        const cookiesToClear = [
          'next-auth.session-token',
          'next-auth.csrf-token',
          'next-auth.callback-url',
          '__Secure-next-auth.session-token',
          '__Host-next-auth.csrf-token'
        ]
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
        })
        
        // Show user-friendly message
        console.warn('Authentication session expired. Clearing cookies and redirecting...')
        
        // Redirect to sign-in with a clean state
        router.push('/auth/signin?reason=session-expired')
      }
    }

    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [router])
}