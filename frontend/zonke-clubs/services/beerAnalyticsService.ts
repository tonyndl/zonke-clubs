import { BeerAnalyticsData } from "@/types/beerAnalytics";

const API_BASE_URL = "http://localhost:4000/api";

export const beerAnalyticsService = {
  async getBeerStats(token: string): Promise<BeerAnalyticsData> {
    const response = await fetch(`${API_BASE_URL}/beer_analytics/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch beer stats");
    }

    const result = await response.json();
    return result.data;
  },
};
