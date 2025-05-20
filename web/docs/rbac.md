# Role-Based Access Control (RBAC) System

## Overview

The Pickleball Facility Owner Platform implements a comprehensive Role-Based Access Control (RBAC) system to manage permissions for different user roles. This document explains how the RBAC system works and how to use it in your code.

## Roles

The platform defines the following roles:

| Role | Description |
|------|-------------|
| `admin` | Full access to all features and functionality |
| `manager` | Access to manage facilities, staff, and members |
| `staff` | Access to view facilities and members |
| `member` | Access to view facilities |
| `guest` | Limited access to public information |

## Permissions

Permissions are granular capabilities that can be assigned to roles. The platform defines the following permission categories:

### Organization Permissions

| Permission | Description |
|------------|-------------|
| `org:view` | View organization details |
| `org:edit` | Edit organization details |
| `org:delete` | Delete the organization |
| `org:manage-members` | Manage organization members |
| `org:billing` | Access billing information |

### User Permissions

| Permission | Description |
|------------|-------------|
| `user:view` | View user details |
| `user:edit` | Edit user details |
| `user:delete` | Delete users |

### Facility Permissions

| Permission | Description |
|------------|-------------|
| `facility:view` | View facility details |
| `facility:create` | Create new facilities |
| `facility:edit` | Edit facility details |
| `facility:delete` | Delete facilities |

### Settings Permissions

| Permission | Description |
|------------|-------------|
| `settings:view` | View settings |
| `settings:edit` | Edit settings |

## Role-Permission Mappings

Each role is assigned a set of permissions:

### Admin

Admins have all permissions:
- All organization permissions
- All user permissions
- All facility permissions
- All settings permissions

### Manager

Managers have the following permissions:
- `org:view`, `org:edit`, `org:manage-members`
- `user:view`, `user:edit`
- `facility:view`, `facility:create`, `facility:edit`
- `settings:view`, `settings:edit`

### Staff

Staff have the following permissions:
- `org:view`
- `user:view`
- `facility:view`, `facility:edit`
- `settings:view`

### Member

Members have the following permissions:
- `org:view`
- `user:view`
- `facility:view`
- `settings:view`

### Guest

Guests have the following permissions:
- `org:view`
- `facility:view`

## Implementation

The RBAC system is implemented in the following files:

- `src/lib/rbac.ts`: Core RBAC functionality with role and permission definitions
- `src/hooks/use-permissions.ts`: Client-side hook for checking permissions
- `src/lib/auth-utils.ts`: Server-side utilities for checking permissions
- `src/components/auth/permission-gate.tsx`: UI component for conditional rendering based on permissions

### Client-Side Usage

#### Using the `usePermissions` Hook

```tsx
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/lib/rbac';

function MyComponent() {
  const { can, is } = usePermissions();
  
  // Check if the user has a specific permission
  const canEditOrg = can(PERMISSIONS.ORG_EDIT);
  
  // Check if the user has a specific role
  const isAdmin = is('admin');
  
  return (
    <div>
      {canEditOrg && (
        <button>Edit Organization</button>
      )}
      
      {isAdmin && (
        <button>Admin Action</button>
      )}
    </div>
  );
}
```

#### Using the `PermissionGate` Component

