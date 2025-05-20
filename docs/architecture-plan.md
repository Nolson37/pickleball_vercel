# Pickleball Facility Owner Platform - Architecture and Implementation Plan

## Overview

This document outlines the architecture and implementation plan for the Pickleball Facility Owner Platform, a multi-tenant SaaS solution for pickleball facility owners. The platform will enable facility owners to manage their operations, including organization management, facility management, and user management.

The architecture follows the guidelines outlined in the multi-tenant SaaS architecture document, focusing on the "First Implementation Slice" which includes organization signup, basic organization profile management, admin user creation and authentication, and simple facility creation.

## 1. System Architecture Design

### Multi-Tenant Data Model and Isolation Strategy

We'll implement a shared database with organization ID approach as specified in the architecture document:

```mermaid
graph TD
    subgraph "Vercel Postgres Database"
        A[Organization Table] --> B[Facility Table]
        A --> C[User Table]
        A --> D[UserOrganization Table]
    end
    
    E[Organization ID in every table] --> F[Application-level Filtering]
    G[Database Indexes on Organization ID] --> H[Query Performance]
```

Key implementation details:
- Each table will include an `organizationId` column for tenant isolation
- All queries will filter by organization ID to ensure data isolation
- Indexes will be created on `organizationId` columns for performance
- Middleware will automatically inject organization context into all queries
- Repository pattern will abstract organization filtering logic

### Authentication and Authorization Framework

We'll implement authentication with organization context using Auth.js (NextAuth):

```mermaid
flowchart TD
    A[User Login Request] --> B{Organization-aware Auth Flow}
    B --> C[Auth.js Provider]
    C --> D[JWT with Organization Context]
    D --> E[Next.js Middleware]
    E --> F[Organization Context Extraction]
    F --> G[Role-based Access Control]
    G --> H[Protected Resources]
    
    I[Admin Portal] --> J[Organization Management]
    J --> K[User Management]
    K --> L[Role Assignment]
```

Key implementation details:
- Auth.js with JWT tokens containing organization identifier and user roles
- Next.js middleware for route protection and organization context extraction
- Role-based access control with core roles: Admin, Staff, User
- Organization-specific permissions stored in configuration

### API and Service Layer Architecture

```mermaid
flowchart TD
    A[Client Application] --> B[Next.js API Routes]
    
    subgraph "API Layer"
        B --> C[Organization Context Middleware]
        C --> D[Authentication Middleware]
        D --> E[Service Layer]
    end
    
    subgraph "Service Layer"
        E --> F[Business Logic]
        F --> G[Data Access Layer]
    end
    
    G --> I[Vercel Postgres]
```

Key implementation details:
- Next.js API routes for core functionality
- Organization context middleware to extract organization ID
- Service layer with business logic and data access
- Repository pattern for data access with organization filtering

### State Management Approach

```mermaid
flowchart TD
    A[Client-side State] --> B[React Context API]
    A --> C[Zustand Store]
    
    D[Server State] --> E[SWR]
    E --> F[Organization-aware Cache]
    
    G[UI Components] --> H[State Consumers]
```

Key implementation details:
- React Context API for global UI state
- Zustand for more complex state with actions
- SWR for server state with organization-aware caching
- Organization-specific state isolated by design

## 2. Next.js Project Setup

### Directory Structure

Following the development standards document and Next.js App Router best practices:

```
/
├── app/                           # Next.js App Router pages and layouts
│   ├── (auth)/                    # Authentication pages (login, signup)
│   ├── (dashboard)/               # Dashboard pages for authenticated users
│   │   ├── [organizationId]/      # Organization-specific pages
│   │   │   ├── facilities/        # Facility management pages
│   │   │   ├── settings/          # Organization settings pages
│   │   │   └── users/             # User management pages
│   ├── (marketing)/               # Public marketing pages
│   ├── api/                       # API routes
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/                    # Reusable UI components
│   ├── ui/                        # shadcn/ui components
│   ├── auth/                      # Authentication components
│   ├── dashboard/                 # Dashboard components
│   ├── facilities/                # Facility-related components
│   └── organizations/             # Organization-related components
├── lib/                           # Utility functions and shared code
│   ├── auth/                      # Authentication utilities
│   ├── db/                        # Database utilities
│   ├── api/                       # API utilities
│   └── utils/                     # General utilities
├── middleware.ts                  # Next.js middleware for auth and organization context
├── prisma/                        # Prisma schema and migrations
│   ├── schema.prisma              # Prisma schema
│   └── migrations/                # Database migrations
├── public/                        # Static assets
├── styles/                        # Global styles
│   └── globals.css                # Global CSS with Tailwind
├── types/                         # TypeScript type definitions
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project dependencies
```

## 3. Technology Configuration

### Tailwind CSS and shadcn/ui Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... other shades
          900: '#0c4a6e',
        },
        // ... other color definitions
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

For shadcn/ui, we'll initialize it in our project:

```bash
npx shadcn@latest init
```

And then add the components we need:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add card
npx shadcn@latest add table
```

We'll also set up dark mode support:

```bash
npm install next-themes
```

And create a ThemeProvider component:

```typescript
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Prisma ORM with Vercel Postgres

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  email       String?
  phone       String?
  logo        String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  users       UserOrganization[]
  facilities  Facility[]
}

