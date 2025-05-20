
[2025-05-20 14:32:53] - # API Design

## Overview

This document outlines the API design for the Pickleball Facility Owner Platform, focusing on the first implementation slice. It defines the API endpoints, request/response formats, and authentication mechanisms to support organization management, user authentication, and facility management.

## API Architecture

The API follows a RESTful design pattern using Next.js API routes with the following characteristics:

1. **Base URL**: `/api/v1`
2. **Authentication**: JWT-based authentication via Auth.js (NextAuth)
3. **Response Format**: JSON with consistent structure
4. **Error Handling**: Standard error responses with appropriate HTTP status codes
5. **Versioning**: API version included in the URL path

## Authentication

### Authentication Flow

1. User authenticates via Auth.js (NextAuth)
2. JWT token is issued containing user ID and organization context
3. Token is included in subsequent requests via HTTP-only cookie
4. API routes validate the token and extract user and organization context

### Organization Context

After authentication, users select an organization context which is stored in their session. All API requests are scoped to the current organization context.

## API Endpoints

### Authentication

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
GET  /api/v1/auth/session
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
```

### Organizations

```
POST /api/v1/organizations           # Create a new organization
GET  /api/v1/organizations           # List organizations the user belongs to
GET  /api/v1/organizations/:id       # Get organization details
PUT  /api/v1/organizations/:id       # Update organization details
DELETE /api/v1/organizations/:id     # Delete an organization
POST /api/v1/organizations/switch    # Switch the current organization context
```

### Organization Members

```
GET  /api/v1/organizations/:id/members           # List organization members
POST /api/v1/organizations/:id/members           # Add a member to the organization
GET  /api/v1/organizations/:id/members/:userId   # Get member details
PUT  /api/v1/organizations/:id/members/:userId   # Update member roles
DELETE /api/v1/organizations/:id/members/:userId # Remove a member
```

### Facilities

```
GET  /api/v1/facilities              # List facilities for the current organization
POST /api/v1/facilities              # Create a new facility
GET  /api/v1/facilities/:id          # Get facility details
PUT  /api/v1/facilities/:id          # Update facility details
DELETE /api/v1/facilities/:id        # Delete a facility
```

### Users

```
GET  /api/v1/users/me                # Get current user profile
PUT  /api/v1/users/me                # Update current user profile
PUT  /api/v1/users/me/password       # Change password
```

## Request and Response Formats

### Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "errors": null
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Error summary message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Detailed error message",
      "field": "field_name" // Optional, for validation errors
    }
  ]
}
```

## Detailed Endpoint Specifications

### Create Organization

**Endpoint**: `POST /api/v1/organizations`

**Request Body**:
```json
{
  "name": "Pickleball Pro Center",
  "email": "info@pickleballpro.com",
  "phone": "555-123-4567",
  "address": "123 Main St",
  "city": "Pickleville",
  "state": "CA",
  "zipCode": "12345",
  "country": "USA",
  "website": "https://pickleballpro.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "org_123456",
    "name": "Pickleball Pro Center",
    "slug": "pickleball-pro-center",
    "email": "info@pickleballpro.com",
    "phone": "555-123-4567",
    "address": "123 Main St",
    "city": "Pickleville",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA",
    "website": "https://pickleballpro.com",
    "logoUrl": null,
    "createdAt": "2025-05-20T14:30:00.000Z",
    "updatedAt": "2025-05-20T14:30:00.000Z"
  },
  "message": "Organization created successfully",
  "errors": null
}
```

### Create Facility

**Endpoint**: `POST /api/v1/facilities`

