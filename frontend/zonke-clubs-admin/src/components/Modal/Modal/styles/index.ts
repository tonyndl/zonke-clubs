import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
  transition: opacity ${theme.transitions.normal};
  padding: ${theme.spacing.lg};
  overflow-y: auto;
`;

export const ModalContainer = styled.div<{
  isOpen: boolean;
  maxWidth?: string;
}>`
  background: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.xl};
  max-width: ${(props) => props.maxWidth || "600px"};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  border: 1px solid ${theme.colors.border};
  box-shadow:
    ${theme.shadows.xl},
    0 0 60px rgba(57, 243, 255, 0.3);
  transform: ${(props) =>
    props.isOpen ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)"};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: all ${theme.transitions.normal};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.gradients.primary};
    z-index: 2;
  }

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
    border-radius: 0 ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
    border: 3px solid ${theme.colors.background};

    &:hover {
      background: ${theme.colors.primary};
    }
  }
`;

export const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: ${theme.colors.cardBackground};
  z-index: 10;
  border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
`;

export const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

export const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    background: ${theme.colors.backgroundHover};
    transform: rotate(90deg);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const ModalBody = styled.div`
  /* Body has no padding - content inside handles its own padding */
`;
