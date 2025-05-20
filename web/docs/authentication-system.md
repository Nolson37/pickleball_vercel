# Authentication System Documentation

This document provides an overview of the authentication system implementation for the Pickleball Platform multi-tenant SaaS application.

## Overview

The authentication system is built using Next.js, Auth.js (NextAuth), and Prisma with a PostgreSQL database. It provides secure user authentication with email verification, password reset functionality, and role-based access control (RBAC) for multi-tenant organizations.

## Key Components

### Authentication Provider

- **Auth.js (NextAuth)**: Provides the core authentication functionality with JWT strategy
- **Custom Callbacks**: Implemented to handle multi-tenant context and roles in tokens and sessions
- **Remember Me**: Option for extended session duration

### User Management

- **Registration**: Email-based registration with password strength requirements
- **Email Verification**: Required before login is allowed
- **Password Reset**: Secure password reset flow with email verification
- **Password Change**: Authenticated users can change their password

### Security Features

- **Password Validation**: Enforces strong password requirements
  - Minimum length (8 characters)
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- **Password Strength Indicator**: Visual feedback on password strength
- **CSRF Protection**: Protection against cross-site request forgery attacks
- **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies
- **Rate Limiting**: (Planned) Protection against brute force attacks

### Multi-Tenancy

- **Organization Context**: Users belong to organizations
- **Role-Based Access Control**: Permissions based on roles within organizations
- **Organization Settings**: Management of organization details and members

## Authentication Flow

1. **Registration**:
   - User submits registration form with email, password, and organization details
   - System validates input and password strength
   - System creates user, organization, and user-organization relationship
   - Verification email is sent to the user

2. **Email Verification**:
   - User clicks verification link in email
   - System verifies token and marks email as verified
   - User is redirected to login page

3. **Login**:
   - User submits login form with email and password
   - System validates credentials
   - System creates session with user and organization context
   - User is redirected to dashboard

4. **Password Reset**:
   - User requests password reset
   - System sends password reset email
   - User clicks reset link and sets new password
   - System updates password and redirects to login

## Role-Based Access Control (RBAC)

The RBAC system provides fine-grained control over user permissions based on their roles within an organization.

### Roles

- **Admin**: Full access to all features
- **Manager**: Access to most features except critical organization settings
- **Staff**: Limited access to operational features
- **Member**: Basic access to view content
- **Guest**: Minimal access to public content

### Permissions

Permissions are grouped by resource type:

- **Organization**: View, edit, delete, manage members, billing
- **User**: View, edit, delete
- **Facility**: View, create, edit, delete
- **Settings**: View, edit

### Implementation

- **Server-Side**: Middleware and utility functions for API routes and server components
- **Client-Side**: React hooks and components for conditional rendering based on permissions

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user and organization
- `GET /api/auth/verify`: Verify email address
- `POST /api/auth/signin`: Sign in user (handled by NextAuth)
- `GET /api/auth/signout`: Sign out user (handled by NextAuth)
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token
- `POST /api/auth/change-password`: Change password (authenticated)
- `GET /api/auth/csrf`: Generate CSRF token

## Client-Side Utilities

- `usePermissions`: Hook for checking user permissions and roles
- `PermissionGate`: Component for conditional rendering based on permissions
- `useCsrf`: Hook for managing CSRF tokens in forms

## Server-Side Utilities

- `getPermissionUtils`: Function for checking permissions in server components
- `withPermission`: Middleware for protecting API routes with permission checks
- `withRole`: Middleware for protecting API routes with role checks
- `withCsrfProtection`: Middleware for protecting API routes with CSRF validation

## Future Enhancements

- **Two-Factor Authentication**: Add 2FA support for enhanced security
- **Social Login**: Integration with social login providers
- **API Key Authentication**: For programmatic access to the API
- **Audit Logging**: Track authentication events and security-related actions
- **Session Management**: Allow users to view and manage active sessions
- **Enhanced Rate Limiting**: More sophisticated rate limiting based on IP and user context