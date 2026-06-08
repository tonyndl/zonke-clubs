import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  UIManager,
  findNodeHandle,
  Dimensions,
  FlatList,
  StyleProp,
  ViewStyle,
  Keyboard,
  Platform,
  BackHandler,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { FieldValues, Path, UseFormSetValue } from "react-hook-form";
import { Portal } from "react-native-paper";

import { Feather, MaterialIcons } from "@expo/vector-icons";

import { Colors } from "@/constants/ui";
import { fetchSuggestions } from "@/helpers/locations";
import { Location } from "@/services/locationService";
import { styles } from "./styles";

type DropdownInputProps<T extends FieldValues> = {
  label: string;
  labelIcon?: React.ReactNode;
  options?: string[];
  selectedValue?: string | null;
  onSelect?: (value: string) => void;
  placeholder?: string;
  menuWidth?: "full" | "auto" | number;
  menuStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  caretSize?: number;
  name: Path<T>;
  required?: boolean;
  setValue: UseFormSetValue<T>;
  placeholderTextColor?: string;
  value: string;
};

export const DropdownInput = <T extends FieldValues>({
  label,
  labelIcon,
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  menuWidth = "full",
  menuStyle,
  inputStyle,
  caretSize = 24,
  name,
  setValue,
  required,
  placeholderTextColor,
  value,
}: DropdownInputProps<T>) => {
  const [open, setOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardTopPosition, setKeyboardTopPosition] = useState(0);
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);

  // Sync query when value changes externally (e.g. pre-loaded saved location),
  // but only when the dropdown is closed so we don't overwrite what the user is typing
  useEffect(() => {
    if (value && !open) {
      setQuery(value);
    }
  }, [value]);

  const isLocation = name === "location";

  const [layout, setLayout] = useState({
    dropdownTop: 0,
    dropdownLeft: 0,
    inputY: 0,
    inputWidth: 0,
    inputHeight: 0,
    dropdownWidth: 0,
    dropdownHeight: 0,
    freeHeight: 0,
    freeWidth: 0,
    widestTextWidth: 0,
    caretWidth: 0,
  });

  const inputRef = useRef<View>(null);
  const textInputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<View>(null);
  const caretRef = useRef<View>(null);

  const measureInputPosition = (cb?: () => void) => {
    if (inputRef.current) {
      const handle = findNodeHandle(inputRef.current);
      if (handle) {
        UIManager.measure(handle, (_x, _y, width, height, pageX, pageY) => {
          const screenHeight = Dimensions.get("window").height;
          const screenWidth = Dimensions.get("window").width;
          setLayout((prev) => ({
            ...prev,
            dropdownTop: pageY + height,
            dropdownLeft: pageX,
            inputY: pageY,
            inputWidth: width,
            inputHeight: height,
            freeHeight: screenHeight - (pageY + height),
            freeWidth: Math.round(screenWidth - (width + 30) || 0),
          }));

          if (cb) cb();
        });
      }
    }
  };

  const measureCaretWidth = () => {
    if (caretRef.current) {
      const handle = findNodeHandle(caretRef.current);
      if (handle) {
        UIManager.measure(handle, (_x, _y, width) => {
          setLayout((prev) => ({ ...prev, caretWidth: width }));
        });
      }
    }
  };

  useEffect(() => {
    const dimSub = Dimensions.addEventListener("change", () => {
      if (open) measureInputPosition();
    });

    const kbShowSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const screenHeight = Dimensions.get("window").height;
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardTopPosition(screenHeight - e.endCoordinates.height);
        if (open) measureInputPosition();
      },
    );
    const kbHideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setKeyboardTopPosition(0);
        if (open) {
          setIsRepositioning(true);
          requestAnimationFrame(() => {
            setTimeout(() => {
              measureInputPosition();
              setIsRepositioning(false);
            }, 150);
          });
        }
      },
    );

    measureInputPosition();

    return () => {
      dimSub?.remove();
      kbShowSub?.remove();
      kbHideSub?.remove();
    };
    // layout.inputY intentionally excluded — it's set inside measureInputPosition,
    // including it would create a measurement feedback loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onBackPress = () => {
      setOpen(false);
      Keyboard.dismiss();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [open]);

  useEffect(() => {
    measureCaretWidth();
    // Only re-measure caret width when caret visibility changes (open toggle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (item: Location | string) => {
    if (isLocation) {
      const loc = item as Location;
      setValue(name, loc as any, { shouldValidate: true });
      setQuery(loc.name);
      setIsLoadingLocations(false);
    } else {
      onSelect!(item as string);
      setQuery(item as string);
    }
    setOpen(false);
  };

  const handleChange = (text: string) => {
    setQuery(text);

    if (!isLocation) return;

    if (text.length >= 3) {
      // Show loading immediately — before the debounced search fires
      setIsLoadingLocations(true);
      setResults([]);
      fetchSuggestions(text, setResults, setOpen, setIsLoadingLocations);
    } else {
      setIsLoadingLocations(false);
      setResults([]);
      fetchSuggestions.cancel();
    }
  };

  let computedWidth: number;
  switch (menuWidth) {
    case "full":
      computedWidth = layout.inputWidth;
      break;
    case "auto":
      computedWidth = layout.widestTextWidth + 60;
      break;
    default:
      computedWidth = menuWidth as number;
      break;
  }

  const calculateShowAbove = () => {
    const minDropdownSpace = 200;

    if (keyboardHeight > 0) {
      const inputBottom = layout.inputY + layout.inputHeight;
      const availableSpaceBelow = keyboardTopPosition - inputBottom;
      const keyboardBottom = keyboardTopPosition + keyboardHeight;
      const screenHeight = Dimensions.get("window").height;
      const availableSpaceAbove =
        layout.inputY - (screenHeight - keyboardBottom);

      return (
        availableSpaceBelow < minDropdownSpace &&
        availableSpaceAbove > availableSpaceBelow
      );
    }

    return layout.freeHeight <= 225;
  };

  const showAbove = calculateShowAbove();

  const dropdownPositionTop = showAbove
    ? layout.dropdownTop - (layout.dropdownHeight + layout.inputHeight) - 10
    : layout.dropdownTop + 10;

  const calculateMaxHeight = (): number | "auto" => {
    if (showAbove) return "auto";
    if (keyboardHeight > 0) {
      return Math.max(keyboardTopPosition - (dropdownPositionTop + 10), 50);
    }
    return Math.max(layout.freeHeight - 30, 0);
  };

  const maxHeight = calculateMaxHeight();

  // Show the dropdown when:
  //  - location field: query is ≥ 3 chars (shows loading, then results)
  //  - options field:  results or options exist
  const showDropdown =
    open &&
    !isRepositioning &&
    (isLocation ? query.length >= 3 : (options?.length ?? 0) > 0);

  return (
    <View>
      {label && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {labelIcon && <View style={{ marginRight: 6 }}>{labelIcon}</View>}
          <Text style={styles.label}>{label}</Text>
          {required && (
            <Text style={{ color: Colors.gold, paddingLeft: 3 }}>*</Text>
          )}
        </View>
      )}

      <Pressable
        ref={inputRef}
        style={[styles.inputBox, inputStyle]}
        onPress={() => {
          if (open) {
            textInputRef.current?.blur();
            setOpen(false);
          } else {
            setOpen(true);
          }
        }}
        onLayout={() => {
          if (open) measureInputPosition();
        }}
      >
        <View style={styles.before} />
        {open ? (
          <TextInput
            ref={textInputRef}
            value={query}
            onFocus={() => {
              measureInputPosition(() => {
                setOpen(true);
                if (isLocation && query.length >= 3) {
                  setIsLoadingLocations(true);
                  setResults([]);
                  fetchSuggestions(
                    query,
                    setResults,
                    setOpen,
                    setIsLoadingLocations,
                  );
                }
              });
            }}
            onChangeText={handleChange}
            placeholderTextColor={placeholderTextColor}
            placeholder={placeholder}
            autoFocus
            style={[
              styles.inputText,
              { width: layout.inputWidth - layout.caretWidth * 2 },
            ]}
          />
        ) : (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.inputText,
              { width: layout.inputWidth - layout.caretWidth * 2 },
              !query && { color: placeholderTextColor ?? "#aaa" },
            ]}
          >
            {query || placeholder}
          </Text>
        )}
        <View style={styles.caretWrapper} ref={caretRef}>
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={caretSize}
            color={Colors.gold}
          />
        </View>
      </Pressable>

      {showDropdown && (
        <Portal>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View
            ref={dropdownRef}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setLayout((prev) => ({
                ...prev,
                dropdownWidth: width,
                dropdownHeight: height,
              }));
            }}
            style={[
              styles.dropdownMenu,
              {
                top: dropdownPositionTop,
                left: Math.max(
                  layout.dropdownLeft + layout.inputWidth - computedWidth,
                  0,
                ),
                width: computedWidth,
                maxWidth:
                  layout.freeWidth === 0
                    ? layout.inputWidth
                    : layout.inputWidth + layout.freeWidth,
                maxHeight: maxHeight,
              },
              menuStyle,
            ]}
          >
            {/* Loading indicator — shown immediately while debounce fires */}
            {isLocation && isLoadingLocations && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: 14,
                }}
              >
                <ActivityIndicator size="small" color={Colors.gold} />
                <Text style={{ color: Colors.smoke, fontSize: 14 }}>
                  Searching...
                </Text>
              </View>
            )}

            {/* No results */}
            {isLocation &&
              !isLoadingLocations &&
              results.length === 0 &&
              query.length >= 3 && (
                <View style={{ padding: 14 }}>
                  <Text style={{ color: Colors.smoke, fontSize: 14 }}>
                    No locations found
                  </Text>
                </View>
              )}

            {/* Location results */}
            {isLocation && !isLoadingLocations && results.length > 0 && (
              <FlatList<Location>
                data={results}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => {
                  const isSelected = query === item.name;
                  return (
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          isSelected && {
                            fontWeight: "bold",
                            color: Colors.primaryBlue,
                          },
                          { maxWidth: computedWidth * 0.85 },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <MaterialIcons
                          name="check"
                          size={18}
                          color={Colors.primaryBlue}
                        />
                      )}
                    </Pressable>
                  );
                }}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingVertical: 4 }}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Options list (non-location dropdowns) */}
            {!isLocation && (
              <FlatList<string>
                data={options}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => {
                  const isSelected = selectedValue === item;
                  return (
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          isSelected && {
                            fontWeight: "bold",
                            color: Colors.primaryBlue,
                          },
                          {
                            maxWidth:
                              (typeof computedWidth === "number"
                                ? computedWidth
                                : layout.inputWidth + layout.freeWidth) * 0.85,
                          },
                        ]}
                        onLayout={(e) => {
                          const { width } = e.nativeEvent.layout;
                          setLayout((prev) => ({
                            ...prev,
                            widestTextWidth: Math.max(
                              prev.widestTextWidth,
                              width,
                            ),
                          }));
                        }}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <MaterialIcons
                          name="check"
                          size={18}
                          color={Colors.primaryBlue}
                        />
                      )}
                    </Pressable>
                  );
                }}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingVertical: 4 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </Portal>
      )}

      <View style={styles.longText}>
        {options?.map((option, index) => (
          <Text
            key={`${option}-${index}`}
            style={styles.dropdownText}
            onLayout={(e) => {
              const { width } = e.nativeEvent.layout;
              setLayout((prev) => ({
                ...prev,
                widestTextWidth: Math.max(prev.widestTextWidth, width),
              }));
            }}
          >
            {option}
          </Text>
        ))}
      </View>
    </View>
  );
};
