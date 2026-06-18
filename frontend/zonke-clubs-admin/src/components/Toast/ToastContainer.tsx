import React from "react";
import { Toast, ToastProps } from "./Toast";
import { ToastContainerWrapper } from "./styles";

interface ToastContainerProps {
  toasts: Omit<ToastProps, "onClose">[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <ToastContainerWrapper>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </ToastContainerWrapper>
  );
};
