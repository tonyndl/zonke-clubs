import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  TextInput,
  Pressable,
  PanResponder,
} from "react-native";
import { Modal } from "@/components/modal";
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { FONT_FAMILIES } from "@/constants/fontFamilies";
import * as Haptics from "expo-haptics";
import { PressableScale } from "@/components/ui/PressableScale";
import { useRouter } from "expo-router";
import { TextStroke } from "../Login/utils";
import { styles } from "./styles";
import { useLedColor } from "@/contexts/LedColorContext";
import { useFonts } from "expo-font";
import { Nabla_400Regular } from "@expo-google-fonts/nabla";
import { Sixtyfour_400Regular } from "@expo-google-fonts/sixtyfour";
import { Ballet_400Regular } from "@expo-google-fonts/ballet";
import { Miltonian_400Regular } from "@expo-google-fonts/miltonian";
import { RalewayDots_400Regular } from "@expo-google-fonts/raleway-dots";
import { CaesarDressing_400Regular } from "@expo-google-fonts/caesar-dressing";
import { TradeWinds_400Regular } from "@expo-google-fonts/trade-winds";
import { Sancreek_400Regular } from "@expo-google-fonts/sancreek";
import { Lemon_400Regular } from "@expo-google-fonts/lemon";
import { RubikDirt_400Regular } from "@expo-google-fonts/rubik-dirt";
import { Codystar_400Regular } from "@expo-google-fonts/codystar";
import { Kablammo_400Regular } from "@expo-google-fonts/kablammo";
import { Matemasie_400Regular } from "@expo-google-fonts/matemasie";
import { HoltwoodOneSC_400Regular } from "@expo-google-fonts/holtwood-one-sc";
import { Nosifer_400Regular } from "@expo-google-fonts/nosifer";
import { SairaStencilOne_400Regular } from "@expo-google-fonts/saira-stencil-one";
import { UncialAntiqua_400Regular } from "@expo-google-fonts/uncial-antiqua";
import { ProstoOne_400Regular } from "@expo-google-fonts/prosto-one";
import { FontdinerSwanky_400Regular } from "@expo-google-fonts/fontdiner-swanky";
import { BungeeShade_400Regular } from "@expo-google-fonts/bungee-shade";
import { FasterOne_400Regular } from "@expo-google-fonts/faster-one";
import { Wallpoet_400Regular } from "@expo-google-fonts/wallpoet";
import { Monoton_400Regular } from "@expo-google-fonts/monoton";
import { RockSalt_400Regular } from "@expo-google-fonts/rock-salt";
import { Eater_400Regular } from "@expo-google-fonts/eater";
import { Gelasio_400Regular } from "@expo-google-fonts/gelasio";
import { Audiowide_400Regular } from "@expo-google-fonts/audiowide";
import { RubikWetPaint_400Regular } from "@expo-google-fonts/rubik-wet-paint";
import { Parisienne_400Regular } from "@expo-google-fonts/parisienne";
import { RubikMarkerHatch_400Regular } from "@expo-google-fonts/rubik-marker-hatch";
import { GloriaHallelujah_400Regular } from "@expo-google-fonts/gloria-hallelujah";
import { PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import { OleoScript_400Regular } from "@expo-google-fonts/oleo-script";
import { Prata_400Regular } from "@expo-google-fonts/prata";
import { GermaniaOne_400Regular } from "@expo-google-fonts/germania-one";
import { Creepster_400Regular } from "@expo-google-fonts/creepster";
import { BitcountInk_400Regular } from "@expo-google-fonts/bitcount-ink";
import { EduAUVICWANTHand_400Regular } from "@expo-google-fonts/edu-au-vic-wa-nt-hand";
import { PlaywriteIE_400Regular } from "@expo-google-fonts/playwrite-ie";
import { Workbench_400Regular } from "@expo-google-fonts/workbench";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOX_WIDTH = SCREEN_WIDTH - 32 - 8 - 6; // marginHorizontal(32) + ledBorder margin(8) + border(6)
const PREVIEW_TEXT_WIDTH = BOX_WIDTH * 0.98; // matches render width
const PREVIEW_BOX_HEIGHT = 186; // ledDisplay 200 - ledBorder margin(8) - border(6)
const STATIC_REF_FONT = 50;

type LEDStyle =
  | "classic"
  | "neon"
  | "matrix"
  | "retro"
  | "fire"
  | "pink"
  | "purple"
  | "white";
interface LEDTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  backgroundColor: string;
  icon: string;
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

function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r: number, g: number, b: number;
  switch (i) {
    case 0:
      [r, g, b] = [v, t, p];
      break;
    case 1:
      [r, g, b] = [q, v, p];
      break;
    case 2:
      [r, g, b] = [p, v, t];
      break;
    case 3:
      [r, g, b] = [p, q, v];
      break;
    case 4:
      [r, g, b] = [t, p, v];
      break;
    default:
      [r, g, b] = [v, p, q];
      break;
  }
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r!)}${toHex(g!)}${toHex(b!)}`;
}

const WHEEL_SLICES = 120;

function ColorWheelPicker({
  size,
  initialColor,
  onColorChange,
  previewTextColor,
  previewBgColor,
}: {
  size: number;
  initialColor: string;
  onColorChange: (hex: string) => void;
  previewTextColor?: string;
  previewBgColor?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const holeR = size * 0.18;
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const pickColor = (x: number, y: number) => {
    const dx = x - cx;
    const dy = y - cy;
    const radius = Math.sqrt(dx * dx + dy * dy);
    if (radius > outerR || radius < holeR) return;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    const saturation = Math.min(1, (radius - holeR) / (outerR - holeR));
    const hex = hsvToHex(angle, saturation, 1);
    setSelectedColor(hex);
    onColorChange(hex);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        pickColor(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) =>
        pickColor(e.nativeEvent.locationX, e.nativeEvent.locationY),
    }),
  ).current;

  const slices = useMemo(() => {
    const paths: React.ReactElement[] = [];
    for (let i = 0; i < WHEEL_SLICES; i++) {
      const startAngle = (i / WHEEL_SLICES) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((i + 1) / WHEEL_SLICES) * 2 * Math.PI - Math.PI / 2;
      const hue = (i / WHEEL_SLICES) * 360;
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} Z`;
      paths.push(<Path key={i} d={d} fill={`hsl(${hue}, 100%, 50%)`} />);
    }
    return paths;
  }, [size]);

  const showPreview = !!(previewTextColor || previewBgColor);
  // Color of the "A" letter:
  //   text color picker (previewBgColor set): selectedColor (live, the color being chosen)
  //   bg color picker   (previewTextColor set): previewTextColor (fixed LED text color)
  const aColor = previewBgColor ? selectedColor : (previewTextColor as string);
  // Fill inside the "A" for outline style
  const aInsideColor = previewBgColor ?? selectedColor;

  const getATextStyle = (): any => {
    const base = {
      fontWeight: "900" as const,
      fontFamily: "monospace",
      width: 80,
      textAlign: "center",
      fontSize: holeR * 0.9,
      lineHeight: holeR * 0.9,
      includeFontPadding: false,
      overflow: "visible",
    };
    return { ...base, color: aColor };
  };

  return (
    <View {...panResponder.panHandlers} style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="satMask" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="white" stopOpacity="1" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {slices}
        <Circle cx={cx} cy={cy} r={outerR} fill="url(#satMask)" />
        {/* Center hole */}
        <Circle
          cx={cx}
          cy={cy}
          r={holeR}
          fill={previewBgColor ?? selectedColor}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={holeR}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
        />
      </Svg>

      {/* "A" preview overlay — rendered as RN Text so shadows/font styles work */}
      {showPreview && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={getATextStyle()}>A</Text>
        </View>
      )}
    </View>
  );
}

