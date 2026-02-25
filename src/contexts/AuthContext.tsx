import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { useAuthService, useProfileService } from "@/services";
import type {
  AuthState,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileDTO,
} from "@/types";
import { authReducer, initialAuthState } from "./auth";

/**
 * AuthContext Value Type
 * Contains auth state and methods for authentication operations
 */
type AuthContextValue = AuthState & {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileDTO) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * AuthProvider Component
 * Uses useReducer for predictable state management (SRP)
 * Depends on service interfaces (DIP - Dependency Inversion)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const authService = useAuthService();
  const profileService = useProfileService();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const user = await profileService.getProfile(firebaseUser.uid);
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user, firebaseUser },
            });
          } catch (error) {
            console.error("Failed to load user profile:", error);
            dispatch({
              type: "AUTH_ERROR",
              payload: "Failed to load user profile",
            });
          }
        } else {
          dispatch({ type: "SIGN_OUT" });
        }
      }
    );

    return () => unsubscribe();
  }, [authService, profileService]);

  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch({ type: "AUTH_START" });
      try {
        const user = await authService.signIn(credentials);
        // Auth state listener will handle the rest
        dispatch({ type: "UPDATE_USER", payload: user });
      } catch (error) {
        const errorMessage = authService.getErrorMessage(error);
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [authService]
  );

  const signUp = useCallback(
    async (credentials: SignupCredentials) => {
      dispatch({ type: "AUTH_START" });
      try {
        const user = await authService.signUp(credentials);
        dispatch({ type: "UPDATE_USER", payload: user });
      } catch (error) {
        const errorMessage = authService.getErrorMessage(error);
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [authService]
  );

  const signOut = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await authService.signOut();
      // Auth state listener will handle the state update
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, [authService]);

  const updateProfile = useCallback(
    async (data: UpdateProfileDTO) => {
      if (!state.user) {
        throw new Error("No user is signed in");
      }

      dispatch({ type: "AUTH_START" });
      try {
        const updatedUser = await profileService.updateProfile(
          state.user.id,
          data
        );
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
      } catch (error) {
        const errorMessage = authService.getErrorMessage(error);
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    [state.user, profileService, authService]
  );

  const deleteAccount = useCallback(async () => {
    if (!state.user) {
      throw new Error("No user is signed in");
    }

    dispatch({ type: "AUTH_START" });
    try {
      await profileService.deleteAccount(state.user.id);
      // Auth state listener will handle the state update
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, [state.user, profileService, authService]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      updateProfile,
      deleteAccount,
      clearError,
    }),
    [state, signIn, signUp, signOut, updateProfile, deleteAccount, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext Hook
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
