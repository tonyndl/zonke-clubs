import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TextStroke } from "../_screens/Login/utils";
import { styles } from "./_styles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type LEDStyle =
  | "classic"
  | "neon"
  | "matrix"
  | "retro"
  | "fire"
  | "pink"
  | "purple"
  | "white";
type FontStyle = "solid" | "outline" | "shadow" | "neon" | "glitch" | "3d";

interface LEDTheme {
  primaryColor: string;
  glowColor: string;
  backgroundColor: string;
}

interface LEDFullscreenProps {
  text: string;
  style?: LEDStyle;
  fontStyle?: FontStyle;
  fontSize?: number;
  animationMode?: "static" | "scroll";
  waveEnabled?: boolean;
  customColor?: string;
}

const LED_THEMES: Record<LEDStyle, LEDTheme> = {
  neon: {
    primaryColor: "#39F3FF",
    glowColor: "#39F3FF",
    backgroundColor: "#000000",
  },
  classic: {
    primaryColor: "#FF0000",
    glowColor: "#FF0000",
    backgroundColor: "#000000",
  },
  matrix: {
    primaryColor: "#00FF00",
    glowColor: "#00FF00",
    backgroundColor: "#000000",
  },
  retro: {
    primaryColor: "#FFA500",
    glowColor: "#FFA500",
    backgroundColor: "#000000",
  },
  fire: {
    primaryColor: "#FF4500",
    glowColor: "#FF4500",
    backgroundColor: "#000000",
  },
  pink: {
    primaryColor: "#FF1493",
    glowColor: "#FF1493",
    backgroundColor: "#000000",
  },
  purple: {
    primaryColor: "#9370DB",
    glowColor: "#9370DB",
    backgroundColor: "#000000",
  },
  white: {
    primaryColor: "#FFFFFF",
    glowColor: "#FFFFFF",
    backgroundColor: "#000000",
  },
};