const SPEED_MIN = 50;
const SPEED_MAX = 400;
const THUMB_SIZE = 26;

function SpeedSlider({
  value,
  onChange,
  primaryColor,
  secondaryColor,
  backgroundColor,
  onDragStart,
  onDragEnd,
}: {
  value: number;
  onChange: (speed: number) => void;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const positionRef = useRef(0);
  const startXRef = useRef(0);
  const effectiveWidthRef = useRef(1);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const onChangeRef = useRef(onChange);
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;
  onChangeRef.current = onChange;

  const effectiveWidth = Math.max(1, trackWidth - THUMB_SIZE);
  effectiveWidthRef.current = effectiveWidth;

  const position =
    trackWidth > 0
      ? ((value - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * effectiveWidth
      : 0;
  positionRef.current = position;

  const getLabel = (v: number) => {
    if (v < 100) return "SLOW";
    if (v < 180) return "NORMAL";
    if (v < 280) return "FAST";
    return "TURBO";
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        startXRef.current = positionRef.current;
        onDragStartRef.current();
      },
      onPanResponderMove: (_, gs) => {
        const ew = effectiveWidthRef.current;
        const newPos = Math.max(0, Math.min(ew, startXRef.current + gs.dx));
        const newSpeed = Math.round(
          SPEED_MIN + (newPos / ew) * (SPEED_MAX - SPEED_MIN),
        );
        onChangeRef.current(newSpeed);
      },
      onPanResponderRelease: () => onDragEndRef.current(),
      onPanResponderTerminate: () => onDragEndRef.current(),
    }),
  ).current;

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: Colors.white,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
          }}
        >
          SCROLL SPEED
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 8,
            backgroundColor: primaryColor + "22",
            borderWidth: 1,
            borderColor: primaryColor + "55",
          }}
        >
          <Text
            style={{
              color: primaryColor,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            {getLabel(value)}
          </Text>
        </View>
      </View>

      {/* Slider track */}
      <View
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{ height: THUMB_SIZE + 8, justifyContent: "center" }}
        {...panResponder.panHandlers}
      >
        {trackWidth > 0 && (
          <>
            {/* Background track */}
            <View
              style={{
                position: "absolute",
                left: THUMB_SIZE / 2,
                right: THUMB_SIZE / 2,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />

            {/* Filled gradient track */}
            <LinearGradient
              colors={[secondaryColor + "90", primaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: "absolute",
                left: THUMB_SIZE / 2,
                width: Math.max(0, position),
                height: 4,
                borderRadius: 2,
              }}
            />

            {/*thumb */}
            <View
              style={{
                position: "absolute",
                left: position,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: primaryColor,
                borderWidth: 3,
                borderColor: backgroundColor,
              }}
            />
          </>
        )}
      </View>

      {/* SLOW / FAST labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <Text
          style={{
            color: Colors.platinum,
            fontSize: 9,
            fontWeight: "600",
            letterSpacing: 1,
          }}
        >
          SLOW
        </Text>
        <Text
          style={{
            color: Colors.platinum,
            fontSize: 9,
            fontWeight: "600",
            letterSpacing: 1,
          }}
        >
          FAST
        </Text>
      </View>
    </View>
  );
}

export function ScanScreen() {
  const router = useRouter();
  const { setLedPrimaryColor } = useLedColor();
  const [text, setText] = useState("TAP TO ENTER YOUR TEXT");
  const [speed, setSpeed] = useState(225);
  const [currentStyle, setCurrentStyle] = useState<LEDStyle>("neon");
  const [fontSize, setFontSize] = useState(48);
  const [animationMode, setAnimationMode] = useState<"static" | "scroll">(
    "scroll",
  );
  const [waveEnabled, setWaveEnabled] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const textBeforeEditRef = useRef<string>("");
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#000000");
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorModalTab, setColorModalTab] = useState<"text" | "bg">("text");
  const [pendingTextColor, setPendingTextColor] = useState<string>("#00FFFF");
  const [pendingBgColor, setPendingBgColor] = useState<string>("#000000");
  const pendingTextColorRef = useRef<string>("#00FFFF");
  const pendingBgColorRef = useRef<string>("#000000");
  const [modalWheelKey, setModalWheelKey] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [currentFontFamily, setCurrentFontFamily] = useState("monospace");
  const [hollowStroke, setHollowStroke] = useState(false);

  useFonts({
    Nabla_400Regular,
    Sixtyfour_400Regular,
    Ballet_400Regular,
    Miltonian_400Regular,
    RalewayDots_400Regular,
    CaesarDressing_400Regular,
    TradeWinds_400Regular,
    Sancreek_400Regular,
    Lemon_400Regular,
    RubikDirt_400Regular,
    Codystar_400Regular,
    Kablammo_400Regular,
    Matemasie_400Regular,
    HoltwoodOneSC_400Regular,
    Nosifer_400Regular,
    SairaStencilOne_400Regular,
    UncialAntiqua_400Regular,
    ProstoOne_400Regular,
    FontdinerSwanky_400Regular,
    BungeeShade_400Regular,
    FasterOne_400Regular,
    Wallpoet_400Regular,
    Monoton_400Regular,
    RockSalt_400Regular,
    Eater_400Regular,
    Gelasio_400Regular,
    Audiowide_400Regular,
    RubikWetPaint_400Regular,
    Parisienne_400Regular,
    RubikMarkerHatch_400Regular,
    GloriaHallelujah_400Regular,
    PressStart2P_400Regular,
    OleoScript_400Regular,
    Prata_400Regular,
    GermaniaOne_400Regular,
    Creepster_400Regular,
    BitcountInk_400Regular,
    EduAUVICWANTHand_400Regular,
    PlaywriteIE_400Regular,
    Workbench_400Regular,
  });

  const effectiveFontFamily = currentFontFamily;

  const scrollX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);
  const [measuredTextWidth, setMeasuredTextWidth] = useState<number | null>(
    null,
  );
  const [staticRefBlockHeight, setStaticRefBlockHeight] = useState<
    number | null
  >(null);
  const [staticRefNoWrapWidth, setStaticRefNoWrapWidth] = useState<
    number | null
  >(null);

  const baseTheme = LED_THEMES[currentStyle];
  const theme = customColor
    ? {
        ...baseTheme,
        primaryColor: customColor,
        secondaryColor: customColor,
        glowColor: customColor + "99",
      }
    : baseTheme;

  // Initialize pending colors from committed state when modal opens
  useEffect(() => {
    if (showColorModal) {
      const tc = customColor || theme.primaryColor;
      const bc = bgColor;
      setPendingTextColor(tc);
      setPendingBgColor(bc);
      pendingTextColorRef.current = tc;
      pendingBgColorRef.current = bc;
    }
  }, [showColorModal]);

  // Reset scroll measurement when text or font changes
  useEffect(() => {
    if (animationMode === "scroll") {
      setMeasuredTextWidth(null);
    }
  }, [text, fontSize, animationMode, effectiveFontFamily]);

  // Horizontal scrolling animation — only starts once real text width is measured
  useEffect(() => {
    if (animationMode !== "scroll") return;
    if (measuredTextWidth === null) return;

    const textWidth = measuredTextWidth;

    scrollX.setValue(BOX_WIDTH);

    // Travel = textWidth + BOX_WIDTH so last char exits left exactly when next copy enters right
    const totalDistance = BOX_WIDTH + textWidth;
    const duration = (totalDistance / speed) * 1000;

    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -textWidth,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [measuredTextWidth, speed, animationMode]);

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
    setCustomColor(null);
    setLedPrimaryColor(LED_THEMES[style].primaryColor);
  };

  const handleCustomColorComplete = (hex: string) => {
    setCustomColor(hex);
    setLedPrimaryColor(hex);
    setShowColorModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFullscreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: "/led-fullscreen",
      params: {
        text,
        style: currentStyle,
        fontSize: fontSize.toString(),
        animationMode,
        waveEnabled: waveEnabled.toString(),
        customColor: customColor || "",
        speed: speed.toString(),
        bgColor,
        fontFamily: effectiveFontFamily,
        hollowStroke: hollowStroke.toString(),
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

  const staticBaseText = text.replace(/\s+$/, "").toUpperCase();
  const staticLongestWord = staticBaseText
    .trim()
    .split(/\s+/)
    .reduce(
      (a, b) => (b.length > a.length ? b : a),
      staticBaseText.trim() || " ",
    );

  let staticFontSize = 24; // fallback while measuring
  if (
    staticRefBlockHeight !== null &&
    staticRefNoWrapWidth !== null &&
    staticRefBlockHeight > 0 &&
    staticRefNoWrapWidth > 0
  ) {
    const fontFromHeight =
      (STATIC_REF_FONT * (PREVIEW_BOX_HEIGHT * 0.9)) / staticRefBlockHeight;
    const fontFromWidth =
      (STATIC_REF_FONT * PREVIEW_TEXT_WIDTH) / staticRefNoWrapWidth;
    staticFontSize = Math.floor(Math.min(fontFromHeight, fontFromWidth));
  }

  const getTextStyleForFont = (baseColor: any) => ({
    ...(effectiveFontFamily === "monospace"
      ? { fontWeight: "900" as const }
      : {}),
    fontFamily: effectiveFontFamily,
    color: baseColor,
  });

  const renderLEDText = (customFontSize?: number, isFullscreen?: boolean) => {
    let actualFontSize = customFontSize || fontSize;

    // Use measured font size for static/wave modes
    if (animationMode !== "scroll") {
      actualFontSize = staticFontSize;
    }

    const baseText = text.replace(/\s+$/, "").toUpperCase();
    const fontWordGap =
      FONT_FAMILIES.find((f) => f.key === effectiveFontFamily)?.wordGap ?? " ";
    const displayText =
      animationMode === "scroll"
        ? baseText.replace(/ /g, fontWordGap)
        : baseText;

    const textColor = theme.primaryColor;

    const fontStyleProps = getTextStyleForFont(textColor);

    // Normal mode
    if (!isFullscreen) {
      // Use a very large width for scrolling to prevent wrapping
      const textWidth = animationMode === "scroll" ? 99999 : undefined;

      if (animationMode === "scroll") {
        const sharedTextStyle = {
          fontSize: actualFontSize + 42,
          ...fontStyleProps,
          color: hollowStroke ? bgColor : textColor,
          letterSpacing: 4,
          width: 99999,
        };
        const scrollText = (key: string) =>
          hollowStroke ? (
            <TextStroke key={key} color={textColor as string} stroke={2}>
              <Text style={sharedTextStyle}>{displayText}</Text>
            </TextStroke>
          ) : (
            <Text key={key} style={sharedTextStyle}>
              {displayText}
            </Text>
          );
        return measuredTextWidth !== null ? (
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              flexDirection: "row",
              alignItems: "center",
              transform: [{ translateX: scrollX }],
            }}
          >
            {scrollText("a")}
            <View style={{ width: BOX_WIDTH }} />
            {scrollText("b")}
          </Animated.View>
        ) : null;
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

        const waveInner = (
          <Text
            style={{
              width: ledBoxWidth * 0.98,
              fontSize: actualFontSize,
              ...fontStyleProps,
              color: hollowStroke ? bgColor : textColor,
              letterSpacing: 2,
              textAlign: "center",
              lineHeight: actualFontSize * 1.2,
            }}
          >
            {displayText}
          </Text>
        );
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
            {hollowStroke ? (
              <TextStroke color={textColor as string} stroke={2}>
                {waveInner}
              </TextStroke>
            ) : (
              waveInner
            )}
          </Animated.View>
        );
      }

      if (hollowStroke) {
        return (
          <TextStroke color={textColor as string} stroke={2}>
            <Text
              style={{
                width: ledBoxWidth * 0.98,
                fontSize: actualFontSize,
                ...fontStyleProps,
                color: bgColor,
                letterSpacing: 2,
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

  // Compute the text style used for the scroll preview so measurement matches render
  const scrollMeasureStyle = {
    fontSize: fontSize + 42,
    ...(effectiveFontFamily === "monospace"
      ? { fontWeight: "900" as const }
      : {}),
    fontFamily: effectiveFontFamily,
    letterSpacing: 4,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      edges={["top"]}
    >
      <StatusBar style="light" />

      {/* Hidden off-screen node to measure true pixel width of one scroll text copy */}
      {animationMode === "scroll" && measuredTextWidth === null && (
        <View
          style={{ position: "absolute", opacity: 0, width: 99999 }}
          pointerEvents="none"
        >
          <Text
            numberOfLines={1}
            style={[scrollMeasureStyle, { alignSelf: "flex-start" }]}
            onLayout={(e) => setMeasuredTextWidth(e.nativeEvent.layout.width)}
          >
            {text
              .replace(/\s+$/, "")
              .toUpperCase()
              .replace(
                / /g,
                FONT_FAMILIES.find((f) => f.key === effectiveFontFamily)
                  ?.wordGap ?? " ",
              )}
          </Text>
        </View>
      )}

      {/* Two hidden nodes to compute maximum font size for static mode — always rendered so they re-measure automatically when text/font changes */}
      {animationMode !== "scroll" && staticBaseText.length > 0 && (
        <>
          <View
            style={{
              position: "absolute",
              opacity: 0,
              width: PREVIEW_TEXT_WIDTH,
            }}
            pointerEvents="none"
          >
            <Text
              onLayout={(e) =>
                setStaticRefBlockHeight(e.nativeEvent.layout.height)
              }
              style={{
                fontSize: STATIC_REF_FONT,
                fontFamily: effectiveFontFamily,
                ...(effectiveFontFamily === "monospace"
                  ? { fontWeight: "900" as const }
                  : {}),
                width: PREVIEW_TEXT_WIDTH,
                textAlign: "center",
                letterSpacing: 2,
              }}
            >
              {staticBaseText}
            </Text>
          </View>
          <View
            style={{ position: "absolute", opacity: 0, width: 99999 }}
            pointerEvents="none"
          >
            <Text
              numberOfLines={1}
              onLayout={(e) =>
                setStaticRefNoWrapWidth(e.nativeEvent.layout.width)
              }
              style={{
                fontSize: STATIC_REF_FONT,
                fontFamily: effectiveFontFamily,
                ...(effectiveFontFamily === "monospace"
                  ? { fontWeight: "900" as const }
                  : {}),
                alignSelf: "flex-start",
                letterSpacing: 2,
              }}
            >
              {staticLongestWord}
            </Text>
          </View>
        </>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
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
            textBeforeEditRef.current = text;
            setIsEditingText(true);
            setTimeout(() => textInputRef.current?.focus(), 100);
          }}
          style={[styles.ledDisplay, { backgroundColor: bgColor }]}
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

            {/* BG color palette button - top left */}
            <Pressable
              style={styles.bgColorButton}
              onPress={(e) => {
                e.stopPropagation();
                setColorModalTab("bg");
                setModalWheelKey((k) => k + 1);
                setShowColorModal(true);
              }}
            >
              <View
                style={[
                  styles.bgColorSwatch,
                  { backgroundColor: bgColor, borderColor: theme.primaryColor },
                ]}
              />
              <Ionicons
                name="color-palette-outline"
                size={14}
                color={theme.primaryColor}
              />
            </Pressable>

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
              <View key={i} style={[styles.scanline, { opacity: 0.1 }]} />
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
                  setText(textBeforeEditRef.current);
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

        {/* Speed Slider - Only visible in scroll mode */}
        {animationMode === "scroll" && (
          <SpeedSlider
            value={speed}
            onChange={setSpeed}
            primaryColor={theme.primaryColor}
            secondaryColor={theme.secondaryColor}
            backgroundColor={theme.backgroundColor}
            onDragStart={() => setScrollEnabled(false)}
            onDragEnd={() => setScrollEnabled(true)}
          />
        )}

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

        {/* Font Family Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
              FONT FAMILY
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHollowStroke((v) => !v);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  color: hollowStroke ? theme.primaryColor : Colors.smoke,
                }}
              >
                HOLLOW
              </Text>
              <View
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: hollowStroke
                    ? theme.primaryColor
                    : "rgba(255,255,255,0.12)",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    transform: [{ translateX: hollowStroke ? 16 : 0 }],
                  }}
                />
              </View>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.styleScroll}
          >
            {FONT_FAMILIES.map((font) => {
              const isActive = currentFontFamily === font.key;
              return (
                <PressableScale
                  key={font.key}
                  style={[
                    styles.fontStyleCard,
                    isActive && {
                      borderColor: theme.primaryColor,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentFontFamily(font.key);
                  }}
                >
                  <View
                    style={[
                      styles.fontStylePreview,
                      { backgroundColor: theme.backgroundColor },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontFamily: font.key,
                        color: theme.primaryColor,
                      }}
                    >
                      Aa
                    </Text>
                  </View>
                  <View style={styles.fontStyleInfo}>
                    <Text
                      style={[
                        styles.fontStyleLabel,
                        { color: Colors.platinum },
                      ]}
                      numberOfLines={1}
                    >
                      {font.name}
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

        {/* Style Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primaryColor }]}>
              LED STYLE
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {/* Color palette icon */}
              <Pressable
                onPress={() => {
                  setColorModalTab("text");
                  setModalWheelKey((k) => k + 1);
                  setShowColorModal(true);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: 2,
                  borderColor: customColor
                    ? customColor
                    : "rgba(255,255,255,0.2)",
                  backgroundColor: customColor
                    ? customColor
                    : "rgba(255,255,255,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="color-palette"
                  size={16}
                  color={customColor ? "#000" : "rgba(255,255,255,0.6)"}
                />
              </Pressable>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.styleScroll}
          >
            {(Object.keys(LED_THEMES) as LEDStyle[]).map((style) => {
              const styleTheme = LED_THEMES[style];
              const isActive = currentStyle === style && !customColor;

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

        {/* Saved Messages */}
        {/* {savedMessages.length > 0 && (
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
        )} */}
      </ScrollView>

      {/* Unified Color Picker Modal */}
      {showColorModal && (
        <Modal onDismiss={() => setShowColorModal(false)}>
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
          >
            {/* Tab switcher */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: 4,
                marginBottom: 20,
                width: "100%",
              }}
            >
              {(["text", "bg"] as const).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setColorModalTab(tab);
                    setModalWheelKey((k) => k + 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor:
                      colorModalTab === tab
                        ? theme.primaryColor
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 1,
                      color:
                        colorModalTab === tab
                          ? "#000"
                          : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {tab === "text" ? "TEXT COLOR" : "BACKGROUND"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Reset to initial color — works for both text and bg tabs */}
            <PressableScale
              onPress={() => {
                if (colorModalTab === "text") {
                  const defaultColor = LED_THEMES[currentStyle].primaryColor;
                  setPendingTextColor(defaultColor);
                  pendingTextColorRef.current = defaultColor;
                } else {
                  setPendingBgColor("#000000");
                  pendingBgColorRef.current = "#000000";
                }
                setModalWheelKey((k) => k + 1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                alignSelf: "flex-end",
                padding: 6,
                marginBottom: 4,
                marginTop: -8,
              }}
            >
              <Ionicons
                name="refresh-outline"
                size={22}
                color="rgba(255,255,255,0.6)"
              />
            </PressableScale>

            <ColorWheelPicker
              key={`wheel-${colorModalTab}-${modalWheelKey}`}
              size={SCREEN_WIDTH * 0.72}
              initialColor={
                colorModalTab === "text" ? pendingTextColor : pendingBgColor
              }
              onColorChange={(hex) => {
                if (colorModalTab === "text") {
                  setPendingTextColor(hex);
                  pendingTextColorRef.current = hex;
                } else {
                  setPendingBgColor(hex);
                  pendingBgColorRef.current = hex;
                }
              }}
              previewTextColor={
                colorModalTab === "bg" ? pendingTextColor : undefined
              }
              previewBgColor={
                colorModalTab === "text" ? pendingBgColor : undefined
              }
            />

            <Pressable
              onPress={() => {
                setCustomColor(pendingTextColorRef.current);
                setLedPrimaryColor(pendingTextColorRef.current);
                setBgColor(pendingBgColorRef.current);
                setShowColorModal(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                marginTop: 20,
                paddingHorizontal: 40,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: theme.primaryColor,
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontWeight: "800",
                  fontSize: 14,
                  letterSpacing: 1,
                }}
              >
                APPLY
              </Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
