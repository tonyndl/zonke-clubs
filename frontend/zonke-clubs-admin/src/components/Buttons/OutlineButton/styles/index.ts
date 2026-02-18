import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const OutlineButton = styled.button<{ fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.typography.fontFamily.base};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;
  background: transparent;
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
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
