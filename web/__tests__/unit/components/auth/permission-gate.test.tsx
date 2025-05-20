import { expect, test, describe, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// Add type definition for the mocked usePermissions
jest.mock('@/hooks/use-permissions');
const mockedUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;


describe('PermissionGate', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the usePermissions mock to default values
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
      session: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user has the required permission', () => {
    // Mock the can function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(true),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate permission={PERMISSIONS.ORG_VIEW}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('renders fallback when user does not have the required permission', () => {
    // Mock the can function to return false
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate 
        permission={PERMISSIONS.ORG_EDIT}
        fallback={<div data-testid="fallback-content">Fallback Content</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  test('renders children when user has any of the required permissions', () => {
    // Mock the canAny function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(true),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate anyPermission={[PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT]}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('renders children when user has all of the required permissions', () => {
    // Mock the canAll function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(true),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate allPermissions={[PERMISSIONS.ORG_VIEW, PERMISSIONS.ORG_EDIT]}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('renders children when user has the required role', () => {
    // Mock the is function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(true),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate role={ROLES.ADMIN}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('renders children when user has any of the required roles', () => {
    // Mock the isAny function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(true),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    render(
      <PermissionGate anyRole={[ROLES.ADMIN, ROLES.MANAGER]}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('renders children when user has all of the required roles', () => {
    // Mock the isAll function to return true
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(true),
      roles: [],
    });

    render(
      <PermissionGate allRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('renders null fallback by default when permission check fails', () => {
    // All permission checks return false
    mockedUsePermissions.mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      canAny: jest.fn().mockReturnValue(false),
      canAll: jest.fn().mockReturnValue(false),
      is: jest.fn().mockReturnValue(false),
      isAny: jest.fn().mockReturnValue(false),
      isAll: jest.fn().mockReturnValue(false),
      roles: [],
    });

    const { container } = render(
      <PermissionGate permission={PERMISSIONS.ORG_EDIT}>
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // The container should be empty (null fallback)
    expect(container.firstChild).toBeNull();
  });
});