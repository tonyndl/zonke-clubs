import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Downshift from "downshift";
import { locationService, Location } from "../../services/locationService";
import {
  AutocompleteContainer,
  Input,
  SuggestionsContainer,
  SuggestionItem,
  SuggestionText,
  NoResults,
  LoadingText,
} from "./styles";

interface LocationAutocompleteProps {
  id?: string;
  value: string;
  onChange: (
    location: string | { name: string; latitude: number; longitude: number },
  ) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  value,
  onChange,
  placeholder = "Search for a location...",
  required = false,
  name,
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(false);

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownMaxHeight = 300;
      const gap = 4;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Show above if not enough space below and more space above
      const showAbove =
        spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

      if (showAbove) {
        // Position from bottom so dropdown grows upward
        setDropdownPosition({
          bottom: viewportHeight - rect.top + gap,
          left: rect.left,
          width: rect.width,
        });
      } else {
        // Position from top so dropdown grows downward
        setDropdownPosition({
          top: rect.bottom + gap,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update position whenever dropdown should be shown
  useEffect(() => {
    if (value && value.length >= 3) {
      updateDropdownPosition();
    }
  }, [value]);

  const handleInputValueChange = (inputValue: string | undefined) => {
    if (!inputValue) {
      setSuggestions([]);
      onChange("");
      return;
    }

    onChange(inputValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search if less than 3 characters
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce search
    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      locationService
        .searchLocations(inputValue)
        .then((results) => {
          setSuggestions(results);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Location search error:", error);
          setSuggestions([]);
          setIsLoading(false);
        });
    }, 400);
  };

  const handleSelection = (selectedItem: Location | null) => {
    if (selectedItem) {
      onChange({
        name: selectedItem.name,
        latitude: selectedItem.latitude,
        longitude: selectedItem.longitude,
      });
      setSuggestions([]);
    }
  };

  return (
    <Downshift
      inputValue={value}
      onInputValueChange={handleInputValueChange}
      onChange={handleSelection}
      itemToString={(item) => (item ? item.name : "")}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        getRootProps,
        isOpen,
        highlightedIndex,
        inputValue,
      }) => {
        const showDropdown = isOpen && (inputValue?.length ?? 0) >= 3;

        // Track when dropdown opens and update position
        if (isOpen !== isOpenRef.current) {
          isOpenRef.current = isOpen;
          if (isOpen) {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => updateDropdownPosition(), 0);
          }
        }

        const dropdownContent =
          showDropdown &&
          createPortal(
            <SuggestionsContainer
              {...getMenuProps()}
              isOpen={showDropdown}
              top={dropdownPosition.top}
              bottom={dropdownPosition.bottom}
              left={dropdownPosition.left}
              width={dropdownPosition.width}
            >
              {isLoading && <LoadingText>Searching...</LoadingText>}
              {!isLoading &&
                suggestions.length === 0 &&
                (inputValue?.length ?? 0) >= 3 && (
                  <NoResults>No locations found</NoResults>
                )}
              {!isLoading &&
                suggestions.map((location, index) => (
                  <SuggestionItem
                    {...getItemProps({
                      key: location.name + index,
                      index,
                      item: location,
                    })}
                    highlighted={highlightedIndex === index}
                  >
                    <SuggestionText>{location.name}</SuggestionText>
                  </SuggestionItem>
                ))}
            </SuggestionsContainer>,
            document.body,
          );

        return (
          <AutocompleteContainer
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input
              {...getInputProps({
                id,
                name,
                placeholder,
                required,
                autoComplete: "off",
                ref: inputRef,
              })}
            />
            {dropdownContent}
          </AutocompleteContainer>
        );
      }}
    </Downshift>
  );
};
