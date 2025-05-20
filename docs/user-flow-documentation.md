# User Flow Documentation

This document provides a detailed walkthrough of the key user flows in the Pickleball Facility Owner Platform, including registration, authentication, onboarding, and dashboard navigation.

## Table of Contents

1. [User Registration and Onboarding](#user-registration-and-onboarding)
   - [Organization Registration Flow](#organization-registration-flow)
   - [Email Verification Flow](#email-verification-flow)
   - [User Onboarding Flow](#user-onboarding-flow)
2. [Authentication Flows](#authentication-flows)
   - [Login Flow](#login-flow)
   - [Logout Flow](#logout-flow)
   - [Password Reset Flow](#password-reset-flow)
   - [Password Change Flow](#password-change-flow)
3. [Dashboard Navigation and Usage](#dashboard-navigation-and-usage)
   - [Dashboard Overview](#dashboard-overview)
   - [Organization Management](#organization-management)
   - [Facility Management](#facility-management)
   - [User Management](#user-management)
   - [Profile Management](#profile-management)

## User Registration and Onboarding

### Organization Registration Flow

The organization registration flow allows new users to create an account and register their pickleball organization on the platform.

#### Steps:

1. **Access Registration Form**:
   - User navigates to the homepage
   - User clicks on the "Get Started" or "Sign Up" button
   - The registration form is displayed

2. **Fill Registration Form**:
   - User enters their name
   - User enters their email address
   - User creates a password (with strength indicator feedback)
   - User enters their organization name
   - User accepts the terms and conditions
   - User clicks "Create Account" button

3. **Form Validation**:
   - System validates all fields:
     - Name is required
     - Email must be valid and not already registered
     - Password must meet strength requirements
     - Organization name is required
     - Terms must be accepted

4. **Account Creation**:
   - System creates a new user record
   - System creates a new organization record
   - System associates the user with the organization as an admin
   - System generates a verification token
   - System sends a verification email to the user

5. **Confirmation Screen**:
   - User is shown a confirmation screen
   - Message indicates that a verification email has been sent
   - Instructions are provided to check email and verify the account

#### Technical Implementation:

The registration flow is implemented using:
- Frontend: `RegistrationForm` component in `src/components/marketing/registration-form.tsx`
- Backend: API route handler in `src/app/api/auth/register/route.ts`
- Email verification: Handled by the email service configured in the environment variables

### Email Verification Flow

The email verification flow ensures that users have access to the email address they provided during registration.

#### Steps:

1. **Receive Verification Email**:
   - User receives an email with a verification link
   - Email contains a unique token embedded in the link

2. **Click Verification Link**:
   - User clicks on the verification link in the email
   - Link directs to the verification endpoint with the token

3. **Token Verification**:
   - System validates the token
   - System checks if the token is expired
   - System identifies the associated user account

4. **Account Verification**:
   - System marks the user's email as verified
   - System updates the user record

5. **Verification Success**:
   - User is redirected to the verification success page
   - Success message is displayed
   - Login button is provided to proceed to login

#### Technical Implementation:

The email verification flow is implemented using:
- Backend: API route handler in `src/app/api/auth/verify/route.ts`
- Frontend: Verification success page in `src/app/auth/verification-success/page.tsx`

### User Onboarding Flow

The user onboarding flow guides new users through setting up their account and organization after registration and verification.

#### Steps:

1. **First Login**:
   - User logs in after email verification
   - System detects that onboarding is not complete
   - User is directed to the onboarding flow

2. **Complete Profile**:
   - User is prompted to complete their profile
   - User enters additional information:
     - Job title
     - Phone number
     - Timezone
     - Notification preferences

3. **Organization Setup**:
   - User is prompted to provide additional organization details:
     - Organization logo (optional)
     - Address
     - Contact information
     - Website (optional)

4. **Facility Setup**:
   - User is prompted to set up their first facility:
     - Facility name
     - Address
     - Number of courts
     - Operating hours

5. **Onboarding Completion**:
   - System marks onboarding as complete
   - User is redirected to the dashboard
   - Welcome message is displayed with next steps

#### Technical Implementation:

The user onboarding flow is implemented using:
- Frontend: Onboarding components and forms
- Backend: API route handler in `src/app/api/user/onboarding/route.ts`
- State management: `useOnboarding` hook in `src/hooks/use-onboarding.ts`

## Authentication Flows

### Login Flow

The login flow allows registered users to authenticate and access the platform.

#### Steps:

1. **Access Login Form**:
   - User navigates to the login page
   - Login form is displayed with email and password fields

2. **Enter Credentials**:
   - User enters their email address
   - User enters their password
   - User can optionally select "Remember me"
   - User clicks "Sign In" button

3. **Credential Validation**:
   - System validates the credentials
   - System checks if the email is verified
   - System authenticates the user

4. **Session Creation**:
   - System creates a new session
   - System generates a JWT token with user and organization context
   - System sets the session cookie

5. **Redirect to Dashboard**:
   - User is redirected to the dashboard
   - If onboarding is not complete, user is directed to onboarding flow

#### Technical Implementation:

The login flow is implemented using:
- Frontend: Login page in `src/app/auth/signin/page.tsx`
- Backend: NextAuth.js configuration in `src/app/api/auth/[...nextauth]/route.ts`
- Authentication: Auth.js (NextAuth) with JWT strategy

### Logout Flow

The logout flow allows authenticated users to sign out and end their session.

#### Steps:

1. **Initiate Logout**:
   - User clicks on their profile menu
   - User selects "Sign Out" option

2. **Session Termination**:
   - System invalidates the current session
   - System clears the session cookie

3. **Redirect to Home**:
   - User is redirected to the home page
   - Success message confirms successful logout

#### Technical Implementation:

The logout flow is implemented using:
- Frontend: Logout button in the user menu
- Backend: NextAuth.js signOut functionality

### Password Reset Flow

The password reset flow allows users who have forgotten their password to create a new one.

#### Steps:

1. **Access Password Reset**:
   - User navigates to the login page
   - User clicks "Forgot password?" link
   - Password reset request form is displayed

2. **Request Password Reset**:
   - User enters their email address
   - User clicks "Send Reset Link" button

3. **Reset Token Generation**:
   - System validates the email exists
   - System generates a password reset token
   - System stores the token with an expiration time
   - System sends a password reset email

4. **Access Reset Form**:
   - User receives the password reset email
   - User clicks the reset link in the email
   - User is directed to the password reset form

5. **Set New Password**:
   - User enters a new password
   - Password strength is validated
   - User confirms the new password
   - User clicks "Reset Password" button

6. **Password Update**:
   - System validates the token
   - System updates the user's password
   - System invalidates the reset token

7. **Confirmation**:
   - Success message is displayed
   - User is provided a link to log in with the new password

#### Technical Implementation:

The password reset flow is implemented using:
- Frontend: 
  - Forgot password page in `src/app/auth/forgot-password/page.tsx`
  - Reset password page in `src/app/auth/reset-password/page.tsx`
- Backend: 
  - Forgot password API in `src/app/api/auth/forgot-password/route.ts`
  - Reset password API in `src/app/api/auth/reset-password/route.ts`

### Password Change Flow

The password change flow allows authenticated users to update their password.

#### Steps:

1. **Access Password Change**:
   - User navigates to their profile settings
   - User selects the "Security" or "Password" section

2. **Enter Passwords**:
   - User enters their current password
   - User enters a new password
   - Password strength is validated
   - User confirms the new password
   - User clicks "Change Password" button

3. **Validation**:
   - System verifies the current password
   - System validates the new password strength
   - System checks that new password is different from current

4. **Password Update**:
   - System updates the user's password
   - System logs the password change event

5. **Confirmation**:
   - Success message is displayed
   - User remains logged in with the updated credentials

#### Technical Implementation:

The password change flow is implemented using:
- Frontend: Password change form in profile settings
- Backend: Change password API in `src/app/api/auth/change-password/route.ts`

## Dashboard Navigation and Usage

### Dashboard Overview

The dashboard provides a central hub for users to manage their pickleball organization, facilities, and users.

#### Layout:

- **Sidebar Navigation**: Provides access to different sections
- **Header**: Shows user information and global actions
- **Main Content Area**: Displays the selected section's content
- **Quick Actions**: Provides shortcuts to common tasks

#### Key Metrics Displayed:

- Total number of facilities
- Total number of courts
- Recent activity
- Upcoming events or reservations

#### Technical Implementation:

The dashboard is implemented using:
- Layout: Dashboard layout in `src/app/dashboard/layout.tsx`
- Overview: Dashboard page in `src/app/dashboard/page.tsx`
- Components: Dashboard components in `src/components/dashboard/`

### Organization Management

The organization management section allows users to view and update their organization details.

#### Features:

- **Organization Profile**: View and edit organization details
  - Name
  - Logo
  - Contact information
  - Address
  - Website

- **Organization Settings**: Configure organization-wide settings
  - Branding
  - Default preferences
  - Notification settings

#### Access Control:

- Viewing organization details: Requires `org:view` permission
- Editing organization details: Requires `org:edit` permission
- Managing organization settings: Requires `org:edit` permission

#### Technical Implementation:

The organization management is implemented using:
- Frontend: Organization page in `src/app/dashboard/organization/page.tsx`
- Backend: Organization API endpoints

### Facility Management

The facility management section allows users to create, view, edit, and delete facilities.

#### Features:

- **Facility List**: View all facilities with key information
  - Name
  - Address
  - Number of courts
  - Status

- **Facility Details**: View and edit detailed facility information
  - Name
  - Address
  - Contact information
  - Operating hours
  - Court information
  - Amenities

- **Add New Facility**: Create a new facility with required information

#### Access Control:

- Viewing facilities: Requires `facility:view` permission
- Creating facilities: Requires `facility:create` permission
- Editing facilities: Requires `facility:edit` permission
- Deleting facilities: Requires `facility:delete` permission

#### Technical Implementation:

The facility management is implemented using:
- Frontend: 
  - Facilities list page in `src/app/dashboard/facilities/page.tsx`
  - New facility page in `src/app/dashboard/facilities/new/page.tsx`
- Backend: Facility API endpoints

### User Management

The user management section allows administrators to manage users within their organization.

#### Features:

- **User List**: View all users with key information
  - Name
  - Email
  - Role
  - Status

- **User Details**: View and edit user information
  - Name
  - Email
  - Role assignments
  - Status

- **Invite User**: Send invitations to new users
  - Email
  - Initial role assignment
  - Custom message

#### Access Control:

- Viewing users: Requires `user:view` permission
- Editing users: Requires `user:edit` permission
- Deleting users: Requires `user:delete` permission
- Managing roles: Requires `org:manage-members` permission

#### Technical Implementation:

The user management is implemented using:
- Frontend: 
  - Users list page in `src/app/dashboard/users/page.tsx`
  - Invite user page in `src/app/dashboard/users/invite/page.tsx`
- Backend: User management API endpoints

### Profile Management

The profile management section allows users to view and update their own profile information.

#### Features:

- **Profile Information**: View and edit personal details
  - Name
  - Email
  - Profile picture
  - Job title
  - Contact information

- **Security Settings**: Manage security-related settings
  - Change password
  - Two-factor authentication (planned)
  - Session management (planned)

- **Notification Preferences**: Configure notification settings
  - Email notifications
  - In-app notifications
  - SMS notifications (planned)

#### Technical Implementation:

The profile management is implemented using:
- Frontend: Profile page in `src/app/dashboard/profile/page.tsx`
- Backend: Profile API endpoints

## User Flow Diagrams

### Registration and Onboarding Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Homepage   │────▶│ Registration│────▶│  Verify     │────▶│  Onboarding │
│             │     │    Form     │     │   Email     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │             │
                                                            │  Dashboard  │
                                                            │             │
                                                            └─────────────┘
```

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Login Page │────▶│ Credentials │────▶│  Dashboard  │
│             │     │ Validation  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│   Forgot    │────▶│ Reset Email │────▶│ Reset Form  │────▶│  Login Page │
│  Password   │     │    Sent     │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Dashboard Navigation Flow

```
                           ┌─────────────┐
                           │             │
                           │  Dashboard  │
                           │   Overview  │
                           │             │
                           └─────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
        │             │   │             │   │             │
        │ Organization│   │  Facility   │   │    User     │
        │ Management  │   │ Management  │   │ Management  │
        │             │   │             │   │             │
        └─────────────┘   └─────────────┘   └─────────────┘
                 │                │                │
                 │                │                │
                 ▼                ▼                ▼
        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
        │             │   │             │   │             │
        │    Edit     │   │    Edit     │   │    Edit     │
        │ Organization│   │   Facility  │   │    User     │
        │             │   │             │   │             │
        └─────────────┘   └─────────────┘   └─────────────┘
```

## Best Practices for User Flow Design

When designing and implementing user flows in the Pickleball Facility Owner Platform, follow these best practices:

1. **Minimize Steps**: Keep the number of steps in each flow to a minimum.
2. **Clear Guidance**: Provide clear instructions and feedback at each step.
3. **Consistent Navigation**: Maintain consistent navigation patterns throughout the platform.
4. **Error Handling**: Provide helpful error messages and recovery paths.
5. **Progress Indication**: Show users where they are in multi-step flows.
6. **Responsive Design**: Ensure flows work well on all device sizes.
7. **Accessibility**: Make flows accessible to users with disabilities.
8. **Performance**: Optimize for fast loading and response times.
9. **Validation**: Validate user input as early as possible.
10. **Confirmation**: Provide clear confirmation when actions are completed.