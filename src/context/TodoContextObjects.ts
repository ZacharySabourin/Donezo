import { createContext } from "react";
import type { TodoDispatch, TodoState } from ".";

/**
 * State context. Called by the useTodoContext hook
 */
export const TodoStateContext = createContext<TodoState | null>(null);

/**
 * Dispatch context. Called by the useTodoContext hook
 */
export const TodoDispatchContext = createContext<TodoDispatch | null>(null);
