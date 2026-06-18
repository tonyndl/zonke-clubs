import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  TouchableWithoutFeedback,
  Text,
  Switch,
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
  | "white"
  | "rainbow";
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
  rainbow: {
    primaryColor: "#FF0000",
    glowColor: "#FF0000",
    backgroundColor: "#000000",
  },
};

// Pride-flag stripe colors — rendered as horizontal bands within each letter
const RAINBOW_STRIPE_COLORS = [
  "#FF0000", // red
  "#FF8C00", // orange
  "#FFE000", // yellow
  "#00CC00", // green
  "#0066FF", // blue
  "#8B00FF", // violet
];

// Horizontal rainbow stripes within each letter.
// Uses normal-flow Views (not absolute) so overflow:hidden clips reliably on Android.
function RainbowText({
  text,
  textStyle,
  hollow,
  hollowBgColor,
}: {
  text: string;
  textStyle: any;
  hollow?: boolean;
  hollowBgColor?: string;
}) {
  const fontSize: number = textStyle.fontSize ?? 100;
  const stripeH = fontSize / RAINBOW_STRIPE_COLORS.length;
  const w: number | undefined = textStyle.width;
  return (
    <View style={w !== undefined ? { width: w } : undefined}>
      {RAINBOW_STRIPE_COLORS.map((color, i) => {
        const stripeText = (
          <Text
            style={
              {
                ...textStyle,
                color: hollow ? hollowBgColor : color,
                ...(hollow
                  ? { position: "absolute" as const, top: -(i * stripeH) }
                  : { marginTop: -(i * stripeH) }),
                lineHeight: fontSize,
                includeFontPadding: false,
              } as any
            }
          >
            {text}
          </Text>
        );
        return (
          <View
            key={i}
            style={[
              { height: stripeH, overflow: "hidden" },
              w !== undefined ? { width: w } : undefined,
            ]}
          >
            {hollow ? (
              <TextStroke color={color} stroke={3}>
                {stripeText}
              </TextStroke>
            ) : (
              stripeText
            )}
          </View>
        );
      })}
    </View>
  );
}

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
        pan.extractOffset();
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

interface DraggableWordProps {
  word: string;
  initialX: number;
  initialY: number;
  fontSize: number;
  lineHeight: number;
  fontStyleProps: object;
  fontFamily: string;
  hollowStroke: boolean;
  textColor: string;
  bgColor: string;
  waveEnabled: boolean;
  pulseScale: Animated.AnimatedInterpolation<number>;
  vibrateX: Animated.AnimatedInterpolation<number>;
  vibrateY: Animated.AnimatedInterpolation<number>;
  dragEnabled: boolean;
  resizeEnabled: boolean;
  centered: boolean;
  isRainbow: boolean;
}

