# Code Style Guide

## Table of Contents

- [TypeScript Conventions](#typescript-conventions)
- [File Naming Conventions](#file-naming-conventions)
- [Import Guidelines](#import-guidelines)
- [Responsive Design](#responsive-design)

---

## TypeScript Conventions

### Prefer `type` over `interface`

In 2026 TypeScript development, `type` should be the default choice for type definitions. The primary reasons are **consistency** and **predictability**.

#### 1. Expressive Consistency

`type` can handle all advanced features: Union types (`A | B`), Intersection types (`A & B`), Mapped Types, and Conditional Types. Since `interface` cannot express all of these, projects inevitably end up mixing both. By standardizing on `type`, we minimize cognitive load and maintain visual consistency across the codebase.

```typescript
// Prefer: type handles everything uniformly
type Result<T> = Success<T> | Failure;
type UserWithTimestamp = User & { createdAt: Date };

// Avoid: interface cannot express unions
interface Result<T> { ... } // How to represent Success | Failure?
```

#### 2. Preventing Unintended Extension

`interface` supports Declaration Merging—multiple declarations with the same name automatically merge. While useful for library authors extending global types, this behavior can cause unexpected side effects in application code. `type` does not allow redefinition, making types effectively immutable and improving predictability.

```typescript
// Dangerous: interface merges silently
interface User {
  name: string;
}
interface User {
  age: number;
} // Merged! Now has both properties

// Safe: type prevents accidental redefinition
type User = { name: string };
type User = { age: number }; // Error: Duplicate identifier
```

#### 3. Modern Developer Experience

TypeScript's compiler has evolved significantly. In 2026:

- Error messages for `type` are as clear as those for `interface`
- Performance differences are imperceptible except in Google-scale monorepos
- IDE tooling treats both equally well

#### Guideline

> **Use `type` by default. Reserve `interface` only for library development where external extension is an explicit design goal.**

---

## File Naming Conventions

| Type            | Convention                       | Example           |
| --------------- | -------------------------------- | ----------------- |
| React Component | PascalCase                       | `LoginForm.tsx`   |
| Custom Hook     | camelCase with `use` prefix      | `useLoginForm.ts` |
| Service Class   | PascalCase with `Service` suffix | `AuthService.ts`  |
| Interface       | PascalCase with `I` prefix       | `IAuthService.ts` |
| Types           | kebab-case with `.types` suffix  | `user.types.ts`   |
| Utility         | camelCase                        | `formatting.ts`   |
| Index           | Always `index.ts`                | `index.ts`        |

---

## Import Guidelines

### Prefer Barrel Exports

```typescript
// Good: Import from feature index
import { LoginForm, SignupForm } from "@/features/users";

// Avoid: Deep imports
import { LoginForm } from "@/features/users/components/LoginForm";
```

### Layer Import Rules

```
✅ components → hooks → contexts → services
❌ services → contexts (services should be pure)
❌ hooks → components (avoid circular deps)
```

### Import Order

Organize imports in the following order:

1. External libraries (React, third-party)
2. Internal aliases (`@/`)
3. Relative imports (`./`, `../`)

```typescript
// 1. External
import { useState } from "react";
import { clsx } from "clsx";

// 2. Internal aliases
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";

// 3. Relative
import { validateEmail } from "./validation";
import type { FormProps } from "./types";
```

---

## UI & Aesthetics

### Modern Premium Light Theme

This project follows a modern, premium light theme aesthetic. When building new components, adhere to the following principles:

- **Backgrounds**: Use clean white (`bg-white`) for cards and prominent surfaces, and light slate (`bg-slate-50`) for application backgrounds.
- **Subtle Shadows**: Rely on subtle shadows (`shadow-sm`, `hover:shadow`) to create depth without relying heavily on borders.
- **Micro-Animations**: Enhance interactivity with smooth transitions. For interactive elements like buttons or cards, use `transition-all` and subtle scaling effects like `active:scale-[0.98]`.
- **Borders**: Keep borders light and unobtrusive (`border-slate-200`).

```tsx
// Example of a modern card component
<div className="bg-white rounded-xl shadow-sm hover:shadow border border-slate-200 transition-all">
  {content}
</div>
```

---

## Responsive Design

### Mobile-First Approach

Tailwind CSS uses a **mobile-first** breakpoint system. This means:

- **Unprefixed utilities** apply to all screen sizes (mobile and up)
- **Prefixed utilities** (e.g., `sm:`, `md:`) apply at that breakpoint and above

> **Always start with mobile styles, then add complexity for larger screens.**

```typescript
// Good: Mobile-first approach
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">...</div>
</div>

// Avoid: Desktop-first (requires overrides)
<div className="flex-row md:flex-col"> // Confusing!
```

### Standard Breakpoints

Use Tailwind's default breakpoints consistently across the project:

| Prefix | Minimum Width | Typical Devices                          |
| ------ | ------------- | ---------------------------------------- |
| (none) | 0px           | Mobile phones (portrait)                 |
| `sm:`  | 640px         | Mobile phones (landscape), small tablets |
| `md:`  | 768px         | Tablets                                  |
| `lg:`  | 1024px        | Laptops, small desktops                  |
| `xl:`  | 1280px        | Desktops                                 |
| `2xl:` | 1536px        | Large desktops                           |

### Responsive Patterns

#### 1. Container Layout

Use consistent container patterns with responsive padding:

```typescript
// Standard page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

#### 2. Responsive Grid

Stack on mobile, expand columns on larger screens:

```typescript
// Good: Mobile stack → 2 cols → 3 cols
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### 3. Responsive Typography

Adjust font sizes for readability across devices:

```typescript
// Headings should scale
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>

// Body text is usually fine without scaling
<p className="text-base text-slate-600">...</p>
```

#### 4. Visibility Control

Show/hide elements based on screen size:

```typescript
// Hide on mobile, show on larger screens
<span className="hidden sm:block">Full Label</span>

// Show on mobile only
<span className="sm:hidden">Short</span>

// Responsive navigation pattern
<nav className="hidden md:flex gap-4">...</nav>
<button className="md:hidden">Menu</button>
```

#### 5. Flexible Heights

Avoid fixed pixel heights; use relative or viewport units responsively:

```typescript
// Good: Responsive height
<div className="h-[50vh] md:h-[calc(100vh-8rem)]">...</div>

// Avoid: Fixed heights that break on different devices
<div className="h-[600px]">...</div>
```

#### 6. Touch-Friendly Sizing

Ensure interactive elements are easily tappable on mobile (minimum 44x44px):

```typescript
// Good: Adequate touch target
<button className="px-4 py-3 min-h-[44px]">Submit</button>

// Links in navigation
<a className="p-2 -m-2">...</a> // Extended touch area
```

### Component-Specific Guidelines

#### Navigation/Header

- Collapse navigation into a hamburger menu on mobile (`md:hidden` / `hidden md:flex`)
- Ensure logo and critical actions remain visible on all sizes
- Use sticky positioning carefully (consider mobile viewport height)

#### Cards

- Full width on mobile, flexible grid on larger screens
- Use `min-w-0` with `truncate` to prevent text overflow
- Maintain consistent padding (`p-4` typically works across sizes)

#### Modals

- Use `mx-4` for mobile margin, `max-w-md` or `max-w-lg` for desktop constraint
- Consider `max-h-[90vh] overflow-y-auto` for long content
- Full-screen modals on mobile are acceptable for complex forms

#### Forms

- Stack labels and inputs vertically on mobile
- Use `w-full` for inputs to fill available space
- Button groups: stack vertically on mobile (`flex-col sm:flex-row`)

### Testing Checklist

When developing responsive components, verify:

- [ ] Layout doesn't break at standard breakpoints (320px, 640px, 768px, 1024px)
- [ ] Text remains readable without horizontal scrolling
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Critical content is visible without scrolling (above the fold)
- [ ] Images scale appropriately (`w-full h-auto object-cover`)
- [ ] Forms are usable on mobile keyboards (proper input types, autofocus)

### References

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Approach Best Practices](https://dev.to/hitesh_developer/20-tips-for-designing-mobile-first-with-tailwind-css-36km)

---

## TailwindCSS + React Patterns

### Class Merging with `cn` Utility

When working with conditional classes in React components, use the `cn` utility function that combines `clsx` and `tailwind-merge`. This pattern:

- Handles conditional class logic cleanly
- Resolves Tailwind class conflicts automatically
- Keeps class literals visible for Tailwind's compiler

#### Setup

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Usage

```typescript
// Good: Using cn for conditional classes
<button
  className={cn(
    "px-4 py-2 rounded-lg font-medium transition-all",
    variant === "primary" && "bg-indigo-600 text-white",
    variant === "secondary" && "bg-white border border-slate-200",
    disabled && "opacity-50 cursor-not-allowed",
    className // Allow parent overrides
  )}
>

// Avoid: Template literals without conflict resolution
<button
  className={`px-4 py-2 ${variant === "primary" ? "bg-indigo-600" : "bg-white"} ${className}`}
>
```

### Variant Object Pattern

For components with multiple visual variants, use the `Record<Variant, string>` pattern to centralize and type-safe variant styles.

```typescript
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
};

// Usage
<button className={cn(baseStyles, variantStyles[variant], className)}>
```

> **Avoid** inline ternary chains for variants. They become unreadable with more than 2-3 variants and are error-prone.

---

## Color Palette Consistency

### Primary Color: Indigo

This project uses **indigo** as the primary brand color. Always use `indigo-*` for:

- Primary buttons and CTAs
- Active/selected states
- Links and interactive elements
- Focus rings

```typescript
// Good: Consistent indigo usage
"bg-indigo-600 hover:bg-indigo-700";
"text-indigo-600 hover:text-indigo-700";
"focus:ring-indigo-500";
"ring-indigo-700/10";

// Avoid: Mixing blue/indigo inconsistently
"bg-blue-600 hover:bg-blue-700"; // Don't use blue for primary
```

### Neutral Color: Slate

Use **slate** for all neutral/gray tones:

| Use Case         | Color       |
| ---------------- | ----------- |
| Primary text     | `slate-900` |
| Secondary text   | `slate-700` |
| Muted text       | `slate-500` |
| Placeholder text | `slate-400` |
| Borders          | `slate-200` |
| Light borders    | `slate-100` |
| Background       | `slate-50`  |

```typescript
// Good: Consistent slate usage
"text-slate-700 border-slate-200 bg-slate-50";

// Avoid: Mixing gray/slate
"text-gray-700 border-gray-200 bg-gray-50"; // Don't use gray
```

### Semantic Colors

| Semantic | Color    | Usage                   |
| -------- | -------- | ----------------------- |
| Success  | `green`  | Success messages, valid |
| Error    | `red`    | Errors, destructive     |
| Warning  | `yellow` | Warnings, caution       |
| Info     | `blue`   | Informational messages  |

---

## Component Reuse Guidelines

### Always Use Shared UI Components

When a shared UI component exists in `@/components/ui`, **always use it** instead of creating inline implementations.

```typescript
// Good: Using shared components
import { Button, Input, Alert, Modal } from "@/components/ui";

<Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
  <Alert variant="error">{error}</Alert>
  <Input label="Name" value={name} onChange={handleChange} />
  <Button variant="primary" isLoading={isLoading}>Save</Button>
</Modal>

// Avoid: Inline implementations when shared components exist
<div className="fixed inset-0 bg-black bg-opacity-50 ...">
  <div className="bg-white rounded-lg ...">
    <div className="bg-red-50 border border-red-200 ...">{error}</div>
    <input className="w-full px-3 py-2 border ..." />
    <button className="bg-blue-600 text-white ...">Save</button>
  </div>
</div>
```

### Benefits of Component Reuse

1. **Consistency**: Ensures uniform styling across the app
2. **Maintainability**: Changes propagate automatically
3. **Type Safety**: Props are typed and validated
4. **Accessibility**: Shared components include a11y features

---

## CVA for Complex Components (Optional)

For components with multiple variant dimensions, consider using [Class Variance Authority (CVA)](https://cva.style/docs):

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
        secondary: "bg-white border border-slate-200 text-slate-700",
        danger: "bg-red-600 hover:bg-red-700 text-white",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: ReactNode;
};

export function Button({ variant, size, children }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })}>{children}</button>;
}
```

> **Note**: CVA is optional. For simple components with 1-2 variant dimensions, the `Record<Variant, string>` pattern is sufficient.

### References

- [CVA Documentation](https://cva.style/docs)
- [Tailwind Merge](https://github.com/dcastil/tailwind-merge)
- [clsx](https://github.com/lukeed/clsx)