**Request Body**:
```json
{
  "name": "Downtown Pickleball Center",
  "address": "456 Main St",
  "city": "Pickleville",
  "state": "CA",
  "zipCode": "12345",
  "country": "USA",
  "phone": "555-987-6543",
  "email": "downtown@pickleballpro.com",
  "website": "https://pickleballpro.com/downtown",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "22:00" },
    "tuesday": { "open": "08:00", "close": "22:00" },
    "wednesday": { "open": "08:00", "close": "22:00" },
    "thursday": { "open": "08:00", "close": "22:00" },
    "friday": { "open": "08:00", "close": "22:00" },
    "saturday": { "open": "09:00", "close": "20:00" },
    "sunday": { "open": "09:00", "close": "18:00" }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "fac_123456",
    "organizationId": "org_123456",
    "name": "Downtown Pickleball Center",
    "slug": "downtown-pickleball-center",
    "address": "456 Main St",
    "city": "Pickleville",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA",
    "phone": "555-987-6543",
    "email": "downtown@pickleballpro.com",
    "website": "https://pickleballpro.com/downtown",
    "operatingHours": {
      "monday": { "open": "08:00", "close": "22:00" },
      "tuesday": { "open": "08:00", "close": "22:00" },
      "wednesday": { "open": "08:00", "close": "22:00" },
      "thursday": { "open": "08:00", "close": "22:00" },
      "friday": { "open": "08:00", "close": "22:00" },
      "saturday": { "open": "09:00", "close": "20:00" },
      "sunday": { "open": "09:00", "close": "18:00" }
    },
    "createdAt": "2025-05-20T15:30:00.000Z",
    "updatedAt": "2025-05-20T15:30:00.000Z"
  },
  "message": "Facility created successfully",
  "errors": null
}
```

### Add Organization Member

**Endpoint**: `POST /api/v1/organizations/:id/members`

**Request Body**:
```json
{
  "email": "manager@example.com",
  "roles": ["manager"],
  "sendInvite": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uorg_123456",
    "userId": "user_789012",
    "organizationId": "org_123456",
    "roles": ["manager"],
    "isDefault": false,
    "createdAt": "2025-05-20T16:30:00.000Z",
    "updatedAt": "2025-05-20T16:30:00.000Z",
    "user": {
      "id": "user_789012",
      "email": "manager@example.com",
      "name": "Manager User"
    }
  },
  "message": "Member added successfully",
  "errors": null
}
```

## API Implementation

### Middleware

1. **Authentication Middleware**: Validates JWT tokens and extracts user and organization context
2. **Organization Context Middleware**: Ensures all requests are scoped to the current organization
3. **Validation Middleware**: Validates request data against schemas
4. **Error Handling Middleware**: Catches and formats errors consistently

### API Route Implementation

API routes will be implemented using Next.js API routes with the following structure:

```typescript
// Example API route implementation
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Unauthorized',
        errors: [{ code: 'UNAUTHORIZED', message: 'You must be logged in' }]
      });
    }

    // Extract organization context
    const organizationId = session.organizationId;
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Organization context required',
        errors: [{ code: 'ORGANIZATION_REQUIRED', message: 'Organization context is required' }]
      });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // Implementation for GET
        break;
      case 'POST':
        // Validate request body
        const validationResult = validateRequest(req.body, 'createFacilitySchema');
        if (!validationResult.success) {
          return res.status(400).json({
            success: false,
            data: null,
            message: 'Validation error',
            errors: validationResult.errors
          });
        }

        // Create facility
        const facility = await prisma.facility.create({
          data: {
            ...req.body,
            organizationId,
            slug: generateSlug(req.body.name)
          }
        });

        return res.status(201).json({
          success: true,
          data: facility,
          message: 'Facility created successfully',
          errors: null
        });

      default:
        return res.status(405).json({
          success: false,
          data: null,
          message: 'Method not allowed',
          errors: [{ code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} not allowed` }]
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error',
      errors: [{ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }]
    });
  }
}
```

## API Security Considerations

1. **Authentication**: JWT tokens with appropriate expiration and refresh mechanisms
2. **Authorization**: Role-based access control for all endpoints
3. **Data Validation**: Input validation for all request data
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **CORS**: Configure appropriate CORS policies
6. **HTTP Security Headers**: Implement security headers for all responses
7. **Error Handling**: Ensure errors don't leak sensitive information

## API Documentation

API documentation will be generated using Swagger/OpenAPI and made available at `/api/docs` in non-production environments.
