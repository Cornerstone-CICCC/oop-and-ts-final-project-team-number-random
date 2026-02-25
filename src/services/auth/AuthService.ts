import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import type { User as FirebaseUser, Unsubscribe, Auth } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore, Timestamp } from "firebase/firestore";
import type {
  IUser,
  LoginCredentials,
  SignupCredentials,
  UserDocument,
  FirebaseAuthErrorCode,
} from "@/types";
import type { IAuthService } from "@/services/interfaces";
import { AppError, AuthError, NotFoundError } from "@/errors";

/**
 * AuthService - Authentication operations
 * Implements IAuthService interface (SRP - Single Responsibility)
 *
 * Deep Module: Simple interface hiding Firebase complexity (APoSD)
 */
export class AuthService implements IAuthService {
  private readonly usersCollection = "users";
  private readonly auth: Auth;
  private readonly db: Firestore;

  constructor(auth: Auth, db: Firestore) {
    this.auth = auth;
    this.db = db;
  }

  async signUp(credentials: SignupCredentials): Promise<IUser> {
    const { email, password, displayName } = credentials;

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update display name in Firebase Auth
      await firebaseUpdateProfile(firebaseUser, { displayName });

      // Create user profile document in Firestore
      const now = serverTimestamp();
      const userDoc: Omit<UserDocument, "id"> = {
        email,
        displayName,
        photoURL: null,
        createdAt: now as unknown as Timestamp,
        updatedAt: now as unknown as Timestamp,
        lastLoginAt: now as unknown as Timestamp,
      };

      await setDoc(
        doc(this.db, this.usersCollection, firebaseUser.uid),
        userDoc
      );

      return {
        id: firebaseUser.uid,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AuthError(this.getErrorMessage(error), error);
    }
  }

  async signIn(credentials: LoginCredentials): Promise<IUser> {
    const { email, password } = credentials;

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update last login time in Firestore
      await updateDoc(doc(this.db, this.usersCollection, firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Fetch and return the user profile
      const docRef = doc(this.db, this.usersCollection, firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new NotFoundError("User profile", firebaseUser.uid);
      }

      return this.convertDocumentToUser(
        firebaseUser.uid,
        docSnap.data() as UserDocument
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AuthError(this.getErrorMessage(error), error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AuthError("Failed to sign out", error);
    }
  }

  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): Unsubscribe {
    return onAuthStateChanged(this.auth, callback);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  getErrorMessage(error: unknown): string {
    // Handle our custom errors
    if (error instanceof AppError) {
      return error.message;
    }

    // Handle Firebase errors
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code as FirebaseAuthErrorCode;
      const messages: Record<FirebaseAuthErrorCode, string> = {
        "auth/email-already-in-use": "This email is already registered",
        "auth/invalid-email": "Invalid email address",
        "auth/operation-not-allowed": "Email/password accounts are not enabled",
        "auth/weak-password": "Password is too weak (minimum 6 characters)",
        "auth/user-disabled": "This account has been disabled",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/invalid-credential": "Invalid email or password",
        "auth/too-many-requests":
          "Too many failed attempts. Please try again later",
        "auth/requires-recent-login":
          "Please sign in again to perform this action",
      };
      return messages[code] || `Authentication error: ${code}`;
    }

    return error instanceof Error ? error.message : "An unknown error occurred";
  }

  private convertDocumentToUser(userId: string, data: UserDocument): IUser {
    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: this.timestampToDate(data.createdAt),
      updatedAt: this.timestampToDate(data.updatedAt),
      lastLoginAt: this.timestampToDate(data.lastLoginAt),
    };
  }

  private timestampToDate(timestamp: Timestamp): Date {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    return new Date();
  }
}
