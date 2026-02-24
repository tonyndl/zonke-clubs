import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { LayoutContainer, MainContent } from "./styles";

interface MainLayoutProps {
  clubName?: string;
  onLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  clubName,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LayoutContainer>
      <Sidebar
        clubName={clubName}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};
