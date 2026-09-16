import {
  TodoDispatchContext,
  TodoStateContext,
  type TodoDispatch,
  type TodoState,
} from "@/context";
import { useContext } from "react";

/**
 * Todo state hook. Only usable within a TodoProvider
 * @returns TodoState
 */
export function useTodoStateContext() {
  const context: TodoState | null = useContext(TodoStateContext);
  if (!context) {
    throw new Error("useTodoStateContext must be used within an TodoProvider");
  }
  return context;
}

/**
 * Todo dispatch hook. Only usable within a TodoProvider
 * @returns TodoDispatch
 */
export function useTodoDispatchContext() {
  const context: TodoDispatch | null = useContext(TodoDispatchContext);
  if (!context) {
    throw new Error(
      "useTodoDispatchContext must be used within an TodoProvider",
    );
  }
  return context;
}
