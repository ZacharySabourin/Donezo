/**
 * Outgoing login and sigup request object.
 */
export interface AuthFormData {
  /** The account's username. */
  username: string;
  /** The account's password, sent over HTTPS and never stored client-side. */
  password: string;
}

/**
 * Incoming user profile object.
 */
export interface UserProfile {
  /** Unique identifier for the user, assigned by the server. */
  id: string;
  /** The user's display/login name. */
  username: string;
}

/**
 * State fields in AuthContext
 */
export interface AuthState {
  /** The currently authenticated user, or `null` if signed out. */
  user: UserProfile | null;
  /** Whether an auth-related request (profile fetch, login, signup) is in flight. */
  loading: boolean;
}

/**
 * Dispatch fields in AuthContext
 */
export interface AuthDispatch {
  /** Logs the user in and populates `AuthState.user` on success. */
  login: (formData: AuthFormData) => Promise<void>;
  /** Logs the current user out and clears `AuthState.user`. */
  logout: () => Promise<void>;
  /** Creates a new account. Does not automatically log the user in. */
  signup: (formData: AuthFormData) => Promise<void>;
  /** Re-fetches the current user's profile, e.g. after a page reload. */
  refetchAuth: () => Promise<void>;
}
