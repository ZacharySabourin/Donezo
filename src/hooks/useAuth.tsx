import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getProfileApi,
  loginApi,
  logoutApi,
  type AuthRequest,
  type UserProfile,
} from "../services/AuthAPI";
import type ApiError from "../types/ApiError";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: ApiError | null;
  login: (formData: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetchAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const userProfile: UserProfile | null = await getProfileApi();
      if (userProfile) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      setError(error as ApiError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (formData: AuthRequest) => {
    try {
      setLoading(true);
      const userProfile = await loginApi(formData);
      setUser(userProfile);
    } catch (error) {
      setError(error as ApiError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user) {
        await logoutApi();
        setUser(null);
      }
    } catch (error) {
      setError(error as ApiError);
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(() => {
    return {
      user,
      loading,
      error,
      login,
      logout,
      refetchAuth: checkAuthStatus,
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
