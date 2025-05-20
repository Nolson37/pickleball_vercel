import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simplified middleware that doesn't use bcrypt
// It only checks for the presence of a session cookie and redirects accordingly
export function middleware(request: NextRequest) {
  // In development mode, bypass authentication
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  
  // Always allow access to authentication routes
  if (pathname.startsWith("/auth/")) return NextResponse.next()
  
  // Allow access to marketing pages
  if (pathname === "/" || pathname.startsWith("/marketing")) return NextResponse.next()
  
  // Check for session cookie
  const hasSession = request.cookies.has("next-auth.session-token") ||
                     request.cookies.has("__Secure-next-auth.session-token")
  
  // If no session and trying to access protected routes, redirect to login
  if (!hasSession) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public folder
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}