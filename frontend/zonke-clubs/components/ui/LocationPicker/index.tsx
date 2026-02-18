import React from "react";
import { View, Text } from "react-native";
import { DropdownInput } from "../../dropdown";
import { styles } from "./styles";

interface LocationPickerProps {
  label?: string;
  labelIcon?: React.ReactNode;
  value?: any;
  onChange: (location: any) => void;
  placeholder?: string;
  error?: string;
}

export function LocationPicker({
  label,
  labelIcon,
  value,
  onChange,
  placeholder = "Search location...",
  error,
}: LocationPickerProps) {
  // Create a setValue function that matches React Hook Form's interface
  const setValue = (_name: string, locationData: any) => {
    onChange(locationData);
  };

  // Extract name from location object if it exists
  const displayValue = value?.name || (typeof value === "string" ? value : "");

  return (
    <View style={styles.container}>
      <DropdownInput
        name="location"
        label={label || ""}
        labelIcon={labelIcon}
        value={displayValue}
        setValue={setValue}
        placeholder={placeholder}
      />

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
