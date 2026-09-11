import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getProfileApi,
  loginApi,
  logoutApi,
  sendSignupApi,
  type AuthRequest,
  type UserProfile,
} from "../services/authAPI";
import type { AuthDispatch, AuthState } from "../types/auth";
import type ApiError from "../types/ApiError";
import { useToastContext } from "../hooks/useToastContext";

export const AuthStateContext = createContext<AuthState | null>(null);
export const AuthDispatchContext = createContext<AuthDispatch | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { showError } = useToastContext();

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
      const apiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchAuth();
  }, [refetchAuth]);

  const login = useCallback(async (formData: AuthRequest) => {
    try {
      setLoading(true);
      const userProfile = await loginApi(formData);
      setUser(userProfile);
    } catch (error) {
      setUser(null);
      const apiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      setUser(null);
      const apiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
      showError(apiError.message);
    }
  }, [user]);

  const signup = useCallback(async (formData: AuthRequest) => {
    try {
      setLoading(true);
      await sendSignupApi(formData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const apiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
      throw apiError;
    }
  }, []);

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
