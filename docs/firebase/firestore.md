# Firebase Firestore Guide

## Overview

Firestore is a NoSQL cloud database provided by Firebase. It features real-time synchronization, offline support, and scalability.

## Data Structure

Firestore stores data in the following hierarchical structure:

```
Firestore
└── Collection
    └── Document
        └── Field / Subcollection
```

### Example: users collection

```
/users (collection)
├── user123 (document)
│   ├── email: "user@example.com"
│   ├── displayName: "John Doe"
│   └── createdAt: Timestamp
└── user456 (document)
    ├── email: "another@example.com"
    ├── displayName: "Jane Doe"
    └── createdAt: Timestamp
```

## Setup

### 1. Import Firestore SDK

```typescript
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
```

### 2. Get Firestore Instance

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

## Main Methods

### Getting References

#### doc() - Document Reference

```typescript
import { doc } from "firebase/firestore";

// Get reference to /users/user123
const userRef = doc(db, "users", "user123");
```

#### collection() - Collection Reference

```typescript
import { collection } from "firebase/firestore";

// Get reference to /users collection
const usersRef = collection(db, "users");
```

### CRUD Operations

#### setDoc() - Create/Overwrite Document

```typescript
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Create with specified document ID
await setDoc(doc(db, "users", "user123"), {
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: serverTimestamp(),
});
```

#### addDoc() - Create Document (Auto-generated ID)

```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Create with auto-generated document ID
const docRef = await addDoc(collection(db, "tasks"), {
  title: "New Task",
  status: "todo",
  createdAt: serverTimestamp(),
});
console.log("Created with ID:", docRef.id);
```

#### getDoc() - Get Single Document

```typescript
import { doc, getDoc } from "firebase/firestore";

const docRef = doc(db, "users", "user123");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log("Data:", docSnap.data());
} else {
  console.log("Document not found");
}
```

#### getDocs() - Get Multiple Documents

```typescript
import { collection, getDocs } from "firebase/firestore";

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, "=>", doc.data());
});
```

#### updateDoc() - Update Document

```typescript
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

const userRef = doc(db, "users", "user123");
await updateDoc(userRef, {
  displayName: "Updated Name",
  updatedAt: serverTimestamp(),
});
```

#### deleteDoc() - Delete Document

```typescript
import { doc, deleteDoc } from "firebase/firestore";

await deleteDoc(doc(db, "users", "user123"));
```

### Queries

#### query() + where() - Conditional Retrieval

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";

// Get tasks where status is "todo"
const q = query(
  collection(db, "tasks"),
  where("status", "==", "todo")
);

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

**where() comparison operators:**
- `==` : Equal to
- `!=` : Not equal to
- `<` : Less than
- `<=` : Less than or equal to
- `>` : Greater than
- `>=` : Greater than or equal to
- `array-contains` : Array contains
- `in` : Matches any of

#### orderBy() - Sorting

```typescript
import { collection, query, orderBy, getDocs } from "firebase/firestore";

// Sort by createdAt in descending order
const q = query(
  collection(db, "tasks"),
  orderBy("createdAt", "desc")
);
```

#### Compound Queries

```typescript
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const q = query(
  collection(db, "tasks"),
  where("status", "==", "todo"),
  orderBy("dueDate", "asc")
);
```

### Real-time Updates

#### onSnapshot() - Real-time Listener

```typescript
import { collection, query, onSnapshot } from "firebase/firestore";

const q = query(collection(db, "tasks"));

// Monitor changes in real-time
const unsubscribe = onSnapshot(q, (querySnapshot) => {
  const tasks = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  console.log("Current tasks:", tasks);
});

// Unsubscribe
unsubscribe();
```

**Detecting change types:**

```typescript
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      console.log("New:", change.doc.data());
    }
    if (change.type === "modified") {
      console.log("Modified:", change.doc.data());
    }
    if (change.type === "removed") {
      console.log("Removed:", change.doc.data());
    }
  });
});
```

## Handling Timestamps

### serverTimestamp() - Server Time

```typescript
import { serverTimestamp } from "firebase/firestore";

// Set server time when creating document
await setDoc(doc(db, "users", "user123"), {
  createdAt: serverTimestamp(),
});
```

### Converting Timestamp to Date

```typescript
import { Timestamp } from "firebase/firestore";

// Convert Timestamp retrieved from Firestore to Date
const data = docSnap.data();
const createdAt: Date = data.createdAt.toDate();
```

### Converting Date to Timestamp

```typescript
import { Timestamp } from "firebase/firestore";

// Convert JavaScript Date to Firestore Timestamp
const timestamp = Timestamp.fromDate(new Date());
```

## TypeScript Type Definitions

```typescript
import { Timestamp } from "firebase/firestore";

// Firestore document type
interface UserDocument {
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Application type (after Date conversion)
interface IUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Conversion function
function convertToUser(id: string, data: UserDocument): IUser {
  return {
    id,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}
```

## Using with Emulator

Connect to Firebase Emulator during development.

```typescript
import { connectFirestoreEmulator } from "firebase/firestore";

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

## Security Rules

Define access control in the `firestore.rules` file.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Best Practices

1. **Indexes**: Compound queries require indexes. Check errors in Emulator Console

2. **Batch Processing**: Use `writeBatch()` to combine multiple writes

3. **Unsubscribe**: Always cleanup `onSnapshot` with `unsubscribe()`

4. **serverTimestamp**: Use `serverTimestamp()` for time fields

5. **Transactions**: Use `runTransaction()` when updating multiple documents simultaneously

## Reference Links

- [Firestore Official Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Web API Reference](https://firebase.google.com/docs/reference/js/firestore_)
