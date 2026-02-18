import { apiService } from "./api";
import {
  PostingPermissions,
  BlockedUser,
  ContentGuideline,
  Subscription,
  Invoice,
  MediaItem,
  PaginatedResponse,
} from "../types";

export const settingsService = {
  // Posting Permissions
  getPostingPermissions: async (
    clubId: string,
  ): Promise<PostingPermissions> => {
    return apiService.get<PostingPermissions>(
      `/clubs/${clubId}/settings/posting-permissions`,
    );
  },

  updatePostingPermissions: async (
    clubId: string,
    data: PostingPermissions,
  ): Promise<PostingPermissions> => {
    return apiService.put<PostingPermissions>(
      `/clubs/${clubId}/settings/posting-permissions`,
      data,
    );
  },

  // Blocked Users
  getBlockedUsers: async (clubId: string): Promise<BlockedUser[]> => {
    return apiService.get<BlockedUser[]>(`/clubs/${clubId}/blocked-users`);
  },

  blockUser: async (
    clubId: string,
    userId: string,
    reason: string,
  ): Promise<BlockedUser> => {
    return apiService.post<BlockedUser>(`/clubs/${clubId}/blocked-users`, {
      userId,
      reason,
    });
  },

  unblockUser: async (clubId: string, userId: string): Promise<void> => {
    return apiService.delete<void>(`/clubs/${clubId}/blocked-users/${userId}`);
  },

  // Content Guidelines
  getContentGuidelines: async (clubId: string): Promise<ContentGuideline[]> => {
    return apiService.get<ContentGuideline[]>(
      `/clubs/${clubId}/content-guidelines`,
    );
  },

  createContentGuideline: async (
    clubId: string,
    data: Partial<ContentGuideline>,
  ): Promise<ContentGuideline> => {
    return apiService.post<ContentGuideline>(
      `/clubs/${clubId}/content-guidelines`,
      data,
    );
  },

  updateContentGuideline: async (
    id: string,
    data: Partial<ContentGuideline>,
  ): Promise<ContentGuideline> => {
    return apiService.put<ContentGuideline>(`/content-guidelines/${id}`, data);
  },

  deleteContentGuideline: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/content-guidelines/${id}`);
  },

  // Media Management
  getMedia: async (clubId: string): Promise<MediaItem[]> => {
    return apiService.get<MediaItem[]>(`/clubs/${clubId}/media`);
  },

  uploadMedia: async (
    clubId: string,
    file: File,
    type: "image" | "video",
  ): Promise<MediaItem> => {
    return apiService.uploadFile<MediaItem>(`/clubs/${clubId}/media`, file);
  },

  deleteMedia: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/media/${id}`);
  },

  // Subscription
  getSubscription: async (clubId: string): Promise<Subscription> => {
    return apiService.get<Subscription>(`/clubs/${clubId}/subscription`);
  },

  updateSubscription: async (
    clubId: string,
    plan: "basic" | "pro" | "premium",
  ): Promise<Subscription> => {
    return apiService.post<Subscription>(`/clubs/${clubId}/subscription`, {
      plan,
    });
  },

  cancelSubscription: async (clubId: string): Promise<Subscription> => {
    return apiService.post<Subscription>(
      `/clubs/${clubId}/subscription/cancel`,
      {},
    );
  },

  // Invoices
  getInvoices: async (clubId: string): Promise<Invoice[]> => {
    return apiService.get<Invoice[]>(`/clubs/${clubId}/invoices`);
  },
};
