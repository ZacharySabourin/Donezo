import type { AuthRequest, UserProfile } from "../services/authAPI";

/**
 * State fields in AuthContext
 */
export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}

/**
 * Dispatch fields in AuthContext
 */
export interface AuthDispatch {
  login: (formData: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  signup: (formData: AuthRequest) => Promise<void>;
  refetchAuth: () => Promise<void>;
}
