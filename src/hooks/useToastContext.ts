import { ToastContext, type ToastContextType } from "@/context";
import { useContext } from "react";

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
