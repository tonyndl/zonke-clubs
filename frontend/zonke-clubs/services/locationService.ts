import { api } from "./api";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationSearchResponse {
  locations: Location[];
}

class LocationService {
  /**
   * Search for location suggestions using Geoapify API (proxied through backend).
   *
   * @param query - Search query (minimum 3 characters recommended)
   * @returns Promise with array of location suggestions
   */
  searchLocations(query: string): Promise<Location[]> {
    if (query.length < 3) {
      return Promise.resolve([]);
    }

    return api
      .get<LocationSearchResponse>(
        `/locations/search?q=${encodeURIComponent(query)}`,
        false,
      )
      .then((response) => response.locations)
      .catch((error) => {
        console.error("Location search failed:", error);
        return [];
      });
  }
}

export const locationService = new LocationService();
