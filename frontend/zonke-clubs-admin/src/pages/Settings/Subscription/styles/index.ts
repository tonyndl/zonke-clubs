import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  max-width: 1200px;
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

export const CurrentPlanCard = styled(Card)`
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  background: ${theme.gradients.primary};
  color: ${theme.colors.background};
`;

export const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const PlanName = styled.h2`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 28px;
    height: 28px;
  }
`;

export const PlanPrice = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
`;

export const PlanMeta = styled.div`
  color: ${theme.colors.background};
  opacity: 0.9;
`;

export const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const PlanCard = styled(Card)<{ recommended?: boolean }>`
  padding: ${theme.spacing.xl};
  transition: all ${theme.transitions.normal};
  position: relative;
  border: ${(props) =>
    props.recommended
      ? `2px solid ${theme.colors.primary}`
      : "1px solid transparent"};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.gradients.primary};
    opacity: ${(props) => (props.recommended ? 1 : 0)};
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.xl};

    &::before {
      opacity: 1;
    }
  }
`;

export const RecommendedBadge = styled.div`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  background: ${theme.gradients.primary};
  color: ${theme.colors.background};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

export const PlanTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.md};
`;

export const PlanPriceText = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

export const PlanPeriod = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing.lg} 0;
`;

export const Feature = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.md};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.success};
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

export const BillingCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

export const BillingInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const InfoItem = styled.div``;

export const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  margin-bottom: ${theme.spacing.xs};
`;

export const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;