model User {
  id             String           @id @default(cuid())
  email          String           @unique
  name           String?
  organizations  UserOrganization[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model UserOrganization {
  id             String       @id @default(cuid())
  user           User         @relation(fields: [userId], references: [id])
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  role           String       @default("user") // admin, staff, user
  isOwner        Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([userId, organizationId])
  @@index([organizationId])
}

model Facility {
  id             String       @id @default(cuid())
  name           String
  address        String?
  city           String?
  state          String?
  zip            String?
  phone          String?
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}
```

### Auth.js (NextAuth) Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import EmailProvider from "next-auth/providers/email"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      // Add user ID to session
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      // Add user ID to token
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### State Management with React Context API and Zustand

```typescript
// lib/store/organization-context.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Organization } from '@prisma/client'

type OrganizationContextType = {
  currentOrganization: Organization | null
  setCurrentOrganization: (organization: Organization) => void
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      // Fetch user's organizations
      fetch('/api/organizations/user')
        .then(res => res.json())
        .then(data => {
          if (data.organizations?.length > 0) {
            setCurrentOrganization(data.organizations[0])
          }
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error fetching organizations:', error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [session])

  return (
    <OrganizationContext.Provider value={{ currentOrganization, setCurrentOrganization, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
```

```typescript
// lib/store/organization-store.ts
import { create } from 'zustand'
import { Organization, Facility } from '@prisma/client'

interface OrganizationState {
  currentOrganization: Organization | null
  facilities: Facility[]
  isLoading: boolean
  setCurrentOrganization: (organization: Organization) => void
  setFacilities: (facilities: Facility[]) => void
  setIsLoading: (isLoading: boolean) => void
  fetchFacilities: () => Promise<void>
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  currentOrganization: null,
  facilities: [],
  isLoading: true,
  setCurrentOrganization: (organization) => set({ currentOrganization: organization }),
  setFacilities: (facilities) => set({ facilities }),
  setIsLoading: (isLoading) => set({ isLoading }),
  fetchFacilities: async () => {
    const { currentOrganization } = get()
    if (!currentOrganization) return
    
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/facilities`)
      const data = await response.json()
      set({ facilities: data.facilities })
    } catch (error) {
      console.error('Error fetching facilities:', error)
    }
  }
}))
```

## 4. Implementation Details for First Slice

### Organization Signup Flow

```mermaid
sequenceDiagram
    participant User
    participant SignupPage
    participant API
    participant Database
    participant Email
    
    User->>SignupPage: Enter organization details
    SignupPage->>API: POST /api/organizations
    API->>Database: Create organization
    API->>Database: Create admin user
    API->>Database: Link user to organization
    API->>Email: Send verification email
    API->>SignupPage: Return success
    SignupPage->>User: Show confirmation
```

Key implementation details:
- Signup form collecting organization name, admin email, and password
- Email verification using Resend
- Organization creation in database with unique slug generation
- Initial admin user creation with owner role

### Authentication Implementation

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant Auth.js
    participant Database
    participant ProtectedPage
    
    User->>LoginPage: Enter credentials
    LoginPage->>Auth.js: Sign in request
    Auth.js->>Database: Verify credentials
    Auth.js->>Auth.js: Generate JWT with org context
    Auth.js->>LoginPage: Return JWT
    LoginPage->>ProtectedPage: Redirect with JWT
    ProtectedPage->>Auth.js: Verify JWT
    Auth.js->>ProtectedPage: Allow access
```

Key implementation details:
- Auth.js setup with organization context
- JWT tokens with organization ID claim
- Next.js middleware for route protection
- Organization context extraction from JWT

### Admin Dashboard

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[Organization Profile]
    A --> C[Facility Management]
    A --> D[User Management]
    
    B --> B1[Edit Organization Details]
    B --> B2[Upload Logo]
    
    C --> C1[Create Facility]
    C --> C2[Edit Facility]
    C --> C3[Delete Facility]
    
    D --> D1[Invite Users]
    D --> D2[Manage Roles]
    D --> D3[Remove Users]
```

Key implementation details:
- Organization profile management (name, contact info, logo)
- Facility creation and management (name, address, contact info)
- Admin user management (invite additional admins)

## 5. Implementation Approach and Next Steps

### Implementation Approach

1. **Project Initialization**:
   - Initialize Next.js project with App Router
   - Configure TypeScript
   - Set up Tailwind CSS and shadcn/ui

2. **Database Setup**:
   - Configure Prisma with Vercel Postgres
   - Define initial schema
   - Create migrations

3. **Authentication Setup**:
   - Configure Auth.js with JWT
   - Implement authentication pages
   - Set up middleware for route protection

4. **Core Features Implementation**:
   - Organization signup flow
   - Organization profile management
   - Facility management
   - User management

5. **Documentation**:
   - Update README.md with setup instructions
   - Document architecture decisions
   - Document project structure

### Next Steps After First Slice

1. Court management and reservation system
2. Player accounts and membership management
3. Payment processing integration
4. Calendar integration
5. More advanced customization options

## 6. Setup Instructions

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pickleball-facility-owner-platform.git
   cd pickleball-facility-owner-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```
   # .env.local
   DATABASE_URL="postgresql://username:password@localhost:5432/pickleball"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-password"
   EMAIL_FROM="noreply@example.com"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 7. Conclusion

This architecture and implementation plan provides a solid foundation for the Pickleball Facility Owner Platform. By following the multi-tenant SaaS architecture guidelines and leveraging Next.js, Vercel Postgres, Auth.js, and shadcn/ui, we can create a scalable, maintainable, and user-friendly platform for pickleball facility owners.

The first implementation slice focuses on the core features of organization signup, basic organization profile management, admin user creation and authentication, and simple facility creation. This will provide a solid foundation for future development and expansion of the platform.