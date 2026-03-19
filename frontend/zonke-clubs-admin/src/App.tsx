import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Events } from "./pages/Events/Events";
import { Content } from "./pages/Content/Content";
import { Spending } from "./pages/Spending/Spending";
import { ClubInfo } from "./pages/Settings/ClubInfo";
import { OpeningHours } from "./pages/Settings/OpeningHours";
import { Media } from "./pages/Settings/Media";
import { DJSchedule } from "./pages/Settings/DJSchedule";
import { Permissions } from "./pages/Settings/Permissions";
import { BlockedUsers } from "./pages/Settings/BlockedUsers";
import { Guidelines } from "./pages/Settings/Guidelines";
import { Subscription } from "./pages/Settings/Subscription";
import { Strobe } from "./pages/Strobe/Strobe";
import { Auth } from "./pages/Auth";
import { Setup } from "./pages/Setup";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { apiService } from "./services/api";
import { ToastProvider } from "./components/Toast";

// Create a query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRoutes() {
  const [clubName, setClubName] = useState<string>("My Club");
  const location = useLocation();

  const fetchClubData = () => {
    if (apiService.isAuthenticated()) {
      apiService
        .getMyClub()
        .then((response) => {
          console.log("Club data response:", response);
          if (response && response.name) {
            setClubName(response.name);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch club data:", error);
          console.error("Error details:", error.response?.data);
        });
    }
  };

  useEffect(() => {
    // Fetch club data if user is authenticated
    // Refetch whenever location changes to ensure we have the latest data
    fetchClubData();
  }, [location.pathname]);

  useEffect(() => {
    // Listen for club update events
    const handleClubUpdate = () => {
      fetchClubData();
    };

    window.addEventListener("clubUpdated", handleClubUpdate);
    return () => window.removeEventListener("clubUpdated", handleClubUpdate);
  }, []);

  const handleLogout = () => {
    apiService.logout();
    // Redirect to login or show login modal
    window.location.href = "/login";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/setup" element={<Setup />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout clubName={clubName} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="content" element={<Content />} />
        <Route path="spending" element={<Spending />} />
        <Route path="settings/club-info" element={<ClubInfo />} />
        <Route path="settings/opening-hours" element={<OpeningHours />} />
        <Route path="settings/media" element={<Media />} />
        <Route path="settings/dj-schedule" element={<DJSchedule />} />
        <Route path="settings/permissions" element={<Permissions />} />
        <Route path="settings/blocked-users" element={<BlockedUsers />} />
        <Route path="settings/guidelines" element={<Guidelines />} />
        <Route path="settings/subscription" element={<Subscription />} />
        <Route path="strobe" element={<Strobe />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
