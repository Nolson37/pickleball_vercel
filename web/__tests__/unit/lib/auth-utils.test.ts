import { expect, test, describe, jest } from '@jest/globals';
import {
  getPermissionUtils,
  requirePermission,
  requireRole,
  withPermission,
  withRole
} from '@/lib/auth-utils';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// Mock the auth module
jest.mock('@/auth');

// Import the mocked auth module
import { auth } from '@/auth';

describe('auth-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPermissionUtils', () => {
    test('returns correct permission checking functions when user has roles', async () => {
      // Mock the auth function to return a user with roles
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function
      const permissionUtils = await getPermissionUtils();

      // Check that the function returns the expected properties
      expect(permissionUtils).toHaveProperty('can');
      expect(permissionUtils).toHaveProperty('canAny');
      expect(permissionUtils).toHaveProperty('canAll');
      expect(permissionUtils).toHaveProperty('is');
      expect(permissionUtils).toHaveProperty('isAny');
      expect(permissionUtils).toHaveProperty('isAll');
      expect(permissionUtils).toHaveProperty('roles');
      expect(permissionUtils).toHaveProperty('session');

      // Check that the roles array is correct
      expect(permissionUtils.roles).toEqual(['admin']);

      // Check that the permission checking functions work correctly
      expect(permissionUtils.can(PERMISSIONS.ORG_VIEW)).toBe(true);
      expect(permissionUtils.can(PERMISSIONS.ORG_EDIT)).toBe(true);
      expect(permissionUtils.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
      expect(permissionUtils.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(true);
      expect(permissionUtils.is(ROLES.ADMIN)).toBe(true);
      expect(permissionUtils.is(ROLES.MANAGER)).toBe(false);
      expect(permissionUtils.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(true);
      expect(permissionUtils.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
    });

    test('returns correct permission checking functions when user has no roles', async () => {
      // Mock the auth function to return a user with no roles
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function
      const permissionUtils = await getPermissionUtils();

      // Check that the roles array is empty
      expect(permissionUtils.roles).toEqual([]);

      // Check that the permission checking functions return false
      expect(permissionUtils.can(PERMISSIONS.ORG_VIEW)).toBe(false);
      expect(permissionUtils.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
      expect(permissionUtils.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
      expect(permissionUtils.is(ROLES.ADMIN)).toBe(false);
      expect(permissionUtils.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
      expect(permissionUtils.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
    });

    test('returns correct permission checking functions when session is null', async () => {
      // Mock the auth function to return null
      auth.mockResolvedValue(null);

      // Call the function
      const permissionUtils = await getPermissionUtils();

      // Check that the roles array is empty
      expect(permissionUtils.roles).toEqual([]);

      // Check that the permission checking functions return false
      expect(permissionUtils.can(PERMISSIONS.ORG_VIEW)).toBe(false);
      expect(permissionUtils.canAny([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
      expect(permissionUtils.canAll([PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT])).toBe(false);
      expect(permissionUtils.is(ROLES.ADMIN)).toBe(false);
      expect(permissionUtils.isAny([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
      expect(permissionUtils.isAll([ROLES.ADMIN, ROLES.MANAGER])).toBe(false);
    });
  });

  describe('requirePermission', () => {
    test('does not throw error when user has the required permission', async () => {
      // Mock the auth function to return a user with admin role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function and expect it not to throw
      await expect(requirePermission(PERMISSIONS.ORG_VIEW)).resolves.not.toThrow();
    });

    test('throws error when user does not have the required permission', async () => {
      // Mock the auth function to return a user with guest role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['guest'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function and expect it to throw
      await expect(requirePermission(PERMISSIONS.ORG_DELETE)).rejects.toThrow(
        `Forbidden: Missing required permission: ${PERMISSIONS.ORG_DELETE}`
      );
    });

    test('throws error when user is not authenticated', async () => {
      // Mock the auth function to return null
      auth.mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(requirePermission(PERMISSIONS.ORG_VIEW)).rejects.toThrow(
        'Unauthorized: User not authenticated'
      );
    });
  });

  describe('requireRole', () => {
    test('does not throw error when user has the required role', async () => {
      // Mock the auth function to return a user with admin role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function and expect it not to throw
      await expect(requireRole(ROLES.ADMIN)).resolves.not.toThrow();
    });

    test('throws error when user does not have the required role', async () => {
      // Mock the auth function to return a user with guest role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['guest'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Call the function and expect it to throw
      await expect(requireRole(ROLES.ADMIN)).rejects.toThrow(
        `Forbidden: Missing required role: ${ROLES.ADMIN}`
      );
    });

    test('throws error when user is not authenticated', async () => {
      // Mock the auth function to return null
      auth.mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(requireRole(ROLES.ADMIN)).rejects.toThrow(
        'Unauthorized: User not authenticated'
      );
    });
  });

  describe('withPermission', () => {
    test('calls handler when user has the required permission', async () => {
      // Mock the auth function to return a user with admin role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Create a mock handler
      const handler = jest.fn().mockReturnValue('result');

      // Create a wrapped handler
      const wrappedHandler = withPermission(handler, PERMISSIONS.ORG_VIEW);

      // Call the wrapped handler
      const result = await wrappedHandler('arg1', 'arg2');

      // Check that the handler was called with the correct arguments
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');

      // Check that the result is correct
      expect(result).toBe('result');
    });

    test('throws error when user does not have the required permission', async () => {
      // Mock the auth function to return a user with guest role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['guest'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Create a mock handler
      const handler = jest.fn().mockReturnValue('result');

      // Create a wrapped handler
      const wrappedHandler = withPermission(handler, PERMISSIONS.ORG_DELETE);

      // Call the wrapped handler and expect it to throw
      await expect(wrappedHandler('arg1', 'arg2')).rejects.toThrow(
        `Forbidden: Missing required permission: ${PERMISSIONS.ORG_DELETE}`
      );

      // Check that the handler was not called
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('withRole', () => {
    test('calls handler when user has the required role', async () => {
      // Mock the auth function to return a user with admin role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Create a mock handler
      const handler = jest.fn().mockReturnValue('result');

      // Create a wrapped handler
      const wrappedHandler = withRole(handler, ROLES.ADMIN);

      // Call the wrapped handler
      const result = await wrappedHandler('arg1', 'arg2');

      // Check that the handler was called with the correct arguments
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');

      // Check that the result is correct
      expect(result).toBe('result');
    });

    test('throws error when user does not have the required role', async () => {
      // Mock the auth function to return a user with guest role
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['guest'],
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      });

      // Create a mock handler
      const handler = jest.fn().mockReturnValue('result');

      // Create a wrapped handler
      const wrappedHandler = withRole(handler, ROLES.ADMIN);

      // Call the wrapped handler and expect it to throw
      await expect(wrappedHandler('arg1', 'arg2')).rejects.toThrow(
        `Forbidden: Missing required role: ${ROLES.ADMIN}`
      );

      // Check that the handler was not called
      expect(handler).not.toHaveBeenCalled();
    });
  });
});