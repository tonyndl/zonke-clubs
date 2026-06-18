import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "./ToastContainer";
import { ToastProps } from "./Toast";

interface ToastContextValue {
  showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, "onClose">[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      showToast({ type: "success", message, title: title || "Success" });
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast({ type: "error", message, title: title || "Error" });
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast({ type: "warning", message, title: title || "Warning" });
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast({ type: "info", message, title: title || "Info" });
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
