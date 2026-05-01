import styled, { keyframes } from "styled-components";
import { NavLink } from "react-router-dom";
import { theme } from "../../../styles/theme";

export const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(57, 243, 255, 0.3); }
  50% { box-shadow: 0 0 25px rgba(57, 243, 255, 0.5); }
`;

export const SidebarContainer = styled.aside<{ collapsed?: boolean }>`
  width: ${({ collapsed }) => (collapsed ? "68px" : "280px")};
  height: 100%;
  background: ${theme.colors.sidebarBackground};
  border-right: 1px solid ${theme.colors.sidebarBorder};
  color: ${theme.colors.sidebarText};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width ${theme.transitions.normal};
`;

export const LogoSection = styled.div<{ collapsed?: boolean }>`
  padding: ${({ collapsed }) =>
    collapsed ? `${theme.spacing.lg} ${theme.spacing.sm}` : theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.sidebarBorder};
  display: flex;
  flex-direction: ${({ collapsed }) => (collapsed ? "column" : "row")};
  align-items: center;
  justify-content: center;
  gap: ${({ collapsed }) => (collapsed ? theme.spacing.xs : theme.spacing.sm)};
  transition:
    padding ${theme.transitions.normal},
    gap ${theme.transitions.normal};
`;

export const LogoContainer = styled.div<{ collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  overflow: hidden;
  min-width: 0;
  flex: ${({ collapsed }) => (collapsed ? "0 0 auto" : "1")};
  width: ${({ collapsed }) => (collapsed ? "100%" : "auto")};
`;

export const LogoIcon = styled.div<{ collapsed?: boolean }>`
  width: ${({ collapsed }) => (collapsed ? "100%" : "40px")};
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ collapsed }) =>
    collapsed ? theme.borderRadius.md : theme.borderRadius.xl};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.background};
  box-shadow: ${theme.shadows.glow};
  animation: ${glow} 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${theme.gradients.shimmer};
    animation: ${shimmer} 2s linear infinite;
  }
`;

export const LogoText = styled.div<{ collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: ${({ collapsed }) => (collapsed ? "0" : "160px")};
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  transition:
    max-width ${theme.transitions.normal},
    opacity ${theme.transitions.normal};
  white-space: nowrap;
`;

export const LogoTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  white-space: nowrap;
`;

export const LogoSubtitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
`;

export const CollapseToggle = styled.button<{ collapsed?: boolean }>`
  flex-shrink: 0;
  width: ${({ collapsed }) => (collapsed ? "100%" : "22px")};
  height: ${({ collapsed }) => (collapsed ? "24px" : "22px")};
  border-radius: ${({ collapsed }) =>
    collapsed ? theme.borderRadius.md : theme.borderRadius.full};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.sidebarActiveBg};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    box-shadow: 0 0 8px rgba(57, 243, 255, 0.3);
  }

  svg {
    width: 12px;
    height: 12px;
    transition: transform ${theme.transitions.normal};
    transform: ${({ collapsed }) =>
      collapsed ? "rotate(180deg)" : "rotate(0deg)"};
  }
`;

export const Nav = styled.nav`
  flex: 1;
  padding: ${theme.spacing.lg} 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
    &:hover {
      background: ${theme.colors.primary};
    }
  }
`;

export const NavSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const NavSectionTitle = styled.div<{ collapsed?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.xs};
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  max-height: ${({ collapsed }) => (collapsed ? "0" : "32px")};
  overflow: hidden;
  transition:
    opacity ${theme.transitions.normal},
    max-height ${theme.transitions.normal};
  white-space: nowrap;
`;

export const StyledNavLink = styled(NavLink)<{ collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => (collapsed ? "center" : "flex-start")};
  padding: ${theme.spacing.md}
    ${({ collapsed }) => (collapsed ? "0" : theme.spacing.lg)};
  margin: 0 ${theme.spacing.sm};
  color: ${theme.colors.sidebarText};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: ${theme.gradients.primary};
    transition: width ${theme.transitions.normal};
    border-radius: ${theme.borderRadius.lg};
  }

  &:hover {
    background: ${theme.colors.backgroundHover};
    color: ${theme.colors.primary};
    transform: ${({ collapsed }) => (collapsed ? "none" : "translateX(4px)")};
  }

  &.active {
    background: ${theme.colors.sidebarActiveBg};
    color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.glow};
    font-weight: ${theme.typography.fontWeight.semibold};

    &::before {
      width: 3px;
    }

    &::after {
      content: "";
      position: absolute;
      right: ${theme.spacing.md};
      width: 6px;
      height: 6px;
      border-radius: ${theme.borderRadius.full};
      background: ${theme.colors.primary};
      box-shadow: 0 0 10px ${theme.colors.primary};
      display: ${({ collapsed }) => (collapsed ? "none" : "block")};
    }
  }
`;

export const NavLinkLabel = styled.span<{ collapsed?: boolean }>`
  max-width: ${({ collapsed }) => (collapsed ? "0" : "200px")};
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width ${theme.transitions.normal},
    opacity ${theme.transitions.normal};
`;

export const IconWrapper = styled.span<{ collapsed?: boolean }>`
  margin-right: ${({ collapsed }) => (collapsed ? "0" : theme.spacing.md)};
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    margin ${theme.transitions.normal},
    transform ${theme.transitions.normal};

  ${StyledNavLink}:hover & {
    transform: scale(1.15) rotate(-5deg);
  }

  ${StyledNavLink}.active & {
    filter: drop-shadow(0 0 8px ${theme.colors.primary});
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const UserSection = styled.div<{ collapsed?: boolean }>`
  padding: ${theme.spacing.lg}
    ${({ collapsed }) => (collapsed ? theme.spacing.xs : theme.spacing.lg)};
  border-top: 1px solid ${theme.colors.sidebarBorder};
  background: ${theme.colors.backgroundDark};
  position: relative;
  transition: padding ${theme.transitions.normal};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: ${theme.spacing.lg};
    right: ${theme.spacing.lg};
    height: 1px;
    background: ${theme.gradients.accent};
    opacity: 0.3;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

export const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.background};
  box-shadow: ${theme.shadows.glow};
  border: 2px solid ${theme.colors.sidebarBackground};
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: ${theme.gradients.shimmer};
    animation: ${shimmer} 2s linear infinite;
  }
`;

export const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const UserName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserRole = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-top: 2px;
`;

export const LogoutButton = styled.button<{ collapsed?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.backgroundHover};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ collapsed }) => (collapsed ? "0" : theme.spacing.sm)};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.glow};
    &::before {
      opacity: 0.1;
    }
    svg {
      transform: translateX(2px);
    }
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform ${theme.transitions.normal};
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    position: relative;
    z-index: 1;
    max-width: ${({ collapsed }) => (collapsed ? "0" : "120px")};
    opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
    overflow: hidden;
    white-space: nowrap;
    transition:
      max-width ${theme.transitions.normal},
      opacity ${theme.transitions.normal};
  }
`;
