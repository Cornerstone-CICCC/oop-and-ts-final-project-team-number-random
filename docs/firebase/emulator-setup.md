# Firebase Emulator Setup Guide

## Overview

Firebase Emulator Suite is a tool for emulating Firebase services in your local environment. It allows you to develop and test without affecting the production environment.

## Project Structure

```
firebase-emulator/
├── firebase.json          # Emulator configuration
├── .firebaserc            # Project configuration
├── firestore.rules        # Firestore security rules
├── Dockerfile.firebase    # Docker image definition
└── docker-compose.yml     # Docker Compose configuration
```

### Port Configuration

| Service            | Port | URL                   |
| ------------------ | ---- | --------------------- |
| Auth Emulator      | 9099 | http://localhost:9099 |
| Firestore Emulator | 8080 | http://localhost:8080 |
| Emulator UI        | 4000 | http://localhost:4000 |

## Starting the Emulator

### Using npm scripts (Required)

All Docker operations must be done through npm scripts defined in `package.json`.

```bash
# Start the Emulator
npm run emulator:run

# Start with rebuild (after Dockerfile changes)
npm run emulator:run:build

# Stop the Emulator
npm run emulator:down
```

> **Note**: Do not use `docker compose` commands directly. Always use npm scripts to ensure consistency.

## Using the Emulator UI

Open http://localhost:4000 in your browser to access the Emulator Suite UI.

### Authentication Tab

- View list of created users
- Manually create new users
- Delete users
- Reset passwords

### Firestore Tab

- Browse collections and documents
- Manually add, edit, and delete data
- Execute queries
- Test security rules

## Client Connection Configuration

### Automatic Connection (Recommended)

The connection to the Emulator is automatically configured in `src/lib/firebase/config.ts`:

```typescript
// Auto-connect in development mode
if (import.meta.env.DEV) {
  connectToEmulators();
}
```

### Manual Connection

```typescript
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

// Connect to Auth Emulator
connectAuthEmulator(auth, "http://localhost:9099", {
  disableWarnings: true,
});

// Connect to Firestore Emulator
connectFirestoreEmulator(db, "localhost", 8080);
```

## Resetting Data

### Method 1: From Emulator UI

1. Open http://localhost:4000
2. Delete documents in the Firestore tab
3. Delete users in the Authentication tab

### Method 2: Delete Data Directory

```bash
# Stop the Emulator
npm run emulator:down

# Restart the Emulator
npm run emulator:run
```

## Troubleshooting

### Cannot Connect to Emulator

1. Check if Docker is running

   ```bash
   docker ps
   ```

2. Check if ports are in use

   ```bash
   lsof -i :9099
   lsof -i :8080
   lsof -i :4000
   ```

3. Check Emulator logs (run emulator without `-d` flag to see logs)
   ```bash
   npm run emulator:run
   ```

### Hot Reload Errors

During development, errors may occur when reconnecting to the Emulator after Vite's Hot Reload. This is handled in `config.ts` and can usually be safely ignored.

### Security Rules Errors

If errors occur when reading/writing to Firestore:

1. Check "Rules" in the Firestore tab of Emulator UI
2. Verify there are no syntax errors in `firestore.rules`
3. If rules require authentication, confirm the user is logged in

## About Project ID

This project uses the project ID `demo-kanban`.

- The `demo-` prefix is exclusive to Firebase Emulator
- It does not connect to any production Firebase project
- API keys don't need to be real

## Development Workflow

1. **Start Emulator**

   ```bash
   npm run emulator:run
   ```

2. **Start App** (in another terminal)

   ```bash
   npm run dev
   ```

3. **Development**
   - Edit code
   - Check in browser
   - Verify data in Emulator UI (http://localhost:4000)

4. **When Finished**
   ```bash
   npm run emulator:down
   ```

## Reference Links

- [Firebase Emulator Suite Official Documentation](https://firebase.google.com/docs/emulator-suite)
- [Local Firestore Development](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [Local Auth Development](https://firebase.google.com/docs/emulator-suite/connect_auth)
