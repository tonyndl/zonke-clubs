import React, { createContext, useContext, useState } from "react";
import { Colors } from "@/constants/ui";

interface LedColorContextType {
  ledPrimaryColor: string;
  setLedPrimaryColor: (color: string) => void;
  ledStyle: string;
  setLedStyle: (style: string) => void;
  isRainbowActive: boolean;
  setIsRainbowActive: (v: boolean) => void;
}

const LedColorContext = createContext<LedColorContextType>({
  ledPrimaryColor: Colors.gold,
  setLedPrimaryColor: () => {},
  ledStyle: "neon",
  setLedStyle: () => {},
  isRainbowActive: false,
  setIsRainbowActive: () => {},
});

export const LedColorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ledPrimaryColor, setLedPrimaryColor] = useState(Colors.gold);
  const [ledStyle, setLedStyle] = useState("neon");
  const [isRainbowActive, setIsRainbowActive] = useState(false);

  return (
    <LedColorContext.Provider
      value={{
        ledPrimaryColor,
        setLedPrimaryColor,
        ledStyle,
        setLedStyle,
        isRainbowActive,
        setIsRainbowActive,
      }}
    >
      {children}
    </LedColorContext.Provider>
  );
};

export const useLedColor = () => useContext(LedColorContext);
