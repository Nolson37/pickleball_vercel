import { auth } from "@/auth"
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

/**
 * Server-side utility for checking user permissions and roles
 * 
 * This utility provides functions to check if the current user has specific
 * permissions or roles based on their session data. It's designed for use
 * in server components and API routes.
 */
export async function getPermissionUtils() {
  const session = await auth()
  const userRoles = session?.user?.roles || []
  
  return {
    /**
     * Check if the user has a specific permission
     */
    can: (permission: Permission): boolean => {
      return hasPermission(userRoles, permission)
    },
    
    /**
     * Check if the user has any of the specified permissions
     */
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(userRoles, permissions)
    },
    
    /**
     * Check if the user has all of the specified permissions
     */
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(userRoles, permissions)
    },
    
    /**
     * Check if the user has a specific role
     */
    is: (role: Role): boolean => {
      return hasRole(userRoles, role)
    },
    
    /**
     * Check if the user has any of the specified roles
     */
    isAny: (roles: Role[]): boolean => {
      return hasAnyRole(userRoles, roles)
    },
    
    /**
     * Check if the user has all of the specified roles
     */
    isAll: (roles: Role[]): boolean => {
      return hasAllRoles(userRoles, roles)
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
}

/**
 * Check if the current user has a specific permission
 * Throws an error if the user doesn't have the permission
 * 
 * @param permission - Permission to check
 * @throws Error if user doesn't have the permission
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const { can, session } = await getPermissionUtils()
  
  if (!session?.user) {
    throw new Error("Unauthorized: User not authenticated")
  }
  
  if (!can(permission)) {
    throw new Error(`Forbidden: Missing required permission: ${permission}`)
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
  const { is, session } = await getPermissionUtils()
  
  if (!session?.user) {
    throw new Error("Unauthorized: User not authenticated")
  }
  
  if (!is(role)) {
    throw new Error(`Forbidden: Missing required role: ${role}`)
  }
}

/**
 * Middleware-style function to check permissions
 * 
 * @param handler - Request handler function
 * @param permission - Permission to check
 * @returns Handler function that checks permission before executing the original handler
 */
export function withPermission(handler: Function, permission: Permission) {
  return async (...args: any[]) => {
    await requirePermission(permission)
    return handler(...args)
  }
}

/**
 * Middleware-style function to check roles
 * 
 * @param handler - Request handler function
 * @param role - Role to check
 * @returns Handler function that checks role before executing the original handler
 */
export function withRole(handler: Function, role: Role) {
  return async (...args: any[]) => {
    await requireRole(role)
    return handler(...args)
  }
}