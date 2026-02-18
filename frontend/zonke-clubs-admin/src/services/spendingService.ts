import { apiService } from "./api";
import {
  SpendingRecord,
  GroupSpending,
  SpendingStats,
  PaginatedResponse,
} from "../types";

export const spendingService = {
  // Get spending records
  getSpendingRecords: async (
    clubId: string,
    params?: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<PaginatedResponse<SpendingRecord>> => {
    return apiService.get<PaginatedResponse<SpendingRecord>>(
      `/clubs/${clubId}/spending`,
      params,
    );
  },

  // Get spending statistics
  getSpendingStats: async (clubId: string): Promise<SpendingStats> => {
    return apiService.get<SpendingStats>(`/clubs/${clubId}/spending/stats`);
  },

  // Create spending record
  createSpendingRecord: async (
    clubId: string,
    data: Partial<SpendingRecord>,
  ): Promise<SpendingRecord> => {
    return apiService.post<SpendingRecord>(`/clubs/${clubId}/spending`, data);
  },

  // Create group spending
  createGroupSpending: async (
    clubId: string,
    data: GroupSpending,
  ): Promise<SpendingRecord[]> => {
    return apiService.post<SpendingRecord[]>(
      `/clubs/${clubId}/spending/group`,
      data,
    );
  },

  // Update spending record
  updateSpendingRecord: async (
    id: string,
    data: Partial<SpendingRecord>,
  ): Promise<SpendingRecord> => {
    return apiService.put<SpendingRecord>(`/spending/${id}`, data);
  },

  // Delete spending record
  deleteSpendingRecord: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/spending/${id}`);
  },

  // Get leaderboard (top spenders)
  getLeaderboard: async (
    timePeriod: "week" | "month" | "all" = "all",
    limit: number = 10,
  ): Promise<SpendingRecord[]> => {
    const response = await apiService.get<{ leaderboard: SpendingRecord[] }>(
      "/admin/spending-records/leaderboard",
      {
        limit,
        time_period: timePeriod,
      },
    );
    return response.leaderboard || [];
  },

  // Get all spending records for admin
  getAllSpendingRecords: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    timeframe?: "week" | "month" | "all";
  }): Promise<PaginatedResponse<SpendingRecord>> => {
    return apiService.get<PaginatedResponse<SpendingRecord>>(
      "/admin/spending-records",
      params,
    );
  },

  // Create spending record (admin)
  createSpendingRecordAdmin: async (
    data: Partial<SpendingRecord>,
  ): Promise<SpendingRecord> => {
    return apiService.post<SpendingRecord>("/admin/spending-records", data);
  },
};
