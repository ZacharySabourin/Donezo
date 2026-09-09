import ApiError from "../types/ApiError";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export interface AuthRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
}

export async function loginApi(payload: AuthRequest): Promise<UserProfile> {
  return fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error logging in", response.status);
    }
    return response.json() as Promise<UserProfile>;
  });
}

export async function logoutApi(): Promise<void> {
  return fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error logging out", response.status);
    }
  });
}

export async function sendSignupApi(payload: AuthRequest): Promise<void> {
  return fetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error signing up", response.status);
    }
  });
}

export async function getProfileApi(): Promise<UserProfile | null> {
  return fetch(`${baseUrl}/auth/profile`, {
    method: "GET",
    credentials: "include",
  }).then((response: Response) => {
    if (!response.ok && response.status != 403) {
      throw new ApiError("Error fetching profile", response.status);
    }
    return response.json() as Promise<UserProfile>;
  });
}
