import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  max-width: 900px;
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize["4xl"]};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const PageDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
`;

export const FormCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

export const PermissionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const PermissionInfo = styled.div`
  flex: 1;
`;

export const PermissionTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.primary};
  }
`;

export const PermissionDesc = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const ToggleSwitch = styled.button<{ active: boolean }>`
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: ${theme.borderRadius.full};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.border};

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(props) => (props.active ? "31px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.white};
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadows.sm};
  }

  &:hover {
    box-shadow: ${theme.shadows.glow};
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;
