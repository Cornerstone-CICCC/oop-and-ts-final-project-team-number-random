# Error Handling Best Practices

## Table of Contents

- [Overview](#overview)
- [Error Types and Classification](#error-types-and-classification)
- [Custom Error Classes](#custom-error-classes)
- [Service Layer Error Handling](#service-layer-error-handling)
- [React Component Error Handling](#react-component-error-handling)
- [Error Boundary](#error-boundary)
- [Form Validation Errors](#form-validation-errors)
- [Async Operations](#async-operations)
- [Firebase Error Handling](#firebase-error-handling)
- [Logging and Monitoring](#logging-and-monitoring)
- [Implementation Checklist](#implementation-checklist)

---

## Overview

This guide establishes error handling patterns for React + TypeScript applications with Firebase backend. The goal is to provide:

- **Predictable error behavior** across the application
- **Type-safe error handling** with TypeScript
- **User-friendly error messages** without exposing implementation details
- **Centralized error logging** for debugging and monitoring

---

## Error Types and Classification

### Application Error Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Validation** | User input errors | Invalid email format |
| **Authentication** | Auth-related errors | Wrong password |
| **Authorization** | Permission errors | Cannot edit another user's profile |
| **Network** | Connection failures | Firebase offline |
| **Not Found** | Resource doesn't exist | User profile not found |
| **Unknown** | Unexpected errors | Runtime exceptions |

### Error Severity Levels

```typescript
type ErrorSeverity = "warning" | "error" | "critical";

// warning: User can retry or fix (validation errors)
// error: Something went wrong but app continues (network timeout)
// critical: App cannot continue safely (auth state corrupted)
```

---

## Custom Error Classes

### Base Application Error

Define a base error class that all application-specific errors extend:

```typescript
// src/errors/AppError.ts
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly severity: "warning" | "error" | "critical";
  readonly originalError?: unknown;
  readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    options?: {
      severity?: "warning" | "error" | "critical";
      originalError?: unknown;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.severity = options?.severity ?? "error";
    this.originalError = options?.originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
```

### Domain-Specific Errors

```typescript
// src/errors/AuthError.ts
export class AuthError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "AUTH_ERROR", { originalError });
    this.name = "AuthError";
  }
}

// src/errors/ValidationError.ts
export class ValidationError extends AppError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", { severity: "warning" });
    this.name = "ValidationError";
    this.field = field;
  }
}

// src/errors/NotFoundError.ts
export class NotFoundError extends AppError {
  readonly resourceType: string;
  readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} not found: ${resourceId}`, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}
```

---

## Service Layer Error Handling

### Error Wrapping Pattern

Services should catch external errors and wrap them in application-specific errors:

```typescript
// Good: Wrap external errors with context
async getProfile(userId: string): Promise<IUser> {
  try {
    const docSnap = await getDoc(doc(this.db, "users", userId));

    if (!docSnap.exists()) {
      throw new NotFoundError("User", userId);
    }

    return this.convertDocumentToUser(userId, docSnap.data());
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Re-throw our custom errors
    }

    // Wrap Firebase errors
    throw new AppError(
      "Failed to fetch user profile",
      "NETWORK_ERROR",
      { originalError: error }
    );
  }
}

// Avoid: Exposing raw Firebase errors
async getProfile(userId: string): Promise<IUser> {
  const docSnap = await getDoc(doc(this.db, "users", userId));
  // Firebase error leaks to caller
}
```

### Error Message Mapping

Map external error codes to user-friendly messages:

```typescript
// src/services/errorMessages.ts
export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;

    const messages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/invalid-email": "Invalid email address",
      "auth/weak-password": "Password is too weak (minimum 6 characters)",
      "auth/user-not-found": "No account found with this email",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-credential": "Invalid email or password",
      "auth/too-many-requests": "Too many attempts. Please try again later",
    };

    return messages[code] ?? `Authentication error: ${code}`;
  }

  return error instanceof Error
    ? error.message
    : "An unknown error occurred";
}
```

---

## React Component Error Handling

### Error State Management

Use a consistent pattern for error state in components:

```typescript
// Good: Centralized error state in context
type AuthContextValue = AuthState & {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  clearError: () => void;
};

// Component accesses error from context
function LoginForm() {
  const { signIn, error, clearError } = useAuth();

  const handleSubmit = async (values: LoginCredentials) => {
    clearError(); // Clear previous errors
    try {
      await signIn(values);
    } catch {
      // Error is already set in context by signIn
    }
  };
}
```

### Error Display Pattern

```typescript
// Use shared Alert component for error display
import { Alert } from "@/components/ui";

function MyComponent() {
  const { error } = useSomeContext();

  return (
    <div>
      {error && <Alert variant="error">{error}</Alert>}
      {/* rest of component */}
    </div>
  );
}
```

---

## Error Boundary

### Implementation

Error Boundaries catch JavaScript errors in the component tree:

```typescript
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md">
              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 mb-4">
                We're sorry, but something unexpected happened. Please refresh
                the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### Usage

Wrap critical sections of your app:

```typescript
// Root level - catches everything
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Feature level - isolates feature crashes
<ErrorBoundary fallback={<KanbanErrorFallback />}>
  <KanbanBoard />
</ErrorBoundary>
```

### Limitations

Error Boundaries do NOT catch:
- Event handler errors
- Async errors (setTimeout, Promises)
- Server-side rendering errors
- Errors thrown in the boundary itself

For these cases, use try-catch in event handlers and async functions.

---

## Form Validation Errors

### Client-Side Validation

```typescript
// Validate before submission
function validateLoginForm(
  values: LoginCredentials
): Partial<Record<keyof LoginCredentials, string>> {
  const errors: Partial<Record<keyof LoginCredentials, string>> = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email format";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}
```

### Error Priority

When displaying errors, follow this priority:
1. **Field-level validation errors** - Show next to the specific field
2. **Server errors** - Show at the top of the form
3. **Generic errors** - Show as a toast or alert

---

## Async Operations

### Promise Error Handling

```typescript
// Good: Proper async error handling
const handleSubmit = async () => {
  setIsLoading(true);
  setError(null);

  try {
    await someAsyncOperation();
    onSuccess();
  } catch (error) {
    const message = error instanceof AppError
      ? error.message
      : "An unexpected error occurred";
    setError(message);
  } finally {
    setIsLoading(false);
  }
};

// Avoid: Unhandled promise rejection
const handleSubmit = async () => {
  await someAsyncOperation(); // Error bubbles up unhandled
};
```

### useCallback with Error Handling

```typescript
const signIn = useCallback(
  async (credentials: LoginCredentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const user = await authService.signIn(credentials);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error; // Re-throw if caller needs to handle
    }
  },
  [authService]
);
```

---

## Firebase Error Handling

### Firebase Auth Errors

Firebase Auth errors have a `code` property that can be typed:

```typescript
export type FirebaseAuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/requires-recent-login";
```

### Firestore Error Handling

```typescript
// Handle Firestore-specific errors
try {
  await setDoc(docRef, data);
} catch (error) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        throw new AppError("You don't have permission", "PERMISSION_DENIED");
      case "unavailable":
        throw new AppError("Service temporarily unavailable", "NETWORK_ERROR");
      default:
        throw new AppError("Database operation failed", "UNKNOWN_ERROR", {
          originalError: error,
        });
    }
  }
  throw error;
}
```

---

## Logging and Monitoring

### Development Logging

```typescript
// Development: Log full error details
if (import.meta.env.DEV) {
  console.error("Error details:", {
    message: error.message,
    code: error.code,
    stack: error.stack,
    originalError: error.originalError,
  });
}
```

### Production Error Tracking

For production, integrate an error tracking service (Sentry, LogRocket, etc.):

```typescript
// src/lib/errorTracking.ts
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    // Sentry.captureException(error, { extra: context });
  }

  console.error("Error captured:", error.message, context);
}
```

---

## Implementation Checklist

### Required

- [ ] **Error Boundary** at root level wrapping the app
- [ ] **Custom error types** for domain-specific errors
- [ ] **Firebase error mapping** for user-friendly messages
- [ ] **try-catch in all async operations** with proper error handling
- [ ] **Error state in context** for centralized error management
- [ ] **Alert component** for consistent error display

### Recommended

- [ ] Feature-level Error Boundaries for isolated failures
- [ ] Error logging service integration
- [ ] Retry logic for transient failures
- [ ] Offline detection and handling

### Anti-Patterns to Avoid

```typescript
// ❌ Empty catch blocks
try {
  await operation();
} catch {
  // Silent failure - never do this
}

// ❌ Using 'any' for error
} catch (error: any) {
  console.log(error.message); // No type safety
}

// ❌ Exposing internal errors to users
} catch (error) {
  setError(error.stack); // Never show stack trace
}

// ❌ Not clearing errors
const handleSubmit = async () => {
  // Previous error still shows
  await operation();
};
```

---

## References

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript Error Handling Best Practices](https://www.bacancytechnology.com/blog/typescript-best-practices)
- [Firebase Error Handling](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
- [react-error-boundary package](https://github.com/bvaughn/react-error-boundary)
