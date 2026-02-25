# Project Architecture Guide

## Table of Contents

- [Overview](#overview)
- [Why This Architecture in 2026](#why-this-architecture-in-2026)
- [Directory Structure](#directory-structure)
- [Architectural Principles](#architectural-principles)
- [Layer Responsibilities](#layer-responsibilities)
- [Design Patterns Used](#design-patterns-used)
- [Testing Strategy](#testing-strategy)
- [Related Documentation](#related-documentation)
- [References](#references)

---

## Overview

This project implements a modern React application architecture based on three foundational pillars:

1. **A Philosophy of Software Design (APoSD)** by John Ousterhout
2. **SOLID Principles** by Robert C. Martin
3. **2026 React Best Practices** from the React and TypeScript communities

The architecture prioritizes **maintainability**, **testability**, and **scalability** while keeping complexity manageable.

---

## Why This Architecture in 2026

### The Problem with Traditional React Architectures

Early React applications (2016-2022) often suffered from:

- **God Components**: Single components handling UI, state, API calls, and business logic
- **Prop Drilling**: Passing data through multiple component layers
- **Tight Coupling**: Components directly importing Firebase, Axios, or other libraries
- **Untestable Code**: Business logic embedded in components made unit testing difficult
- **Feature Fragmentation**: Related code scattered across `components/`, `utils/`, `api/` folders

### Why These Principles Matter Now

#### 1. AI-Assisted Development

In 2026, developers frequently use AI coding assistants. Clean architecture with clear boundaries helps AI tools:

- Understand component responsibilities quickly
- Generate code that follows existing patterns
- Refactor with confidence due to interface contracts

#### 2. Team Scalability

Modern teams are often distributed and asynchronous. This architecture enables:

- **Parallel Development**: Teams can work on features independently
- **Clear Ownership**: Each feature folder has a clear scope
- **Reduced Merge Conflicts**: Isolated feature directories minimize overlapping changes

#### 3. Framework Agnosticism

The service layer abstraction allows:

- Swapping Firebase for Supabase without touching React components
- Easy migration between state management solutions
- Backend-for-frontend (BFF) pattern adoption when needed

#### 4. Testing Evolution

Modern testing emphasizes:

- **Unit Testing Services**: Pure TypeScript classes are trivial to test
- **Integration Testing Components**: Components depend on interfaces, not implementations
- **Mocking via DI**: ServiceProvider makes dependency injection natural

---

## Directory Structure

```
src/
├── components/          # Shared, reusable UI components
│   ├── ui/              # Atomic design components (Button, Input, Modal)
│   ├── layouts/         # Page layout components (Header, AuthLayout)
│   └── index.ts         # Public exports
│
├── features/            # Feature-based modules (domain-driven)
│   ├── users/           # User authentication & profile feature
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific custom hooks
│   │   └── index.ts     # Public API for this feature
│   │
│   ├── kanban/          # Kanban board feature
│   │   ├── components/
│   │   └── index.ts
│   │
│   └── tasks/           # Task management feature
│
├── services/            # Business logic & external integrations
│   ├── interfaces/      # Service contracts (DIP)
│   │   ├── IAuthService.ts
│   │   └── IProfileService.ts
│   ├── auth/            # Authentication service implementation
│   ├── profile/         # Profile service implementation
│   └── index.ts         # ServiceProvider & hooks
│
├── contexts/            # React Context providers
│   ├── auth/            # Auth reducer & types
│   │   └── authReducer.ts
│   └── AuthContext.tsx  # Authentication context
│
├── hooks/               # Shared custom hooks
│   ├── useForm.ts       # Generic form state management
│   └── useAuth.ts       # Simplified auth hook
│
├── types/               # TypeScript type definitions
│   └── user.types.ts    # User-related types
│
├── lib/                 # External library configurations
│   └── firebase/        # Firebase initialization
│
├── utils/               # Pure utility functions
│   └── formatting.ts    # Date/string formatting
│
└── assets/              # Static assets (images, fonts)
```

---

## Architectural Principles

### 1. Deep Modules (APoSD)

**Principle**: Modules should have simple interfaces that hide complex implementations.

**Problem (Shallow Module)**:

```typescript
// Bad: Interface as complex as implementation
class UserService {
  async createUser(email: string, password: string, displayName: string) { ... }
  async signIn(email: string, password: string) { ... }
  async updateProfile(userId: string, displayName?: string, photoURL?: string) { ... }
}
```

**Solution (Deep Module)**:

```typescript
// Good: Simple interface hiding Firebase complexity
interface IAuthService {
  signUp(credentials: SignupCredentials): Promise<IUser>;
  signIn(credentials: LoginCredentials): Promise<IUser>;
  signOut(): Promise<void>;
}

class AuthService implements IAuthService {
  // Internally handles:
  // - Firebase Auth user creation
  // - Firebase Auth profile update
  // - Firestore document creation
  // - Timestamp conversions
  // - Error code mapping
}
```

The caller doesn't need to know about Firebase, Firestore, or timestamp handling.

### 2. Single Responsibility Principle (SRP)

**Principle**: A class/module should have only one reason to change.

**Implementation in this project**:

| Module           | Single Responsibility          |
| ---------------- | ------------------------------ |
| `AuthService`    | Authentication operations only |
| `ProfileService` | Profile CRUD operations only   |
| `authReducer`    | State transition logic only    |
| `AuthContext`    | Wiring services to React only  |
| `useLoginForm`   | Login form logic only          |
| `LoginForm`      | Login UI rendering only        |

### 3. Dependency Inversion Principle (DIP)

**Principle**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Implementation**:

```
┌─────────────────┐     depends on     ┌──────────────────┐
│   AuthContext   │ ─────────────────► │   IAuthService   │ ◄─── Interface
└─────────────────┘                    └──────────────────┘
                                              ▲
                                              │ implements
                                              │
                                       ┌──────────────────┐
                                       │   AuthService    │ ◄─── Implementation
                                       └──────────────────┘
                                              │
                                              │ uses
                                              ▼
                                       ┌──────────────────┐
                                       │  Firebase Auth   │ ◄─── External Library
                                       └──────────────────┘
```

**Why this matters**:

- `AuthContext` can be tested with mock services
- Firebase can be swapped without touching React components
- Implementations can be changed without changing consumers

### 4. Interface Segregation Principle (ISP)

**Principle**: Clients should not be forced to depend on interfaces they don't use.

**Before (Fat Interface)**:

```typescript
interface IUserService {
  signUp(...): Promise<IUser>;
  signIn(...): Promise<IUser>;
  signOut(): Promise<void>;
  getProfile(...): Promise<IUser>;
  updateProfile(...): Promise<IUser>;
  deleteAccount(...): Promise<void>;
  getAllUsers(): Promise<IUser[]>;
}
```

**After (Segregated Interfaces)**:

```typescript
interface IAuthService {
  signUp(...): Promise<IUser>;
  signIn(...): Promise<IUser>;
  signOut(): Promise<void>;
}

interface IProfileService {
  getProfile(...): Promise<IUser>;
  updateProfile(...): Promise<IUser>;
  deleteAccount(...): Promise<void>;
  getAllProfiles(): Promise<IUser[]>;
}
```

Components that only need authentication don't depend on profile methods.

### 5. Information Hiding (APoSD)

**Principle**: Hide complexity behind simple abstractions.

**Examples**:

| What's Hidden                | Where                           | Public Interface          |
| ---------------------------- | ------------------------------- | ------------------------- |
| Firebase error codes         | `AuthService.getErrorMessage()` | User-friendly strings     |
| Timestamp conversion         | `ProfileService`                | JavaScript `Date` objects |
| Firestore document structure | Services                        | `IUser` interface         |
| Form validation rules        | `useLoginForm`                  | `errors` object           |
| Reducer action types         | `authReducer`                   | `dispatch` function       |

---

## Layer Responsibilities

### UI Layer (`components/`, `features/*/components/`)

**Responsibility**: Rendering and user interaction

**Rules**:

- ✅ Receive data via props or hooks
- ✅ Dispatch user actions
- ✅ Handle local UI state (modals, tooltips)
- ❌ No direct API calls
- ❌ No business logic

### Hook Layer (`hooks/`, `features/*/hooks/`)

**Responsibility**: Encapsulate reusable stateful logic

**Rules**:

- ✅ Manage component state
- ✅ Call context methods
- ✅ Handle form validation
- ❌ No direct service instantiation
- ❌ No UI rendering

### Context Layer (`contexts/`)

**Responsibility**: Global state management and service wiring

**Rules**:

- ✅ Use `useReducer` for complex state
- ✅ Provide stable callbacks via `useCallback`
- ✅ Connect services to React tree
- ❌ No business logic implementation
- ❌ No direct Firebase calls

### Service Layer (`services/`)

**Responsibility**: Business logic and external integrations

**Rules**:

- ✅ Implement business operations
- ✅ Handle external API communication
- ✅ Transform data formats
- ✅ Map error codes to messages
- ❌ No React dependencies
- ❌ No UI concerns

### Type Layer (`types/`)

**Responsibility**: Type definitions and contracts

**Rules**:

- ✅ Define interfaces and types
- ✅ Export type-only declarations
- ❌ No runtime code
- ❌ No implementation details

---

## Design Patterns Used

### 1. Provider Pattern (Dependency Injection)

```typescript
// ServiceProvider.tsx
export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo(() => ({
    authService: new AuthService(auth, db),
    profileService: new ProfileService(auth, db),
  }), []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}
```

**Benefits**:

- Services instantiated once at app startup
- Easy to swap implementations for testing
- Clear dependency graph

### 2. Reducer Pattern (State Machine)

```typescript
// authReducer.ts
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, isLoading: false, user: action.payload.user };
    // ...
  }
}
```

**Benefits**:

- Predictable state transitions
- Easy to test (pure function)
- Actions are documented in types

### 3. Composition Pattern (UI Components)

```typescript
// Usage in LoginForm
<AuthLayout
  title="Welcome Back"
  description="Sign in to continue"
>
  <Input
    label="Email"
    error={errors.email}
    {...register("email")}
  />
  <Button variant="primary" loading={isSubmitting}>
    Sign In
  </Button>
</AuthLayout>
```

**Benefits**:

- Consistent styling across app
- Changes propagate automatically
- Self-documenting via props

### 4. Custom Hook Pattern (Logic Extraction)

```typescript
// useLoginForm.ts
export function useLoginForm() {
  const { signIn } = useAuthContext();

  return useForm({
    initialValues: { email: "", password: "" },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      await signIn(values);
    },
  });
}
```

**Benefits**:

- Separates logic from UI
- Reusable across components
- Testable in isolation

---

## Testing Strategy

| Layer      | Test Type   | Tools                       |
| ---------- | ----------- | --------------------------- |
| Services   | Unit        | Vitest, Mock Firebase       |
| Hooks      | Unit        | React Testing Library hooks |
| Components | Integration | React Testing Library       |
| Features   | E2E         | Playwright                  |

---

## Related Documentation

- [Style Guide](./style-guide.md) - TypeScript conventions, naming, and import guidelines

---

## References

- [A Philosophy of Software Design](https://www.amazon.com/Philosophy-Software-Design-John-Ousterhout/dp/1732102201) - John Ousterhout
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Robert C. Martin
- [React Documentation](https://react.dev/) - Official React Docs
- [Bulletproof React](https://github.com/alan2207/bulletproof-react) - React Architecture Guide
