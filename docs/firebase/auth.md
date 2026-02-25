# Firebase Authentication Guide

## Overview

Firebase Authentication is a service that makes implementing user authentication easy. This project uses **Email/Password authentication**.

## Setup

### 1. Import Firebase SDK

```typescript
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  User,
} from "firebase/auth";
```

### 2. Get Auth Instance

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

## Main Methods

### createUserWithEmailAndPassword

Creates a new user.

```typescript
import { createUserWithEmailAndPassword } from "firebase/auth";

try {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  console.log("User created:", user.uid);
} catch (error) {
  console.error("Error:", error.code, error.message);
}
```

**Parameters:**
- `auth`: Auth instance
- `email`: User's email address
- `password`: Password (minimum 6 characters)

**Returns:** `UserCredential` object

### signInWithEmailAndPassword

Signs in an existing user.

```typescript
import { signInWithEmailAndPassword } from "firebase/auth";

try {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  console.log("Signed in:", user.uid);
} catch (error) {
  console.error("Error:", error.code, error.message);
}
```

### signOut

Signs out the current user.

```typescript
import { signOut } from "firebase/auth";

try {
  await signOut(auth);
  console.log("Signed out successfully");
} catch (error) {
  console.error("Error:", error.message);
}
```

### onAuthStateChanged

Monitors authentication state changes. This is a **very important** method.

```typescript
import { onAuthStateChanged } from "firebase/auth";

// Start subscription
const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User signed in:", user.uid);
  } else {
    // User is signed out
    console.log("User signed out");
  }
});

// Unsubscribe (call during component cleanup)
unsubscribe();
```

**React usage example:**

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  return () => unsubscribe(); // Cleanup
}, []);
```

### updateProfile

Updates the user's profile (displayName, photoURL).

```typescript
import { updateProfile } from "firebase/auth";

await updateProfile(auth.currentUser, {
  displayName: "New Name",
  photoURL: "https://example.com/photo.jpg",
});
```

### deleteUser

Deletes the user account.

```typescript
import { deleteUser } from "firebase/auth";

await deleteUser(auth.currentUser);
```

⚠️ **Note:** This method may require recent authentication (`auth/requires-recent-login` error).

## User Object

Main properties of the User object obtained after authentication:

| Property | Type | Description |
|----------|------|-------------|
| `uid` | string | User's unique identifier |
| `email` | string \| null | Email address |
| `displayName` | string \| null | Display name |
| `photoURL` | string \| null | Profile image URL |
| `emailVerified` | boolean | Whether email is verified |

## Error Handling

Firebase Auth errors can be identified by their `code` property.

```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  switch (error.code) {
    case "auth/user-not-found":
      console.log("User not found");
      break;
    case "auth/wrong-password":
      console.log("Incorrect password");
      break;
    case "auth/invalid-email":
      console.log("Invalid email address");
      break;
    case "auth/too-many-requests":
      console.log("Too many requests");
      break;
    default:
      console.log("Error:", error.message);
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `auth/email-already-in-use` | Email address is already in use |
| `auth/invalid-email` | Invalid email format |
| `auth/weak-password` | Weak password (less than 6 characters) |
| `auth/user-not-found` | User does not exist |
| `auth/wrong-password` | Incorrect password |
| `auth/invalid-credential` | Invalid credentials |
| `auth/too-many-requests` | Too many requests |
| `auth/requires-recent-login` | Recent authentication required |

## Using with Emulator

Connect to Firebase Emulator during development.

```typescript
import { connectAuthEmulator } from "firebase/auth";

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099", {
    disableWarnings: true,
  });
}
```

## Best Practices

1. **Use onAuthStateChanged**: Monitor state with `onAuthStateChanged` instead of directly checking `auth.currentUser`

2. **Error Handling**: Wrap all authentication operations in try-catch

3. **Loading State**: Display appropriate loading UI while checking authentication state

4. **Cleanup**: Always call unsubscribe when subscribing in useEffect

5. **Security**: Don't log passwords, only process on client-side

## Reference Links

- [Firebase Auth Official Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Web API Reference](https://firebase.google.com/docs/reference/js/auth)
