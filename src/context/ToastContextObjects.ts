import type { ToastContextType } from ".";
import { createContext } from "react";

/**
 * Toast context. Called by the useToastContext hook
 */
export const ToastContext = createContext<ToastContextType | null>(null);
