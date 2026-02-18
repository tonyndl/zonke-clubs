import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchResponse {
  locations: Location[];
}

class LocationService {
  /**
   * Search for location suggestions using Geoapify API (proxied through backend).
   *
   * @param query - Search query (minimum 3 characters recommended)
   * @returns Promise with array of location suggestions
   */
  async searchLocations(query: string): Promise<Location[]> {
    if (query.length < 3) {
      return [];
    }

    try {
      const response = await axios.get<LocationSearchResponse>(
        `${API_URL}/locations/search?q=${encodeURIComponent(query)}`,
      );
      return response.data.locations || [];
    } catch (error) {
      console.error("Location search failed:", error);
      return [];
    }
  }
}

export const locationService = new LocationService();
