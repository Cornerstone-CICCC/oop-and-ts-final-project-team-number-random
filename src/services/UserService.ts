import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  deleteUser,
} from "firebase/auth";
import type { User as FirebaseUser, Unsubscribe } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type {
  IUser,
  UserDocument,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileDTO,
  FirebaseAuthErrorCode,
} from "@/types";

/**
 * UserService - Singleton class for user authentication and profile management
 *
 * This service handles:
 * - Firebase Authentication (signup, signin, signout)
 * - Firestore user profile CRUD operations
 * - Auth state observation
 */
export class UserService {
  private static instance: UserService;
  private readonly usersCollection = "users";

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of UserService
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // ==========================================
  // Authentication Methods
  // ==========================================

  /**
   * Subscribe to authentication state changes
   * @param callback Function called when auth state changes
   * @returns Unsubscribe function to stop listening
   */
  public onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign up a new user with email and password
   * Creates both Firebase Auth user and Firestore profile
   */
  public async signUp(credentials: SignupCredentials): Promise<IUser> {
    const { email, password, displayName } = credentials;

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
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

    await setDoc(doc(db, this.usersCollection, firebaseUser.uid), userDoc);

    // Return the created user
    return {
      id: firebaseUser.uid,
      email,
      displayName,
      photoURL: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };
  }

  /**
   * Sign in an existing user with email and password
   */
  public async signIn(credentials: LoginCredentials): Promise<IUser> {
    const { email, password } = credentials;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Update last login time in Firestore
    await updateDoc(doc(db, this.usersCollection, firebaseUser.uid), {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Return the user profile
    return this.getUserProfile(firebaseUser.uid);
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /**
   * Get the current Firebase Auth user
   */
  public getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // ==========================================
  // Firestore Profile Methods
  // ==========================================

  /**
   * Get a user profile from Firestore
   */
  public async getUserProfile(userId: string): Promise<IUser> {
    const docRef = doc(db, this.usersCollection, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`User profile not found for ID: ${userId}`);
    }

    return this.convertDocumentToUser(userId, docSnap.data() as UserDocument);
  }

  /**
   * Get all user profiles (useful for task assignment dropdown)
   */
  public async getAllUsers(): Promise<IUser[]> {
    const querySnapshot = await getDocs(collection(db, this.usersCollection));
    return querySnapshot.docs.map((doc) =>
      this.convertDocumentToUser(doc.id, doc.data() as UserDocument)
    );
  }

  /**
   * Update user profile in both Firebase Auth and Firestore
   */
  public async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<IUser> {
    const currentUser = auth.currentUser;

    // Verify the user is updating their own profile
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("You can only update your own profile");
    }

    // Update Firebase Auth profile if displayName is provided
    if (data.displayName) {
      await firebaseUpdateProfile(currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL ?? currentUser.photoURL,
      });
    }

    // Update Firestore profile
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    if (data.photoURL !== undefined) {
      updateData.photoURL = data.photoURL;
    }

    await updateDoc(doc(db, this.usersCollection, userId), updateData);

    // Return updated profile
    return this.getUserProfile(userId);
  }

  /**
   * Delete user account completely (Firebase Auth + Firestore)
   * WARNING: This action is irreversible
   */
  public async deleteAccount(userId: string): Promise<void> {
    const currentUser = auth.currentUser;

    // Verify the user is deleting their own account
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("You can only delete your own account");
    }

    // Delete Firestore profile first (while still authenticated)
    await deleteDoc(doc(db, this.usersCollection, userId));

    // Delete Firebase Auth user
    // Note: This may require recent authentication
    await deleteUser(currentUser);
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Convert Firestore document to IUser type
   */
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

  /**
   * Convert Firestore Timestamp to JavaScript Date
   */
  private timestampToDate(timestamp: Timestamp): Date {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    // Fallback for server timestamp that hasn't been written yet
    return new Date();
  }

  /**
   * Get user-friendly error message for Firebase Auth errors
   */
  public getErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code as FirebaseAuthErrorCode;
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered",
        "auth/invalid-email": "Invalid email address",
        "auth/operation-not-allowed":
          "Email/password accounts are not enabled",
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
}

// Export singleton instance for convenience
export const userService = UserService.getInstance();
