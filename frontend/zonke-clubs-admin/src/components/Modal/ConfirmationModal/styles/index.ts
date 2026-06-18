import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const ModalContent = styled.div`
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${theme.spacing.lg};
`;

export const IconWrapper = styled.div<{ type: "danger" | "warning" | "info" }>`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    if (props.type === "danger")
      return "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)";
    if (props.type === "warning")
      return "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)";
    return "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)";
  }};
  border: 2px solid
    ${(props) => {
      if (props.type === "danger") return theme.colors.error;
      if (props.type === "warning") return theme.colors.warning;
      return theme.colors.primary;
    }};

  svg {
    width: 40px;
    height: 40px;
    color: ${(props) => {
      if (props.type === "danger") return theme.colors.error;
      if (props.type === "warning") return theme.colors.warning;
      return theme.colors.primary;
    }};
  }
`;

export const Message = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 400px;
`;

export const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};

  button {
    flex: 1;
  }
`;
