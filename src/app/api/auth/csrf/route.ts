import { NextResponse } from "next/server"
import { createCsrfTokenHandler } from "@/lib/csrf"

/**
 * API endpoint to generate a new CSRF token
 * 
 * This endpoint generates a new CSRF token, sets it in a cookie,
 * and returns it in the response body. Clients should call this
 * endpoint before submitting forms that require CSRF protection.
 * 
 * The token should be included in the 'x-csrf-token' header when
 * making POST, PUT, PATCH, or DELETE requests to protected endpoints.
 */
export const GET = createCsrfTokenHandler()