import { auth } from "@/auth"
import { trace, SpanStatusCode } from '@opentelemetry/api'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  type Permission,
  type Role
} from "@/lib/rbac"

// Create auth utilities tracer
const tracer = trace.getTracer('auth-utils', '1.0.0')

/**
 * Server-side utility for checking user permissions and roles
 *
 * This utility provides functions to check if the current user has specific
 * permissions or roles based on their session data. It's designed for use
 * in server components and API routes.
 */
export async function getPermissionUtils() {
  const span = tracer.startSpan('auth-getPermissionUtils', {
    attributes: {
      'function.name': 'getPermissionUtils'
    }
  })

  try {
    const session = await auth()
    const userRoles = session?.user?.roles || []
    
    // Add attributes for the session context
    span.setAttributes({
      'user.authenticated': !!session?.user,
      'user.id': session?.user?.id || 'anonymous',
      'user.roles.count': userRoles.length,
      'user.roles': userRoles.join(','),
      'function.result': 'success'
    })

    const result = {
      /**
       * Check if the user has a specific permission
       */
      can: (permission: Permission): boolean => {
        const permissionSpan = tracer.startSpan('auth-checkPermission', {
          attributes: {
            'function.name': 'can',
            'permission.requested': permission,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasPermissionResult = hasPermission(userRoles, permission)
          permissionSpan.setAttributes({
            'permission.granted': hasPermissionResult,
            'function.result': 'success'
          })
          permissionSpan.setStatus({ code: SpanStatusCode.OK })
          return hasPermissionResult
        } catch (error) {
          permissionSpan.recordException(error as Error)
          permissionSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          permissionSpan.end()
        }
      },
      
      /**
       * Check if the user has any of the specified permissions
       */
      canAny: (permissions: Permission[]): boolean => {
        const permissionSpan = tracer.startSpan('auth-checkAnyPermission', {
          attributes: {
            'function.name': 'canAny',
            'permissions.requested': permissions.join(','),
            'permissions.count': permissions.length,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasAnyPermissionResult = hasAnyPermission(userRoles, permissions)
          permissionSpan.setAttributes({
            'permission.granted': hasAnyPermissionResult,
            'function.result': 'success'
          })
          permissionSpan.setStatus({ code: SpanStatusCode.OK })
          return hasAnyPermissionResult
        } catch (error) {
          permissionSpan.recordException(error as Error)
          permissionSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          permissionSpan.end()
        }
      },
      
      /**
       * Check if the user has all of the specified permissions
       */
      canAll: (permissions: Permission[]): boolean => {
        const permissionSpan = tracer.startSpan('auth-checkAllPermissions', {
          attributes: {
            'function.name': 'canAll',
            'permissions.requested': permissions.join(','),
            'permissions.count': permissions.length,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasAllPermissionsResult = hasAllPermissions(userRoles, permissions)
          permissionSpan.setAttributes({
            'permission.granted': hasAllPermissionsResult,
            'function.result': 'success'
          })
          permissionSpan.setStatus({ code: SpanStatusCode.OK })
          return hasAllPermissionsResult
        } catch (error) {
          permissionSpan.recordException(error as Error)
          permissionSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          permissionSpan.end()
        }
      },
      
      /**
       * Check if the user has a specific role
       */
      is: (role: Role): boolean => {
        const roleSpan = tracer.startSpan('auth-checkRole', {
          attributes: {
            'function.name': 'is',
            'role.requested': role,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasRoleResult = hasRole(userRoles, role)
          roleSpan.setAttributes({
            'role.granted': hasRoleResult,
            'function.result': 'success'
          })
          roleSpan.setStatus({ code: SpanStatusCode.OK })
          return hasRoleResult
        } catch (error) {
          roleSpan.recordException(error as Error)
          roleSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          roleSpan.end()
        }
      },
      
      /**
       * Check if the user has any of the specified roles
       */
      isAny: (roles: Role[]): boolean => {
        const roleSpan = tracer.startSpan('auth-checkAnyRole', {
          attributes: {
            'function.name': 'isAny',
            'roles.requested': roles.join(','),
            'roles.count': roles.length,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasAnyRoleResult = hasAnyRole(userRoles, roles)
          roleSpan.setAttributes({
            'role.granted': hasAnyRoleResult,
            'function.result': 'success'
          })
          roleSpan.setStatus({ code: SpanStatusCode.OK })
          return hasAnyRoleResult
        } catch (error) {
          roleSpan.recordException(error as Error)
          roleSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          roleSpan.end()
        }
      },
      
      /**
       * Check if the user has all of the specified roles
       */
      isAll: (roles: Role[]): boolean => {
        const roleSpan = tracer.startSpan('auth-checkAllRoles', {
          attributes: {
            'function.name': 'isAll',
            'roles.requested': roles.join(','),
            'roles.count': roles.length,
            'user.id': session?.user?.id || 'anonymous'
          }
        })

        try {
          const hasAllRolesResult = hasAllRoles(userRoles, roles)
          roleSpan.setAttributes({
            'role.granted': hasAllRolesResult,
            'function.result': 'success'
          })
          roleSpan.setStatus({ code: SpanStatusCode.OK })
          return hasAllRolesResult
        } catch (error) {
          roleSpan.recordException(error as Error)
          roleSpan.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          roleSpan.end()
        }
      },
      
      /**
       * Get the user's roles
       */
      roles: userRoles,
      
      /**
       * Get the current session
       */
      session,
    }

    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Failed to get permission utils'
    })
    span.setAttributes({
      'function.result': 'error'
    })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if the current user has a specific permission
 * Throws an error if the user doesn't have the permission
 *
 * @param permission - Permission to check
 * @throws Error if user doesn't have the permission
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const span = tracer.startSpan('auth-requirePermission', {
    attributes: {
      'function.name': 'requirePermission',
      'permission.required': permission
    }
  })

  try {
    const { can, session } = await getPermissionUtils()
    
    span.setAttributes({
      'user.authenticated': !!session?.user,
      'user.id': session?.user?.id || 'anonymous'
    })
    
    if (!session?.user) {
      span.setAttributes({
        'authorization.result': 'unauthorized',
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'User not authenticated' })
      throw new Error("Unauthorized: User not authenticated")
    }
    
    if (!can(permission)) {
      span.setAttributes({
        'authorization.result': 'forbidden',
        'permission.granted': false,
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required permission' })
      throw new Error(`Forbidden: Missing required permission: ${permission}`)
    }

    span.setAttributes({
      'authorization.result': 'granted',
      'permission.granted': true,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
  } catch (error) {
    span.recordException(error as Error)
    span.setAttributes({
      'authorization.result': 'error',
      'function.result': 'error'
    })
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if the current user has a specific role
 * Throws an error if the user doesn't have the role
 *
 * @param role - Role to check
 * @throws Error if user doesn't have the role
 */
export async function requireRole(role: Role): Promise<void> {
  const span = tracer.startSpan('auth-requireRole', {
    attributes: {
      'function.name': 'requireRole',
      'role.required': role
    }
  })

  try {
    const { is, session } = await getPermissionUtils()
    
    span.setAttributes({
      'user.authenticated': !!session?.user,
      'user.id': session?.user?.id || 'anonymous'
    })
    
    if (!session?.user) {
      span.setAttributes({
        'authorization.result': 'unauthorized',
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'User not authenticated' })
      throw new Error("Unauthorized: User not authenticated")
    }
    
    if (!is(role)) {
      span.setAttributes({
        'authorization.result': 'forbidden',
        'role.granted': false,
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing required role' })
      throw new Error(`Forbidden: Missing required role: ${role}`)
    }

    span.setAttributes({
      'authorization.result': 'granted',
      'role.granted': true,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
  } catch (error) {
    span.recordException(error as Error)
    span.setAttributes({
      'authorization.result': 'error',
      'function.result': 'error'
    })
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw error
  } finally {
    span.end()
  }
}

// Type definitions for handler functions
type AsyncHandler<T extends unknown[], R> = (...args: T) => Promise<R>
type SyncHandler<T extends unknown[], R> = (...args: T) => R
type Handler<T extends unknown[], R> = AsyncHandler<T, R> | SyncHandler<T, R>

/**
 * Middleware-style function to check permissions
 *
 * @param handler - Request handler function
 * @param permission - Permission to check
 * @returns Handler function that checks permission before executing the original handler
 */
export function withPermission<T extends unknown[], R>(
  handler: Handler<T, R>,
  permission: Permission
): AsyncHandler<T, R> {
  return async (...args: T): Promise<R> => {
    const span = tracer.startSpan('auth-withPermission', {
      attributes: {
        'function.name': 'withPermission',
        'permission.required': permission,
        'middleware.type': 'permission'
      }
    })

    try {
      await requirePermission(permission)
      span.setAttributes({
        'middleware.result': 'passed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return handler(...args)
    } catch (error) {
      span.recordException(error as Error)
      span.setAttributes({
        'middleware.result': 'failed',
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  }
}

/**
 * Middleware-style function to check roles
 *
 * @param handler - Request handler function
 * @param role - Role to check
 * @returns Handler function that checks role before executing the original handler
 */
export function withRole<T extends unknown[], R>(
  handler: Handler<T, R>,
  role: Role
): AsyncHandler<T, R> {
  return async (...args: T): Promise<R> => {
    const span = tracer.startSpan('auth-withRole', {
      attributes: {
        'function.name': 'withRole',
        'role.required': role,
        'middleware.type': 'role'
      }
    })

    try {
      await requireRole(role)
      span.setAttributes({
        'middleware.result': 'passed',
        'function.result': 'success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      return handler(...args)
    } catch (error) {
      span.recordException(error as Error)
      span.setAttributes({
        'middleware.result': 'failed',
        'function.result': 'error'
      })
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  }
}