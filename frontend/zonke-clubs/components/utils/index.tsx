import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

type OnClickOutsideProps = {
  children: ReactNode;
  onClickOutsideFn?: () => void;
  isSearch?: boolean;
  clearSearchValue?: () => void;
};

/**
 * A wrapper that closes when user taps outside.
 */
export const OnClickOutside = ({
  children,
  onClickOutsideFn,
  isSearch = false,
  clearSearchValue,
}: OnClickOutsideProps) => {
  const handleOutsidePress = () => {
    Keyboard.dismiss();
    onClickOutsideFn?.();
    clearSearchValue?.();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.overlay}>
        {/* Stop outside presses from reaching children */}
        <Pressable style={[styles.wrapper, !isSearch && styles.fullWidth]}>
          {children}
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    // this ensures touches inside don't close the modal
  },
  fullWidth: {
    width: "100%",
  },
});

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const removeTrailingWhitespace = (text: string): string => {
  if (/\s$/.test(text)) {
    return text.replace(/\s+$/, "");
  }
  return text;
};
