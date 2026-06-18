import React, { useEffect, useRef } from "react";
import { RiCloseLine } from "react-icons/ri";
import {
  Overlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
} from "./styles";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // When a file picker opens, the window loses focus then regains it on close.
  // The browser fires a synthetic click on the overlay at that moment — block it.
  const blockOverlayClick = useRef(false);
  useEffect(() => {
    const handleFocus = () => {
      blockOverlayClick.current = true;
      setTimeout(() => {
        blockOverlayClick.current = false;
      }, 300);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <Overlay
      isOpen={isOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget && !blockOverlayClick.current)
          onClose();
      }}
    >
      <ModalContainer
        isOpen={isOpen}
        maxWidth={maxWidth}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>
            {React.createElement(RiCloseLine as React.ComponentType)}
          </CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Overlay>
  );
};
