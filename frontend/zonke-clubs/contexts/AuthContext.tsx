import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  authService,
  User,
  LoginData,
  RegisterData,
} from "../services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsSetup: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsLoading(true);
    // Fetch fresh user data from server instead of using cached local data
    // This ensures all devices show the same profile picture
    authService
      .getProfile()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch((error) => {
        console.error("Check auth failed:", error);
        // If profile fetch fails (e.g., token invalid), try local cache as fallback
        return authService.getCurrentUser().then((cachedUser) => {
          if (cachedUser) {
            setUser(cachedUser);
          } else {
            setUser(null);
          }
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const login = (data: LoginData): Promise<void> => {
    return authService
      .login(data)
      .then((response) => {
        setUser(response.user);
        console.log("User logged in successfully:", response.user);
      })
      .catch((error) => {
        console.error("Login error:", error);
        throw error;
      });
  };

  const register = (data: RegisterData): Promise<{ needsSetup: boolean }> => {
    return authService
      .register(data)
      .then(() => {
        // After registration, automatically log in
        console.log("Registration successful, logging in...");
        return login({
          username: data.username,
          password: data.password,
        }).then(() => ({ needsSetup: true })); // New users need profile setup
      })
      .catch((error) => {
        console.error("Registration error:", error);
        throw error;
      });
  };

  const logout = (): Promise<void> => {
    return authService
      .logout()
      .then(() => {
        setUser(null);
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        throw error;
      });
  };

  const refreshUser = (): Promise<void> => {
    return authService
      .getProfile()
      .then((updatedUser) => {
        setUser(updatedUser);
        console.log("User profile refreshed:", updatedUser);
      })
      .catch((error) => {
        console.error("Refresh user error:", error);
        // If refresh fails with unauthorized, log out
        if (error.message === "Unauthorized") {
          setUser(null);
        }
        throw error;
      });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
