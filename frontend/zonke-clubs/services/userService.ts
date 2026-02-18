import { api } from "./api";
import { User } from "./authService";

export type UserResponse = {
  user: User;
};

class UserService {
  /**
   * Get a user's public profile by ID (public endpoint)
   */
  getUserById(userId: string): Promise<User> {
    return api.get<any>(`/users/${userId}`, false).then((response) => response);
  }
}

export const userService = new UserService();
