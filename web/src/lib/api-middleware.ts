import { NextRequest, NextResponse } from "next/server"
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { auth } from "@/auth"
import { Permission, Role } from "@/lib/rbac"
import { getPermissionUtils } from "@/lib/auth-utils"

// Create API middleware tracer
const tracer = trace.getTracer('api-middleware', '1.0.0')

/**
 * Type for API route handlers
 */
export type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string | string[]> }
) => Promise<NextResponse>

/**
 * Middleware to protect API routes with authentication
 *
 * @param handler - The API route handler
 * @returns A new handler that checks authentication before executing the original handler
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    const span = tracer.startSpan('api-middleware-withAuth', {
      attributes: {
        'function.name': 'withAuth',
        'middleware.type': 'authentication',
        'request.method': req.method,
        'request.url': req.url
      }
    })

    try {
      const session = await auth()
      
      span.setAttributes({
        'user.authenticated': !!session?.user,
        'user.id': session?.user?.id || 'anonymous'
      })
      
      if (!session?.user) {
        span.setAttributes({
          'authorization.result': 'unauthorized',
          'response.status': 401,
          'function.result': 'unauthorized'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Authentication required' })
        
        return NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        )
      }
      
      span.setAttributes({
        'authorization.result': 'authorized',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return handler(req, context)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Auth middleware error'
      })
      span.setAttributes({
        'authorization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * Middleware to protect API routes with permission checks
 *
 * @param handler - The API route handler
 * @param permission - The permission required to access the route
 * @returns A new handler that checks permission before executing the original handler
 */
