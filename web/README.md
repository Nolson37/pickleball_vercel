# Pickleball Facility Owner Platform

A multi-tenant SaaS platform for pickleball facility owners to manage their facilities, staff, and members.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests](#end-to-end-tests)
  - [Accessibility Tests](#accessibility-tests)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Pickleball Facility Owner Platform is a comprehensive SaaS solution designed to help pickleball facility owners manage their operations efficiently. The platform provides tools for managing facilities, staff, members, and bookings, with a focus on ease of use and accessibility.

## Features

- **User Authentication**: Secure login, registration, and password management
- **Role-Based Access Control**: Granular permissions for different user roles
- **Facility Management**: Add, edit, and manage pickleball facilities
- **Organization Management**: Manage your organization settings and branding
- **User Management**: Invite and manage staff and members
- **Profile Management**: Update personal information and preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/pickleball-facility-owner-platform.git
cd pickleball-facility-owner-platform/web
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pickleball"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (for password reset and verification)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"
```

## Project Structure

```
web/
├── __tests__/            # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── a11y/             # Accessibility tests
├── e2e/                  # End-to-end tests
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   └── dashboard/    # Dashboard pages
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── marketing/    # Marketing components
│   │   └── ui/           # UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions and libraries
└── types/                # TypeScript type definitions
```

## Testing

The project includes a comprehensive testing suite with unit tests, integration tests, end-to-end tests, and accessibility tests.

### Unit Tests

Unit tests are located in the `__tests__/unit` directory and test individual components, functions, and modules in isolation.

To run unit tests:

```bash
npm run test:unit
```

### Integration Tests

Integration tests are located in the `__tests__/integration` directory and test the interaction between components and services.

To run integration tests:

```bash
npm run test:integration
```

### End-to-End Tests

End-to-end tests are located in the `e2e` directory and test complete user flows from a user's perspective.

To run end-to-end tests:

```bash
npm run test:e2e
```

To run end-to-end tests with the Playwright UI:

```bash
npm run test:e2e:ui
```

### Accessibility Tests

Accessibility tests are located in the `__tests__/a11y` directory and test compliance with WCAG 2.1 AA standards.

To run accessibility tests:

```bash
npm run test:a11y
```

## Authentication

The platform uses NextAuth.js for authentication, with support for email/password authentication, email verification, and password reset.

For more information, see [Authentication System Documentation](docs/authentication-system.md).

## Role-Based Access Control

The platform implements a role-based access control (RBAC) system to manage permissions for different user roles.

Available roles:
- Admin: Full access to all features
- Manager: Access to manage facilities, staff, and members
- Staff: Access to view facilities and members
- Member: Access to view facilities
- Guest: Limited access to public information

For more information, see the [RBAC Documentation](docs/rbac.md).

## API Documentation

The platform provides a RESTful API for interacting with the backend services.

For more information, see the [API Documentation](docs/api.md).

## Deployment

The platform can be deployed to Vercel with minimal configuration.

1. Create a new project on Vercel
2. Link your GitHub repository
3. Configure the environment variables
4. Deploy

For more information, see the [Deployment Documentation](docs/deployment.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
