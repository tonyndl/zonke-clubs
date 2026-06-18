import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { api, setTokenGetter, setTokenClearer } from "./api";

const TOKEN_KEY = "my_jwt";
const USER_KEY = "auth_user";

// Secure storage helpers (supports web and native)
export const getItem = (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    return Promise.resolve(localStorage.getItem(key));
  } else {
    return SecureStore.getItemAsync(key);
  }
};

export const setItem = (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return Promise.resolve();
  } else {
    return SecureStore.setItemAsync(key, value);
  }
};

export const deleteItem = (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return Promise.resolve();
  } else {
    return SecureStore.deleteItemAsync(key);
  }
};

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: "user" | "admin" | "dj";
  inserted_at: string;
  updated_at: string;
  // Optional profile fields
  bio?: string;
  favoriteDrinks?: string[];
  favoriteClubIds?: string[];
  avatar_url?: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  onboarding_complete?: boolean;
  spending_visible?: boolean;
  // DJ profile fields (only set when role = "dj")
  dj_genres?: string[];
  dj_handles?: Array<{ platform: string; handle: string }>;
}

export interface RegisterData {
  username: string;
  email?: string;
  password: string;
  role: "user" | "dj";
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  jwt: string;
}

class AuthService {
  public register(data: RegisterData): Promise<User> {
    return api
      .post<User>("/register", data, false)
      .then((user) => {
        return user;
      })
      .catch((error) => {
        const message =
          error?.response?.data?.error ||
          error.message ||
          "Registration failed";
        throw new Error(message);
      });
  }

  public login(data: LoginData): Promise<AuthResponse> {
    return api
      .post<AuthResponse>("/login", data, false)
      .then((response) => {
        if (!response?.jwt) {
          throw new Error("Invalid response from server");
        }

        console.log(
          "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
          response,
        );

        const normalizedUser = this.normalizeUser(response.user);
        return this.saveAuthData(response.jwt, normalizedUser).then(() => ({
          ...response,
          user: normalizedUser,
        }));
      })
      .catch((error) => {
        const message =
          error?.response?.data?.error || error.message || "Login failed";
        throw new Error(message);
      });
  }

  public logout(): Promise<void> {
    return Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)])
      .then(() => {})
      .catch((error) => {
        console.error("Logout failed:", error);
        throw error;
      });
  }

  public getCurrentUser(): Promise<User | null> {
    return getItem(USER_KEY)
      .then((userJson) => {
        if (userJson) {
          return this.normalizeUser(JSON.parse(userJson));
        }
        return null;
      })
      .catch((error) => {
        console.error("Get current user failed:", error);
        return null;
      });
  }

  public getProfile(): Promise<User> {
    return api
      .get<User>("/profile", true)
      .then((user) => {
        const normalized = this.normalizeUser(user);
        return this.saveUser(normalized).then(() => normalized);
      })
      .catch((error) => {
        if (error.message !== "Unauthorized") {
          console.error("Get profile failed:", error);
        }
        throw error;
      });
  }

  public updateProfile(data: Partial<User>): Promise<User> {
    return api
      .put<User>("/profile", data, true)
      .then((user) => {
        const normalized = this.normalizeUser(user);
        return this.saveUser(normalized).then(() => normalized);
      })
      .catch((error) => {
        console.error("Update profile failed:", error);
        throw error;
      });
  }

  public updateAccountInfo(data: {
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    return api
      .put<User>("/profile/account", data, true)
      .then((user) => {
        const normalized = this.normalizeUser(user);
        return this.saveUser(normalized).then(() => normalized);
      })
      .catch((error) => {
        console.error("Update account info failed:", error);
        const message =
          error?.response?.data?.errors ||
          error?.response?.data?.error ||
          error.message ||
          "Update failed";
        throw new Error(message);
      });
  }

  public changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return api
      .put<{ message: string }>("/profile/password", data, true)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error("Change password failed:", error);
        const message =
          error?.response?.data?.error ||
          error.message ||
          "Password change failed";
        throw new Error(message);
      });
  }

  public getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY)
      .then((token) => token)
      .catch(() => null);
  }

  public isAuthenticated(): Promise<boolean> {
    return this.getToken()
      .then((token) => token !== null)
      .catch(() => false);
  }

  private normalizeUser(raw: any): User {
    return {
      ...raw,
      favoriteDrinks: raw.favoriteDrinks ?? raw.favorite_drinks,
      favoriteClubIds: raw.favoriteClubIds ?? raw.favorite_club_ids,
    };
  }

  private saveAuthData(jwt: string, user: User): Promise<void> {
    return Promise.all([
      setItem(TOKEN_KEY, jwt),
      setItem(USER_KEY, JSON.stringify(user)),
    ])
      .then(() => {})
      .catch((error) => {
        console.error("Save auth data failed:", error);
        throw error;
      });
  }

  private saveUser(user: User): Promise<void> {
    return setItem(USER_KEY, JSON.stringify(user))
      .then(() => {})
      .catch((error) => {
        console.error("Save user failed:", error);
        throw error;
      });
  }
}

export const authService = new AuthService();

// Connect authService with API client for token retrieval and clearing
setTokenGetter(() => authService.getToken());
setTokenClearer(() => authService.logout());

export { TOKEN_KEY };
