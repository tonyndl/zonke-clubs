import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "@/constants/ui";
import { styles } from "./styles";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  showBorder?: boolean;
};

export function GlassCard({
  children,
  style,
  borderColor = Colors.gold,
  showBorder = true,
}: Props) {
  return (
    <View style={[styles.container, showBorder && { borderColor }, style]}>
      {children}
    </View>
  );
}
