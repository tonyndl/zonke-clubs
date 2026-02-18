import { debounce } from "lodash";
import { locationService } from "@/services/locationService";

export const fetchSuggestions = debounce(
  (
    text: string,
    onSetResults: (results: any[]) => void,
    onOpen: (open: boolean) => void,
  ) => {
    if (text.length < 3) {
      onSetResults([]);
      return;
    }

    locationService
      .searchLocations(text)
      .then((results) => {
        // Convert to format expected by DropdownInput and backend
        const formattedResults = results.map((location) => ({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
        }));

        onSetResults(formattedResults);
        onOpen(true);
      })
      .catch((err) => {
        console.error("Location fetch error:", err.message);
        onSetResults([]);
      });
  },
  400,
);
