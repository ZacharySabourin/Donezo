/**
 * Barrel file for the app's three React Contexts (Auth, Toast,
 * Todo). Each section re-exports that context's state/dispatch
 * hooks, its associated types, its `Provider` component, and its
 * raw context objects.
 */
export {
  useAuthDispatchContext,
  useAuthStateContext,
} from "@/hooks/useAuthContext";
export type {
  AuthDispatch,
  AuthFormData,
  AuthState,
  UserProfile,
} from "@/types/auth";
export { AuthProvider } from "./AuthContext";
export { AuthDispatchContext, AuthStateContext } from "./AuthContextObjects";

export { useToastContext } from "@/hooks/useToastContext";
export type { Toast, ToastContextType, ToastType } from "@/types/toast";
export { ToastProvider } from "./ToastContext";
export { ToastContext } from "./ToastContextObjects";

export {
  useTodoDispatchContext,
  useTodoStateContext,
} from "@/hooks/useTodoContext";
export type {
  BulkTodoPositionUpdate,
  FilterType,
  Todo,
  TodoCompletionUpdate,
  TodoDispatch,
  TodoRequest,
  TodoState,
  TodoTextUpdate,
} from "@/types/todo";
export { TodoProvider } from "./TodoContext";
export { TodoDispatchContext, TodoStateContext } from "./TodoContextObjects";
