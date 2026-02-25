import {
  updateProfile as firebaseUpdateProfile,
  deleteUser,
} from "firebase/auth";
import type { Auth } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore, Timestamp } from "firebase/firestore";
import type { IUser, UpdateProfileDTO, UserDocument } from "@/types";
import type { IProfileService } from "@/services/interfaces";
import {
  AppError,
  NotFoundError,
  PermissionError,
  NetworkError,
} from "@/errors";

/**
 * ProfileService - User profile CRUD operations
 * Implements IProfileService interface (SRP - Single Responsibility)
 *
 * Deep Module: Simple interface hiding Firestore complexity (APoSD)
 */
export class ProfileService implements IProfileService {
  private readonly usersCollection = "users";
  private readonly auth: Auth;
  private readonly db: Firestore;

  constructor(auth: Auth, db: Firestore) {
    this.auth = auth;
    this.db = db;
  }

  async getProfile(userId: string): Promise<IUser> {
    try {
      const docRef = doc(this.db, this.usersCollection, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new NotFoundError("User profile", userId);
      }

      return this.convertDocumentToUser(userId, docSnap.data() as UserDocument);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new NetworkError("Failed to fetch user profile", error);
    }
  }

  async getAllProfiles(): Promise<IUser[]> {
    try {
      const querySnapshot = await getDocs(
        collection(this.db, this.usersCollection)
      );
      return querySnapshot.docs.map((doc) =>
        this.convertDocumentToUser(doc.id, doc.data() as UserDocument)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new NetworkError("Failed to fetch user profiles", error);
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<IUser> {
    const currentUser = this.auth.currentUser;

    // Verify the user is updating their own profile
    if (!currentUser || currentUser.uid !== userId) {
      throw new PermissionError("You can only update your own profile");
    }

    try {
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

      await updateDoc(doc(this.db, this.usersCollection, userId), updateData);

      return this.getProfile(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new NetworkError("Failed to update profile", error);
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    const currentUser = this.auth.currentUser;

    // Verify the user is deleting their own account
    if (!currentUser || currentUser.uid !== userId) {
      throw new PermissionError("You can only delete your own account");
    }

    try {
      // Delete Firestore profile first (while still authenticated)
      await deleteDoc(doc(this.db, this.usersCollection, userId));

      // Delete Firebase Auth user
      await deleteUser(currentUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new NetworkError("Failed to delete account", error);
    }
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
