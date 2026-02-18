import { api } from "./api";

export type SpendingRecord = {
  id: string;
  club_id: string;
  user_id: string;
  amount: number;
  visit_date: string; // Date string
  notes?: string;
  group_outing_id?: string;
  paid_by_user_id?: string;
  split_type?: "equal" | "custom";
  original_amount?: number;
  participant_ids?: string[];
  inserted_at: string;
  updated_at: string;
  // Populated relations
  club?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
};

export type SpendingStats = {
  total_spent: number;
  total_visits: number;
  average_per_visit: number;
  most_visited_club?: {
    club_id: string;
    club_name: string;
    visit_count: number;
  };
};

export type ClubSpendingStats = {
  total_spent: number;
  total_visits: number;
  average_per_visit: number;
  rank?: number;
};

class SpendingService {
  /**
   * Get current user's spending history across all clubs
   */
  getHistory(limit?: number): Promise<{ spending_records: SpendingRecord[] }> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return api.get<{ spending_records: SpendingRecord[] }>(
      "/spending/history",
      true,
      params,
    );
  }

  /**
   * Get current user's spending statistics across all clubs
   */
  getStats(): Promise<SpendingStats> {
    return api.get<SpendingStats>("/spending/stats", true);
  }

  /**
   * Get current user's spending history for a specific club
   */
  getClubHistory(
    clubId: string,
    limit?: number,
  ): Promise<{ spending_records: SpendingRecord[] }> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return api.get<{ spending_records: SpendingRecord[] }>(
      `/spending/club/${clubId}`,
      true,
      params,
    );
  }

  /**
   * Get current user's spending statistics for a specific club
   */
  getClubStats(clubId: string): Promise<ClubSpendingStats> {
    return api.get<ClubSpendingStats>(`/spending/club/${clubId}/stats`, true);
  }
}

export const spendingService = new SpendingService();
