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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerForPushNotifications,
  registerTokenWithBackend,
} from "../services/pushNotificationService";

const PUSH_TOKEN_KEY = "@zonke/push_token";

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
        const isAuthError =
          error.message === "Unauthorized" ||
          /Request failed with status 5\d\d/.test(error.message ?? "");

        if (!isAuthError) {
          console.error("Check auth failed:", error);
        }

        // Auth/server errors: token is already cleared by api.ts — go to login
        if (isAuthError) {
          setUser(null);
          return;
        }

        // Network/unknown errors: fall back to cache so offline users stay logged in
        return authService.getCurrentUser().then((cachedUser) => {
          setUser(cachedUser);
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
        AsyncStorage.getItem(PUSH_TOKEN_KEY).then((storedToken) => {
          if (storedToken !== null) {
            registerForPushNotifications().then((token) => {
              if (token) {
                registerTokenWithBackend(token);
                AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
              }
            });
          }
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  const register = (data: RegisterData): Promise<{ needsSetup: boolean }> => {
    return authService
      .register(data)
      .then(() => {
        return login({
          username: data.username,
          password: data.password,
        }).then(() => ({ needsSetup: true }));
      })
      .catch((error) => {
        throw error;
      });
  };

  const logout = (): Promise<void> => {
    return authService
      .logout()
      .then(() => {
        setUser(null);
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
