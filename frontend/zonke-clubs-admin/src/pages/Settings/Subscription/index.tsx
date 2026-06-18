import React, { useState } from "react";
import { Card, CardTitle, CardDescription } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import { RiVipCrownLine, RiCheckLine } from "react-icons/ri";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  CurrentPlanCard,
  PlanHeader,
  PlanName,
  PlanPrice,
  PlanMeta,
  PlansGrid,
  PlanCard,
  RecommendedBadge,
  PlanTitle,
  PlanPriceText,
  PlanPeriod,
  FeatureList,
  Feature,
  BillingCard,
  BillingInfo,
  InfoItem,
  InfoLabel,
  InfoValue,
} from "./styles";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "R299",
    period: "/month",
    recommended: false,
    features: [
      "Up to 5 events per month",
      "Basic analytics",
      "Post moderation",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "R799",
    period: "/month",
    recommended: true,
    features: [
      "Unlimited events",
      "Advanced analytics",
      "Post moderation",
      "Spending tracker",
      "Priority support",
      "Custom branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R1,999",
    period: "/month",
    recommended: false,
    features: [
      "Everything in Professional",
      "Multi-location support",
      "API access",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom integrations",
    ],
  },
];

export const Subscription: React.FC = () => {
  const [currentPlan] = useState(plans[1]); // Professional plan

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Subscription & Billing</PageTitle>
        <PageDescription>
          Manage your subscription plan and billing information.
        </PageDescription>
      </PageHeader>

      <CurrentPlanCard>
        <PlanHeader>
          <div>
            <PlanName>
              {React.createElement(RiVipCrownLine as React.ComponentType)}
              {currentPlan.name} Plan
            </PlanName>
            <PlanMeta>Active subscription</PlanMeta>
          </div>
          <PlanPrice>
            {currentPlan.price}
            <span style={{ fontSize: "1rem" }}>/month</span>
          </PlanPrice>
        </PlanHeader>
      </CurrentPlanCard>

      <Card
        style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.xl }}
      >
        <CardTitle style={{ marginBottom: theme.spacing.md }}>
          Available Plans
        </CardTitle>
        <CardDescription style={{ marginBottom: theme.spacing.xl }}>
          Choose the plan that best fits your club's needs
        </CardDescription>

        <PlansGrid>
          {plans.map((plan) => (
            <PlanCard key={plan.id} recommended={plan.recommended}>
              {plan.recommended && (
                <RecommendedBadge>Recommended</RecommendedBadge>
              )}

              <PlanTitle>{plan.name}</PlanTitle>
              <PlanPriceText>{plan.price}</PlanPriceText>
              <PlanPeriod>{plan.period}</PlanPeriod>

              <FeatureList>
                {plan.features.map((feature, index) => (
                  <Feature key={index}>
                    {React.createElement(RiCheckLine as React.ComponentType)}
                    {feature}
                  </Feature>
                ))}
              </FeatureList>

              {currentPlan.id === plan.id ? (
                <OutlineButton fullWidth disabled>
                  Current Plan
                </OutlineButton>
              ) : (
                <PrimaryButton
                  fullWidth
                  onClick={() => alert(`Upgrade to ${plan.name} plan`)}
                >
                  {currentPlan.id < plan.id ? "Upgrade" : "Downgrade"}
                </PrimaryButton>
              )}
            </PlanCard>
          ))}
        </PlansGrid>
      </Card>

      <BillingCard>
        <CardTitle style={{ marginBottom: theme.spacing.md }}>
          Billing Information
        </CardTitle>
        <CardDescription style={{ marginBottom: theme.spacing.lg }}>
          Your billing details and payment history
        </CardDescription>

        <BillingInfo>
          <InfoItem>
            <InfoLabel>Next Billing Date</InfoLabel>
            <InfoValue>February 22, 2026</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Payment Method</InfoLabel>
            <InfoValue>Visa ending in 4242</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Billing Email</InfoLabel>
            <InfoValue>billing@zonkenightclub.co.za</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Amount Due</InfoLabel>
            <InfoValue>{currentPlan.price}</InfoValue>
          </InfoItem>
        </BillingInfo>

        <div
          style={{
            marginTop: theme.spacing.xl,
            display: "flex",
            gap: theme.spacing.md,
          }}
        >
          <OutlineButton onClick={() => alert("Update payment method")}>
            Update Payment Method
          </OutlineButton>
          <OutlineButton onClick={() => alert("View billing history")}>
            View Billing History
          </OutlineButton>
        </div>
      </BillingCard>
    </SettingsContainer>
  );
};
