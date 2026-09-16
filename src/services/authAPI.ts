import type { AuthFormData, UserProfile } from "@/context";
import { ApiError } from ".";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

/**
 * Sends a POST login request using the given username and password.
 * Returns the user's profile on success, throws an ApiError on failure.
 * @param payload The given username and possword
 * @returns A Promise containing the user's profile
 */
export async function loginApi(payload: AuthFormData): Promise<UserProfile> {
  return fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Failed to Login!", response.status);
    }
    return response.json() as Promise<UserProfile>;
  });
}

/**
 * Sends a logout request to the server. Throws an ApiError on failure.
 * @returns Promise<void>
 */
export async function logoutApi(): Promise<void> {
  return fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Failed to Logout!", response.status);
    }
  });
}

/**
 * Sends a signup request using the given username and password.
 * @param payload The given username and password.
 * @returns Promise<void>
 */
export async function sendSignupApi(payload: AuthFormData): Promise<void> {
  return fetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Account creation failed!", response.status);
    }
  });
}

/**
 * Fetches the current user's profile using the credentials stored in the browser.
 * @returns A Promise containing the user's profile.
 */
export async function getProfileApi(): Promise<UserProfile | null> {
  return fetch(`${baseUrl}/auth/profile`, {
    method: "GET",
    credentials: "include",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("No profile found!", response.status);
    }
    return response.json() as Promise<UserProfile>;
  });
}
