import React from "react";
import {
  RiDashboardLine,
  RiCalendarEventLine,
  RiFileListLine,
  RiWallet3Line,
  RiStore2Line,
  RiTimeLine,
  RiImageLine,
  RiMusic2Line,
  RiFlashlightLine,
  RiLogoutBoxRLine,
  RiArrowLeftSLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";
import {
  SidebarContainer,
  LogoSection,
  LogoContainer,
  LogoIcon,
  LogoText,
  LogoTitle,
  LogoSubtitle,
  CollapseToggle,
  Nav,
  NavSection,
  NavSectionTitle,
  StyledNavLink,
  IconWrapper,
  NavLinkLabel,
  UserSection,
  LogoutButton,
} from "./styles";

interface SidebarProps {
  clubName?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItemProps {
  to: string;
  icon: IconType;
  label: string;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  collapsed,
}) => {
  const IconComponent = Icon as React.ComponentType;
  return (
    <StyledNavLink
      to={to}
      collapsed={collapsed}
      title={collapsed ? label : undefined}
    >
      <IconWrapper collapsed={collapsed}>
        <IconComponent />
      </IconWrapper>
      <NavLinkLabel collapsed={collapsed}>{label}</NavLinkLabel>
    </StyledNavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  clubName = "My Club",
  onLogout,
  collapsed = false,
  onToggle,
}) => {
  const initials = clubName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ArrowIcon = RiArrowLeftSLine as React.ComponentType;

  return (
    <SidebarContainer collapsed={collapsed}>
      <LogoSection collapsed={collapsed}>
        <LogoContainer collapsed={collapsed}>
          <LogoIcon collapsed={collapsed}>{initials}</LogoIcon>
          <LogoText collapsed={collapsed}>
            <LogoTitle>{clubName}</LogoTitle>
            <LogoSubtitle>Admin Panel</LogoSubtitle>
          </LogoText>
        </LogoContainer>
        <CollapseToggle
          collapsed={collapsed}
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ArrowIcon />
        </CollapseToggle>
      </LogoSection>

      <Nav>
        <NavSection>
          <NavSectionTitle collapsed={collapsed}>Main</NavSectionTitle>
          <NavItem
            to="/dashboard"
            icon={RiDashboardLine}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavItem
            to="/events"
            icon={RiCalendarEventLine}
            label="Events"
            collapsed={collapsed}
          />
          <NavItem
            to="/content"
            icon={RiFileListLine}
            label="Content"
            collapsed={collapsed}
          />
          <NavItem
            to="/spending"
            icon={RiWallet3Line}
            label="Spending"
            collapsed={collapsed}
          />
          <NavItem
            to="/strobe"
            icon={RiFlashlightLine}
            label="DJ Strobe"
            collapsed={collapsed}
          />
        </NavSection>

        <NavSection>
          <NavSectionTitle collapsed={collapsed}>Settings</NavSectionTitle>
          <NavItem
            to="/settings/club-info"
            icon={RiStore2Line}
            label="Club Info"
            collapsed={collapsed}
          />
          <NavItem
            to="/settings/opening-hours"
            icon={RiTimeLine}
            label="Opening Hours"
            collapsed={collapsed}
          />
          <NavItem
            to="/settings/media"
            icon={RiImageLine}
            label="Media"
            collapsed={collapsed}
          />
          <NavItem
            to="/settings/dj-schedule"
            icon={RiMusic2Line}
            label="DJ Schedule"
            collapsed={collapsed}
          />
        </NavSection>
      </Nav>

      <UserSection collapsed={collapsed}>
        <LogoutButton
          collapsed={collapsed}
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <span>Logout</span>
          {React.createElement(RiLogoutBoxRLine as React.ComponentType)}
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};
