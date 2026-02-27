import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import * as Haptics from "expo-haptics";
import { PressableScale } from "@/components/ui/PressableScale";
import { useRouter } from "expo-router";
import { TextStroke } from "../Login/utils";
import { styles } from "./styles";

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
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  backgroundColor: string;
  icon: string;
}

interface FontStyleOption {
  name: string;
  icon: string;
  description: string;
}

const LED_THEMES: Record<LEDStyle, LEDTheme> = {
  neon: {
    name: "Neon Cyan",
    primaryColor: "#00FFFF",
    secondaryColor: "#00CED1",
    glowColor: "rgba(0, 255, 255, 0.8)",
    backgroundColor: "#0a0a1a",
    icon: "flash",
  },
  classic: {
    name: "Classic Red",
    primaryColor: "#FF0000",
    secondaryColor: "#8B0000",
    glowColor: "rgba(255, 0, 0, 0.6)",
    backgroundColor: "#1a1a1a",
    icon: "radio-button-on",
  },
  matrix: {
    name: "Matrix Green",
    primaryColor: "#00FF00",
    secondaryColor: "#008000",
    glowColor: "rgba(0, 255, 0, 0.7)",
    backgroundColor: "#000000",
    icon: "code-slash",
  },
  retro: {
    name: "Retro Orange",
    primaryColor: "#FFA500",
    secondaryColor: "#FF4500",
    glowColor: "rgba(255, 165, 0, 0.6)",
    backgroundColor: "#2a1a0a",
    icon: "game-controller",
  },
  fire: {
    name: "Fire",
    primaryColor: "#FF4500",
    secondaryColor: "#FFD700",
    glowColor: "rgba(255, 69, 0, 0.8)",
    backgroundColor: "#1a0a00",
    icon: "flame",
  },
  pink: {
    name: "Pink",
    primaryColor: "#FF1493",
    secondaryColor: "#FF69B4",
    glowColor: "rgba(255, 20, 147, 0.7)",
    backgroundColor: "#1a0a14",
    icon: "heart",
  },
  purple: {
    name: "Purple",
    primaryColor: "#9370DB",
    secondaryColor: "#8B00FF",
    glowColor: "rgba(147, 112, 219, 0.7)",
    backgroundColor: "#0f0a1a",
    icon: "star",
  },
  white: {
    name: "White",
    primaryColor: "#FFFFFF",
    secondaryColor: "#E0E0E0",
    glowColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "#000000",
    icon: "snow",
  },
};

const FONT_STYLES: Record<FontStyle, FontStyleOption> = {
  solid: {
    name: "Solid",
    icon: "square",
    description: "Clean filled text",
  },
  outline: {
    name: "Outline",
    icon: "square-outline",
    description: "Hollow stroke only",
  },
  shadow: {
    name: "Shadow",
    icon: "layers",
    description: "Classic 3D drop",
  },
  neon: {
    name: "Neon",
    icon: "bulb",
    description: "Ultra bright glow",
  },
  glitch: {
    name: "Glitch",
    icon: "bug",
    description: "Cyberpunk shift",
  },
  "3d": {
    name: "3D Pop",
    icon: "cube",
    description: "Extruded depth",
  },
};

