/**
 * Role-Based Access Control (RBAC) utility functions
 *
 * This module provides utilities for managing and checking permissions
 * based on user roles within an organization context.
 */

import { trace, SpanStatusCode } from '@opentelemetry/api'

// Create RBAC tracer
const tracer = trace.getTracer('rbac', '1.0.0')

// Define available roles and their permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define available permissions
export const PERMISSIONS = {
  // Organization permissions
  ORG_VIEW: 'org:view',
  ORG_EDIT: 'org:edit',
  ORG_DELETE: 'org:delete',
  ORG_MANAGE_MEMBERS: 'org:manage-members',
  ORG_BILLING: 'org:billing',
  
  // User permissions
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // Facility permissions
  FACILITY_VIEW: 'facility:view',
  FACILITY_CREATE: 'facility:create',
  FACILITY_EDIT: 'facility:edit',
  FACILITY_DELETE: 'facility:delete',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role-permission mappings
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_EDIT,
    PERMISSIONS.ORG_DELETE,
    PERMISSIONS.ORG_MANAGE_MEMBERS,
    PERMISSIONS.ORG_BILLING,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.FACILITY_VIEW,
    PERMISSIONS.FACILITY_CREATE,
    PERMISSIONS.FACILITY_EDIT,
    PERMISSIONS.FACILITY_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_EDIT,
    PERMISSIONS.ORG_MANAGE_MEMBERS,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.FACILITY_VIEW,
    PERMISSIONS.FACILITY_CREATE,
    PERMISSIONS.FACILITY_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.FACILITY_VIEW,
    PERMISSIONS.FACILITY_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.FACILITY_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.FACILITY_VIEW,
  ],
};

/**
 * Check if a user has a specific role
 *
 * @param userRoles - Array of user roles
 * @param role - Role to check
 * @returns Boolean indicating if user has the role
 */
export function hasRole(userRoles: string[], role: Role): boolean {
  const span = tracer.startSpan('rbac-hasRole', {
    attributes: {
      'function.name': 'hasRole',
      'role.requested': role,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    const result = userRoles.includes(role)
    span.setAttributes({
      'role.granted': result,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if a user has any of the specified roles
 *
 * @param userRoles - Array of user roles
 * @param roles - Array of roles to check
 * @returns Boolean indicating if user has any of the roles
 */
export function hasAnyRole(userRoles: string[], roles: Role[]): boolean {
  const span = tracer.startSpan('rbac-hasAnyRole', {
    attributes: {
      'function.name': 'hasAnyRole',
      'roles.requested': roles.join(','),
      'roles.count': roles.length,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    const result = userRoles.some(role => roles.includes(role as Role))
    const matchingRoles = userRoles.filter(role => roles.includes(role as Role))
    
    span.setAttributes({
      'role.granted': result,
      'roles.matching': matchingRoles.join(','),
      'roles.matching.count': matchingRoles.length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if a user has all of the specified roles
 *
 * @param userRoles - Array of user roles
 * @param roles - Array of roles to check
 * @returns Boolean indicating if user has all of the roles
 */
export function hasAllRoles(userRoles: string[], roles: Role[]): boolean {
  const span = tracer.startSpan('rbac-hasAllRoles', {
    attributes: {
      'function.name': 'hasAllRoles',
      'roles.requested': roles.join(','),
      'roles.count': roles.length,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    const result = roles.every(role => userRoles.includes(role))
    const missingRoles = roles.filter(role => !userRoles.includes(role))
    
    span.setAttributes({
      'role.granted': result,
      'roles.missing': missingRoles.join(','),
      'roles.missing.count': missingRoles.length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Get all permissions for a set of roles
 *
 * @param roles - Array of roles
 * @returns Array of permissions
 */
export function getPermissionsForRoles(roles: Role[]): Permission[] {
  const span = tracer.startSpan('rbac-getPermissionsForRoles', {
    attributes: {
      'function.name': 'getPermissionsForRoles',
      'roles.input': roles.join(','),
      'roles.count': roles.length
    }
  })

  try {
    const permissionSet = new Set<Permission>()
    
    roles.forEach(role => {
      if (role in ROLE_PERMISSIONS) {
        ROLE_PERMISSIONS[role].forEach(permission => {
          permissionSet.add(permission)
        })
      }
    })
    
    const permissions = Array.from(permissionSet)
    span.setAttributes({
      'permissions.total': permissions.length,
      'permissions.list': permissions.join(','),
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return permissions
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if a user has a specific permission based on their roles
 *
 * @param userRoles - Array of user roles
 * @param permission - Permission to check
 * @returns Boolean indicating if user has the permission
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const span = tracer.startSpan('rbac-hasPermission', {
    attributes: {
      'function.name': 'hasPermission',
      'permission.requested': permission,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    // Convert string roles to Role type where possible
    const typedRoles = userRoles.filter(role =>
      Object.values(ROLES).includes(role as Role)
    ) as Role[]
    
    span.setAttributes({
      'roles.typed': typedRoles.join(','),
      'roles.typed.count': typedRoles.length
    })
    
    // Get all permissions for the user's roles
    const permissions = getPermissionsForRoles(typedRoles)
    
    // Check if the permission exists in the user's permissions
    const result = permissions.includes(permission)
    
    span.setAttributes({
      'permission.granted': result,
      'permissions.available': permissions.join(','),
      'permissions.available.count': permissions.length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if a user has all of the specified permissions based on their roles
 *
 * @param userRoles - Array of user roles
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has all of the permissions
 */
export function hasAllPermissions(userRoles: string[], permissions: Permission[]): boolean {
  const span = tracer.startSpan('rbac-hasAllPermissions', {
    attributes: {
      'function.name': 'hasAllPermissions',
      'permissions.requested': permissions.join(','),
      'permissions.count': permissions.length,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    const result = permissions.every(permission => hasPermission(userRoles, permission))
    const missingPermissions = permissions.filter(permission => !hasPermission(userRoles, permission))
    
    span.setAttributes({
      'permission.granted': result,
      'permissions.missing': missingPermissions.join(','),
      'permissions.missing.count': missingPermissions.length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}

/**
 * Check if a user has any of the specified permissions based on their roles
 *
 * @param userRoles - Array of user roles
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(userRoles: string[], permissions: Permission[]): boolean {
  const span = tracer.startSpan('rbac-hasAnyPermission', {
    attributes: {
      'function.name': 'hasAnyPermission',
      'permissions.requested': permissions.join(','),
      'permissions.count': permissions.length,
      'user.roles': userRoles.join(','),
      'user.roles.count': userRoles.length
    }
  })

  try {
    const result = permissions.some(permission => hasPermission(userRoles, permission))
    const matchingPermissions = permissions.filter(permission => hasPermission(userRoles, permission))
    
    span.setAttributes({
      'permission.granted': result,
      'permissions.matching': matchingPermissions.join(','),
      'permissions.matching.count': matchingPermissions.length,
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.setAttributes({ 'function.result': 'error' })
    throw error
  } finally {
    span.end()
  }
}