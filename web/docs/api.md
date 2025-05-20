# API Documentation

## Overview

The Pickleball Facility Owner Platform provides a RESTful API for interacting with the backend services. This document describes the available API endpoints, request/response formats, and authentication requirements.

## Authentication

All API endpoints (except for public endpoints) require authentication. The platform uses JWT-based authentication via NextAuth.js.

To authenticate API requests, include the session cookie that is set when logging in. For programmatic access, you can use the NextAuth.js API to obtain a JWT token.

## API Endpoints

### Authentication

#### Register a New User

```
POST /api/auth/register
```

Register a new user and organization.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "organizationName": "Acme Pickleball",
  "acceptTerms": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Status Codes:**

- `200 OK`: Registration successful
- `400 Bad Request`: Validation error or user already exists
- `500 Internal Server Error`: Server error

#### Verify Email

```
GET /api/auth/verify?token=<verification-token>
```

Verify a user's email address using the token sent to their email.

**Query Parameters:**

- `token`: The verification token sent to the user's email

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Status Codes:**

- `200 OK`: Email verified successfully
- `400 Bad Request`: Invalid or expired token
- `500 Internal Server Error`: Server error

#### Request Password Reset

```
POST /api/auth/forgot-password
```

Request a password reset link to be sent to the user's email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent a password reset link."
}
```

**Status Codes:**

- `200 OK`: Request processed (note: for security reasons, this returns 200 even if the email doesn't exist)
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

#### Reset Password

```
POST /api/auth/reset-password
```

Reset a user's password using the token sent to their email.

**Request Body:**

```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Status Codes:**

- `200 OK`: Password reset successful
- `400 Bad Request`: Invalid or expired token, or validation error
- `500 Internal Server Error`: Server error

#### Change Password

```
POST /api/auth/change-password
```

Change the password for the currently logged-in user.

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

**Status Codes:**

- `200 OK`: Password changed successfully
- `400 Bad Request`: Validation error or incorrect current password
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

#### Get CSRF Token

```
GET /api/auth/csrf
```

Get a CSRF token for use with forms.

**Response:**

```json
{
  "csrfToken": "csrf-token"
}
```

**Status Codes:**

- `200 OK`: Token generated successfully
- `500 Internal Server Error`: Server error

### User Management

#### Complete Onboarding

```
POST /api/user/onboarding
```

Complete the onboarding process for a new user.

**Request Body:**

```json
{
  "jobTitle": "Facility Manager",
  "phoneNumber": "+1234567890",
  "timezone": "America/New_York",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false
    },
    "theme": "light"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Onboarding completed successfully."
}
```

**Status Codes:**

- `200 OK`: Onboarding completed successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

### Organization Management

#### Get Organization Details

```
GET /api/organization
```

Get details for the current user's organization.

**Response:**

```json
{
  "id": "org-123",
  "name": "Acme Pickleball",
  "slug": "acme-pickleball",
  "logo": "https://example.com/logo.png",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "USA"
  },
  "contactEmail": "info@acmepickleball.com",
  "contactPhone": "+1234567890",
  "website": "https://acmepickleball.com",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200 OK`: Organization details retrieved successfully
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to view organization details
- `500 Internal Server Error`: Server error

#### Update Organization Details

```
PUT /api/organization
```

Update details for the current user's organization.

**Request Body:**

```json
{
  "name": "Acme Pickleball Club",
  "logo": "https://example.com/new-logo.png",
  "address": {
    "street": "456 Oak St",
    "city": "Newtown",
    "state": "CA",
    "zip": "54321",
    "country": "USA"
  },
  "contactEmail": "info@acmepickleball.com",
  "contactPhone": "+1234567890",
  "website": "https://acmepickleball.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Organization updated successfully.",
  "organization": {
    "id": "org-123",
    "name": "Acme Pickleball Club",
    "slug": "acme-pickleball",
    "logo": "https://example.com/new-logo.png",
    "address": {
      "street": "456 Oak St",
      "city": "Newtown",
      "state": "CA",
      "zip": "54321",
      "country": "USA"
    },
    "contactEmail": "info@acmepickleball.com",
    "contactPhone": "+1234567890",
    "website": "https://acmepickleball.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK`: Organization updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to update organization details
- `500 Internal Server Error`: Server error

