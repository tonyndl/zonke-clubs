import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  width: 100%;
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
  margin-bottom: ${theme.spacing.xl};
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    color: ${theme.colors.primary};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

export const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.md};
`;

export const DangerZone = styled(Card)`
  padding: ${theme.spacing.xl};
  border-color: ${theme.colors.error}33;
`;

export const DangerTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const DangerDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
`;

export const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
`;

export const SuccessText = styled.p`
  color: ${theme.colors.success};
  font-size: ${theme.typography.fontSize.sm};
`;
