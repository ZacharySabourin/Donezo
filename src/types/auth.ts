/**
 * Outgoing login and sigup request object.
 */
export interface AuthFormData {
  username: string;
  password: string;
}

/**
 * Incoming user profile object.
 */
export interface UserProfile {
  id: string;
  username: string;
}

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
  login: (formData: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
  signup: (formData: AuthFormData) => Promise<void>;
  refetchAuth: () => Promise<void>;
}