export function ScanScreen() {
  const router = useRouter();
  const [text, setText] = useState("TAP TO ENTER YOUR TEXT");
  const [speed, setSpeed] = useState(120); // Turbo speed
  const [currentStyle, setCurrentStyle] = useState<LEDStyle>("neon");
  const [currentFontStyle, setCurrentFontStyle] = useState<FontStyle>("solid");
  const [fontSize, setFontSize] = useState(48);
  const [animationMode, setAnimationMode] = useState<"static" | "scroll">(
    "scroll",
  );
  const [waveEnabled, setWaveEnabled] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);

  const scrollX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);

  const theme = LED_THEMES[currentStyle];

  // Reset scroll position when scrolling is enabled or text changes
  useEffect(() => {
    if (animationMode === "scroll") {
      scrollX.setValue(SCREEN_WIDTH);
    }
  }, [animationMode, text]);

  // Horizontal scrolling animation (scroll mode)
  useEffect(() => {
    if (animationMode !== "scroll") return;

    // Reset position before starting animation
    scrollX.setValue(SCREEN_WIDTH);

    const letterSpacing = 4;
    const charWidth = 0.75; // More accurate estimate for monospace font
    // Remove trailing spaces for display
    const displayText = text.replace(/\s+$/, "").toUpperCase();
    // Correct formula: N characters + (N-1) letter spacings
    const textWidth =
      displayText.length * fontSize * charWidth +
      (displayText.length - 1) * letterSpacing;
    const totalDistance = SCREEN_WIDTH + textWidth;
    const duration = (totalDistance / speed) * 1000;

    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -textWidth - 20, // Extra margin to ensure last character fully exits
        duration: duration,
        delay: 0,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [text, speed, fontSize, animationMode]);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

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
    return () => animation.stop();
  }, [animationMode, waveEnabled]);

  const handleStyleChange = (style: LEDStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStyle(style);
  };

  const handleFontStyleChange = (style: FontStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentFontStyle(style);
  };

  const handleFullscreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/led-fullscreen",
      params: {
        text,
        style: currentStyle,
        fontStyle: currentFontStyle,
        fontSize: fontSize.toString(),
        animationMode,
        waveEnabled: waveEnabled.toString(),
      },
    });
  };

  const handleSaveMessage = () => {
    if (text.trim() && !savedMessages.includes(text.trim())) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSavedMessages([text.trim(), ...savedMessages]);
    }
  };

  const handleDeleteMessage = (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSavedMessages(savedMessages.filter((m) => m !== message));
  };

  // Calculate font size based on text length (simple approach)
  const calculateStaticFontSize = () => {
    const textLength = text.length;

    // Conservative font sizes to ensure text fits without overflow
    if (textLength < 10) {
      return 36;
    } else if (textLength < 20) {
      return 25;
    } else if (textLength < 30) {
      return 19;
    } else if (textLength < 40) {
      return 16;
    } else if (textLength < 60) {
      return 14;
    } else {
      return 12;
    }
  };

  const getTextStyleForFont = (baseColor: any, actualFontSize: number) => {
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
          textShadowColor: baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        };
      case "shadow":
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 4, height: 4 },
          textShadowRadius: 8,
        };
      case "neon":
        // Ultra intense neon glow
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 50,
        };
      case "glitch":
        // Cyberpunk glitch with offset
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: baseColor,
          textShadowOffset: { width: 3, height: -2 },
          textShadowRadius: 15,
        };
      case "3d":
        // 3D pop effect - dramatic raised effect with white shadow
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: "rgba(255, 255, 255, 0.4)",
          textShadowOffset: { width: 5, height: 5 },
          textShadowRadius: 2,
        };
      default:
        return {
          ...baseStyle,
          color: baseColor,
          textShadowColor: theme.glowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
        };
    }
  };

  const renderLEDText = (customFontSize?: number, isFullscreen?: boolean) => {
    let actualFontSize = customFontSize || fontSize;

    // Use fixed font size for static and wave modes to allow text wrapping
    if (animationMode !== "scroll") {
      actualFontSize = 24; // Fixed font size instead of dynamic calculation
    }

    // Remove trailing spaces for display
    const displayText = text.replace(/\s+$/, "").toUpperCase();

    const textColor = theme.primaryColor;

    const fontStyleProps = getTextStyleForFont(textColor, actualFontSize);

    // Normal mode
    if (!isFullscreen) {
      // Use a very large width for scrolling to prevent wrapping
      const textWidth = animationMode === "scroll" ? 99999 : undefined;

      if (animationMode === "scroll") {
        return (
          <Animated.Text
            style={{
              position: "absolute",
              left: 0,
              fontSize: actualFontSize,
              ...fontStyleProps,
              letterSpacing: 4,
              transform: [{ translateX: scrollX }],
              width: textWidth,
            }}
          >
            {displayText}
          </Animated.Text>
        );
      }

      // Same approach as fullscreen but without rotation
      const ledBoxWidth = SCREEN_WIDTH - 32 - 8 - 6;

      // Pulsating animation - vibrating from club noise
      if (animationMode === "static" && waveEnabled) {
        const pulseScale = waveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        });

        const vibrateX = waveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1.5],
        });

        const vibrateY = waveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1.5],
        });

        if (currentFontStyle === "outline") {
          return (
            <Animated.View
              style={{
                transform: [
                  { scale: pulseScale },
                  { translateX: vibrateX },
                  { translateY: vibrateY },
                ],
              }}
            >
              <TextStroke color={textColor as string} stroke={2}>
                <Text
                  style={{
                    width: ledBoxWidth * 0.98,
                    fontSize: actualFontSize,
                    letterSpacing: 2,
                    fontWeight: "900",
                    fontFamily: "monospace",
                    textAlign: "center",
                    lineHeight: actualFontSize * 1.2,
                  }}
                >
                  {displayText}
                </Text>
              </TextStroke>
            </Animated.View>
          );
        }

        return (
          <Animated.Text
            style={{
              width: ledBoxWidth * 0.98,
              fontSize: actualFontSize,
              ...fontStyleProps,
              letterSpacing: 2,
              textAlign: "center",
              lineHeight: actualFontSize * 1.2,
              transform: [
                { scale: pulseScale },
                { translateX: vibrateX },
                { translateY: vibrateY },
              ],
            }}
          >
            {displayText}
          </Animated.Text>
        );
      }

      // Use TextStroke for outline effect when static
      if (currentFontStyle === "outline") {
        return (
          <TextStroke color={textColor as string} stroke={2}>
            <Text
              style={{
                width: ledBoxWidth * 0.98,
                fontSize: actualFontSize,
                letterSpacing: 2,
                fontWeight: "900",
                fontFamily: "monospace",
                textAlign: "center",
                lineHeight: actualFontSize * 1.2,
              }}
            >
              {displayText}
            </Text>
          </TextStroke>
        );
      }

      return (
        <Text
          style={{
            width: ledBoxWidth * 0.98,
            fontSize: actualFontSize,
            ...fontStyleProps,
            letterSpacing: 2,
            textAlign: "center",
            lineHeight: actualFontSize * 1.2,
          }}
        >
          {displayText}
        </Text>
      );
    }

    // Fullscreen mode
    const textWidth =
      animationMode === "scroll"
        ? displayText.length * actualFontSize * 0.6
        : SCREEN_HEIGHT * 0.9;

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: "#000000",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.Text
          style={{
            width: textWidth,
            fontSize: actualFontSize,
            ...fontStyleProps,
            letterSpacing: 1,
            textAlign: "center",
            transform:
              animationMode === "scroll"
                ? [{ translateY: scrollY }, { rotate: "90deg" }]
                : [{ rotate: "90deg" }],
          }}
        >
          {displayText}
        </Animated.Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      edges={["top"]}
    >
      <StatusBar style="light" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Fullscreen Button */}
        <View style={styles.header}>
          <PressableScale
            onPress={text.trim().length > 0 ? handleFullscreen : undefined}
            style={[
              styles.fullscreenButtonWrapper,
              text.trim().length === 0 && { opacity: 0.3 },
            ]}
            disabled={text.trim().length === 0}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={[theme.primaryColor, theme.secondaryColor]}
                style={styles.headerIconContainer}
              >
                <Ionicons name="tv" size={32} color={theme.backgroundColor} />
              </LinearGradient>
            </Animated.View>
            <Text
              style={[styles.fullscreenHint, { color: theme.primaryColor }]}
            >
              {text.trim().length > 0 ? "Tap for Fullscreen" : "Add Text First"}
            </Text>
          </PressableScale>

          <Text style={[styles.headerTitle, { color: theme.primaryColor }]}>
            LED BANNER
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.secondaryColor }]}
          >
            Tap display to edit • Swipe styles to change
          </Text>
        </View>

        {/* LED Display - Tap to Edit */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsEditingText(true);
            setTimeout(() => textInputRef.current?.focus(), 100);
          }}
          style={[
            styles.ledDisplay,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <View style={styles.ledBorder}>
            {/* Corner lights */}
            {[0, 1, 2, 3].map((corner) => (
              <Animated.View
                key={corner}
                style={[
                  styles.cornerLight,
                  {
                    backgroundColor: theme.primaryColor,
                    shadowColor: theme.glowColor,
                    transform: [{ scale: pulseAnim }],
                    [corner === 0 || corner === 3 ? "top" : "bottom"]: 8,
                    [corner === 0 || corner === 1 ? "left" : "right"]: 8,
                  },
                ]}
              />
            ))}

            {/* Edit hint overlay */}
            {!isEditingText && (
              <View style={styles.editHintOverlay} pointerEvents="none">
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={theme.primaryColor}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={[styles.editHintText, { color: theme.primaryColor }]}
                >
                  Tap to Edit
                </Text>
              </View>
            )}

            {/* Scrolling text or empty state */}
            <View style={styles.textContainer}>
              {text.trim().length > 0 ? (
                renderLEDText(undefined, false)
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Ionicons
                      name="create"
                      size={32}
                      color={theme.primaryColor}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: theme.primaryColor },
                    ]}
                  >
                    Tap to add your message
                  </Text>
                  <Text
                    style={[
                      styles.emptyStateSubtext,
                      { color: theme.secondaryColor },
                    ]}
                  >
                    Create stunning LED displays
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Scanlines effect */}
          <View style={styles.scanlines} pointerEvents="none">
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.scanline, { opacity: 0.05 }]} />
            ))}
          </View>
        </PressableScale>

        {/* Quick Edit Input */}
        {isEditingText && (
          <Animated.View style={styles.quickEditContainer}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.quickEditInput,
                {
                  borderColor: theme.primaryColor,
                  color: Colors.platinum,
                  fontSize: 16,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="Enter your message..."
              placeholderTextColor={Colors.smoke}
              autoFocus
              autoCapitalize="characters"
              autoCorrect={false}
              multiline
              scrollEnabled
              allowFontScaling={false}
              onBlur={() => setIsEditingText(false)}
            />
            <View style={styles.quickEditActions}>
              <PressableScale
                style={[
                  styles.quickEditButton,
                  { backgroundColor: theme.primaryColor },
                ]}
                onPress={() => {
                  handleSaveMessage();
                  setIsEditingText(false);
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.backgroundColor}
                />
                <Text
                  style={[
                    styles.quickEditButtonText,
                    { color: theme.backgroundColor },
                  ]}
                >
                  Save
                </Text>
              </PressableScale>
              <PressableScale
                style={styles.quickEditButton}
                onPress={() => {
                  setIsEditingText(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="close" size={20} color={Colors.smoke} />
                <Text
                  style={[styles.quickEditButtonText, { color: Colors.smoke }]}
                >
                  Cancel
                </Text>
              </PressableScale>
            </View>
          </Animated.View>
        )}

        {/* Mode Toggle */}
        <View style={styles.controls}>
          <PressableScale
            style={[
              styles.modeButton,
              animationMode === "static" && {
                backgroundColor: theme.primaryColor,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAnimationMode("static");
            }}
          >
            <Ionicons
              name="pause"
              size={20}
              color={
                animationMode === "static"
                  ? theme.backgroundColor
                  : theme.primaryColor
              }
            />
            <Text
              style={[
                styles.modeButtonText,
                {
                  color:
                    animationMode === "static"
                      ? theme.backgroundColor
                      : theme.primaryColor,
                },
              ]}
            >
              Static
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.modeButton,
              animationMode === "scroll" && {
                backgroundColor: theme.primaryColor,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAnimationMode("scroll");
            }}
          >
            <Ionicons
              name="play"
              size={20}
              color={
                animationMode === "scroll"
                  ? theme.backgroundColor
                  : theme.primaryColor
              }
            />
            <Text
              style={[
                styles.modeButtonText,
                {
                  color:
                    animationMode === "scroll"
                      ? theme.backgroundColor
                      : theme.primaryColor,
                },
              ]}
            >
              Scroll
            </Text>
          </PressableScale>
        </View>

        {/* 3D Wave Toggle - Only visible when Static is selected */}
        {animationMode === "static" && (
          <Animated.View style={styles.waveToggleContainer}>
            <PressableScale
              style={[
                styles.waveToggleCard,
                waveEnabled && {
                  backgroundColor: `${theme.primaryColor}15`,
                  borderColor: theme.primaryColor,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWaveEnabled(!waveEnabled);
              }}
            >
              <View style={styles.waveToggleContent}>
                <View style={styles.waveToggleLeft}>
                  <View
                    style={[
                      styles.waveToggleIcon,
                      waveEnabled && {
                        backgroundColor: `${theme.primaryColor}30`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="pulse"
                      size={24}
                      color={waveEnabled ? theme.primaryColor : Colors.smoke}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.waveToggleLabel,
                        {
                          color: waveEnabled
                            ? theme.primaryColor
                            : Colors.platinum,
                        },
                      ]}
                    >
                      Bass Pulse
                    </Text>
                    <Text
                      style={[styles.waveToggleDesc, { color: Colors.smoke }]}
                    >
                      Vibrating from club noise
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    waveEnabled && { backgroundColor: theme.primaryColor },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      waveEnabled && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </View>
            </PressableScale>
          </Animated.View>
        )}

        {/* Style Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
              LED STYLE
            </Text>
            <Text style={[styles.sectionHint, { color: theme.secondaryColor }]}>
              Swipe to browse →
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.styleScroll}
          >
            {(Object.keys(LED_THEMES) as LEDStyle[]).map((style) => {
              const styleTheme = LED_THEMES[style];
              const isActive = currentStyle === style;

              return (
                <PressableScale
                  key={style}
                  style={[
                    styles.styleCard,
                    isActive && {
                      borderColor: styleTheme.primaryColor,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleStyleChange(style)}
                >
                  <LinearGradient
                    colors={[
                      styleTheme.primaryColor,
                      styleTheme.secondaryColor,
                    ]}
                    style={styles.styleIconContainer}
                  >
                    <Ionicons
                      name={styleTheme.icon as any}
                      size={24}
                      color={styleTheme.backgroundColor}
                    />
                  </LinearGradient>
                  <Text style={[styles.styleLabel, { color: Colors.platinum }]}>
                    {styleTheme.name}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: styleTheme.primaryColor },
                      ]}
                    />
                  )}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Font Style Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
              FONT STYLE
            </Text>
            <Text style={[styles.sectionHint, { color: theme.secondaryColor }]}>
              Choose effect →
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.styleScroll}
          >
            {(Object.keys(FONT_STYLES) as FontStyle[]).map((fontStyle) => {
              const styleOption = FONT_STYLES[fontStyle];
              const isActive = currentFontStyle === fontStyle;

              return (
                <PressableScale
                  key={fontStyle}
                  style={[
                    styles.fontStyleCard,
                    isActive && {
                      borderColor: theme.primaryColor,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleFontStyleChange(fontStyle)}
                >
                  <View
                    style={[
                      styles.fontStylePreview,
                      { backgroundColor: theme.backgroundColor },
                    ]}
                  >
                    {fontStyle === "outline" ? (
                      <TextStroke color={theme.primaryColor} stroke={0.6}>
                        <Text style={{ fontSize: 36 }}>A</Text>
                      </TextStroke>
                    ) : (
                      <Text
                        style={[
                          styles.fontStylePreviewText,
                          {
                            color: theme.primaryColor,
                            ...(fontStyle === "shadow" && {
                              textShadowColor: theme.primaryColor,
                              textShadowOffset: { width: 2, height: 2 },
                              textShadowRadius: 4,
                            }),
                            ...(fontStyle === "neon" && {
                              textShadowColor: theme.primaryColor,
                              textShadowRadius: 20,
                            }),
                            ...(fontStyle === "glitch" && {
                              textShadowColor: theme.primaryColor,
                              textShadowOffset: { width: 2, height: -1 },
                              textShadowRadius: 6,
                            }),
                            ...(fontStyle === "3d" && {
                              textShadowColor: "rgba(255, 255, 255, 0.4)",
                              textShadowOffset: { width: 2, height: 2 },
                              textShadowRadius: 1,
                            }),
                          },
                        ]}
                      >
                        A
                      </Text>
                    )}
                  </View>
                  <View style={styles.fontStyleInfo}>
                    <Text
                      style={[
                        styles.fontStyleLabel,
                        { color: Colors.platinum },
                      ]}
                    >
                      {styleOption.name}
                    </Text>
                    <Text
                      style={[styles.fontStyleDesc, { color: Colors.smoke }]}
                    >
                      {styleOption.description}
                    </Text>
                  </View>
                  {isActive && (
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: theme.primaryColor },
                      ]}
                    />
                  )}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Saved Messages */}
        {savedMessages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.primaryColor }]}
              >
                YOUR MESSAGES
              </Text>
              <Text
                style={[styles.sectionHint, { color: theme.secondaryColor }]}
              >
                {savedMessages.length} saved
              </Text>
            </View>
            {savedMessages.map((message, index) => (
              <View key={index} style={styles.savedMessageItem}>
                <PressableScale
                  style={styles.savedMessageButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setText(message);
                  }}
                >
                  <Ionicons
                    name="bookmark"
                    size={16}
                    color={theme.primaryColor}
                  />
                  <Text style={styles.savedMessageText} numberOfLines={1}>
                    {message}
                  </Text>
                </PressableScale>
                <PressableScale
                  style={styles.deleteMessageButton}
                  onPress={() => handleDeleteMessage(message)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.smoke}
                  />
                </PressableScale>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
