import {
  AuthDispatchContext,
  AuthStateContext,
  type AuthDispatch,
  type AuthState,
} from "@/context";
import { use } from "react";

/**
 * Auth state hook. Only usable within an AuthProvider
 * @returns AuthState
 */
export const useAuthStateContext = () => {
  const context: AuthState | null = use(AuthStateContext);
  if (!context) {
    throw new Error("useAuthStateContext must be used within an AuthProvider");
  }
  return context;
};

/**
 * Auth dispatch hook. Only usable within an AuthProvider
 * @returns AuthDispatch
 */
export const useAuthDispatchContext = () => {
  const context: AuthDispatch | null = use(AuthDispatchContext);
  if (!context) {
    throw new Error(
      "useAuthDispatchContext must be used within an AuthProvider",
    );
  }
  return context;
};