export function LEDFullscreenView({
  text,
  style = "neon",
  fontStyle = "solid",
  fontSize = 48,
  animationMode = "scroll",
  waveEnabled = false,
  customColor,
}: LEDFullscreenProps) {
  const router = useRouter();

  // Remove trailing spaces and convert to uppercase for display
  const displayText = text.replace(/\s+$/, "").toUpperCase();
  const currentStyle = style;
  const currentFontStyle = fontStyle;

  const scrollY = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);
  const hideButtonTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showBackButton, setShowBackButton] = useState(false);
  const [measuredTextWidth, setMeasuredTextWidth] = useState<number | null>(
    null,
  );

  const baseTheme = LED_THEMES[currentStyle];
  const theme = customColor
    ? { ...baseTheme, primaryColor: customColor, glowColor: customColor }
    : baseTheme;

  const getTextStyleForFont = (baseColor: any) => {
    const baseStyle: any = {
      fontWeight: "900",
      fontFamily: "monospace",
    };

    switch (currentFontStyle) {
      case "solid":
        return {
          ...baseStyle,
          color: baseColor,
        };
      case "outline":
        // Create outline effect using strong shadow glow
        return {
          ...baseStyle,
          color: "transparent",
          textShadowColor: baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 15,
        };
      case "shadow":
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 6, height: 6 },
          textShadowRadius: 12,
        };
      case "neon":
        // Ultra intense neon glow for fullscreen
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 80,
        };
      case "glitch":
        // Cyberpunk glitch with offset
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 8, height: -5 },
          textShadowRadius: 25,
        };
      case "3d":
        // 3D pop effect - dramatic raised effect with white shadow
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: "rgba(255, 255, 255, 0.4)",
          textShadowOffset: { width: 10, height: 10 },
          textShadowRadius: 3,
        };
      default:
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 30,
        };
    }
  };

  // Pulsating animation - vibrating from club noise
  useEffect(() => {
    if (animationMode !== "static" || !waveEnabled) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animationMode, waveEnabled]);

  // Reset measurement whenever the text or font size changes
  useEffect(() => {
    if (animationMode === "scroll") {
      setMeasuredTextWidth(null);
    }
  }, [displayText, fontSize, animationMode]);

  // Vertical scrolling animation — only starts once the real text width is known
  useEffect(() => {
    if (animationMode !== "scroll") return;
    if (measuredTextWidth === null) return;

    // After 90° rotation the text's width becomes its vertical travel extent
    const textHeight = measuredTextWidth;

    // Start: text fully below screen; End: text fully above screen
    const startY = SCREEN_HEIGHT / 2 + textHeight / 2;
    const endY = -SCREEN_HEIGHT / 2 - textHeight / 2;

    const totalDistance = startY - endY;
    const pixelsPerSecond = 180;
    const duration = (totalDistance / pixelsPerSecond) * 1000;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollY, {
          toValue: startY,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scrollY, {
          toValue: endY,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [measuredTextWidth, animationMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideButtonTimeout.current) {
        clearTimeout(hideButtonTimeout.current);
      }
    };
  }, []);

  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleExit();
    } else {
      // Single tap - show back button
      setShowBackButton(true);

      // Clear existing timeout if any
      if (hideButtonTimeout.current) {
        clearTimeout(hideButtonTimeout.current);
      }

      // Hide button after 2 seconds
      hideButtonTimeout.current = setTimeout(() => {
        setShowBackButton(false);
      }, 2000);
    }
    lastTap.current = now;
  };

  // Calculate maximum font size that fits the screen
  const calculateStaticFontSize = () => {
    // After 90° rotation: text width→vertical extent, text height→horizontal extent
    // availableWidth = how wide text can be before rotation = vertical space after rotation
    // availableHeight = how tall text can be before rotation = horizontal space after rotation
    const availableWidth = SCREEN_HEIGHT * 0.98; // Width before rotation = vertical space after (HEIGHT!)
    const availableHeight = SCREEN_WIDTH * 0.95; // Height before rotation = horizontal space after (WIDTH!)
    const charWidth = 0.7; // Character width estimate
    const letterSpacing = 1;
    const lineHeight = 1; // More spacing between rows
    const minFontSize = 20;
    const maxFontSize = Math.floor(SCREEN_HEIGHT * 0.95);

    let low = minFontSize;
    let high = maxFontSize;
    let bestFontSize = minFontSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const charWidthWithSpacing = mid * charWidth + letterSpacing;
      const charsPerLine = Math.floor(availableWidth / charWidthWithSpacing);
      const estimatedLines = Math.ceil(displayText.length / charsPerLine);
      const requiredHeight = estimatedLines * mid * lineHeight;

      if (requiredHeight <= availableHeight && charsPerLine > 0) {
        bestFontSize = mid;
        low = mid + 1; // Try even larger
      } else {
        high = mid - 1; // Too large, try smaller
      }
    }

    return bestFontSize; // Use full calculated size
  };

  const letterSpacing = 1;

  // For static/wave mode: check if it's a single word (no spaces)
  const isSingleWord =
    animationMode !== "scroll" && displayText.indexOf(" ") === -1;

  // Calculate font size based on mode and text
  let actualFontSize;

  if (animationMode === "scroll") {
    actualFontSize = fontSize * 4.5;
  } else if (isSingleWord) {
    // For single words: calculate font size to fit in one row
    const charWidth = 0.7; // Character width estimate
    // Before rotation: width→horizontal, height→vertical
    // After 90° rotation: width→vertical, height→horizontal
    const maxTextWidth = SCREEN_HEIGHT * 0.85; // Max width before rotation (vertical space after = HEIGHT!) - accounts for notch/bottom
    const maxFontHeight = SCREEN_WIDTH * 0.88; // Max font height (horizontal space after rotation = WIDTH!)

    // Calculate max font size that fits the text width (becomes vertical after rotation)
    // Formula: displayText.length * fontSize * charWidth + (displayText.length - 1) * letterSpacing <= maxTextWidth
    const maxFontSizeForWidth = Math.floor(
      (maxTextWidth - (displayText.length - 1) * letterSpacing) /
        (displayText.length * charWidth),
    );

    // The font size itself must fit within the available height (becomes horizontal after rotation)
    const maxFontSizeForHeight = Math.floor(maxFontHeight);

    // Use the smaller of the two to ensure it fits both dimensions
    // Cap at 400px to prevent extremely large text for very short words
    actualFontSize = Math.max(
      Math.min(maxFontSizeForWidth, maxFontSizeForHeight, 400),
      30,
    ); // Min 30px, Max 400px
  } else {
    // For multiple words: use binary search that allows wrapping
    actualFontSize = Math.max(calculateStaticFontSize(), 30); // Minimum 30px
  }

  const textColor = theme.primaryColor;

  const fontStyleProps = getTextStyleForFont(textColor);

  // Calculate text width: N characters + (N-1) letter spacings
  // After 90° rotation: the text's width becomes its VERTICAL extent
  // To span from top to bottom, width should be ~SCREEN_HEIGHT
  const textWidth =
    animationMode === "scroll"
      ? 99999 // Very large width to ensure no wrapping for scrolling
      : isSingleWord
        ? SCREEN_HEIGHT * 0.95 // Single words: fit within screen height (becomes vertical after rotation)
        : SCREEN_HEIGHT * 0.95; // Multiple words static/wave: width controls vertical space after rotation (use HEIGHT!)

  // Pulsating animation interpolation - vibrating from bass/noise
  const pulseScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const vibrateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const vibrateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  // Compute transform explicitly to ensure it's evaluated on initial render
  const textTransform =
    animationMode === "scroll"
      ? [{ translateY: scrollY }, { rotate: "90deg" }]
      : animationMode === "static" && waveEnabled
        ? [
            { rotate: "90deg" },
            { scale: pulseScale },
            { translateX: vibrateX },
            { translateY: vibrateY },
          ]
        : [{ rotate: "90deg" }];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar style="light" hidden />

      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={styles.ledContainer}>
          {/* Hidden off-screen node used only to measure the true rendered text width */}
          {animationMode === "scroll" && measuredTextWidth === null && (
            <View
              style={{ position: "absolute", opacity: 0, width: 99999 }}
              pointerEvents="none"
            >
              <Text
                numberOfLines={1}
                onLayout={(e) => {
                  const width = e.nativeEvent.layout.width;
                  console.log("LED text measured width:", width);
                  console.log("Device screen height:", SCREEN_HEIGHT);
                  console.log(
                    "Phrase total length (chars):",
                    displayText.length,
                  );
                  setMeasuredTextWidth(width);
                }}
                style={{
                  fontSize: actualFontSize,
                  letterSpacing: 1,
                  fontWeight: "900",
                  fontFamily: "monospace",
                  alignSelf: "flex-start",
                }}
              >
                {displayText}
              </Text>
            </View>
          )}

          {/* Visible animated text — hidden until measurement is ready in scroll mode */}
          {(animationMode !== "scroll" || measuredTextWidth !== null) &&
            (currentFontStyle === "outline" ? (
              <Animated.View
                style={{
                  position: "absolute",
                  transform: textTransform,
                }}
              >
                <TextStroke color={textColor as string} stroke={3}>
                  <Text
                    style={{
                      width: textWidth,
                      fontSize: actualFontSize,
                      letterSpacing: 1,
                      fontWeight: "900",
                      fontFamily: "monospace",
                      textAlign: "center",
                    }}
                  >
                    {displayText}
                  </Text>
                </TextStroke>
              </Animated.View>
            ) : (
              <Animated.View
                style={{
                  position: "absolute",
                  transform: textTransform,
                }}
              >
                <Text
                  style={{
                    width: textWidth,
                    fontSize: actualFontSize,
                    ...fontStyleProps,
                    letterSpacing: 1,
                    textAlign: "center",
                  }}
                >
                  {displayText}
                </Text>
              </Animated.View>
            ))}
        </View>
      </TouchableWithoutFeedback>

      {/* Back button - appears on single tap */}
      {showBackButton && (
        <Pressable style={styles.backButton} onPress={handleExit}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </Pressable>
      )}

      {/* Exit hint - press to exit */}
    </SafeAreaView>
  );
}

// Default export wrapper for route screen usage
export default function LEDFullscreenScreen() {
  const params = useLocalSearchParams();

  return (
    <LEDFullscreenView
      text={(params.text as string) || ""}
      style={(params.style as LEDStyle) || "neon"}
      fontStyle={(params.fontStyle as FontStyle) || "solid"}
      fontSize={Number(params.fontSize) || 48}
      animationMode={(params.animationMode as "static" | "scroll") || "scroll"}
      waveEnabled={params.waveEnabled === "true"}
      customColor={(params.customColor as string) || undefined}
    />
  );
}
