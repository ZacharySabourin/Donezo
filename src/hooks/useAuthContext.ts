import { useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../context/AuthContext";
import type { AuthDispatch, AuthState } from "../types/auth";

/**
 * Auth state hook. Only usable within an AuthProvider
 * @returns AuthState
 */
export const useAuthStateContext = () => {
  const context: AuthState | null = useContext(AuthStateContext);
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
  const context: AuthDispatch | null = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error(
      "useAuthDispatchContext must be used within an AuthProvider",
    );
  }
  return context;
};
