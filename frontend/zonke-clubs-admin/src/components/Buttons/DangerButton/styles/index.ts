import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const DangerButton = styled.button<{ fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.typography.fontFamily.base};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;
  background: ${theme.colors.error};
  color: ${theme.colors.white};
  border: 1px solid transparent;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  &:hover:not(:disabled) {
    background: ${theme.colors.errorDark};
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