### Facility Management

#### Get Facilities

```
GET /api/facilities
```

Get a list of facilities for the current user's organization.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Number of facilities per page (default: 10)
- `sort`: Sort field (default: "name")
- `order`: Sort order ("asc" or "desc", default: "asc")

**Response:**

```json
{
  "facilities": [
    {
      "id": "facility-123",
      "name": "Main Facility",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345",
        "country": "USA"
      },
      "courts": 8,
      "indoor": true,
      "amenities": ["restrooms", "pro shop", "lounge"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "facility-456",
      "name": "Outdoor Facility",
      "address": {
        "street": "456 Oak St",
        "city": "Newtown",
        "state": "CA",
        "zip": "54321",
        "country": "USA"
      },
      "courts": 4,
      "indoor": false,
      "amenities": ["restrooms", "water fountains"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Status Codes:**

- `200 OK`: Facilities retrieved successfully
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to view facilities
- `500 Internal Server Error`: Server error

#### Get Facility

```
GET /api/facilities/:id
```

Get details for a specific facility.

**Path Parameters:**

- `id`: Facility ID

**Response:**

```json
{
  "id": "facility-123",
  "name": "Main Facility",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "USA"
  },
  "courts": 8,
  "indoor": true,
  "amenities": ["restrooms", "pro shop", "lounge"],
  "hours": [
    {
      "day": "Monday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Tuesday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Wednesday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Thursday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Friday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Saturday",
      "open": "09:00",
      "close": "20:00"
    },
    {
      "day": "Sunday",
      "open": "09:00",
      "close": "20:00"
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200 OK`: Facility retrieved successfully
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to view the facility
- `404 Not Found`: Facility not found
- `500 Internal Server Error`: Server error

#### Create Facility

```
POST /api/facilities
```

Create a new facility.

**Request Body:**

```json
{
  "name": "New Facility",
  "address": {
    "street": "789 Pine St",
    "city": "Othertown",
    "state": "CA",
    "zip": "67890",
    "country": "USA"
  },
  "courts": 6,
  "indoor": true,
  "amenities": ["restrooms", "pro shop", "lounge", "water fountains"],
  "hours": [
    {
      "day": "Monday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Tuesday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Wednesday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Thursday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Friday",
      "open": "08:00",
      "close": "22:00"
    },
    {
      "day": "Saturday",
      "open": "09:00",
      "close": "20:00"
    },
    {
      "day": "Sunday",
      "open": "09:00",
      "close": "20:00"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Facility created successfully.",
  "facility": {
    "id": "facility-789",
    "name": "New Facility",
    "address": {
      "street": "789 Pine St",
      "city": "Othertown",
      "state": "CA",
      "zip": "67890",
      "country": "USA"
    },
    "courts": 6,
    "indoor": true,
    "amenities": ["restrooms", "pro shop", "lounge", "water fountains"],
    "hours": [
      {
        "day": "Monday",
        "open": "08:00",
        "close": "22:00"
      },
      {
        "day": "Tuesday",
        "open": "08:00",
        "close": "22:00"
      },
      {
        "day": "Wednesday",
        "open": "08:00",
        "close": "22:00"
      },
      {
        "day": "Thursday",
        "open": "08:00",
        "close": "22:00"
      },
      {
        "day": "Friday",
        "open": "08:00",
        "close": "22:00"
      },
      {
        "day": "Saturday",
        "open": "09:00",
        "close": "20:00"
      },
      {
        "day": "Sunday",
        "open": "09:00",
        "close": "20:00"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201 Created`: Facility created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to create facilities
- `500 Internal Server Error`: Server error

## Error Handling

All API endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

The `errors` array is optional and only included for validation errors.

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The rate limits are as follows:

- Authentication endpoints: 10 requests per minute
- Other endpoints: 60 requests per minute

When a rate limit is exceeded, the API returns a `429 Too Many Requests` status code with a `Retry-After` header indicating the number of seconds to wait before retrying.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for specified origins. By default, only the frontend application origin is allowed.

## Versioning

The API is versioned using URL path versioning. The current version is v1, which is implied in the base URL. Future versions will be explicitly versioned (e.g., `/api/v2/...`).

## Changelog

### v1.0.0 (2025-05-20)

- Initial release