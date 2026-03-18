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
  speed?: number;
  bgColor?: string;
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
  speed = 180,
  bgColor = "#000000",
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
  const [staticMeasuredWidth, setStaticMeasuredWidth] = useState<number | null>(
    null,
  );

  // Reference font size used for static measurement
  const STATIC_REF_FONT = 100;

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
        // Fill inside of letters with background color so only the stroke is visible
        return {
          ...baseStyle,
          color: bgColor,
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

  // Reset scroll measurement when text/font changes
  useEffect(() => {
    if (animationMode === "scroll") {
      setMeasuredTextWidth(null);
    }
  }, [displayText, fontSize, animationMode]);

  // Reset static measurement when text or mode changes
  useEffect(() => {
    if (animationMode !== "scroll") {
      setStaticMeasuredWidth(null);
    }
  }, [displayText, animationMode]);

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
    // Scale speed so the text crosses its visible area (SCREEN_HEIGHT) in the same
    // time it crosses the preview box (SCREEN_WIDTH - 46), giving matching perception
    const previewBoxWidth = SCREEN_WIDTH + 100;
    const pixelsPerSecond = speed * (SCREEN_HEIGHT / previewBoxWidth);
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
  }, [measuredTextWidth, animationMode, speed]);

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

  // ── Font size calculation ────────────────────────────────────────────────
  // Scroll mode: large font (rotated text scrolls vertically)
  // Static mode: measurement-based — render at STATIC_REF_FONT, measure true width,
  //              then scale up so text fills as much of the screen as possible.
  let actualFontSize: number;

  if (animationMode === "scroll") {
    actualFontSize = fontSize * 4.5;
  } else if (staticMeasuredWidth != null && staticMeasuredWidth > 0) {
    // After 90° rotation:
    //   text "width"  (before rotation) → vertical extent on screen  (≤ SCREEN_HEIGHT)
    //   text "height" (before rotation) → horizontal extent on screen (≤ SCREEN_WIDTH)
    //
    // Strategy: binary-search the largest font F where the wrapped text block fits.
    // Average char width at F = (measuredSingleLineWidth * F / REF) / charCount
    // Lines needed           = ceil(charCount / floor(availW / charWidthAtF))
    // Total block height     = lines * F * LINE_HEIGHT_RATIO  ← must fit SCREEN_WIDTH
    const availW = SCREEN_HEIGHT * 0.94; // container width before rotation
    const availH = SCREEN_WIDTH * 0.93; // container height before rotation
    const LINE_HEIGHT_RATIO = 1.15;
    const charCount = displayText.length;

    let low = 20,
      high = 600,
      best = 30;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const charWidthAtMid =
        (staticMeasuredWidth * mid) / STATIC_REF_FONT / charCount;
      const charsPerLine = Math.max(1, Math.floor(availW / charWidthAtMid));
      const numLines = Math.ceil(charCount / charsPerLine);
      const totalHeight = numLines * mid * LINE_HEIGHT_RATIO;
      if (totalHeight <= availH) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    actualFontSize = best;
  } else {
    // Placeholder while measurement node hasn't fired yet — show nothing (hidden by render gate)
    actualFontSize = STATIC_REF_FONT;
  }

  const textColor = theme.primaryColor;
  const fontStyleProps = getTextStyleForFont(textColor);

  // Container width passed to the Text node (before 90° rotation).
  // For scroll: 99999 prevents any wrapping.
  // For static: use the measured single-line width scaled to actualFontSize so the
  //             text is sized exactly and centered correctly on screen.
  const textWidth = animationMode === "scroll" ? 99999 : SCREEN_HEIGHT * 0.94; // text wraps within this width; after rotation = vertical extent

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      edges={["bottom"]}
    >
      <StatusBar style="light" hidden />

      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={[styles.ledContainer, { backgroundColor: bgColor }]}>
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

          {/* Hidden node to measure true single-line text width for static mode */}
          {animationMode !== "scroll" && staticMeasuredWidth === null && (
            <View
              style={{ position: "absolute", opacity: 0, width: 99999 }}
              pointerEvents="none"
            >
              <Text
                numberOfLines={1}
                onLayout={(e) =>
                  setStaticMeasuredWidth(e.nativeEvent.layout.width)
                }
                style={{
                  fontSize: STATIC_REF_FONT,
                  fontWeight: "900",
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  alignSelf: "flex-start",
                }}
              >
                {displayText}
              </Text>
            </View>
          )}

          {/* Visible animated text — hidden until measurement is ready in scroll mode */}
          {(animationMode === "scroll"
            ? measuredTextWidth !== null
            : staticMeasuredWidth !== null) &&
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
                      color: bgColor,
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
      speed={Number(params.speed) || 180}
      bgColor={(params.bgColor as string) || "#000000"}
    />
  );
}
