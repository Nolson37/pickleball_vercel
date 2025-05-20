import { expect, test, describe } from '@jest/globals';
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getPermissionsForRoles,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Role,
  type Permission
} from '@/lib/rbac';

describe('RBAC Constants', () => {
  test('ROLES should contain expected roles', () => {
    expect(ROLES).toEqual({
      ADMIN: 'admin',
      MANAGER: 'manager',
      STAFF: 'staff',
      MEMBER: 'member',
      GUEST: 'guest',
    });
  });

  test('PERMISSIONS should contain expected permissions', () => {
    expect(PERMISSIONS).toHaveProperty('ORG_VIEW');
    expect(PERMISSIONS).toHaveProperty('ORG_EDIT');
    expect(PERMISSIONS).toHaveProperty('FACILITY_VIEW');
    expect(PERMISSIONS).toHaveProperty('USER_EDIT');
    // We don't test all permissions to avoid brittle tests
  });

  test('ROLE_PERMISSIONS should map roles to permissions', () => {
    // Admin should have all permissions
    expect(ROLE_PERMISSIONS[ROLES.ADMIN].length).toBeGreaterThan(0);
    
    // Each role should have at least the view permission
    Object.values(ROLES).forEach(role => {
      expect(ROLE_PERMISSIONS[role as Role]).toContain(PERMISSIONS.ORG_VIEW);
    });
    
    // Admin should have more permissions than other roles
    const adminPermissionCount = ROLE_PERMISSIONS[ROLES.ADMIN].length;
    Object.values(ROLES).forEach(role => {
      if (role !== ROLES.ADMIN) {
        expect(ROLE_PERMISSIONS[role as Role].length).toBeLessThan(adminPermissionCount);
      }
    });
  });
});

describe('hasRole', () => {
  test('returns true when user has the role', () => {
    const userRoles = ['admin', 'manager'];
    expect(hasRole(userRoles, ROLES.ADMIN)).toBe(true);
    expect(hasRole(userRoles, ROLES.MANAGER)).toBe(true);
  });

  test('returns false when user does not have the role', () => {
    const userRoles = ['staff', 'member'];
    expect(hasRole(userRoles, ROLES.ADMIN)).toBe(false);
    expect(hasRole(userRoles, ROLES.MANAGER)).toBe(false);
  });

  test('handles empty user roles array', () => {
    const userRoles: string[] = [];
    expect(hasRole(userRoles, ROLES.ADMIN)).toBe(false);
  });
});

describe('hasAnyRole', () => {
  test('returns true when user has at least one of the roles', () => {
    const userRoles = ['staff', 'member'];
    expect(hasAnyRole(userRoles, [ROLES.STAFF, ROLES.ADMIN])).toBe(true);
    expect(hasAnyRole(userRoles, [ROLES.MEMBER, ROLES.MANAGER])).toBe(true);
  });

  test('returns false when user has none of the roles', () => {
    const userRoles = ['staff', 'member'];
    expect(hasAnyRole(userRoles, [ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
  });

  test('handles empty arrays', () => {
    const userRoles: string[] = [];
    expect(hasAnyRole(userRoles, [ROLES.ADMIN])).toBe(false);
    
    const userRolesWithValues = ['admin'];
    expect(hasAnyRole(userRolesWithValues, [])).toBe(false);
  });
});

describe('hasAllRoles', () => {
  test('returns true when user has all of the roles', () => {
    const userRoles = ['admin', 'manager', 'staff'];
    expect(hasAllRoles(userRoles, [ROLES.ADMIN, ROLES.MANAGER])).toBe(true);
  });

  test('returns false when user is missing any of the roles', () => {
    const userRoles = ['admin', 'staff'];
    expect(hasAllRoles(userRoles, [ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
  });

  test('handles empty arrays', () => {
    const userRoles: string[] = [];
    expect(hasAllRoles(userRoles, [ROLES.ADMIN])).toBe(false);
    
    const userRolesWithValues = ['admin'];
    expect(hasAllRoles(userRolesWithValues, [])).toBe(true); // Empty array of required roles means all are satisfied
  });
});

describe('getPermissionsForRoles', () => {
  test('returns combined permissions for multiple roles without duplicates', () => {
    const roles = [ROLES.ADMIN, ROLES.MANAGER];
    const permissions = getPermissionsForRoles(roles);
    
    // Should include all admin permissions
    ROLE_PERMISSIONS[ROLES.ADMIN].forEach(permission => {
      expect(permissions).toContain(permission);
    });
    
    // Should not have duplicates
    const uniquePermissions = new Set(permissions);
    expect(permissions.length).toBe(uniquePermissions.size);
  });

  test('returns empty array for empty roles array', () => {
    expect(getPermissionsForRoles([])).toEqual([]);
  });

  test('handles invalid roles gracefully', () => {
    const roles = ['invalid_role' as Role];
    expect(getPermissionsForRoles(roles)).toEqual([]);
  });
});

describe('hasPermission', () => {
  test('returns true when user has the permission through their role', () => {
    const userRoles = ['admin'];
    expect(hasPermission(userRoles, PERMISSIONS.ORG_EDIT)).toBe(true);
  });

  test('returns false when user does not have the permission', () => {
    const userRoles = ['guest'];
    expect(hasPermission(userRoles, PERMISSIONS.ORG_DELETE)).toBe(false);
  });

  test('handles empty user roles array', () => {
    const userRoles: string[] = [];
    expect(hasPermission(userRoles, PERMISSIONS.ORG_VIEW)).toBe(false);
  });

  test('filters out invalid roles', () => {
    const userRoles = ['invalid_role', 'admin'];
    expect(hasPermission(userRoles, PERMISSIONS.ORG_EDIT)).toBe(true);
    
    const onlyInvalidRoles = ['invalid_role1', 'invalid_role2'];
    expect(hasPermission(onlyInvalidRoles, PERMISSIONS.ORG_VIEW)).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  test('returns true when user has all of the permissions', () => {
    const userRoles = ['admin'];
    expect(hasAllPermissions(userRoles, [PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
  });

  test('returns false when user is missing any of the permissions', () => {
    const userRoles = ['guest'];
    expect(hasAllPermissions(userRoles, [PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
  });

  test('handles empty arrays', () => {
    const userRoles: string[] = [];
    expect(hasAllPermissions(userRoles, [PERMISSIONS.ORG_VIEW])).toBe(false);
    
    const userRolesWithValues = ['admin'];
    expect(hasAllPermissions(userRolesWithValues, [])).toBe(true); // Empty array of required permissions means all are satisfied
  });
});

describe('hasAnyPermission', () => {
  test('returns true when user has at least one of the permissions', () => {
    const userRoles = ['guest'];
    expect(hasAnyPermission(userRoles, [PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
  });

  test('returns false when user has none of the permissions', () => {
    const userRoles = ['guest'];
    expect(hasAnyPermission(userRoles, [PERMISSIONS.ORG_DELETE, PERMISSIONS.USER_DELETE])).toBe(false);
  });

  test('handles empty arrays', () => {
    const userRoles: string[] = [];
    expect(hasAnyPermission(userRoles, [PERMISSIONS.ORG_VIEW])).toBe(false);
    
    const userRolesWithValues = ['admin'];
    expect(hasAnyPermission(userRolesWithValues, [])).toBe(false); // Empty array of permissions means none to check
  });
});