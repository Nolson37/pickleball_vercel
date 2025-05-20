import { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission, Role } from "@/lib/rbac"

interface PermissionProps {
  /**
   * The permission required to render the children
   */
  permission?: Permission
  
  /**
   * Multiple permissions where any one is required (OR logic)
   */
  anyPermission?: Permission[]
  
  /**
   * Multiple permissions where all are required (AND logic)
   */
  allPermissions?: Permission[]
  
  /**
   * The role required to render the children
   */
  role?: Role
  
  /**
   * Multiple roles where any one is required (OR logic)
   */
  anyRole?: Role[]
  
  /**
   * Multiple roles where all are required (AND logic)
   */
  allRoles?: Role[]
  
  /**
   * Content to render when the user has the required permission/role
   */
  children: ReactNode
  
  /**
   * Optional content to render when the user doesn't have the required permission/role
   */
  fallback?: ReactNode
}

/**
 * Component for conditionally rendering content based on user permissions or roles
 * 
 * This component allows you to easily restrict access to UI elements based on
 * the current user's permissions or roles.
 * 
 * @example
 * // Render content only if user has the 'org:edit' permission
 * <PermissionGate permission={PERMISSIONS.ORG_EDIT}>
 *   <EditButton />
 * </PermissionGate>
 * 
 * @example
 * // Render content if user has any of the specified permissions
 * <PermissionGate anyPermission={[PERMISSIONS.ORG_EDIT, PERMISSIONS.ORG_MANAGE_MEMBERS]}>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Render different content based on permissions
 * <PermissionGate 
 *   permission={PERMISSIONS.ORG_EDIT}
 *   fallback={<ReadOnlyView />}
 * >
 *   <EditableView />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  allRoles,
  children,
  fallback = null,
}: PermissionProps) {
  const { can, canAny, canAll, is, isAny, isAll } = usePermissions()
  
  // Check permissions
  if (permission && !can(permission)) {
    return <>{fallback}</>
  }
  
  if (anyPermission && !canAny(anyPermission)) {
    return <>{fallback}</>
  }
  
  if (allPermissions && !canAll(allPermissions)) {
    return <>{fallback}</>
  }
  
  // Check roles
  if (role && !is(role)) {
    return <>{fallback}</>
  }
  
  if (anyRole && !isAny(anyRole)) {
    return <>{fallback}</>
  }
  
  if (allRoles && !isAll(allRoles)) {
    return <>{fallback}</>
  }
  
  // If all checks pass, render the children
  return <>{children}</>
}