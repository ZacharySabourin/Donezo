import type { AuthRequest, UserProfile } from "../services/AuthAPI";

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (formData: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  signup: (formData: AuthRequest) => Promise<void>;
  refetchAuth: () => Promise<void>;
}
