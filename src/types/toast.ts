/**
 * Visual/semantic category of a toast notification. Drives the styling
 * (e.g. `toast-error`, `toast-success`) applied by the ToastProvider.
 */
export type ToastType = "error" | "success" | "info";

/**
 * A single toast notification rendered by the ToastProvider.
 */
export interface Toast {
  /** Randomly generated identifier used to track and dismiss the toast. */
  id: string;
  /** The text displayed to the user. */
  message: string;
  /** The category of the toast, used for styling. */
  type: ToastType;
  /** How long (in ms) the toast stays visible before auto-dismissing. */
  duration?: number;
}

/**
 * Dispatch shape exposed by ToastContext for triggering notifications
 * from anywhere in the component tree.
 */
export interface ToastContextType {
  /** Displays a toast of the given type. Defaults to "info" and a 4s duration. */
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  /** Convenience wrapper for showing an "error" toast. */
  showError: (message: string, duration?: number) => void;
  /** Convenience wrapper for showing a "success" toast. */
  showSuccess: (message: string, duration?: number) => void;
}
