import React from "react";
import { Text, TextStyle } from "react-native";
import { styles } from "./styles";

type Props = {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: "title" | "subtitle" | "body";
};

export function GoldText({ children, style, variant = "body" }: Props) {
  const variantStyles: Record<string, TextStyle> = {
    title: styles.title,
    subtitle: styles.subtitle,
    body: styles.body,
  };

  return (
    <Text style={[styles.base, variantStyles[variant], style]}>{children}</Text>
  );
}
