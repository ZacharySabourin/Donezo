import type { AuthRequest, UserProfile } from "../services/authAPI";

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}

export interface AuthDispatch {
  login: (formData: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  signup: (formData: AuthRequest) => Promise<void>;
  refetchAuth: () => Promise<void>;
}
