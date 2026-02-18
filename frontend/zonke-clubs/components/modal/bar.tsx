import { Colors } from "@/constants/ui";
import { View } from "react-native";

export const BarLine = () => (
  <View
    style={{
      marginTop: 10,
      height: 5,
      width: 50,
      backgroundColor: Colors.bgSecondary,
      borderRadius: 50,
      alignSelf: "center",
    }}
  />
);
