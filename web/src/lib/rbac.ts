/**
 * Role-Based Access Control (RBAC) utility functions
 * 
 * This module provides utilities for managing and checking permissions
 * based on user roles within an organization context.
 */

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
  return userRoles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 * 
 * @param userRoles - Array of user roles
 * @param roles - Array of roles to check
 * @returns Boolean indicating if user has any of the roles
 */
export function hasAnyRole(userRoles: string[], roles: Role[]): boolean {
  return userRoles.some(role => roles.includes(role as Role));
}

/**
 * Check if a user has all of the specified roles
 * 
 * @param userRoles - Array of user roles
 * @param roles - Array of roles to check
 * @returns Boolean indicating if user has all of the roles
 */
export function hasAllRoles(userRoles: string[], roles: Role[]): boolean {
  return roles.every(role => userRoles.includes(role));
}

/**
 * Get all permissions for a set of roles
 * 
 * @param roles - Array of roles
 * @returns Array of permissions
 */
export function getPermissionsForRoles(roles: Role[]): Permission[] {
  const permissionSet = new Set<Permission>();
  
  roles.forEach(role => {
    if (role in ROLE_PERMISSIONS) {
      ROLE_PERMISSIONS[role].forEach(permission => {
        permissionSet.add(permission);
      });
    }
  });
  
  return Array.from(permissionSet);
}

/**
 * Check if a user has a specific permission based on their roles
 * 
 * @param userRoles - Array of user roles
 * @param permission - Permission to check
 * @returns Boolean indicating if user has the permission
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  // Convert string roles to Role type where possible
  const typedRoles = userRoles.filter(role => 
    Object.values(ROLES).includes(role as Role)
  ) as Role[];
  
  // Get all permissions for the user's roles
  const permissions = getPermissionsForRoles(typedRoles);
  
  // Check if the permission exists in the user's permissions
  return permissions.includes(permission);
}

/**
 * Check if a user has all of the specified permissions based on their roles
 * 
 * @param userRoles - Array of user roles
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has all of the permissions
 */
export function hasAllPermissions(userRoles: string[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRoles, permission));
}

/**
 * Check if a user has any of the specified permissions based on their roles
 * 
 * @param userRoles - Array of user roles
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(userRoles: string[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRoles, permission));
}