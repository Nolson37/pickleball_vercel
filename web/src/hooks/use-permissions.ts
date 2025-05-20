import { useSession } from "next-auth/react"
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
 * Hook for checking user permissions and roles
 * 
 * This hook provides functions to check if the current user has specific
 * permissions or roles based on their session data.
 * 
 * @returns Object with permission and role checking functions
 */
export function usePermissions() {
  const { data: session } = useSession()
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
  }
}