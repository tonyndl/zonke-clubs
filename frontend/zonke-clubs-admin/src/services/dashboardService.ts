import { apiService } from "./api";
import { DashboardStats } from "../types";

export interface SpendingStats {
  total_this_week: number;
  total_this_month: number;
  total_all_time: number;
  unique_visitors_this_week: number;
  unique_visitors_this_month: number;
  unique_visitors_all_time: number;
  average_spend_per_visit: number;
  top_spending_day: string;
}

export interface PostStats {
  pending_posts: number;
  approved_posts_this_week: number;
  total_posts: number;
}

export const dashboardService = {
  /**
   * Get spending statistics for the dashboard
   */
  getSpendingStats: async (): Promise<SpendingStats> => {
    return apiService.get<SpendingStats>("/admin/spending-records/stats");
  },

  /**
   * Get posts statistics for the dashboard
   */
  getPostStats: async (): Promise<PostStats> => {
    return apiService.get<PostStats>("/admin/content-moderation/stats");
  },

  /**
   * Get combined dashboard stats
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Fetch both stats in parallel
    const [spendingStats, postStats] = await Promise.all([
      dashboardService.getSpendingStats(),
      dashboardService.getPostStats(),
    ]);

    // Transform to DashboardStats format
    return {
      new_favorites: spendingStats.unique_visitors_this_week,
      active_meetups: 0, // This would come from connections/meetings feature if implemented
      upcoming_events: 0, // This would come from events count
      avg_rating: 4.8, // This would come from reviews if implemented
      weekly_highlights: {
        trending_events: [], // This would come from event analytics
        peak_nights: [spendingStats.top_spending_day || "Saturday"],
      },
    };
  },
};
