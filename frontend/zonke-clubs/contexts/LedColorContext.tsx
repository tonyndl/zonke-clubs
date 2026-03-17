import React, { createContext, useContext, useState } from "react";
import { Colors } from "@/constants/ui";

interface LedColorContextType {
  ledPrimaryColor: string;
  setLedPrimaryColor: (color: string) => void;
}

const LedColorContext = createContext<LedColorContextType>({
  ledPrimaryColor: Colors.gold,
  setLedPrimaryColor: () => {},
});

export const LedColorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ledPrimaryColor, setLedPrimaryColor] = useState(Colors.gold);

  return (
    <LedColorContext.Provider value={{ ledPrimaryColor, setLedPrimaryColor }}>
      {children}
    </LedColorContext.Provider>
  );
};

export const useLedColor = () => useContext(LedColorContext);
