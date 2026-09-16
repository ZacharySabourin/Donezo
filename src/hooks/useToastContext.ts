import { ToastContext, type ToastContextType } from "@/context";
import { use } from "react";

/**
 * Toast hook. Only usable within a ToastProvider
 * @returns ToastContextType
 */
export function useToastContext() {
  const context: ToastContextType | null = use(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
