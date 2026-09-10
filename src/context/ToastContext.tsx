import {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { Toast, ToastContextType, ToastType } from "../types/toast";

export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const showError = useCallback(
    (message: string, duration?: number) =>
      showToast(message, "error", duration),
    [showToast],
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) =>
      showToast(message, "success", duration),
    [showToast],
  );

  const contextValue = useMemo(() => {
    return { showToast, showError, showSuccess };
  }, [showToast, showError, showSuccess]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container" aria-live="assertive">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-banner toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
