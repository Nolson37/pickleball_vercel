# Pickleball Business Management SaaS Platform

A multi-tenant SaaS platform that enables pickleball business owners to create websites where players can manage memberships and reserve courts.

## Overview

The Pickleball Business Management SaaS Platform is a comprehensive solution designed specifically for pickleball facility owners. It provides a suite of tools to manage facilities, courts, memberships, reservations, and player engagement.

This platform aims to differentiate from existing tools by being:
- More affordable
- Easier to use and customize
- Providing better tools to engage, retain, and attract players

## Features

- **Multi-tenant Architecture**: Secure isolation between organizations
- **Organization Management**: Manage organization details, branding, and settings
- **Facility Management**: Create and manage multiple facilities with different configurations
- **User Management**: Role-based access control with customizable permissions
- **Authentication System**: Secure email-based authentication with password reset functionality
- **Dashboard**: Intuitive dashboard for administrators and staff
- **Responsive Design**: Mobile-friendly interface for all user types

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Vercel Postgres)
- **Authentication**: Auth.js (NextAuth)
- **Deployment**: Vercel

## Getting Started

You can run this application either with Docker (recommended) or with a local development setup.

### Option 1: Docker Deployment (Recommended)

#### Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher

#### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pickleball-business-management.git
   cd pickleball-business-management
   ```

2. Start the application:
   ```bash
   ./docker-start.sh
   ```

   Or manually from the web directory:
   ```bash
   cd web
   docker compose up --build
   ```

   This will:
   - Build the Docker images
   - Start PostgreSQL database with initialization
   - Start the Next.js application
   - Run database migrations automatically
   - Make the application available at [http://localhost:3000](http://localhost:3000)

#### Manual Docker Commands

All Docker commands should be run from the `web` directory:

```bash
cd web

# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down --volumes
```

#### Docker Management Commands

```bash
# Access the database (run from web directory)
docker compose exec db psql -U postgres -d pickleball

# Access the application container
docker compose exec app sh

# View application logs
docker compose logs app

# View database logs
docker compose logs db

# Restart specific service
docker compose restart app
```

### Option 2: Local Development Setup

#### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL database (or Vercel Postgres)

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pickleball-business-management.git
   cd pickleball-business-management
   ```

2. Install dependencies:
   ```bash
   cd web
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `web` directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/pickleball"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
   EMAIL_FROM="noreply@example.com"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Management

You can use Prisma Studio to manage your database:

```bash
npx prisma studio
```

This will open a web interface at [http://localhost:5555](http://localhost:5555) where you can view and edit your database.

## Development Workflow

### Branch Strategy

We follow the GitHub Flow branching strategy:

1. Create a feature branch from `main`
2. Make changes and commit to your feature branch
3. Open a pull request to merge your changes into `main`
4. After review, merge your pull request
5. Delete your feature branch

### Commit Message Format

We follow the Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(auth): add password strength indicator`

### Testing

Before submitting a pull request, ensure that all tests pass:

```bash
# Run unit and integration tests
npm test

# Run end-to-end tests
npm run test:e2e
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint to check code quality
- `npm test`: Run all tests
- `npm run test:unit`: Run unit tests
- `npm run test:integration`: Run integration tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run test:e2e:ui`: Run end-to-end tests with UI
- `npm run test:a11y`: Run accessibility tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate test coverage report

## Project Structure

The project follows a feature-based directory structure with clear separation of concerns:

```
web/
├── __mocks__/            # Mock files for testing
├── __tests__/            # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── a11y/             # Accessibility tests
├── docs/                 # Project documentation
├── e2e/                  # End-to-end tests
├── prisma/               # Database schema and migrations
├── public/               # Static files
├── scripts/              # Utility scripts
├── src/                  # Source code
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── marketing/    # Marketing components
│   │   └── ui/           # UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions and libraries
└── types/                # TypeScript type definitions
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

If you encounter database connection issues:

1. Verify your `DATABASE_URL` environment variable is correct
2. Ensure your PostgreSQL server is running
3. Check if your database exists and is accessible
4. Verify network connectivity to the database server

#### Authentication Issues

If you encounter authentication issues:

1. Verify your `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables
2. Check your email configuration if using email authentication
3. Clear browser cookies and try again
4. Check server logs for more detailed error messages

#### Build Errors

If you encounter build errors:

1. Delete the `.next` directory and try building again
2. Ensure all dependencies are installed with `npm install`
3. Check for TypeScript errors with `npx tsc --noEmit`
4. Verify your Node.js version is compatible

### Getting Help

If you need help with the project:

1. Check the documentation in the `docs` directory
2. Look for similar issues in the issue tracker
3. Ask for help in the project's communication channels

## Documentation

All project documentation is maintained in the [docs](./docs) directory:

- [Documentation Index](./docs/index.md) - Central hub for all project documentation
- [Development Standards](./docs/DevelopmentStandards.md) - Guidelines for code organization, style, and development practices
- [Git Configuration Guide](./docs/GitConfiguration.md) - Instructions for setting up version control
- [Multi-tenant SaaS Architecture](./docs/multi-tenant-saas-architecture.md) - Overview of the system architecture
- [API Documentation](./web/docs/api.md) - API endpoints and usage
- [Authentication System](./web/docs/authentication-system.md) - Authentication system details
- [RBAC Documentation](./web/docs/rbac.md) - Role-based access control system
- [Testing Strategy](./web/docs/testing-strategy.md) - Testing approach and practices

## Contributing

Please read the [Development Standards](./docs/DevelopmentStandards.md) document before contributing to this project. It contains important guidelines for code organization, style, and development practices.

## Version Control

This project uses Git for version control. Please refer to the [Git Configuration Guide](./docs/GitConfiguration.md) for instructions on setting up version control for the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.