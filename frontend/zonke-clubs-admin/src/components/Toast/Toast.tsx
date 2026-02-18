import React, { useEffect } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiInformationLine,
  RiAlertLine,
} from "react-icons/ri";
import {
  ToastWrapper,
  ToastBody,
  IconContainer,
  ToastContent,
  ToastTitle,
  ToastMessage,
  CloseButton,
  ProgressBar,
} from "./styles";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return React.createElement(RiCheckLine as React.ComponentType);
      case "error":
        return React.createElement(RiCloseLine as React.ComponentType);
      case "warning":
        return React.createElement(RiAlertLine as React.ComponentType);
      case "info":
        return React.createElement(RiInformationLine as React.ComponentType);
      default:
        return React.createElement(RiInformationLine as React.ComponentType);
    }
  };

  return (
    <ToastWrapper type={type} isExiting={isExiting}>
      <ToastBody>
        <IconContainer type={type}>{getIcon()}</IconContainer>
        <ToastContent>
          {title && <ToastTitle>{title}</ToastTitle>}
          <ToastMessage>{message}</ToastMessage>
        </ToastContent>
        <CloseButton onClick={handleClose}>
          {React.createElement(RiCloseLine as React.ComponentType)}
        </CloseButton>
      </ToastBody>
      {duration > 0 && <ProgressBar type={type} duration={duration} />}
    </ToastWrapper>
  );
};
