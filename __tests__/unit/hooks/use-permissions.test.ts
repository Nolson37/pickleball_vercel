import { expect, test, describe, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('returns correct permission checking functions when user has roles', () => {
    // Mock the useSession hook to return a user with roles
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Render the hook
    const { result } = renderHook(() => usePermissions());

    // Check that the hook returns the expected functions
    expect(result.current).toHaveProperty('can');
    expect(result.current).toHaveProperty('canAny');
    expect(result.current).toHaveProperty('canAll');
    expect(result.current).toHaveProperty('is');
    expect(result.current).toHaveProperty('isAny');
    expect(result.current).toHaveProperty('isAll');
    expect(result.current).toHaveProperty('roles');

    // Check that the roles array is correct
    expect(result.current.roles).toEqual(['admin']);

    // Check that the permission checking functions work correctly
    expect(result.current.can(PERMISSIONS.ORG_VIEW)).toBe(true);
    expect(result.current.can(PERMISSIONS.ORG_EDIT)).toBe(true);
    expect(result.current.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
    expect(result.current.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
    expect(result.current.is(ROLES.ADMIN)).toBe(true);
    expect(result.current.is(ROLES.MANAGER)).toBe(false);
    expect(result.current.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(true);
    expect(result.current.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
  });

  test('returns correct permission checking functions when user has no roles', () => {
    // Mock the useSession hook to return a user with no roles
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Render the hook
    const { result } = renderHook(() => usePermissions());

    // Check that the roles array is empty
    expect(result.current.roles).toEqual([]);

    // Check that the permission checking functions return false
    expect(result.current.can(PERMISSIONS.ORG_VIEW)).toBe(false);
    expect(result.current.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
    expect(result.current.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
    expect(result.current.is(ROLES.ADMIN)).toBe(false);
    expect(result.current.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
    expect(result.current.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
  });

  test('returns correct permission checking functions when session is null', () => {
    // Mock the useSession hook to return null
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    // Render the hook
    const { result } = renderHook(() => usePermissions());

    // Check that the roles array is empty
    expect(result.current.roles).toEqual([]);

    // Check that the permission checking functions return false
    expect(result.current.can(PERMISSIONS.ORG_VIEW)).toBe(false);
    expect(result.current.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
    expect(result.current.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
    expect(result.current.is(ROLES.ADMIN)).toBe(false);
    expect(result.current.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
    expect(result.current.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
  });

  test('returns correct permission checking functions for different roles', () => {
    // Test with manager role
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          roles: ['manager'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Render the hook
    const { result: managerResult } = renderHook(() => usePermissions());

    // Check manager permissions
    expect(managerResult.current.can(PERMISSIONS.ORG_VIEW)).toBe(true);
    expect(managerResult.current.can(PERMISSIONS.ORG_EDIT)).toBe(true);
    expect(managerResult.current.can(PERMISSIONS.ORG_DELETE)).toBe(false);
    expect(managerResult.current.is(ROLES.MANAGER)).toBe(true);

    // Test with staff role
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          roles: ['staff'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Render the hook
    const { result: staffResult } = renderHook(() => usePermissions());

    // Check staff permissions
    expect(staffResult.current.can(PERMISSIONS.ORG_VIEW)).toBe(true);
    expect(staffResult.current.can(PERMISSIONS.ORG_EDIT)).toBe(false);
    expect(staffResult.current.can(PERMISSIONS.FACILITY_VIEW)).toBe(true);
    expect(staffResult.current.is(ROLES.STAFF)).toBe(true);
  });

  test('handles multiple roles correctly', () => {
    // Mock the useSession hook to return a user with multiple roles
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          roles: ['manager', 'staff'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: 'authenticated',
    });

    // Render the hook
    const { result } = renderHook(() => usePermissions());

    // Check that the roles array is correct
    expect(result.current.roles).toEqual(['manager', 'staff']);

    // Check that the permission checking functions work correctly
    expect(result.current.is(ROLES.MANAGER)).toBe(true);
    expect(result.current.is(ROLES.STAFF)).toBe(true);
    expect(result.current.is(ROLES.ADMIN)).toBe(false);
    expect(result.current.isAny([ROLES.MANAGER, ROLES.ADMIN])).toBe(true);
    expect(result.current.isAll([ROLES.MANAGER, ROLES.STAFF])).toBe(true);
    expect(result.current.isAll([ROLES.MANAGER, ROLES.ADMIN])).toBe(false);
  });
});