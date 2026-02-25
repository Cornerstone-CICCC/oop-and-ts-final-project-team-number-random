import type { User as FirebaseUser } from "firebase/auth";
import type { IUser, AuthState } from "@/types";

/**
 * Auth Action Types
 * Defines all possible state transitions (SRP - Single Responsibility)
 */
export type AuthAction =
  | { type: "AUTH_START" }
  | {
      type: "AUTH_SUCCESS";
      payload: { user: IUser; firebaseUser: FirebaseUser };
    }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "SIGN_OUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: IUser }
  | { type: "SET_LOADING"; payload: boolean };

/**
 * Initial auth state
 */
export const initialAuthState: AuthState = {
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

/**
 * Auth Reducer
 * Pure function for state transitions (SRP - handles only state logic)
 *
 * Benefits:
 * - Predictable state updates
 * - Easy to test
 * - Clear action-to-state mappings
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        user: action.payload.user,
        firebaseUser: action.payload.firebaseUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "SIGN_OUT":
      return {
        user: null,
        firebaseUser: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}
