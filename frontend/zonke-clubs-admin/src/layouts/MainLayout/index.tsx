import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { LayoutContainer, MainContent } from "./styles";
import { adminSocketService } from "../../services/adminSocketService";
import { apiService } from "../../services/api";

interface MainLayoutProps {
  clubName?: string;
  onLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  clubName,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Connect socket once for the entire admin session
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const adminInfo = apiService.getAdminInfo();
    if (token && adminInfo?.id) {
      adminSocketService.connect(token, adminInfo.id);
    }
    return () => {
      adminSocketService.disconnect();
    };
  }, []);

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
