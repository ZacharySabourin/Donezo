import { useAsync } from "@/hooks";
import {
  ApiError,
  getProfileApi,
  loginApi,
  logoutApi,
  sendSignupApi,
} from "@/services";
import { useCallback, useMemo, type ReactNode } from "react";
import {
  AuthDispatchContext,
  AuthStateContext,
  useToastContext,
  type AuthDispatch,
  type AuthFormData,
  type AuthState,
  type UserProfile,
} from ".";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showError } = useToastContext();

  const handleProfileError = useCallback((error: Error) => {
    const apiError = error as ApiError;
    console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
  }, []);

  const {
    data: user,
    setData: setUser,
    loading,
    setLoading,
    refetch: refetchAuth,
  } = useAsync({
    asyncFn: getProfileApi,
    onError: handleProfileError,
  });

  // Login callback. Bubbles up the error to the UI componenet
  const login: (formData: AuthFormData) => Promise<void> = useCallback(
    async (formData: AuthFormData) => {
      try {
        setLoading(true);
        const userProfile: UserProfile = await loginApi(formData);
        setUser(userProfile);
      } catch (error) {
        setUser(null);
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser],
  );

  // Logout callback. Displays the an error toast on failure
  const logout: () => Promise<void> = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      const apiError: ApiError = error as ApiError;
      console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
      showError(apiError.message);
    }
  }, [setUser, showError]);

  // Signup callback. Bubbles up the error to the UI component.
  const signup: (formData: AuthFormData) => Promise<void> = useCallback(
    async (formData: AuthFormData) => {
      try {
        setLoading(true);
        await sendSignupApi(formData);
      } catch (error) {
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
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
    <AuthStateContext value={stateContext}>
      <AuthDispatchContext value={dispatchContext}>
        {children}
      </AuthDispatchContext>
    </AuthStateContext>
  );
};
