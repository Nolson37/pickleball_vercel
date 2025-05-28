import { trace, SpanStatusCode } from '@opentelemetry/api'
import { auth } from "@/auth"
import { NextRequest } from 'next/server'

// Create middleware tracer
const tracer = trace.getTracer('middleware', '1.0.0')

/**
 * Enhanced middleware with OpenTelemetry tracing
 * This wraps the auth middleware with tracing capabilities
 */
const tracedMiddleware = auth((request: NextRequest) => {
  // Create a span for this middleware execution
  const span = tracer.startSpan('middleware-auth', {
    attributes: {
      'function.name': 'middleware',
      'request.method': request.method,
      'request.url': request.url,
      'request.pathname': request.nextUrl.pathname,
      'request.searchParams': request.nextUrl.searchParams.toString(),
      'middleware.type': 'authentication'
    }
  })

  try {
    // Extract path information
    const pathname = request.nextUrl.pathname
    const isDashboard = pathname.startsWith('/dashboard')
    const isAuth = pathname.startsWith('/auth')
    const isApi = pathname.startsWith('/api')
    const isStatic = pathname.includes('_next') || pathname === '/favicon.ico'

    span.setAttributes({
      'route.type': isDashboard ? 'dashboard' : isAuth ? 'auth' : isApi ? 'api' : isStatic ? 'static' : 'public',
      'route.protected': isDashboard,
      'route.excluded': isAuth || isApi || isStatic,
      'middleware.result': 'processed',
      'function.result': 'success'
    })

    // Log important routing decisions
    if (isDashboard) {
      span.addEvent('dashboard_route_accessed', {
        'route.path': pathname,
        'middleware.protection': 'auth_required'
      })
    } else if (isAuth) {
      span.addEvent('auth_route_accessed', {
        'route.path': pathname,
        'middleware.protection': 'public'
      })
    }

    span.setStatus({ code: SpanStatusCode.OK })

    // Return undefined to continue with default auth behavior
    return undefined
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Middleware error'
    })
    span.setAttributes({
      'middleware.result': 'error',
      'function.result': 'error'
    })
    
    // Re-throw the error to maintain original behavior
    throw error
  } finally {
    span.end()
  }
})

export { tracedMiddleware as middleware }

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Protect dashboard and other authenticated routes
    "/dashboard/:path*",
    // Exclude auth pages, API routes, and static assets
    "/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
}