```tsx
import { PermissionGate } from '@/components/auth/permission-gate';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

function MyComponent() {
  return (
    <div>
      {/* Show content only if user has the ORG_EDIT permission */}
      <PermissionGate permission={PERMISSIONS.ORG_EDIT}>
        <button>Edit Organization</button>
      </PermissionGate>
      
      {/* Show content only if user has the ADMIN role */}
      <PermissionGate role={ROLES.ADMIN}>
        <button>Admin Action</button>
      </PermissionGate>
      
      {/* Show content only if user has any of the specified permissions */}
      <PermissionGate anyPermission={[PERMISSIONS.ORG_EDIT, PERMISSIONS.ORG_MANAGE_MEMBERS]}>
        <div>Organization Management</div>
      </PermissionGate>
      
      {/* Show content only if user has all of the specified permissions */}
      <PermissionGate allPermissions={[PERMISSIONS.ORG_VIEW, PERMISSIONS.USER_VIEW]}>
        <div>Organization and User Viewer</div>
      </PermissionGate>
      
      {/* Show alternative content if user doesn't have the required permission */}
      <PermissionGate 
        permission={PERMISSIONS.ORG_EDIT}
        fallback={<div>You don't have permission to edit the organization</div>}
      >
        <button>Edit Organization</button>
      </PermissionGate>
    </div>
  );
}
```

### Server-Side Usage

#### Using the `getPermissionUtils` Function

```ts
import { getPermissionUtils } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/rbac';

async function MyServerComponent() {
  const { can, is, session } = await getPermissionUtils();
  
  // Check if the user has a specific permission
  const canEditOrg = can(PERMISSIONS.ORG_EDIT);
  
  // Check if the user has a specific role
  const isAdmin = is('admin');
  
  return (
    <div>
      {canEditOrg && (
        <button>Edit Organization</button>
      )}
      
      {isAdmin && (
        <button>Admin Action</button>
      )}
      
      {session?.user?.name && (
        <div>Welcome, {session.user.name}</div>
      )}
    </div>
  );
}
```

#### Using the `requirePermission` and `requireRole` Functions

```ts
import { requirePermission, requireRole } from '@/lib/auth-utils';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// In an API route handler
export async function POST(request: Request) {
  try {
    // This will throw an error if the user doesn't have the required permission
    await requirePermission(PERMISSIONS.ORG_EDIT);
    
    // Process the request...
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 403 });
  }
}

// In another API route handler
export async function DELETE(request: Request) {
  try {
    // This will throw an error if the user doesn't have the required role
    await requireRole(ROLES.ADMIN);
    
    // Process the request...
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 403 });
  }
}
```

#### Using the `withPermission` and `withRole` Higher-Order Functions

```ts
import { withPermission, withRole } from '@/lib/auth-utils';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// Define a handler function
async function deleteOrganizationHandler(request: Request) {
  // Process the request...
  return Response.json({ success: true });
}

// Wrap the handler with permission check
export const DELETE = withPermission(deleteOrganizationHandler, PERMISSIONS.ORG_DELETE);

// In another file
async function adminActionHandler(request: Request) {
  // Process the request...
  return Response.json({ success: true });
}

// Wrap the handler with role check
export const POST = withRole(adminActionHandler, ROLES.ADMIN);
```

## Best Practices

1. **Use the PermissionGate component** for UI-level permission checks
2. **Use the usePermissions hook** for more complex client-side permission logic
3. **Use requirePermission and requireRole** for server-side permission checks in API routes
4. **Use withPermission and withRole** for wrapping API route handlers with permission checks
5. **Check permissions, not roles** when possible, as permissions are more granular and flexible
6. **Provide meaningful fallback content** when a user doesn't have the required permissions
7. **Keep permission checks as close to the UI as possible** to avoid unnecessary API calls
8. **Test permission checks** with different user roles to ensure they work as expected

## Testing

The RBAC system includes comprehensive tests:

- Unit tests for the core RBAC functionality
- Unit tests for the usePermissions hook
- Unit tests for the PermissionGate component
- Unit tests for the auth-utils functions
- Integration tests for API routes with permission checks
- End-to-end tests for permission-based UI rendering

To run the tests:

```bash
npm run test:unit
```

## Extending the RBAC System

To add new roles or permissions:

1. Update the `ROLES` and `PERMISSIONS` constants in `src/lib/rbac.ts`
2. Update the `ROLE_PERMISSIONS` mapping to assign permissions to roles
3. Update the TypeScript types for type safety
4. Add tests for the new roles and permissions