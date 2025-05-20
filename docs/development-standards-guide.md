# Development Standards Guide

This guide provides practical implementation details for the development standards outlined in the [Development Standards](./DevelopmentStandards.md) document. It serves as a reference for developers working on the Pickleball Facility Owner Platform.

## Table of Contents

1. [Code Organization](#code-organization)
   - [Project Structure](#project-structure)
   - [File Naming Conventions](#file-naming-conventions)
   - [Import Organization](#import-organization)
2. [Coding Style](#coding-style)
   - [TypeScript Best Practices](#typescript-best-practices)
   - [React Best Practices](#react-best-practices)
   - [CSS/Styling Conventions](#cssstyling-conventions)
3. [Component Development](#component-development)
   - [Component Structure](#component-structure)
   - [Props and Interfaces](#props-and-interfaces)
   - [State Management](#state-management)
4. [Testing Guidelines](#testing-guidelines)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [End-to-End Testing](#end-to-end-testing)
5. [API Development](#api-development)
   - [API Route Structure](#api-route-structure)
   - [Error Handling](#error-handling)
   - [Validation](#validation)
6. [Performance Optimization](#performance-optimization)
   - [React Optimization](#react-optimization)
   - [API Optimization](#api-optimization)
   - [Database Optimization](#database-optimization)
7. [Accessibility Standards](#accessibility-standards)
   - [WCAG Compliance](#wcag-compliance)
   - [Keyboard Navigation](#keyboard-navigation)
   - [Screen Reader Support](#screen-reader-support)
8. [Security Best Practices](#security-best-practices)
   - [Authentication and Authorization](#authentication-and-authorization)
   - [Data Protection](#data-protection)
   - [Input Validation](#input-validation)
9. [Contribution Workflow](#contribution-workflow)
   - [Git Workflow](#git-workflow)
   - [Pull Request Process](#pull-request-process)
   - [Code Review Guidelines](#code-review-guidelines)

## Code Organization

### Project Structure

The Pickleball Facility Owner Platform follows a feature-based directory structure with clear separation of concerns:

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
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   └── (...)         # Other page routes
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── marketing/    # Marketing components
│   │   └── ui/           # UI components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions and libraries
└── types/                # TypeScript type definitions
```

#### Key Principles:

1. **Feature-based Organization**: Group related files by feature or domain
2. **Separation of Concerns**: Separate UI components, business logic, and data access
3. **Discoverability**: Make it easy to find files by using consistent naming and organization
4. **Scalability**: Structure should accommodate growth without becoming unwieldy

### File Naming Conventions

#### Components:

- Use PascalCase for component files: `Button.tsx`, `UserProfile.tsx`
- Use kebab-case for multi-word component files: `password-strength-indicator.tsx`
- Use index.ts files for exporting multiple components from a directory

#### Hooks:

- Prefix with `use`: `useAuth.ts`, `usePermissions.ts`
- Use camelCase for hook files

#### Utilities:

- Use descriptive, noun-based names: `auth-utils.ts`, `date-formatter.ts`
- Use kebab-case for multi-word utility files

#### Pages:

- Use kebab-case for page files: `reset-password.tsx`
- Use `page.tsx` for the main page component in a directory

#### API Routes:

- Use descriptive, verb-based names: `route.ts`
- Organize in directories that match the API path structure

### Import Organization

Organize imports in the following order:

1. External libraries and frameworks
2. Internal modules and components
3. Types and interfaces
4. Assets and styles

Example:

```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Internal modules
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { validatePassword } from '@/lib/password-validation';

// Types
import type { User } from '@/types/user';

// Styles
import styles from './styles.module.css';
## Coding Style

### TypeScript Best Practices

#### Type Definitions:

- Define interfaces and types in the same file where they are used, unless they are shared
- Use interfaces for object shapes and classes
- Use type aliases for unions, intersections, and simple types
- Use generics for reusable components and functions

```typescript
// Good
interface UserProps {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// Good
type ButtonVariant = 'primary' | 'secondary' | 'danger';

// Good
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}
```

#### Null and Undefined:

- Use undefined for uninitialized values
- Use null for intentionally absent values
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators

```typescript
// Good
const user = users.find(u => u.id === userId);
const userName = user?.name ?? 'Unknown User';
```

#### Type Assertions:

- Avoid type assertions when possible
- Use type guards instead of type assertions
- When necessary, use `as` syntax instead of angle brackets

```typescript
// Good
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// When necessary
const user = data as User;
```

### React Best Practices

#### Functional Components:

- Use functional components with hooks instead of class components
- Use arrow functions for component definitions
- Use explicit return types for complex components

```typescript
// Good
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

#### Hooks:

- Follow the Rules of Hooks
- Create custom hooks for reusable logic
- Keep hooks focused on a single concern

```typescript
// Good
const useFormWithValidation = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  defaultValues: Partial<T>
) => {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
};
```

#### Props:

- Use destructuring for props
- Provide default values for optional props
- Use children prop for composition

```typescript
// Good
const Card = ({ title, children, className = '' }: CardProps) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
};
```

### CSS/Styling Conventions

The project uses Tailwind CSS for styling with the following conventions:

#### Class Organization:

- Group related classes together
- Order classes by layout, typography, visual styling, and interactivity
- Use consistent spacing and formatting

```tsx
// Good
<div className="flex items-center p-4 mb-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
  <span className="text-lg font-medium text-gray-800">{title}</span>
</div>
```

#### Custom Classes:

- Use the `@apply` directive in CSS modules for reusable styles
- Follow the component name for CSS module files: `Button.module.css`
- Use meaningful class names that describe the purpose, not the appearance

```css
/* Good */
.cardHeader {
  @apply flex justify-between items-center p-4 border-b;
}

.cardTitle {
  @apply text-lg font-medium;
}
```

#### Responsive Design:

- Use Tailwind's responsive prefixes consistently
- Design for mobile-first, then add breakpoints for larger screens
- Test all components at various screen sizes

```tsx
// Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

## Component Development

### Component Structure

Components should follow a consistent structure:

1. Imports
2. Type definitions
3. Helper functions
4. Component definition
5. Exports

Example:

```tsx
// Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// Type definitions
interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Component definition
export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium">{user.name}</h3>
      <p className="text-gray-500">{user.email}</p>
      <p className="text-sm">Joined: {formatDate(user.createdAt)}</p>
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      )}
    </div>
  );
}
```

### Props and Interfaces

- Define clear interfaces for component props
- Use descriptive names for props
- Document complex props with JSDoc comments
- Use optional props with default values when appropriate

```tsx
interface TableProps<T> {
  /**
   * The data to display in the table
   */
  data: T[];
  
  /**
   * The columns configuration for the table
   */
  columns: {
    key: keyof T;
    header: string;
    width?: number;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }[];
  
  /**
   * Whether to show the table header
   * @default true
   */
  showHeader?: boolean;
  
  /**
   * Callback when a row is clicked
   */
  onRowClick?: (item: T) => void;
}
```

### State Management

The project uses a combination of local component state, React Context, and SWR for state management:

#### Local State:

- Use `useState` for component-specific state
- Use `useReducer` for complex state logic
- Keep state as close to where it's used as possible

```tsx
// Good
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

#### Context API:

- Use Context for state that needs to be accessed by multiple components
- Create separate contexts for different domains
- Provide meaningful default values

```tsx
// Good
const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  isLoading: false,
  error: null,
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading } = useSWR<Organization>('/api/organization');
  
  return (
    <OrganizationContext.Provider value={{ organization: data, isLoading, error }}>
      {children}
    </OrganizationContext.Provider>
  );
}
```

#### SWR for Server State:

- Use SWR for fetching and caching server state
- Define reusable hooks for common data fetching patterns
- Handle loading and error states consistently

```tsx
// Good
function useOrganization() {
  const { data, error, isLoading, mutate } = useSWR<Organization>('/api/organization');
  
  return {
    organization: data,
    isLoading,
    error,
    updateOrganization: async (updates: Partial<Organization>) => {
      await fetch('/api/organization', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      mutate();
    },
  };
}
```
## Testing Guidelines

### Unit Testing

Unit tests should focus on testing individual functions, hooks, and components in isolation:

#### Component Testing:

- Test component rendering
- Test component props and state changes
- Test user interactions
- Test conditional rendering

```tsx
// Good
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Hook Testing:

- Test hook initialization
- Test hook return values
- Test hook side effects
- Test hook error handling

```tsx
// Good
describe('usePermissions', () => {
  it('returns correct permission check', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can).toBeInstanceOf(Function);
    expect(result.current.is).toBeInstanceOf(Function);
  });
  
  it('correctly checks permissions', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can('org:view')).toBe(true);
    expect(result.current.can('org:delete')).toBe(false);
  });
});
```

#### Utility Testing:

- Test function inputs and outputs
- Test edge cases
- Test error handling

```tsx
// Good
describe('hasUppercase', () => {
  it('returns true for passwords with uppercase letters', () => {
    expect(hasUppercase('Password')).toBe(true);
  });
  
  it('returns false for passwords without uppercase letters', () => {
    expect(hasUppercase('password')).toBe(false);
  });
});
```

### Integration Testing

Integration tests should focus on testing the interaction between components and services:

#### API Route Testing:

- Test API route handlers
- Test request validation
- Test response formatting
- Test error handling

```tsx
// Good
describe('POST /api/auth/register', () => {
  it('creates a new user and organization', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        organizationName: 'Test Organization',
        acceptTerms: true,
      }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  it('returns validation errors for invalid input', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'weak',
        organizationName: '',
        acceptTerms: false,
      }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });
});
```

#### Form Testing:

- Test form submission
- Test form validation
- Test form error handling
- Test form success handling

```tsx
// Good
describe('RegistrationForm', () => {
  it('submits the form with valid data', async () => {
    const handleSubmit = jest.fn();
    render(<RegistrationForm onSubmit={handleSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    await userEvent.type(screen.getByLabelText(/organization/i), 'Test Organization');
    await userEvent.click(screen.getByLabelText(/terms/i));
    
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      organizationName: 'Test Organization',
      acceptTerms: true,
    });
  });
});
```

### End-to-End Testing

End-to-end tests should focus on testing complete user flows:

#### User Flow Testing:

- Test critical user journeys
- Test form submissions
- Test navigation
- Test authentication flows

```tsx
// Good
test('user can sign up and log in', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Fill in the registration form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="organizationName"]', 'Test Organization');
  await page.check('input[name="acceptTerms"]');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Verify the user is redirected to the verification page
  await expect(page).toHaveURL(/verification/);
  
  // Verify the verification message is displayed
  await expect(page.locator('text=Check your email')).toBeVisible();
});
```

## API Development

### API Route Structure

API routes should follow a consistent structure:

1. Import dependencies
2. Define request handler
3. Implement validation
4. Implement business logic
5. Return response

Example:

```typescript
// Import dependencies
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/auth-utils';

// Define validation schema
const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional(),
});

// Define request handler
async function handler(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateOrganizationSchema.parse(body);
    
    // Get organization ID from session
    const { organizationId } = req.auth;
    
    // Update organization
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: validatedData,
    });
    
    // Return response
    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully',
      organization,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// Export handler with permission check
export const PUT = withPermission(handler, 'org:edit');
```

### Error Handling

API routes should handle errors consistently:

- Use try/catch blocks to catch errors
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging
- Don't expose sensitive information in error responses

```typescript
// Good
try {
  // Business logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, message: 'Validation error', errors: error.errors },
      { status: 400 }
    );
  }
  
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'A record with this value already exists' },
        { status: 409 }
      );
    }
  }
  
  console.error('Error:', error);
  return NextResponse.json(
    { success: false, message: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

### Validation

API routes should validate input data:

- Use Zod for schema validation
- Validate early in the request lifecycle
- Provide descriptive validation error messages
- Return validation errors in a consistent format

```typescript
// Good
const createFacilitySchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createFacilitySchema.parse(body);
    
    // Proceed with business logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    // Handle other errors
  }
}
```
## Performance Optimization

### React Optimization

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers passed to child components
- Use virtualization for long lists
- Optimize images with next/image

```tsx
// Good
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  return (
    <div>
      {/* Expensive rendering */}
    </div>
  );
});

function ParentComponent({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  const handleItemClick = useCallback((item: Item) => {
    console.log('Item clicked:', item);
  }, []);
  
  return (
    <div>
      {sortedItems.map(item => (
        <ExpensiveComponent 
          key={item.id} 
          data={item} 
          onClick={handleItemClick} 
        />
      ))}
    </div>
  );
}
```

### API Optimization

- Use caching with SWR
- Implement pagination for large data sets
- Use query parameters for filtering and sorting
- Optimize database queries

```tsx
// Good
function useOrganizationUsers(page = 1, limit = 10) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<User>>(
    `/api/organization/users?page=${page}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    users: data?.items ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
```

### Database Optimization

- Use appropriate indexes
- Optimize queries with select and include
- Use transactions for related operations
- Implement connection pooling

```typescript
// Good
async function getUsersWithOrganizations() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      organizations: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          roles: true,
        },
      },
    },
  });
}
```

## Accessibility Standards

### WCAG Compliance

The project aims to meet WCAG 2.1 AA standards:

- Use semantic HTML elements
- Provide alternative text for images
- Ensure sufficient color contrast
- Make forms accessible
- Ensure keyboard navigability

```tsx
// Good
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Organization Settings</h2>
  <img src="/logo.png" alt="Organization Logo" />
  <form>
    <div>
      <label htmlFor="name">Organization Name</label>
      <input 
        id="name" 
        name="name" 
        type="text" 
        aria-describedby="name-description" 
      />
      <p id="name-description" className="text-sm text-gray-500">
        The name of your organization as it will appear to users.
      </p>
    </div>
    <button type="submit">Save Changes</button>
  </form>
</section>
```

### Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Use proper focus management
- Implement focus trapping for modals
- Provide skip links for navigation

```tsx
// Good
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true"
      ref={modalRef}
    >
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

### Screen Reader Support

- Use ARIA attributes appropriately
- Test with screen readers
- Provide context for screen reader users
- Announce dynamic content changes

```tsx
// Good
function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist" aria-label="Settings tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## Security Best Practices

### Authentication and Authorization

- Use Auth.js (NextAuth) for authentication
- Implement role-based access control
- Use JWT tokens with appropriate expiration
- Implement CSRF protection
- Use secure cookies

```typescript
// Good
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Authentication logic
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom claims to JWT
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.organizationId = user.organizationId;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom session properties
      if (token) {
        session.user.id = token.id;
        session.user.organizationId = token.organizationId;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Data Protection

- Use HTTPS for all communications
- Encrypt sensitive data at rest
- Implement proper error handling to avoid information leakage
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for sensitive operations

```typescript
// Good
async function resetPassword(token: string, newPassword: string) {
  // Validate token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  
  if (!resetToken || resetToken.expires < new Date()) {
    throw new Error('Invalid or expired token');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  // Update user password
  await prisma.$transaction([
    prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ]);
}
```

### Input Validation

- Validate all user input
- Use Zod for schema validation
- Sanitize data before using it in queries or rendering
- Implement content security policy
- Use CSRF tokens for forms

```typescript
// Good
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

async function registerUser(data: unknown) {
  const validatedData = userSchema.parse(data);
  // Proceed with registration
}
```

## Contribution Workflow

### Git Workflow

The project follows the GitHub Flow branching strategy:

1. Create a feature branch from `main`
2. Make changes and commit to your feature branch
3. Open a pull request to merge your changes into `main`
4. After review, merge your pull request
5. Delete your feature branch

```bash
# Create a feature branch
git checkout -b feature/add-facility-management

# Make changes and commit
git add .
git commit -m "feat(facility): add facility creation form"

# Push changes to remote
git push -u origin feature/add-facility-management

# After PR is merged, clean up
git checkout main
git pull
git branch -d feature/add-facility-management
```

### Pull Request Process

1. Create a pull request with a descriptive title and description
2. Link the pull request to any related issues
3. Ensure all tests pass
4. Request review from at least one team member
5. Address review comments
6. Merge the pull request when approved

### Code Review Guidelines

#### For Authors:

- Keep pull requests small and focused
- Provide context and explain your changes
- Respond to feedback promptly
- Be open to suggestions

#### For Reviewers:

- Be respectful and constructive
- Focus on code quality, not style preferences
- Provide specific feedback with examples
- Approve only when all issues are addressed

#### Review Checklist:

- Does the code follow the project's coding standards?
- Are there appropriate tests?
- Is the code maintainable and readable?
- Does the code handle edge cases and errors?
- Is the code secure and performant?
- Is the documentation updated?