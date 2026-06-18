import { apiService } from "./api";
import { Post, PaginatedResponse } from "../types";

export const contentService = {
  // Get posts for moderation
  getPosts: async (
    clubId: string,
    params?: {
      status?: "pending" | "approved" | "rejected";
      page?: number;
      pageSize?: number;
    },
  ): Promise<PaginatedResponse<Post>> => {
    return apiService.get<PaginatedResponse<Post>>(
      `/clubs/${clubId}/posts`,
      params,
    );
  },

  // Approve post
  approvePost: async (id: string): Promise<Post> => {
    return apiService.patch<Post>(`/posts/${id}/approve`, {});
  },

  // Reject post
  rejectPost: async (id: string, reason?: string): Promise<Post> => {
    return apiService.patch<Post>(`/posts/${id}/reject`, { reason });
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/posts/${id}`);
  },
};