export function withPermission(handler: RouteHandler, permission: Permission): RouteHandler {
  return async (req, context) => {
    const span = tracer.startSpan('api-middleware-withPermission', {
      attributes: {
        'function.name': 'withPermission',
        'middleware.type': 'permission',
        'permission.required': permission,
        'request.method': req.method,
        'request.url': req.url
      }
    })

    try {
      const permissionUtils = await getPermissionUtils()
      
      span.setAttributes({
        'user.authenticated': !!permissionUtils.session?.user,
        'user.id': permissionUtils.session?.user?.id || 'anonymous'
      })
      
      if (!permissionUtils.session?.user) {
        span.setAttributes({
          'authorization.result': 'unauthorized',
          'response.status': 401,
          'function.result': 'unauthorized'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Authentication required' })
        
        return NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        )
      }
      
      const hasPermission = permissionUtils.can(permission)
      span.setAttributes({
        'permission.granted': hasPermission
      })
      
      if (!hasPermission) {
        span.setAttributes({
          'authorization.result': 'forbidden',
          'response.status': 403,
          'function.result': 'forbidden'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required permission' })
        
        return NextResponse.json(
          { error: `Forbidden: Missing required permission: ${permission}` },
          { status: 403 }
        )
      }
      
      span.setAttributes({
        'authorization.result': 'authorized',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return handler(req, context)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Permission middleware error'
      })
      span.setAttributes({
        'authorization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * Middleware to protect API routes with role checks
 *
 * @param handler - The API route handler
 * @param role - The role required to access the route
 * @returns A new handler that checks role before executing the original handler
 */
export function withRole(handler: RouteHandler, role: Role): RouteHandler {
  return async (req, context) => {
    const span = tracer.startSpan('api-middleware-withRole', {
      attributes: {
        'function.name': 'withRole',
        'middleware.type': 'role',
        'role.required': role,
        'request.method': req.method,
        'request.url': req.url
      }
    })

    try {
      const permissionUtils = await getPermissionUtils()
      
      span.setAttributes({
        'user.authenticated': !!permissionUtils.session?.user,
        'user.id': permissionUtils.session?.user?.id || 'anonymous'
      })
      
      if (!permissionUtils.session?.user) {
        span.setAttributes({
          'authorization.result': 'unauthorized',
          'response.status': 401,
          'function.result': 'unauthorized'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Authentication required' })
        
        return NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        )
      }
      
      const hasRole = permissionUtils.is(role)
      span.setAttributes({
        'role.granted': hasRole
      })
      
      if (!hasRole) {
        span.setAttributes({
          'authorization.result': 'forbidden',
          'response.status': 403,
          'function.result': 'forbidden'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required role' })
        
        return NextResponse.json(
          { error: `Forbidden: Missing required role: ${role}` },
          { status: 403 }
        )
      }
      
      span.setAttributes({
        'authorization.result': 'authorized',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return handler(req, context)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Role middleware error'
      })
      span.setAttributes({
        'authorization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * Middleware to protect API routes with multiple permission checks (any)
 *
 * @param handler - The API route handler
 * @param permissions - The permissions where any one is required to access the route
 * @returns A new handler that checks permissions before executing the original handler
 */
export function withAnyPermission(handler: RouteHandler, permissions: Permission[]): RouteHandler {
  return async (req, context) => {
    const span = tracer.startSpan('api-middleware-withAnyPermission', {
      attributes: {
        'function.name': 'withAnyPermission',
        'middleware.type': 'permission_any',
        'permissions.required': permissions.join(','),
        'permissions.count': permissions.length,
        'request.method': req.method,
        'request.url': req.url
      }
    })

    try {
      const permissionUtils = await getPermissionUtils()
      
      span.setAttributes({
        'user.authenticated': !!permissionUtils.session?.user,
        'user.id': permissionUtils.session?.user?.id || 'anonymous'
      })
      
      if (!permissionUtils.session?.user) {
        span.setAttributes({
          'authorization.result': 'unauthorized',
          'response.status': 401,
          'function.result': 'unauthorized'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Authentication required' })
        
        return NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        )
      }
      
      const hasAnyPermission = permissionUtils.canAny(permissions)
      const grantedPermissions = permissions.filter(p => permissionUtils.can(p))
      
      span.setAttributes({
        'permission.granted': hasAnyPermission,
        'permissions.granted': grantedPermissions.join(','),
        'permissions.granted.count': grantedPermissions.length
      })
      
      if (!hasAnyPermission) {
        span.setAttributes({
          'authorization.result': 'forbidden',
          'response.status': 403,
          'function.result': 'forbidden'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required permissions' })
        
        return NextResponse.json(
          { error: `Forbidden: Missing at least one of the required permissions: ${permissions.join(", ")}` },
          { status: 403 }
        )
      }
      
      span.setAttributes({
        'authorization.result': 'authorized',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return handler(req, context)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Any permission middleware error'
      })
      span.setAttributes({
        'authorization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * Middleware to protect API routes with multiple permission checks (all)
 *
 * @param handler - The API route handler
 * @param permissions - The permissions where all are required to access the route
 * @returns A new handler that checks permissions before executing the original handler
 */
export function withAllPermissions(handler: RouteHandler, permissions: Permission[]): RouteHandler {
  return async (req, context) => {
    const span = tracer.startSpan('api-middleware-withAllPermissions', {
      attributes: {
        'function.name': 'withAllPermissions',
        'middleware.type': 'permission_all',
        'permissions.required': permissions.join(','),
        'permissions.count': permissions.length,
        'request.method': req.method,
        'request.url': req.url
      }
    })

    try {
      const permissionUtils = await getPermissionUtils()
      
      span.setAttributes({
        'user.authenticated': !!permissionUtils.session?.user,
        'user.id': permissionUtils.session?.user?.id || 'anonymous'
      })
      
      if (!permissionUtils.session?.user) {
        span.setAttributes({
          'authorization.result': 'unauthorized',
          'response.status': 401,
          'function.result': 'unauthorized'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Authentication required' })
        
        return NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        )
      }
      
      const hasAllPermissions = permissionUtils.canAll(permissions)
      const grantedPermissions = permissions.filter(p => permissionUtils.can(p))
      const missingPermissions = permissions.filter(p => !permissionUtils.can(p))
      
      span.setAttributes({
        'permission.granted': hasAllPermissions,
        'permissions.granted': grantedPermissions.join(','),
        'permissions.granted.count': grantedPermissions.length,
        'permissions.missing': missingPermissions.join(','),
        'permissions.missing.count': missingPermissions.length
      })
      
      if (!hasAllPermissions) {
        span.setAttributes({
          'authorization.result': 'forbidden',
          'response.status': 403,
          'function.result': 'forbidden'
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required permissions' })
        
        return NextResponse.json(
          { error: `Forbidden: Missing one or more required permissions: ${permissions.join(", ")}` },
          { status: 403 }
        )
      }
      
      span.setAttributes({
        'authorization.result': 'authorized',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return handler(req, context)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'All permissions middleware error'
      })
      span.setAttributes({
        'authorization.result': 'error',
        'function.result': 'error'
      })
      throw error
    } finally {
      span.end()
    }
  }
}