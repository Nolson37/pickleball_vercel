import { NextRequest, NextResponse } from 'next/server'
import { trace, SpanStatusCode } from '@opentelemetry/api'

// Create middleware tracer
const tracer = trace.getTracer('middleware', '1.0.0')

/**
 * Simple middleware with OpenTelemetry tracing
 * This middleware runs basic route protection without database dependencies
 */
export function middleware(request: NextRequest) {
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

    // For now, allow all requests to continue (auth will be handled per page)
    return NextResponse.next()
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
    
    // In case of error, allow request to continue
    return NextResponse.next()
  } finally {
    span.end()
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Run on all routes except static assets and API routes that don't need protection
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}