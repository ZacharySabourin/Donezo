import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";
import type { ToastContextType } from "../types/toast";

/**
 * Toast hook. Only usable within a ToastProvider
 * @returns ToastContextType
 */
export function useToastContext() {
  const context: ToastContextType | null = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
