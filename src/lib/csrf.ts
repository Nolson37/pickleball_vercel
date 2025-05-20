import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Constants
const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "x-csrf-token"
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Generate a secure random token for CSRF protection
 * 
 * @returns A random token string
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Get the CSRF token from the request cookies
 * 
 * @param request - The Next.js request object
 * @returns The CSRF token or null if not found
 */
export function getCsrfCookie(request: NextRequest): string | null {
  const token = request.cookies.get(CSRF_COOKIE_NAME)
  return token?.value || null
}

/**
 * Validate a CSRF token from a request against the token in the cookie
 * 
 * @param request - The Next.js request object
 * @returns Boolean indicating if the CSRF token is valid
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfCookie(request)
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch (error) {
    // If the buffers are different lengths, timingSafeEqual will throw an error
    return false
  }
}

/**
 * Middleware to protect routes with CSRF validation
 * 
 * @param handler - The route handler
 * @returns A new handler that validates CSRF tokens
 */
export function withCsrfProtection(handler: Function): Function {
  return async (req: NextRequest, ...args: any[]) => {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    const method = req.method.toUpperCase()
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      return handler(req, ...args)
    }
    
    // Validate CSRF token for other methods
    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      )
    }
    
    return handler(req, ...args)
  }
}

/**
 * Create an API route handler that generates and returns a new CSRF token
 * 
 * @returns A handler function for the CSRF token generation endpoint
 */
export function createCsrfTokenHandler() {
  return async function handler() {
    const token = generateToken()
    const response = NextResponse.json({ csrfToken: token })
    
    response.cookies.set({
      name: CSRF_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds for cookie
    })
    
    return response
  }
}