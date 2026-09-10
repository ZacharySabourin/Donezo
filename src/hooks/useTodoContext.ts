import { useContext } from "react";
import { TodoContext } from "../context/TodoContext";

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodoContext must be used within an AuthProvider");
  }
  return context;
}
