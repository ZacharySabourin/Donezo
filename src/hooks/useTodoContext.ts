import { useContext } from "react";
import { TodoDispatchContext, TodoStateContext } from "../context/TodoContext";

export function useTodoStateContext() {
  const context = useContext(TodoStateContext);
  if (!context) {
    throw new Error("useTodoStateContext must be used within an TodoProvider");
  }
  return context;
}

export function useTodoDispatchContext() {
  const context = useContext(TodoDispatchContext);
  if (!context) {
    throw new Error(
      "useTodoDispatchContext must be used within an TodoProvider",
    );
  }
  return context;
}
