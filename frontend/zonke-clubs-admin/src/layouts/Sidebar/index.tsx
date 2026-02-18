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
  RiLockLine,
  RiUserForbidLine,
  RiFileTextLine,
  RiVipCrownLine,
  RiLogoutBoxRLine,
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
  Nav,
  NavSection,
  NavSectionTitle,
  StyledNavLink,
  IconWrapper,
  UserSection,
  LogoutButton,
} from "./styles";

interface SidebarProps {
  clubName?: string;
  onLogout?: () => void;
}

interface NavItemProps {
  to: string;
  icon: IconType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label }) => {
  const IconComponent = Icon as React.ComponentType;
  return (
    <StyledNavLink to={to}>
      <IconWrapper>
        <IconComponent />
      </IconWrapper>
      {label}
    </StyledNavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  clubName = "My Club",
  onLogout,
}) => {
  const initials = clubName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoContainer>
          <LogoIcon>{initials}</LogoIcon>
          <LogoText>
            <LogoTitle>{clubName}</LogoTitle>
            <LogoSubtitle>Admin Panel</LogoSubtitle>
          </LogoText>
        </LogoContainer>
      </LogoSection>

      <Nav>
        <NavSection>
          <NavSectionTitle>Main</NavSectionTitle>
          <NavItem to="/dashboard" icon={RiDashboardLine} label="Dashboard" />
          <NavItem to="/events" icon={RiCalendarEventLine} label="Events" />
          <NavItem to="/content" icon={RiFileListLine} label="Content" />
          <NavItem to="/spending" icon={RiWallet3Line} label="Spending" />
        </NavSection>

        <NavSection>
          <NavSectionTitle>Settings</NavSectionTitle>
          <NavItem
            to="/settings/club-info"
            icon={RiStore2Line}
            label="Club Info"
          />
          <NavItem
            to="/settings/opening-hours"
            icon={RiTimeLine}
            label="Opening Hours"
          />
          <NavItem to="/settings/media" icon={RiImageLine} label="Media" />
          <NavItem
            to="/settings/dj-schedule"
            icon={RiMusic2Line}
            label="DJ Schedule"
          />
          <NavItem
            to="/settings/permissions"
            icon={RiLockLine}
            label="Permissions"
          />
          <NavItem
            to="/settings/blocked-users"
            icon={RiUserForbidLine}
            label="Blocked Users"
          />
          <NavItem
            to="/settings/guidelines"
            icon={RiFileTextLine}
            label="Guidelines"
          />
          <NavItem
            to="/settings/subscription"
            icon={RiVipCrownLine}
            label="Subscription"
          />
        </NavSection>
      </Nav>

      <UserSection>
        {/* <UserInfo>
          <UserAvatar>{initials}</UserAvatar>
          <UserDetails>
            <UserName>{clubName}</UserName>
            <UserRole>Club Owner</UserRole>
          </UserDetails>
        </UserInfo> */}
        <LogoutButton onClick={onLogout}>
          <span>Logout</span>
          {React.createElement(RiLogoutBoxRLine as React.ComponentType)}
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};
