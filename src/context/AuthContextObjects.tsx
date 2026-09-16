import type { AuthDispatch, AuthState } from ".";
import { createContext } from "react";

/**
 * State contexts. Called by the useAuthContext hook
 */
export const AuthStateContext = createContext<AuthState | null>(null);

/**
 * Dispatch contexts. Called by the useAuthContext hook
 */
export const AuthDispatchContext = createContext<AuthDispatch | null>(null);
