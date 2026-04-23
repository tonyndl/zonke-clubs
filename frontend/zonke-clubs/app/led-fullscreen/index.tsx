import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  TouchableWithoutFeedback,
  Text,
  PanResponder,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TextStroke } from "../screens/Login/utils";
import { styles } from "./styles";
import { FONT_FAMILIES } from "@/constants/fontFamilies";

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
  fontFamily?: string;
  hollowStroke?: boolean;
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

// Emoji detection
const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

function extractEmojis(text: string): string[] {
  return [...text.matchAll(EMOJI_REGEX)].map((m) => m[0]);
}

const EMOJI_DISPLAY_SIZE = 80;

interface DraggableEmojiProps {
  emoji: string;
  id: string;
  initialX: number;
  initialY: number;
  size: number;
  onDuplicate: (emoji: string) => void;
  onRemove: (id: string) => void;
}

function DraggableEmoji({
  emoji,
  id,
  initialX,
  initialY,
  size,
  onDuplicate,
  onRemove,
}: DraggableEmojiProps) {
  const pan = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY }),
  ).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const offset = useRef({ x: initialX, y: initialY });
  const currentScale = useRef(1);
  const initialPinchDistance = useRef(0);
  const pinchScaleStart = useRef(1);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: false,
    }).start();
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTap = () => {
    tapCount.current += 1;

    if (tapCount.current === 3) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onRemove(id);
      return;
    }

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDuplicate(emoji);
      }
      tapCount.current = 0;
    }, 300);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(offset.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const distance = getDistance(touches);
          if (initialPinchDistance.current === 0) {
            initialPinchDistance.current = distance;
            pinchScaleStart.current = currentScale.current;
          } else {
            const newScale =
              pinchScaleStart.current *
              (distance / initialPinchDistance.current);
            const clamped = Math.max(0.3, Math.min(5, newScale));
            currentScale.current = clamped;
            scaleAnim.setValue(clamped);
          }
        } else {
          pan.x.setValue(gesture.dx);
          pan.y.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        initialPinchDistance.current = 0;
        const wasTap = Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5;
        if (wasTap) handleTap();
        offset.current = {
          x: offset.current.x + gesture.dx,
          y: offset.current.y + gesture.dy,
        };
        pan.flattenOffset();
      },
    }),
  ).current;

  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale: scaleAnim },
          { rotate: "90deg" },
        ],
      }}
      {...panResponder.panHandlers}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

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
  fontFamily = "monospace",
  hollowStroke = false,
}: LEDFullscreenProps) {
  const router = useRouter();

  const baseText = text.replace(/\s+$/, "").toUpperCase();
  const wordGap =
    FONT_FAMILIES.find((f) => f.key === fontFamily)?.wordGap ?? " ";
  const displayText =
    animationMode === "scroll" ? baseText.replace(/ /g, wordGap) : baseText;
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
  const [lineHeightMult, setLineHeightMult] = useState(1.3);
  const [textBlockHeight, setTextBlockHeight] = useState<number | null>(null);

  const [emojiMode, setEmojiMode] = useState(false);
  const [detachedEmojis, setDetachedEmojis] = useState<
    Array<{ id: string; emoji: string; x: number; y: number }>
  >([]);
  const emojiIdCounter = useRef(0);

  const emojisInText = useMemo(() => extractEmojis(baseText), [baseText]);
  const hasEmojis = emojisInText.length > 0;
  const textWithoutEmojis = useMemo(
    () => displayText.replace(EMOJI_REGEX, ""),
    [displayText],
  );
  const activeDisplayText = emojiMode ? textWithoutEmojis : displayText;

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
  }, [activeDisplayText, fontSize, animationMode, fontFamily]);

  // Reset static measurement and line height when text/font/mode changes
  useEffect(() => {
    if (animationMode !== "scroll") {
      setStaticMeasuredWidth(null);
      setLineHeightMult(1.3);
      setTextBlockHeight(null);
    }
  }, [activeDisplayText, animationMode, fontFamily]);

  // Detect overflow and reduce line height until it fits
  useEffect(() => {
    if (animationMode === "scroll" || textBlockHeight === null) return;
    const availH = SCREEN_WIDTH;
    const isOverflowing = textBlockHeight > availH;
    console.log("Text overlapping:", isOverflowing);
    if (isOverflowing && lineHeightMult > 0.9) {
      // 0.95 safety factor ensures convergence even when decorative glyphs
      // extend beyond the line box and don't shrink with lineHeight
      const newMult = (availH / textBlockHeight) * lineHeightMult * 0.95;
      setLineHeightMult(Math.max(0.9, newMult));
    }
  }, [textBlockHeight]);

  // Vertical scrolling animation — only starts once the real text width is known
  useEffect(() => {
    if (animationMode !== "scroll") return;
    if (measuredTextWidth === null) return;

    // After 90° rotation the text's width becomes its vertical travel extent
    const textHeight = measuredTextWidth;

    const previewBoxWidth = SCREEN_WIDTH + 100;
    const pixelsPerSecond = speed * (SCREEN_HEIGHT / previewBoxWidth);

    // Text scrolls from below screen to above screen, then resets
    const startY = SCREEN_HEIGHT / 2 + textHeight / 2;
    const endY = -SCREEN_HEIGHT / 2 - textHeight / 2;
    const totalDistance = startY - endY;
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

  const enterEmojiMode = () => {
    if (!hasEmojis) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const centerX = SCREEN_WIDTH / 2 - EMOJI_DISPLAY_SIZE / 2;
    const centerY = SCREEN_HEIGHT / 2 - EMOJI_DISPLAY_SIZE / 2;

    const positions = emojisInText.map((emoji, i) => {
      emojiIdCounter.current += 1;
      return {
        id: String(emojiIdCounter.current),
        emoji,
        x: centerX + (i - (emojisInText.length - 1) / 2) * 50,
        y: centerY + (i - (emojisInText.length - 1) / 2) * 50,
      };
    });

    setDetachedEmojis(positions);
    setEmojiMode(true);
  };

  const handleDuplicateEmoji = (emoji: string) => {
    emojiIdCounter.current += 1;
    setDetachedEmojis((prev) => [
      ...prev,
      {
        id: String(emojiIdCounter.current),
        emoji,
        x: SCREEN_WIDTH / 2 - EMOJI_DISPLAY_SIZE / 2,
        y: SCREEN_HEIGHT / 2 - EMOJI_DISPLAY_SIZE / 2,
      },
    ]);
  };

  const handleRemoveEmoji = (id: string) => {
    setDetachedEmojis((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Font size calculation ────────────────────────────────────────────────
  // Scroll mode: large font (rotated text scrolls vertically)
  // Static mode: measurement-based — render at STATIC_REF_FONT, measure true width,
  //              then scale up so text fills as much of the screen as possible.
  let actualFontSize: number;

  if (animationMode === "scroll") {
    // Cap so line height fits within SCREEN_WIDTH after 90° rotation
    actualFontSize = Math.min(
      fontSize * 7,
      Math.floor(SCREEN_WIDTH / lineHeightMult),
    );
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
    const charCount = activeDisplayText.length;

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
    const sizeScale =
      FONT_FAMILIES.find((f) => f.key === fontFamily)?.sizeScale ?? 1.0;
    actualFontSize = Math.floor(best * sizeScale);
  } else {
    // Placeholder while measurement node hasn't fired yet — show nothing (hidden by render gate)
    actualFontSize = STATIC_REF_FONT;
  }

  const textColor = theme.primaryColor;
  const fontStyleProps = getTextStyleForFont(textColor);

  // Container width passed to the Text node (before 90° rotation).
  // For scroll: use measured width + buffer to prevent last-word wrapping from subpixel rounding.
  // For static: container spans rotated screen so text can wrap naturally.
  const textWidth =
    animationMode === "scroll"
      ? (measuredTextWidth ?? 0) + 10
      : SCREEN_HEIGHT * 0.94;

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

      <View style={[styles.ledContainer, { backgroundColor: bgColor }]}>
        {/* Background touch handler */}
        <TouchableWithoutFeedback
          onPress={handleDoubleTap}
          onLongPress={hasEmojis && !emojiMode ? enterEmojiMode : undefined}
        >
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        {/* Floating emoji layer (behind text) */}
        {emojiMode &&
          detachedEmojis.map((e) => (
            <DraggableEmoji
              key={e.id}
              id={e.id}
              emoji={e.emoji}
              initialX={e.x}
              initialY={e.y}
              size={EMOJI_DISPLAY_SIZE}
              onDuplicate={handleDuplicateEmoji}
              onRemove={handleRemoveEmoji}
            />
          ))}

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
                  activeDisplayText.length,
                );
                setMeasuredTextWidth(width);
              }}
              style={{
                fontSize: actualFontSize,
                letterSpacing: 1,
                ...(fontFamily === "monospace"
                  ? { fontWeight: "900" as const }
                  : {}),
                fontFamily,
                alignSelf: "flex-start",
              }}
            >
              {activeDisplayText}
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
                fontFamily,
                fontWeight: fontFamily === "monospace" ? "900" : "normal",
                letterSpacing: 1,
                alignSelf: "center",
              }}
            >
              {activeDisplayText}
            </Text>
          </View>
        )}

        {/* Visible animated text — hidden until measurement is ready in scroll mode */}
        {(animationMode === "scroll"
          ? measuredTextWidth !== null
          : staticMeasuredWidth !== null) &&
          (() => {
            const lineHeight = actualFontSize * lineHeightMult;
            const textNode =
              currentFontStyle === "outline" || hollowStroke ? (
                <TextStroke color={textColor as string} stroke={3}>
                  <Text
                    style={{
                      width: textWidth,
                      fontSize: actualFontSize,
                      lineHeight,
                      color: bgColor,
                      letterSpacing: 1,
                      ...(fontFamily === "monospace"
                        ? { fontWeight: "900" as const }
                        : {}),
                      fontFamily,
                      textAlign: "center",
                    }}
                  >
                    {activeDisplayText}
                  </Text>
                </TextStroke>
              ) : (
                <Text
                  style={{
                    width: textWidth,
                    fontSize: actualFontSize,
                    lineHeight,
                    ...fontStyleProps,
                    fontFamily,
                    fontWeight: fontFamily === "monospace" ? "400" : "normal",
                    letterSpacing: 1,
                    textAlign: "center",
                  }}
                >
                  {activeDisplayText}
                </Text>
              );

            return (
              <Animated.View
                style={{
                  position: "absolute",
                  ...(animationMode === "scroll"
                    ? { top: (SCREEN_HEIGHT - lineHeight) / 2 }
                    : {}),
                  transform: textTransform,
                }}
                pointerEvents="none"
                onLayout={(e) => {
                  if (animationMode !== "scroll") {
                    setTextBlockHeight(e.nativeEvent.layout.height);
                  }
                }}
              >
                {textNode}
              </Animated.View>
            );
          })()}
      </View>

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
      fontFamily={(params.fontFamily as string) || "monospace"}
      hollowStroke={params.hollowStroke === "true"}
    />
  );
}
