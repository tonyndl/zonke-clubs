import React from "react";
import { Modal } from "../Modal";
import { PrimaryButton, OutlineButton, DangerButton } from "../../Buttons";
import { RiAlertLine } from "react-icons/ri";
import { ModalContent, IconWrapper, Message, Actions } from "./styles";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="500px">
      <ModalContent>
        <IconWrapper type={type}>
          {React.createElement(RiAlertLine as React.ComponentType)}
        </IconWrapper>
        <Message>{message}</Message>
        <Actions>
          <OutlineButton type="button" onClick={onClose}>
            {cancelText}
          </OutlineButton>
          {type === "danger" ? (
            <DangerButton type="button" onClick={handleConfirm}>
              {confirmText}
            </DangerButton>
          ) : (
            <PrimaryButton type="button" onClick={handleConfirm}>
              {confirmText}
            </PrimaryButton>
          )}
        </Actions>
      </ModalContent>
    </Modal>
  );
};
