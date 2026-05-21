import { debounce } from "lodash";
import { locationService } from "@/services/locationService";

export const fetchSuggestions = debounce(
  (
    text: string,
    onSetResults: (results: any[]) => void,
    onOpen: (open: boolean) => void,
    onSetLoading?: (loading: boolean) => void,
  ) => {
    if (text.length < 3) {
      onSetResults([]);
      onSetLoading?.(false);
      return;
    }

    locationService
      .searchLocations(text)
      .then((results) => {
        const formattedResults = results.map((location) => ({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
        }));

        onSetResults(formattedResults);
        onOpen(true);
        onSetLoading?.(false);
      })
      .catch((err) => {
        console.error("Location fetch error:", err.message);
        onSetResults([]);
        onSetLoading?.(false);
      });
  },
  400,
);