// Lives inside a 90° CW rotated container.
// Screen gesture coords map to container coords as: containerDx = -dy, containerDy = dx
function DraggableWord({
  word,
  initialX,
  initialY,
  fontSize,
  lineHeight,
  fontStyleProps,
  fontFamily,
  hollowStroke,
  textColor,
  bgColor,
  waveEnabled,
  pulseScale,
  vibrateX,
  vibrateY,
  dragEnabled,
  resizeEnabled,
  centered,
  isRainbow,
}: DraggableWordProps) {
  const pan = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY }),
  ).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const currentScale = useRef(1);
  const initialPinchDist = useRef(0);
  const pinchScaleStart = useRef(1);
  const initialMidpoint = useRef({ x: 0, y: 0 });
  const dragEnabledRef = useRef(dragEnabled);
  const resizeEnabledRef = useRef(resizeEnabled);

  useEffect(() => {
    dragEnabledRef.current = dragEnabled;
  }, [dragEnabled]);
  useEffect(() => {
    resizeEnabledRef.current = resizeEnabled;
  }, [resizeEnabled]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        dragEnabledRef.current || resizeEnabledRef.current,
      onMoveShouldSetPanResponder: (evt) =>
        evt.nativeEvent.touches.length <= 2 &&
        (dragEnabledRef.current || resizeEnabledRef.current),
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          if (!resizeEnabledRef.current) return;
          const midX = (touches[0].pageX + touches[1].pageX) / 2;
          const midY = (touches[0].pageY + touches[1].pageY) / 2;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (initialPinchDist.current === 0) {
            initialPinchDist.current = dist;
            pinchScaleStart.current = currentScale.current;
            initialMidpoint.current = { x: midX, y: midY };
          } else {
            const next =
              pinchScaleStart.current * (dist / initialPinchDist.current);
            const clamped = Math.max(0.1, Math.min(10, next));
            currentScale.current = clamped;
            scaleAnim.setValue(clamped);
            const mdx = midX - initialMidpoint.current.x;
            const mdy = midY - initialMidpoint.current.y;
            pan.x.setValue(mdy);
            pan.y.setValue(-mdx);
          }
        } else {
          if (!dragEnabledRef.current) return;
          pan.x.setValue(gesture.dy);
          pan.y.setValue(-gesture.dx);
        }
      },
      onPanResponderRelease: () => {
        initialPinchDist.current = 0;
        pan.flattenOffset();
      },
    }),
  ).current;

  const textStyle: any = {
    fontSize,
    lineHeight,
    ...(fontFamily === "monospace" ? { fontWeight: "900" as const } : {}),
    fontFamily,
    letterSpacing: 1,
    // When alone on a line, use full availW + center so actual rendered width drives position
    ...(centered
      ? { textAlign: "center" as const, width: SCREEN_HEIGHT * 0.98 }
      : {}),
  };

  // Strip fontFamily/fontWeight from fontStyleProps — those come from textStyle.
  // fontWeight:"900" on custom fonts causes RN to look for a non-existent bold
  // variant and fall back to the system font.
  const {
    fontFamily: _ff,
    fontWeight: _fw,
    ...visualProps
  } = fontStyleProps as any;

  const wordNode = isRainbow ? (
    <RainbowText
      text={word}
      textStyle={textStyle}
      hollow={hollowStroke}
      hollowBgColor={bgColor}
    />
  ) : hollowStroke ? (
    <TextStroke color={textColor} stroke={3}>
      <Text style={{ ...textStyle, color: bgColor }}>{word}</Text>
    </TextStroke>
  ) : (
    <Text style={{ ...textStyle, ...visualProps }}>{word}</Text>
  );

  const inner = waveEnabled ? (
    <Animated.View
      style={{
        transform: [
          { scale: pulseScale },
          { translateX: vibrateX },
          { translateY: vibrateY },
        ],
      }}
    >
      {wordNode}
    </Animated.View>
  ) : (
    wordNode
  );

  const gesturesActive = dragEnabled || resizeEnabled;

  return (
    <Animated.View
      style={{
        position: "absolute",
        // Explicit width matches the container's available width so the Text
        // always has room to render on a single line without character-breaking.
        width: SCREEN_HEIGHT,
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale: scaleAnim },
        ],
      }}
      pointerEvents={gesturesActive ? "auto" : "none"}
      {...(gesturesActive ? panResponder.panHandlers : {})}
    >
      {inner}
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
  const [longestWordMeasuredWidth, setLongestWordMeasuredWidth] = useState<
    number | null
  >(null);
  const [lineHeightMult, setLineHeightMult] = useState(1.3);
  const [textBlockHeight, setTextBlockHeight] = useState<number | null>(null);
  const [measuredLineHeight, setMeasuredLineHeight] = useState<number | null>(
    null,
  );

  const [emojiMode, setEmojiMode] = useState(false);
  const [detachedEmojis, setDetachedEmojis] = useState<
    Array<{ id: string; emoji: string; x: number; y: number }>
  >([]);
  const emojiIdCounter = useRef(0);
  const [showGestureMenu, setShowGestureMenu] = useState(false);
  const [wordResetKey, setWordResetKey] = useState(0);
  const [wordWidthMap, setWordWidthMap] = useState<Record<string, number>>({});
  const wordWidthAccRef = useRef<Record<string, number>>({});
  const [wordDragEnabled, setWordDragEnabled] = useState(false);
  const [wordResizeEnabled, setWordResizeEnabled] = useState(false);
  const [groupGestureEnabled, setGroupGestureEnabled] = useState(false);
  const wordDragRef = useRef(false);
  const wordResizeRef = useRef(false);
  const groupGestureRef = useRef(false);

  // Group transform for 2-finger pan + scale of all words simultaneously
  const groupPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const groupScaleAnim = useRef(new Animated.Value(1)).current;
  const groupCurrentScale = useRef(1);
  const groupInitialPinchDist = useRef(0);
  const groupPinchScaleStart = useRef(1);
  const groupInitialMidpoint = useRef({ x: 0, y: 0 });

  const groupPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (evt) =>
        groupGestureRef.current && evt.nativeEvent.touches.length >= 3,
      onPanResponderGrant: () => {
        groupPan.extractOffset();
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length < 2) return;
        const midX = (touches[0].pageX + touches[1].pageX) / 2;
        const midY = (touches[0].pageY + touches[1].pageY) / 2;
        const ddx = touches[0].pageX - touches[1].pageX;
        const ddy = touches[0].pageY - touches[1].pageY;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (groupInitialPinchDist.current === 0) {
          groupInitialPinchDist.current = dist;
          groupPinchScaleStart.current = groupCurrentScale.current;
          groupInitialMidpoint.current = { x: midX, y: midY };
        } else {
          const next =
            groupPinchScaleStart.current *
            (dist / groupInitialPinchDist.current);
          groupCurrentScale.current = Math.max(0.1, Math.min(5, next));
          groupScaleAnim.setValue(groupCurrentScale.current);
          groupPan.x.setValue(midX - groupInitialMidpoint.current.x);
          groupPan.y.setValue(midY - groupInitialMidpoint.current.y);
        }
      },
      onPanResponderRelease: () => {
        groupInitialPinchDist.current = 0;
        groupPan.flattenOffset();
      },
    }),
  ).current;

  const emojisInText = useMemo(() => extractEmojis(baseText), [baseText]);
  const hasEmojis = emojisInText.length > 0;
  const textWithoutEmojis = useMemo(
    () => displayText.replace(EMOJI_REGEX, ""),
    [displayText],
  );
  const activeDisplayText = emojiMode ? textWithoutEmojis : displayText;

  // Longest word — used for accurate per-character width estimation in static mode
  const longestStaticWord = useMemo(() => {
    const ws = activeDisplayText.split(" ").filter(Boolean);
    return ws.reduce((a, b) => (a.length >= b.length ? a : b), ws[0] ?? "A");
  }, [activeDisplayText]);

  // Reference font size used for static measurement
  const STATIC_REF_FONT = 100;

  const baseTheme = LED_THEMES[currentStyle];
  const theme = customColor
    ? { ...baseTheme, primaryColor: customColor, glowColor: customColor }
    : baseTheme;
  const isRainbow = currentStyle === "rainbow" && !customColor;

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

  // Reset static measurement, line height, and group transform when text/font/mode changes
  useEffect(() => {
    if (animationMode !== "scroll") {
      setStaticMeasuredWidth(null);
      setLongestWordMeasuredWidth(null);
      setMeasuredLineHeight(null);
      setLineHeightMult(1.3);
      setTextBlockHeight(null);
      groupPan.setValue({ x: 0, y: 0 });
      groupScaleAnim.setValue(1);
      groupCurrentScale.current = 1;
    }
  }, [activeDisplayText, animationMode, fontFamily]);

  // Reset per-word width measurements whenever text, font, or the full-text
  // measurement changes (staticMeasuredWidth settling means actualFontSize changed)
  useEffect(() => {
    wordWidthAccRef.current = {};
    setWordWidthMap({});
  }, [wordResetKey, staticMeasuredWidth]);

  // Detect overflow and reduce line height until it fits
  useEffect(() => {
    if (animationMode === "scroll" || textBlockHeight === null) return;
    const availH = SCREEN_WIDTH * 0.98;
    const isOverflowing = textBlockHeight > availH;
    if (isOverflowing && lineHeightMult > 0.9) {
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
      fontSize * 8,
      Math.floor(SCREEN_WIDTH / lineHeightMult),
    );
  } else if (
    staticMeasuredWidth != null &&
    staticMeasuredWidth > 0 &&
    longestWordMeasuredWidth != null &&
    longestWordMeasuredWidth > 0 &&
    measuredLineHeight != null &&
    measuredLineHeight > 0
  ) {
    // After 90° rotation:
    //   text "width"  (before rotation) → vertical extent on screen  (≤ SCREEN_HEIGHT)
    //   text "height" (before rotation) → horizontal extent on screen (≤ SCREEN_WIDTH)
    //
    // Strategy: binary-search the largest font F where the wrapped text block fits.
    // Average char width at F = (measuredSingleLineWidth * F / REF) / charCount
    // Lines needed           = ceil(charCount / floor(availW / charWidthAtF))
    // Total block height     = lines * F * LINE_HEIGHT_RATIO  ← must fit SCREEN_WIDTH
    const availW = SCREEN_HEIGHT * 0.98;
    const availH = SCREEN_WIDTH * 0.98;
    const charCount = activeDisplayText.length;
    const staticWords = activeDisplayText.split(" ").filter(Boolean);
    const fontEntry = FONT_FAMILIES.find((f) => f.key === fontFamily);
    const sizeScale = fontEntry?.sizeScale ?? 1.0;
    // lineHeightFactor: actual rendered line height relative to font size.
    // Measured directly so every font uses its real metrics automatically.
    // Per-font lineHeightRatio can override when decorations exceed font metrics.
    const measuredFactor = measuredLineHeight / STATIC_REF_FONT;
    const lineHeightFactor = Math.max(
      measuredFactor,
      fontEntry?.lineHeightRatio ?? 1.0,
    );

    let low = 20,
      high = 1200,
      best = 30;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      // Apply sizeScale so overflow checks reflect the actual rendered size
      const scaledMid = Math.floor(mid * sizeScale);

      // Average charWidth across full text — accurate for wrapping decisions
      const charWidthAtMid =
        (staticMeasuredWidth * scaledMid) / STATIC_REF_FONT / charCount;
      const charsPerLine = Math.max(1, Math.floor(availW / charWidthAtMid));

      // Simulate word-boundary wrapping — same logic as the layout below
      let numLines = 1;
      let lineChars = 0;
      for (const w of staticWords) {
        const needed = lineChars > 0 ? 1 + w.length : w.length;
        if (lineChars + needed >= charsPerLine && lineChars > 0) {
          numLines++;
          lineChars = w.length;
        } else {
          lineChars += needed;
        }
      }

      // Accurate overflow check: uses the longest word's actual measured width
      // (not the average) so proportional fonts with wide characters don't overflow.
      const longestWordFits =
        (longestWordMeasuredWidth! * scaledMid) / STATIC_REF_FONT <= availW;

      const totalHeight = numLines * scaledMid * lineHeightFactor;
      if (totalHeight <= availH && longestWordFits) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
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

  const textTransform = [{ translateY: scrollY }, { rotate: "90deg" as const }];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      edges={["bottom"]}
    >
      <StatusBar style="light" hidden />

      <View
        style={[styles.ledContainer, { backgroundColor: bgColor }]}
        {...(animationMode !== "scroll" ? groupPanResponder.panHandlers : {})}
      >
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

        {/* Full-text width — used for average charWidth (wrapping decisions) */}
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

        {/* Longest-word width — used only for the overflow (longestWordFits) check */}
        {animationMode !== "scroll" && longestWordMeasuredWidth === null && (
          <View
            style={{ position: "absolute", opacity: 0, width: 99999 }}
            pointerEvents="none"
          >
            <Text
              numberOfLines={1}
              onLayout={(e) =>
                setLongestWordMeasuredWidth(e.nativeEvent.layout.width)
              }
              style={{
                fontSize: STATIC_REF_FONT,
                fontFamily,
                fontWeight: fontFamily === "monospace" ? "900" : "normal",
                letterSpacing: 1,
                alignSelf: "center",
              }}
            >
              {longestStaticWord}
            </Text>
          </View>
        )}

        {/* Per-word + per-line width measurement at actualFontSize.
            Measuring line strings lets us derive exact spaceWidth per font. */}
        {animationMode !== "scroll" &&
          staticMeasuredWidth !== null &&
          Object.keys(wordWidthMap).length === 0 &&
          (() => {
            // Recompute lines here so we know which line strings to measure
            const _cw =
              (staticMeasuredWidth * actualFontSize) /
              STATIC_REF_FONT /
              Math.max(1, activeDisplayText.length);
            const _cpl = Math.max(1, Math.floor((SCREEN_HEIGHT * 0.98) / _cw));
            const _words = activeDisplayText.split(" ").filter(Boolean);
            const _lines: string[] = [];
            let _cur: string[] = [],
              _cc = 0;
            for (const w of _words) {
              const needed = _cur.length > 0 ? 1 + w.length : w.length;
              if (_cc + needed >= _cpl && _cur.length > 0) {
                _lines.push(_cur.join(" "));
                _cur = [w];
                _cc = w.length;
              } else {
                _cur.push(w);
                _cc += needed;
              }
            }
            if (_cur.length > 0) _lines.push(_cur.join(" "));

            // Unique tokens = individual words + multi-word line strings
            const uniqueTokens = [
              ...new Set([..._words, ..._lines.filter((l) => l.includes(" "))]),
            ];
            const expectedCount = uniqueTokens.length;

            return (
              <View
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
                pointerEvents="none"
              >
                {uniqueTokens.map((token) => (
                  <Text
                    key={`wm-${token}-${wordResetKey}`}
                    numberOfLines={1}
                    style={{
                      fontSize: actualFontSize,
                      fontFamily,
                      letterSpacing: 1,
                    }}
                    onLayout={(e) => {
                      const next = {
                        ...wordWidthAccRef.current,
                        [token]: e.nativeEvent.layout.width,
                      };
                      wordWidthAccRef.current = next;
                      if (Object.keys(next).length >= expectedCount) {
                        setWordWidthMap(next);
                      }
                    }}
                  >
                    {token}
                  </Text>
                ))}
              </View>
            );
          })()}

        {/* Natural line-height measurement — one character at STATIC_REF_FONT, no explicit lineHeight */}
        {animationMode !== "scroll" && measuredLineHeight === null && (
          <View
            style={{ position: "absolute", opacity: 0 }}
            pointerEvents="none"
          >
            <Text
              numberOfLines={1}
              onLayout={(e) =>
                setMeasuredLineHeight(e.nativeEvent.layout.height)
              }
              style={{
                fontSize: STATIC_REF_FONT,
                fontFamily,
                ...(fontFamily === "monospace"
                  ? { fontWeight: "900" as const }
                  : {}),
                letterSpacing: 1,
                alignSelf: "flex-start",
              }}
            >
              A
            </Text>
          </View>
        )}

        {/* Scroll mode — single animated text strip */}
        {animationMode === "scroll" &&
          measuredTextWidth !== null &&
          (() => {
            const lineHeight = actualFontSize * lineHeightMult;
            const scrollBaseStyle = {
              width: textWidth,
              fontSize: actualFontSize,
              lineHeight,
              ...fontStyleProps,
              fontFamily,
              fontWeight:
                fontFamily === "monospace"
                  ? ("400" as const)
                  : ("normal" as const),
              letterSpacing: 1,
              textAlign: "center" as const,
            };
            const textNode = isRainbow ? (
              <RainbowText
                text={activeDisplayText}
                textStyle={scrollBaseStyle}
                hollow={hollowStroke}
                hollowBgColor={bgColor}
              />
            ) : currentFontStyle === "outline" || hollowStroke ? (
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
              <Text style={scrollBaseStyle}>{activeDisplayText}</Text>
            );
            return (
              <Animated.View
                style={{
                  position: "absolute",
                  top: (SCREEN_HEIGHT - lineHeight) / 2,
                  transform: textTransform,
                }}
                pointerEvents="none"
              >
                {textNode}
              </Animated.View>
            );
          })()}

        {/* Static mode — individual DraggableWord per word, inside rotated container */}
        {animationMode !== "scroll" &&
          staticMeasuredWidth !== null &&
          longestWordMeasuredWidth !== null &&
          (() => {
            const availW = SCREEN_HEIGHT * 0.98;
            const charCount = activeDisplayText.length;
            const _fontEntry = FONT_FAMILIES.find((f) => f.key === fontFamily);
            const _measuredFactor =
              (measuredLineHeight ?? STATIC_REF_FONT) / STATIC_REF_FONT;
            const _lineHeightFactor = Math.max(
              _measuredFactor,
              _fontEntry?.lineHeightRatio ?? 1.0,
            );
            const lineHeight = actualFontSize * _lineHeightFactor;
            // Average charWidth — matches binary search wrapping logic
            const charWidth =
              (staticMeasuredWidth * actualFontSize) /
              STATIC_REF_FONT /
              charCount;
            const charsPerLine = Math.max(1, Math.floor(availW / charWidth));

            // Group words into lines using the same wrapping logic as the binary search
            const words = activeDisplayText.split(" ").filter(Boolean);
            const lines: string[][] = [];
            let currentLine: string[] = [];
            let currentChars = 0;
            for (const w of words) {
              const needed = currentLine.length > 0 ? 1 + w.length : w.length;
              if (
                currentChars + needed >= charsPerLine &&
                currentLine.length > 0
              ) {
                lines.push(currentLine);
                currentLine = [w];
                currentChars = w.length;
              } else {
                currentLine.push(w);
                currentChars += needed;
              }
            }
            if (currentLine.length > 0) lines.push(currentLine);

            const blockHeight = lines.length * lineHeight;
            // Offset so the text block is vertically centred inside the
            // SCREEN_WIDTH-tall container.  The container's top is fixed at
            // SCREEN_HEIGHT/2 - SCREEN_WIDTH/2 so its centre always sits at
            // the screen centre after the 90° rotation.
            const yOffset = (SCREEN_WIDTH - blockHeight) / 2;

            // One DraggableWord per WORD — individual words can be dragged.
            // X positions use measured widths (wordWidthMap) when available,
            // falling back to charWidth estimates until measurements arrive.
            const wordPositions: {
              word: string;
              x: number;
              y: number;
              alone: boolean;
            }[] = [];
            lines.forEach((lineWords, li) => {
              if (lineWords.length === 1) {
                wordPositions.push({
                  word: lineWords[0],
                  x: 0,
                  y: yOffset + li * lineHeight,
                  alone: true,
                });
              } else {
                const lineStr = lineWords.join(" ");
                const measuredLineW = wordWidthMap[lineStr];
                const sumWordW = lineWords.reduce(
                  (s, w) => s + (wordWidthMap[w] ?? w.length * charWidth),
                  0,
                );

                // Derive exact space width from measured line - if not yet measured fall back to charWidth
                const spaceW =
                  measuredLineW != null
                    ? (measuredLineW - sumWordW) / (lineWords.length - 1)
                    : charWidth;
                const totalLineW =
                  measuredLineW ?? sumWordW + spaceW * (lineWords.length - 1);

                let wordX = Math.max(0, (availW - totalLineW) / 2);
                lineWords.forEach((w) => {
                  wordPositions.push({
                    word: w,
                    x: wordX,
                    y: yOffset + li * lineHeight,
                    alone: false,
                  });
                  wordX += (wordWidthMap[w] ?? w.length * charWidth) + spaceW;
                });
              }
            });

            return (
              <Animated.View
                style={{
                  position: "absolute",
                  width: availW,
                  alignItems: "center",
                  height: SCREEN_WIDTH,
                  left: SCREEN_WIDTH / 2 - availW / 2,
                  top: SCREEN_HEIGHT / 2 - SCREEN_WIDTH / 2,
                  transform: [
                    { translateX: groupPan.x },
                    { translateY: groupPan.y },
                    { scale: groupScaleAnim },
                    { rotate: "90deg" },
                  ],
                }}
                pointerEvents="box-none"
              >
                {wordPositions.map((wp, i) => (
                  <DraggableWord
                    key={`${wp.word}-${i}-${wordResetKey}`}
                    word={wp.word}
                    initialX={wp.x}
                    initialY={wp.y}
                    fontSize={actualFontSize}
                    lineHeight={lineHeight}
                    fontStyleProps={fontStyleProps}
                    fontFamily={fontFamily}
                    hollowStroke={hollowStroke}
                    textColor={textColor}
                    bgColor={bgColor}
                    waveEnabled={waveEnabled}
                    pulseScale={pulseScale}
                    vibrateX={vibrateX}
                    vibrateY={vibrateY}
                    dragEnabled={wordDragEnabled}
                    resizeEnabled={wordResizeEnabled}
                    centered={wp.alone}
                    isRainbow={isRainbow}
                  />
                ))}
              </Animated.View>
            );
          })()}
      </View>

      {/* Back button - appears on single tap */}
      {showBackButton && (
        <Pressable style={styles.backButton} onPress={handleExit}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </Pressable>
      )}

      {/* Three-dot menu button — static mode only */}
      {animationMode !== "scroll" && (
        <Pressable
          style={menuStyles.dotsBtn}
          onPress={() => setShowGestureMenu((v) => !v)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </Pressable>
      )}

      {/* Gesture menu popup */}
      {showGestureMenu && (
        <>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowGestureMenu(false)}
          />
          <View style={menuStyles.card}>
            <Text style={menuStyles.heading}>GESTURES</Text>

            {(
              [
                {
                  fingers: "1",
                  action: "Move word",
                  value: wordDragEnabled,
                  onToggle: (v: boolean) => {
                    wordDragRef.current = v;
                    setWordDragEnabled(v);
                  },
                },
                {
                  fingers: "2",
                  action: "Resize & move word",
                  value: wordResizeEnabled,
                  onToggle: (v: boolean) => {
                    wordResizeRef.current = v;
                    setWordResizeEnabled(v);
                  },
                },
                {
                  fingers: "3+",
                  action: "Move all words",
                  value: groupGestureEnabled,
                  onToggle: (v: boolean) => {
                    groupGestureRef.current = v;
                    setGroupGestureEnabled(v);
                  },
                },
              ] as const
            ).map((row) => (
              <View key={row.fingers} style={menuStyles.row}>
                <View style={menuStyles.badge}>
                  <Text style={menuStyles.badgeNum}>{row.fingers}</Text>
                  <Text style={menuStyles.badgeSub}>
                    {row.fingers === "1" ? "finger" : "fingers"}
                  </Text>
                </View>
                <Text style={menuStyles.action}>{row.action}</Text>
                <Switch
                  value={row.value}
                  onValueChange={row.onToggle}
                  trackColor={{
                    false: "rgba(255,255,255,0.15)",
                    true: "rgba(57,243,255,0.5)",
                  }}
                  thumbColor={row.value ? "#39F3FF" : "rgba(255,255,255,0.6)"}
                  ios_backgroundColor="rgba(255,255,255,0.15)"
                />
              </View>
            ))}

            <Pressable
              style={menuStyles.resetBtn}
              onPress={() => {
                setWordResetKey((k) => k + 1);
                groupPan.setValue({ x: 0, y: 0 });
                groupScaleAnim.setValue(1);
                groupCurrentScale.current = 1;
                setShowGestureMenu(false);
              }}
            >
              <Ionicons name="refresh-outline" size={15} color="#000" />
              <Text style={menuStyles.resetText}>Reset Positions</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const menuStyles = StyleSheet.create({
  dotsBtn: {
    position: "absolute",
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    top: 88,
    right: 16,
    backgroundColor: "rgba(10,10,15,0.97)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 230,
  },
  heading: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  badge: {
    minWidth: 44,
    borderRadius: 6,
    backgroundColor: "rgba(57,243,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  badgeNum: {
    color: "#39F3FF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },
  badgeSub: {
    color: "#39F3FF",
    fontSize: 9,
    fontWeight: "600",
    opacity: 0.8,
    lineHeight: 11,
  },
  action: {
    flex: 1,
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "#39F3FF",
    borderRadius: 8,
    paddingVertical: 9,
  },
  resetText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
});

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
