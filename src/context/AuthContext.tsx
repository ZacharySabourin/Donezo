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
} from "../services/AuthAPI";
import type { AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const userProfile: UserProfile | null = await getProfileApi();
      if (userProfile) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // TODO: Figure out how we want to handle this error
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (formData: AuthRequest) => {
    try {
      setLoading(true);
      const userProfile = await loginApi(formData);
      setUser(userProfile);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await logoutApi();
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const signup = async (formData: AuthRequest) => {
    try {
      setLoading(true);
      await sendSignupApi(formData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const contextValue = useMemo(() => {
    return {
      user,
      loading,
      login,
      logout,
      signup,
      refetchAuth: checkAuthStatus,
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
