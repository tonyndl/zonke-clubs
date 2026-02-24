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

export const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const UserCard = styled(Card)`
  padding: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all ${theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${theme.colors.border};
`;

export const UserDetails = styled.div``;

export const Username = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const BlockDate = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing["3xl"]};

  svg {
    width: 64px;
    height: 64px;
    color: ${theme.colors.textSecondary};
    margin-bottom: ${theme.spacing.lg};
  }
`;
