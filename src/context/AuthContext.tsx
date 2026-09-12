import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToastContext } from "../hooks/useToastContext";
import {
  getProfileApi,
  loginApi,
  logoutApi,
  sendSignupApi,
  type AuthRequest,
  type UserProfile,
} from "../services/authAPI";
import type ApiError from "../types/ApiError";
import type { AuthDispatch, AuthState } from "../types/auth";

/**
 * State contexts. Called by the useAuthContext hook
 */
export const AuthStateContext = createContext<AuthState | null>(null);

/**
 * Dispatch contexts. Called by the useAuthContext hook
 */
export const AuthDispatchContext = createContext<AuthDispatch | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { showError } = useToastContext();

  // Used to do the initial profile fetch. If the user's cookie is still stored, the user will be loaded globally
  const refetchAuth = useCallback(async () => {
    try {
      const userProfile: UserProfile | null = await getProfileApi();
      if (userProfile) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      const apiError: ApiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // refetch whenever context is loaded and when the refetch is called.
  useEffect(() => {
    refetchAuth();
  }, [refetchAuth]);

  // Login callback. Bubbles up the error to the UI componenet
  const login: (formData: AuthRequest) => Promise<void> = useCallback(
    async (formData: AuthRequest) => {
      try {
        setLoading(true);
        const userProfile: UserProfile = await loginApi(formData);
        setUser(userProfile);
      } catch (error) {
        setUser(null);
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Logout callback. Displays the an error toast on failure
  const logout: () => Promise<void> = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      const apiError: ApiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
      showError(apiError.message);
    }
  }, []);

  // Signup callback. Bubbles up the error to the UI component.
  const signup: (formData: AuthRequest) => Promise<void> = useCallback(
    async (formData: AuthRequest) => {
      try {
        setLoading(true);
        await sendSignupApi(formData);
      } catch (error) {
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const stateContext: AuthState = useMemo(() => {
    return {
      user,
      loading,
    };
  }, [user, loading]);

  const dispatchContext: AuthDispatch = useMemo(() => {
    return {
      login,
      logout,
      signup,
      refetchAuth,
    };
  }, [login, logout, signup, refetchAuth]);

  return (
    <AuthStateContext.Provider value={stateContext}>
      <AuthDispatchContext.Provider value={dispatchContext}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};
