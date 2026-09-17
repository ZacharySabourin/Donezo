/**
 * Barrel file for the API service layer. Re-exports the `ApiError`
 * type along with every typed fetch wrapper used to talk to the
 * Donezo-API backend.
 */

export { ApiError } from "@/types/ApiError";

/**
 * Base URL prepended to every API request, sourced from the
 * `VITE_SERVER_API_BASE_URL` environment variable. Falls back to an
 * empty string (relative requests) when unset.
 */
export const baseUrl =
  (import.meta.env.VITE_SERVER_API_BASE_URL as string) || "";

export { getProfileApi, loginApi, logoutApi, sendSignupApi } from "./authAPI";

export {
  createTodoApi,
  deleteTodoApi,
  deleteTodoListApi,
  fetchSortedTodosApi,
  updateTodoApi,
  updateTodosApi,
} from "./todoAPI";
