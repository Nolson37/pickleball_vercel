# Component Documentation

This document provides detailed information about the key components in the Pickleball Facility Owner Platform, including their purpose, usage, props, and interfaces.

## Table of Contents

1. [Authentication Components](#authentication-components)
   - [PermissionGate](#permissiongate)
   - [PasswordStrengthIndicator](#passwordstrengthindicator)
2. [Marketing Components](#marketing-components)
   - [Header](#header)
   - [Hero](#hero)
   - [Footer](#footer)
   - [RegistrationForm](#registrationform)
   - [Features](#features)
   - [Testimonials](#testimonials)
3. [Dashboard Components](#dashboard-components)
   - [DashboardOverview](#dashboardoverview)
   - [DashboardWelcome](#dashboardwelcome)
   - [WelcomeMessage](#welcomemessage)
4. [UI Components](#ui-components)
   - [Button](#button)
   - [Card](#card)
   - [Checkbox](#checkbox)
   - [Input](#input)
   - [Avatar](#avatar)
   - [Form](#form)
   - [Label](#label)

## Authentication Components

### PermissionGate

The `PermissionGate` component is a key part of the Role-Based Access Control (RBAC) system. It conditionally renders content based on the user's permissions or roles.

#### Usage

```tsx
import { PermissionGate } from '@/components/auth/permission-gate';
import { PERMISSIONS, ROLES } from '@/lib/rbac';

// Show content only if user has the ORG_EDIT permission
<PermissionGate permission={PERMISSIONS.ORG_EDIT}>
  <button>Edit Organization</button>
</PermissionGate>

// Show content only if user has the ADMIN role
<PermissionGate role={ROLES.ADMIN}>
  <button>Admin Action</button>
</PermissionGate>

// Show content only if user has any of the specified permissions
<PermissionGate anyPermission={[PERMISSIONS.ORG_EDIT, PERMISSIONS.ORG_MANAGE_MEMBERS]}>
  <div>Organization Management</div>
</PermissionGate>

// Show content only if user has all of the specified permissions
<PermissionGate allPermissions={[PERMISSIONS.ORG_VIEW, PERMISSIONS.USER_VIEW]}>
  <div>Organization and User Viewer</div>
</PermissionGate>

// Show alternative content if user doesn't have the required permission
<PermissionGate 
  permission={PERMISSIONS.ORG_EDIT}
  fallback={<div>You don't have permission to edit the organization</div>}
>
  <button>Edit Organization</button>
</PermissionGate>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render if the user has the required permission or role |
| `permission` | `string` | A single permission to check |
| `role` | `string` | A single role to check |
| `anyPermission` | `string[]` | Array of permissions where the user needs at least one |
| `allPermissions` | `string[]` | Array of permissions where the user needs all |
| `fallback` | `ReactNode` | Content to render if the user doesn't have the required permission or role |

### PasswordStrengthIndicator

The `PasswordStrengthIndicator` component provides visual feedback on password strength during registration or password change.

#### Usage

```tsx
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator';

// Basic usage
<PasswordStrengthIndicator password={password} />

// With custom class name
<PasswordStrengthIndicator password={password} className="mt-2" />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `password` | `string` | The password to evaluate |
| `className` | `string` | Optional CSS class name for styling |

## Marketing Components

### Header

The `Header` component displays the navigation bar at the top of the marketing pages.

#### Usage

```tsx
import { Header } from '@/components/marketing/header';

<Header />
```

### Hero

The `Hero` component displays the main banner section on the landing page.

#### Usage

```tsx
import { Hero } from '@/components/marketing/hero';

<Hero />
```

### Footer

The `Footer` component displays the footer section on the marketing pages.

#### Usage

```tsx
import { Footer } from '@/components/marketing/footer';

<Footer />
```

### RegistrationForm

The `RegistrationForm` component provides a form for new users to register and create an organization.

#### Usage

```tsx
import { RegistrationForm } from '@/components/marketing/registration-form';

<RegistrationForm />
```

### Features

The `Features` component displays the platform features on the marketing pages.

#### Usage

```tsx
import { Features } from '@/components/marketing/features';

<Features />
```

### Testimonials

The `Testimonials` component displays customer testimonials on the marketing pages.

#### Usage

```tsx
import { Testimonials } from '@/components/marketing/testimonials';

<Testimonials />
```

## Dashboard Components

### DashboardOverview

The `DashboardOverview` component displays an overview of the organization's data on the dashboard.

#### Usage

```tsx
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

<DashboardOverview />
```

### DashboardWelcome

The `DashboardWelcome` component displays a welcome message and onboarding information for new users.

#### Usage

```tsx
import { DashboardWelcome } from '@/components/dashboard/dashboard-welcome';

<DashboardWelcome />
```

### WelcomeMessage

The `WelcomeMessage` component displays a personalized welcome message to the user.

#### Usage

```tsx
import { WelcomeMessage } from '@/components/dashboard/welcome-message';

<WelcomeMessage />
```

## UI Components

The UI components are based on the shadcn/ui library, which provides a set of accessible, reusable, and customizable UI components.

### Button

The `Button` component is a versatile button component with various styles and variants.

#### Usage

```tsx
import { Button } from '@/components/ui/button';

// Default button
<Button>Click me</Button>

// Primary button
<Button variant="default">Primary</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Ghost button
<Button variant="ghost">Ghost</Button>

// Link button
<Button variant="link">Link</Button>

// Disabled button
<Button disabled>Disabled</Button>

// Button with icon
<Button>
  <Icon className="mr-2 h-4 w-4" />
  With Icon
</Button>

// Button sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Button as a link
<Button asChild>
  <a href="/dashboard">Dashboard</a>
</Button>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | The button style variant |
| `size` | `'default' \| 'sm' \| 'lg'` | The button size |
| `asChild` | `boolean` | Whether to render the button as a child component |

### Card

The `Card` component is used to group related content.

#### Usage

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### Checkbox

The `Checkbox` component is an accessible checkbox input.

#### Usage

```tsx
import { Checkbox } from '@/components/ui/checkbox';

// Basic checkbox
<Checkbox />

// Checkbox with label
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>

// Disabled checkbox
<Checkbox disabled />

// Checked checkbox
<Checkbox checked />

// Checkbox with onChange handler
<Checkbox onCheckedChange={(checked) => console.log(checked)} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean` | Whether the checkbox is checked |
| `defaultChecked` | `boolean` | The default checked state |
| `onCheckedChange` | `(checked: boolean) => void` | Callback when the checked state changes |
| `disabled` | `boolean` | Whether the checkbox is disabled |

### Input

The `Input` component is a styled input element.

#### Usage

```tsx
import { Input } from '@/components/ui/input';

// Basic input
<Input />

// Input with placeholder
<Input placeholder="Email" />

// Input with type
<Input type="email" />

// Disabled input
<Input disabled />

// Input with label
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | `string` | The input type |
| `placeholder` | `string` | The input placeholder |
| `disabled` | `boolean` | Whether the input is disabled |

### Avatar

The `Avatar` component displays a user avatar with fallback.

#### Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

### Form

The `Form` component is a wrapper around react-hook-form with validation.

#### Usage

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define form schema
const formSchema = z.object({
  username: z.string().min(2).max(50),
});

// Create form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: '',
  },
});

// Form component
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="shadcn" {...field} />
          </FormControl>
          <FormDescription>
            This is your public display name.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Label

The `Label` component is an accessible label for form elements.

#### Usage

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
```

## Component Best Practices

When using or creating components in the Pickleball Facility Owner Platform, follow these best practices:

1. **Use TypeScript**: Define proper types for component props to ensure type safety.
2. **Keep Components Focused**: Each component should have a single responsibility.
3. **Use Composition**: Compose complex components from simpler ones.
4. **Consistent Naming**: Follow the established naming conventions.
5. **Accessibility**: Ensure components are accessible with proper ARIA attributes.
6. **Responsive Design**: Components should work well on all screen sizes.
7. **Performance**: Optimize components for performance, using memoization when appropriate.
8. **Testing**: Write tests for components to ensure they work as expected.
9. **Documentation**: Document component props and usage examples.
10. **Reusability**: Design components to be reusable across the application.

## Creating New Components

When creating new components:

1. Create a new file in the appropriate directory (e.g., `src/components/ui` for UI components).
2. Define the component with proper TypeScript types.
3. Export the component as a named export.
4. Write tests for the component.
5. Document the component in this documentation file.

Example:

```tsx
// src/components/ui/my-component.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

## Extending Existing Components

When extending existing components:

1. Use composition to extend functionality.
2. Maintain backward compatibility.
3. Update tests to cover new functionality.
4. Update documentation to reflect changes.

Example:

```tsx
import { Button } from '@/components/ui/button';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading: boolean;
}

export function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? <Spinner className="mr-2" /> : null}
      {children}
    </Button>
  );
}