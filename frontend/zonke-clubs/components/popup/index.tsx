import React, { useEffect, useRef, useState } from "react";
import {
  View,
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
  TouchableOpacity,
} from "react-native";
import { Portal, Text } from "react-native-paper";

import {
  Feather,
  MaterialIcons,
  FontAwesome,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { styles } from "./styles";
import { Colors } from "@/constants/ui";
import { capitalizeFirstLetter } from "../utils";

type OptionType = string | { label: string; value: string };

type PopupMenuProps = {
  label?: string;
  options: OptionType[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  innerBtnFn?: () => void;
  menuWidth?: "auto" | number;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  icon?: React.ComponentProps<any>["name"];
  iconColor?: string;
  iconLibrary?: "Feather" | "MaterialIcons" | "AntDesign";
  children?: React.ReactNode;
  before?: boolean;
};

export const PopupMenu = ({
  label,
  options,
  selectedValue,
  onSelect,
  innerBtnFn,
  icon,
  iconColor = Colors.black,
  menuWidth = "auto",
  style,
  iconSize = 24,
  iconLibrary = "Feather",
  children,
  before = false,
}: PopupMenuProps) => {
  const [open, setOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardTopPosition, setKeyboardTopPosition] = useState(0);

  const [layout, setLayout] = useState({
    popupTop: 0,
    popupLeft: 0,
    width: 0,
    inputY: 0,
    poupBtnWidth: 0,
    popupBtnHeight: 0,
    popupMenuWidth: 0,
    popupMenuHeight: 0,
    freeHeightBelow: 0,
    freeHeightAbove: 0,
    freeWidth: 0,
    widestTextWidth: 0,
    iconWidth: 0,
  });

  const popupBtnRef = useRef<View>(null);
  const popupMenuRef = useRef<View>(null);
  const iconRef = useRef<View>(null);

  const getOptionLabel = (option: OptionType): string => {
    return typeof option === "string" ? option : option.label;
  };

  const getOptionValue = (option: OptionType): string => {
    return typeof option === "string" ? option : option.value;
  };

  const isOptionSelected = (option: OptionType): boolean => {
    return getOptionValue(option) === selectedValue;
  };

  const measureInputPosition = (cb?: () => void) => {
    if (popupBtnRef.current) {
      const handle = findNodeHandle(popupBtnRef.current);
      if (handle) {
        UIManager.measure(handle, (_x, _y, width, height, pageX, pageY) => {
          const screenHeight = Dimensions.get("window").height;
          const screenWidth = Dimensions.get("window").width;
          setLayout((prev) => ({
            ...prev,
            popupTop: pageY + height,
            width,
            popupLeft: pageX,
            inputY: pageY,
            poupBtnWidth: width,
            popupBtnHeight: height,
            freeHeightBelow: screenHeight - (pageY + height),
            freeHeightAbove: pageY,
            freeWidth: Math.round(screenWidth - width || 0),
          }));

          if (cb) cb();
        });
      }
    }
  };

  const openDropdown = () => {
    measureInputPosition(() => setOpen(true));
  };

  const onPopupPress = () => {
    if (innerBtnFn !== undefined) {
      innerBtnFn();
    }

    if (!open) openDropdown();
    else setOpen(false);
  };

  const onBackdropPress = () => {
    setOpen(false);

    if (innerBtnFn !== undefined) {
      innerBtnFn();
    }
  };

  useEffect(() => {
    const dimSub = Dimensions.addEventListener("change", () => {
      if (open) measureInputPosition();
    });

    const kbShowSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        const screenHeight = Dimensions.get("window").height;
        const keyboardTopPosition = screenHeight - e.endCoordinates.height;
        setKeyboardTopPosition(keyboardTopPosition);
        measureInputPosition();

        if (open) measureInputPosition();
      },
    );
    const kbHideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        if (open) measureInputPosition();
      },
    );

    measureInputPosition();

    return () => {
      dimSub?.remove();
      kbShowSub?.remove();
      kbHideSub?.remove();
    };
  }, [open, keyboardHeight]);

  useEffect(() => {
    if (!open) return;

    const onBackPress = () => {
      setOpen(false);

      if (innerBtnFn !== undefined) {
        innerBtnFn();
      }

      Keyboard.dismiss();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [open]);

  const handleSelect = (option: OptionType) => {
    const value = getOptionValue(option);

    onSelect(value);
    setOpen(false);

    if (innerBtnFn !== undefined) {
      innerBtnFn();
    }
  };

  let computedWidth: number;
  switch (menuWidth) {
    case "auto":
      computedWidth = layout.widestTextWidth + 60;
      break;
    default:
      computedWidth = menuWidth;
      break;
  }

  const screenWidth = Dimensions.get("window").width;

  const leftPosition = Math.max(
    layout.popupLeft + layout.width - computedWidth,
    0,
  );

  const calculateShowAbove = () => {
    const minOptionsSpace = 200;

    if (keyboardHeight > 0) {
      const buttonBottom = layout.inputY + layout.popupBtnHeight;
      const availableSpaceBelow = keyboardTopPosition - buttonBottom;

      const availableSpaceAbove = layout.inputY;

      return (
        availableSpaceBelow < minOptionsSpace &&
        availableSpaceAbove > availableSpaceBelow
      );
    }

    return layout.freeHeightBelow <= 225;
  };

  const showAbove = calculateShowAbove();

  const popupPositionTop = showAbove
    ? layout.popupTop - (layout.popupMenuHeight + layout.popupBtnHeight)
    : layout.popupTop;

  const calculateMaxHeight = () => {
    if (showAbove) {
      if (keyboardHeight > 0) {
        const keyboardBottom = keyboardTopPosition + keyboardHeight;
        const screenHeight = Dimensions.get("window").height;
        const availableHeightAboveKeyboard =
          layout.inputY - (screenHeight - keyboardBottom);
        return Math.max(availableHeightAboveKeyboard - 30, 50);
      } else {
        return Math.max(layout.freeHeightAbove - 30, 0);
      }
    } else {
      if (keyboardHeight > 0) {
        const availableHeight = keyboardTopPosition - (popupPositionTop + 10);
        return Math.max(availableHeight, 50);
      } else {
        return Math.max(layout.freeHeightBelow - 30, 0);
      }
    }
  };

  const maxHeight = calculateMaxHeight();

  const IconLibraries = {
    Feather,
    MaterialIcons,
    FontAwesome,
    AntDesign,
  };

  const IconComponent = IconLibraries[iconLibrary] || Feather;

  return (
    <View>
      <TouchableOpacity
        ref={popupBtnRef}
        style={[styles.container, style]}
        activeOpacity={0.5}
        onPress={onPopupPress}
        onLayout={() => {
          if (open) measureInputPosition();
        }}
      >
        {icon ? (
          <>
            {before && children}
            <View
              style={styles.iconWrapper}
              ref={iconRef}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setLayout((prev) => ({
                  ...prev,
                  iconWidth: width,
                }));
              }}
            >
              <IconComponent
                name={icon}
                size={iconSize}
                color={iconColor || Colors.black}
              />
            </View>
            {!before && children}
          </>
        ) : (
          children
        )}
      </TouchableOpacity>

      {open && options && (
        <Portal>
          <TouchableWithoutFeedback onPress={onBackdropPress}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View
            ref={popupMenuRef}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setLayout((prev) => ({
                ...prev,
                popupMenuWidth: width,
                popupMenuHeight: height,
              }));
            }}
            style={[
              styles.popupMenu,
              {
                top: popupPositionTop,
                left: leftPosition,
                width: computedWidth,
                maxHeight: maxHeight,
                maxWidth: screenWidth,
                marginVertical: showAbove ? -4 : 4,
              },
            ]}
          >
            {label && <Text style={styles.label}>{label}</Text>}
            <FlatList
              data={options}
              keyExtractor={(item, index) => {
                const value = getOptionValue(item);
                return `${value}-${index}`;
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const label = getOptionLabel(item);
                const isSelected = isOptionSelected(item);

                const isDanger =
                  label.toLowerCase().includes("delete") ||
                  label.toLowerCase().includes("remove");

                // Get icon based on label
                const getIcon = () => {
                  const lowerLabel = label.toLowerCase();
                  if (lowerLabel.includes("edit"))
                    return { name: "create-outline", color: Colors.gold };
                  if (
                    lowerLabel.includes("delete") ||
                    lowerLabel.includes("remove")
                  )
                    return { name: "trash-outline", color: "#FF3B30" };
                  if (lowerLabel.includes("share"))
                    return { name: "share-outline", color: Colors.gold };
                  if (lowerLabel.includes("copy"))
                    return { name: "copy-outline", color: Colors.gold };
                  if (lowerLabel.includes("download"))
                    return { name: "download-outline", color: Colors.gold };
                  return null;
                };

                const iconInfo = getIcon();

                return (
                  <TouchableOpacity
                    style={styles.popupItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    {iconInfo && (
                      <Ionicons
                        name={iconInfo.name as any}
                        size={20}
                        color={iconInfo.color}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.popupText,
                        isSelected && {
                          fontWeight: "bold",
                          color: Colors.gold,
                        },
                        isDanger && {
                          color: "#FF3B30",
                        },
                        {
                          maxWidth:
                            (typeof computedWidth === "number"
                              ? computedWidth
                              : layout.poupBtnWidth + layout.freeWidth) * 0.85,
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
                      {capitalizeFirstLetter(label)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Portal>
      )}

      <View style={styles.longText}>
        {options?.map((option, index) => {
          const label = getOptionLabel(option);
          return (
            <Text
              key={`${label}-${index}`}
              style={styles.popupText}
              onLayout={(e) => {
                const { width } = e.nativeEvent.layout;
                setLayout((prev) => ({
                  ...prev,
                  widestTextWidth: Math.max(prev.widestTextWidth, width),
                }));
              }}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};
