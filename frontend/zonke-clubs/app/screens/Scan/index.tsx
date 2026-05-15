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
  StyleSheet,
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
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
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
  | "white"
  | "rainbow";
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
  rainbow: {
    name: "Rainbow",
    primaryColor: "#FFE000",
    secondaryColor: "#8B00FF",
    glowColor: "rgba(255, 224, 0, 0.6)",
    backgroundColor: "#000000",
    icon: "color-palette",
  },
};

const RAINBOW_STRIPE_COLORS = [
  "#FF0000",
  "#FF8C00",
  "#FFE000",
  "#00CC00",
  "#0066FF",
  "#8B00FF",
];

function ScanRainbowText({
  text,
  textStyle,
  containerStyle,
  hollow,
  hollowBgColor,
}: {
  text: string;
  textStyle: any;
  containerStyle?: any;
  hollow?: boolean;
  hollowBgColor?: string;
}) {
  const fontSize: number = textStyle.fontSize ?? 40;
  const w: number | undefined = textStyle.width;
  const [totalHeight, setTotalHeight] = useState(fontSize);

  const stripeH = fontSize / RAINBOW_STRIPE_COLORS.length;
  const numLines = Math.max(1, Math.round(totalHeight / fontSize));
  const containerHeight = numLines * fontSize;

  return (
    <View
      style={[
        w !== undefined ? { width: w } : undefined,
        containerStyle,
        { height: containerHeight },
      ]}
    >
      {/* Hidden reference — lineHeight:fontSize makes each line exactly fontSize px so numLines is exact */}
      <Text
        style={
          {
            ...textStyle,
            lineHeight: fontSize,
            position: "absolute",
            opacity: 0,
            includeFontPadding: false,
          } as any
        }
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - totalHeight) > 0.5) setTotalHeight(h);
        }}
      >
        {text}
      </Text>
      {Array.from({ length: numLines }).flatMap((_, l) =>
        RAINBOW_STRIPE_COLORS.map((color, i) => {
          const offset = l * fontSize + i * stripeH;
          const stripeText = (
            <Text
              style={
                {
                  ...textStyle,
                  color: hollow ? hollowBgColor : color,
                  // hollow uses absolute positioning so TextStroke's wrapper has zero layout height
                  // and doesn't interfere with the stripe clip; non-hollow uses marginTop (in-flow)
                  ...(hollow
                    ? { position: "absolute" as const, top: -offset }
                    : { marginTop: -offset }),
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
              key={`${l}-${i}`}
              style={[
                { height: stripeH, overflow: "hidden" },
                w !== undefined ? { width: w } : undefined,
              ]}
            >
              {hollow ? (
                <TextStroke color={color} stroke={2}>
                  {stripeText}
                </TextStroke>
              ) : (
                stripeText
              )}
            </View>
          );
        }),
      )}
    </View>
  );
}

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
  isRainbow,
  tab,
}: {
  size: number;
  initialColor: string;
  onColorChange: (hex: string) => void;
  previewTextColor?: string;
  previewBgColor?: string;
  isRainbow?: boolean;
  tab: "text" | "bg";
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const holeR = size * 0.18;
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [hasInteractedText, setHasInteractedText] = useState(false);
  const [hasInteractedBg, setHasInteractedBg] = useState(false);

  const pickColor = (x: number, y: number) => {
    const dx = x - cx;
    const dy = y - cy;
    const radius = Math.sqrt(dx * dx + dy * dy);
    if (radius > outerR || radius < holeR) return;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    const saturation = Math.min(1, (radius - holeR) / (outerR - holeR));
    const hex = hsvToHex(angle, saturation, 1);
    if (tab === "text") {
      if (!hasInteractedText) setHasInteractedText(true);
    } else {
      if (!hasInteractedBg) setHasInteractedBg(true);
    }
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
          {isRainbow && (tab === "bg" || !hasInteractedText) ? (
            <ScanRainbowText text="A" textStyle={getATextStyle()} />
          ) : (
            <Text style={getATextStyle()}>A</Text>
          )}
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
  isRainbow,
}: {
  value: number;
  onChange: (speed: number) => void;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  onDragStart: () => void;
  onDragEnd: () => void;
  isRainbow?: boolean;
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
        {isRainbow ? (
          <LinearGradient
            colors={RAINBOW_STRIPE_COLORS as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1,
              }}
            >
              {getLabel(value)}
            </Text>
          </LinearGradient>
        ) : (
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
        )}
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
              colors={
                isRainbow
                  ? (RAINBOW_STRIPE_COLORS as any)
                  : [secondaryColor + "90", primaryColor]
              }
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

            {/* thumb */}
            <View
              style={{
                position: "absolute",
                left: position,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: isRainbow
                  ? RAINBOW_STRIPE_COLORS[
                      Math.floor(
                        (position / Math.max(1, trackWidth)) *
                          (RAINBOW_STRIPE_COLORS.length - 1),
                      )
                    ]
                  : primaryColor,
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
  const { setLedPrimaryColor, setLedStyle, setIsRainbowActive } = useLedColor();
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
  const openingTextColorRef = useRef<string>("#00FFFF");
  const openingBgColorRef = useRef<string>("#000000");
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
  const isRainbow = currentStyle === "rainbow" && !customColor;

  // Initialize pending colors from committed state when modal opens
  useEffect(() => {
    if (showColorModal) {
      const tc = customColor || theme.primaryColor;
      const bc = bgColor;
      setPendingTextColor(tc);
      setPendingBgColor(bc);
      pendingTextColorRef.current = tc;
      pendingBgColorRef.current = bc;
      openingTextColorRef.current = tc;
      openingBgColorRef.current = bc;
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
    setLedStyle(style);
    setIsRainbowActive(style === "rainbow");
  };

  const handleCustomColorComplete = (hex: string) => {
    setCustomColor(hex);
    setLedPrimaryColor(hex);
    setIsRainbowActive(false);
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
          isRainbow ? (
            <ScanRainbowText
              key={key}
              text={displayText}
              textStyle={sharedTextStyle}
              hollow={hollowStroke}
              hollowBgColor={bgColor}
            />
          ) : hollowStroke ? (
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

        const waveTextStyle = {
          width: ledBoxWidth * 0.98,
          fontSize: actualFontSize,
          ...fontStyleProps,
          color: hollowStroke ? bgColor : textColor,
          letterSpacing: 2,
          textAlign: "center" as const,
          lineHeight: actualFontSize * 1.2,
        };
        const waveInner = isRainbow ? (
          <ScanRainbowText
            text={displayText}
            textStyle={waveTextStyle}
            hollow={hollowStroke}
            hollowBgColor={bgColor}
          />
        ) : (
          <Text style={waveTextStyle}>{displayText}</Text>
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
            {hollowStroke && !isRainbow ? (
              <TextStroke color={textColor as string} stroke={2}>
                {waveInner}
              </TextStroke>
            ) : (
              waveInner
            )}
          </Animated.View>
        );
      }

      const staticTextStyle = {
        width: ledBoxWidth * 0.98,
        fontSize: actualFontSize,
        ...fontStyleProps,
        letterSpacing: 2,
        textAlign: "center" as const,
        lineHeight: actualFontSize * 1.2,
      };

      if (isRainbow) {
        return (
          <ScanRainbowText
            text={displayText}
            textStyle={staticTextStyle}
            hollow={hollowStroke}
            hollowBgColor={bgColor}
          />
        );
      }

      if (hollowStroke) {
        return (
          <TextStroke color={textColor as string} stroke={2}>
            <Text style={{ ...staticTextStyle, color: bgColor }}>
              {displayText}
            </Text>
          </TextStroke>
        );
      }
      return <Text style={staticTextStyle}>{displayText}</Text>;
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
                colors={
                  isRainbow
                    ? (RAINBOW_STRIPE_COLORS as any)
                    : [theme.primaryColor, theme.secondaryColor]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
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

          {isRainbow ? (
            <ScanRainbowText
              text="LED BANNER"
              textStyle={{
                fontSize: 32,
                fontWeight: "900" as const,
                letterSpacing: 4,
              }}
              containerStyle={{ marginBottom: 6 }}
            />
          ) : (
            <Text style={[styles.headerTitle, { color: theme.primaryColor }]}>
              LED BANNER
            </Text>
          )}
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
            {[0, 1, 2, 3].map((corner) => {
              const posStyle = {
                transform: [{ scale: pulseAnim }],
                [corner === 0 || corner === 3 ? "top" : "bottom"]: 8,
                [corner === 0 || corner === 1 ? "left" : "right"]: 8,
              };
              return isRainbow ? (
                <AnimatedLinearGradient
                  key={corner}
                  colors={RAINBOW_STRIPE_COLORS as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.cornerLight,
                    {
                      shadowColor:
                        RAINBOW_STRIPE_COLORS[
                          corner % RAINBOW_STRIPE_COLORS.length
                        ],
                      ...posStyle,
                    },
                  ]}
                />
              ) : (
                <Animated.View
                  key={corner}
                  style={[
                    styles.cornerLight,
                    {
                      backgroundColor: theme.primaryColor,
                      shadowColor: theme.glowColor,
                      ...posStyle,
                    },
                  ]}
                />
              );
            })}

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
              {isRainbow ? (
                <LinearGradient
                  colors={RAINBOW_STRIPE_COLORS as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    padding: 1.5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      width: "100%",
                      borderRadius: 5.5,
                      backgroundColor: bgColor,
                    }}
                  />
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.bgColorSwatch,
                    {
                      backgroundColor: bgColor,
                      borderColor: theme.primaryColor,
                    },
                  ]}
                />
              )}
              {isRainbow ? (
                (() => {
                  const iconSize = 14;
                  const stripeH = iconSize / RAINBOW_STRIPE_COLORS.length;
                  return (
                    <View style={{ width: iconSize, height: iconSize }}>
                      {RAINBOW_STRIPE_COLORS.map((color, i) => (
                        <View
                          key={i}
                          style={{ height: stripeH, overflow: "hidden" }}
                        >
                          <Ionicons
                            name="color-palette-outline"
                            size={iconSize}
                            color={color}
                            style={
                              {
                                marginTop: -(i * stripeH),
                                lineHeight: iconSize,
                                includeFontPadding: false,
                              } as any
                            }
                          />
                        </View>
                      ))}
                    </View>
                  );
                })()
              ) : (
                <Ionicons
                  name="color-palette-outline"
                  size={14}
                  color={theme.primaryColor}
                />
              )}
            </Pressable>

            {/* Edit hint overlay */}
            {!isEditingText && (
              <View style={styles.editHintOverlay} pointerEvents="none">
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={isRainbow ? Colors.platinum : theme.primaryColor}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={[
                    styles.editHintText,
                    { color: isRainbow ? Colors.platinum : theme.primaryColor },
                  ]}
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
            {isRainbow ? (
              <LinearGradient
                colors={RAINBOW_STRIPE_COLORS as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, padding: 2, marginBottom: 12 }}
              >
                <TextInput
                  ref={textInputRef}
                  style={[
                    styles.quickEditInput,
                    {
                      borderWidth: 0,
                      marginBottom: 0,
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
              </LinearGradient>
            ) : (
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
            )}
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
                {isRainbow && (
                  <LinearGradient
                    colors={RAINBOW_STRIPE_COLORS as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      StyleSheet.absoluteFillObject,
                      { borderRadius: 12 },
                    ]}
                  />
                )}
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
          {(["static", "scroll"] as const).map((mode) => (
            <PressableScale
              key={mode}
              style={[
                styles.modeButton,
                { overflow: "hidden" },
                animationMode === mode &&
                  !isRainbow && { backgroundColor: theme.primaryColor },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setAnimationMode(mode);
              }}
            >
              {isRainbow && animationMode === mode && (
                <LinearGradient
                  colors={RAINBOW_STRIPE_COLORS as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                />
              )}
              <Ionicons
                name={mode === "static" ? "pause" : "play"}
                size={20}
                color={
                  animationMode === mode
                    ? theme.backgroundColor
                    : isRainbow
                      ? Colors.platinum
                      : theme.primaryColor
                }
              />
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      animationMode === mode
                        ? theme.backgroundColor
                        : isRainbow
                          ? Colors.platinum
                          : theme.primaryColor,
                  },
                ]}
              >
                {mode === "static" ? "Static" : "Scroll"}
              </Text>
            </PressableScale>
          ))}
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
            isRainbow={isRainbow}
          />
        )}

        {/* 3D Wave Toggle - Only visible when Static is selected */}
        {animationMode === "static" && (
          <Animated.View style={styles.waveToggleContainer}>
            {isRainbow && waveEnabled ? (
              <LinearGradient
                colors={RAINBOW_STRIPE_COLORS as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 18, padding: 2 }}
              >
                <PressableScale
                  style={[styles.waveToggleCard, { borderWidth: 0 }]}
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
                          { backgroundColor: `${RAINBOW_STRIPE_COLORS[0]}25` },
                        ]}
                      >
                        {(() => {
                          const iconSize = 24;
                          const stripeH =
                            iconSize / RAINBOW_STRIPE_COLORS.length;
                          return (
                            <View style={{ width: iconSize, height: iconSize }}>
                              {RAINBOW_STRIPE_COLORS.map((color, i) => (
                                <View
                                  key={i}
                                  style={{
                                    height: stripeH,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Ionicons
                                    name="pulse"
                                    size={iconSize}
                                    color={color}
                                    style={
                                      {
                                        marginTop: -(i * stripeH),
                                        lineHeight: iconSize,
                                        includeFontPadding: false,
                                      } as any
                                    }
                                  />
                                </View>
                              ))}
                            </View>
                          );
                        })()}
                      </View>
                      <View>
                        <ScanRainbowText
                          text="Bass Pulse"
                          textStyle={{
                            fontSize: 14,
                            fontWeight: "700" as const,
                            letterSpacing: 0.3,
                          }}
                        />
                        <Text
                          style={[
                            styles.waveToggleDesc,
                            { color: Colors.smoke },
                          ]}
                        >
                          Vibrating from club noise
                        </Text>
                      </View>
                    </View>
                    <LinearGradient
                      colors={RAINBOW_STRIPE_COLORS as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.toggleSwitch]}
                    >
                      <Animated.View
                        style={[styles.toggleThumb, styles.toggleThumbActive]}
                      />
                    </LinearGradient>
                  </View>
                </PressableScale>
              </LinearGradient>
            ) : (
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
            )}
          </Animated.View>
        )}

        {/* Font Family Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {isRainbow ? (
              <ScanRainbowText
                text="FONT FAMILY"
                textStyle={{
                  fontSize: 14,
                  fontWeight: "900" as const,
                  letterSpacing: 2,
                }}
              />
            ) : (
              <Text
                style={[styles.sectionTitle, { color: theme.primaryColor }]}
              >
                FONT FAMILY
              </Text>
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHollowStroke((v) => !v);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {isRainbow && hollowStroke ? (
                <ScanRainbowText
                  text="HOLLOW"
                  textStyle={{
                    fontSize: 11,
                    fontWeight: "700" as const,
                    letterSpacing: 0.5,
                  }}
                />
              ) : (
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
              )}
              {isRainbow && hollowStroke ? (
                <LinearGradient
                  colors={RAINBOW_STRIPE_COLORS as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
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
                      transform: [{ translateX: 16 }],
                    }}
                  />
                </LinearGradient>
              ) : (
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
              )}
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.styleScroll}
          >
            {FONT_FAMILIES.map((font) => {
              const isActive = currentFontFamily === font.key;
              const useRainbowBorder = isRainbow && isActive;

              const fontCardContent = (
                <>
                  <View
                    style={[
                      styles.fontStylePreview,
                      { backgroundColor: theme.backgroundColor },
                    ]}
                  >
                    {isRainbow ? (
                      <ScanRainbowText
                        text="Aa"
                        textStyle={{ fontSize: 28, fontFamily: font.key }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 28,
                          fontFamily: font.key,
                          color: theme.primaryColor,
                          includeFontPadding: false,
                        }}
                      >
                        Aa
                      </Text>
                    )}
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
                  {isActive &&
                    (isRainbow ? (
                      <LinearGradient
                        colors={RAINBOW_STRIPE_COLORS as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.activeIndicator}
                      />
                    ) : (
                      <View
                        style={[
                          styles.activeIndicator,
                          { backgroundColor: theme.primaryColor },
                        ]}
                      />
                    ))}
                </>
              );

              if (useRainbowBorder) {
                return (
                  <LinearGradient
                    key={font.key}
                    colors={RAINBOW_STRIPE_COLORS as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      padding: 2,
                      marginRight: 12,
                      overflow: "visible",
                    }}
                  >
                    <PressableScale
                      style={[
                        styles.fontStyleCard,
                        { marginRight: 0, borderWidth: 0 },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCurrentFontFamily(font.key);
                      }}
                    >
                      {fontCardContent}
                    </PressableScale>
                  </LinearGradient>
                );
              }

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
                  {fontCardContent}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Style Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {isRainbow ? (
              <ScanRainbowText
                text="LED STYLE"
                textStyle={{
                  fontSize: 14,
                  fontWeight: "900" as const,
                  letterSpacing: 2,
                }}
              />
            ) : (
              <Text
                style={[styles.sectionTitle, { color: theme.primaryColor }]}
              >
                LED STYLE
              </Text>
            )}
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
              const useRainbowBorder = style === "rainbow" && isActive;

              const styleCardContent = (
                <>
                  <LinearGradient
                    colors={
                      style === "rainbow"
                        ? RAINBOW_STRIPE_COLORS
                        : [styleTheme.primaryColor, styleTheme.secondaryColor]
                    }
                    start={{ x: 0, y: 0 }}
                    end={style === "rainbow" ? { x: 0, y: 1 } : { x: 1, y: 1 }}
                    style={styles.styleIconContainer}
                  >
                    <Ionicons
                      name={styleTheme.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={[styles.styleLabel, { color: Colors.platinum }]}>
                    {styleTheme.name}
                  </Text>
                  {isActive &&
                    (isRainbow ? (
                      <LinearGradient
                        colors={RAINBOW_STRIPE_COLORS as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.activeIndicator}
                      />
                    ) : (
                      <View
                        style={[
                          styles.activeIndicator,
                          { backgroundColor: theme.primaryColor },
                        ]}
                      />
                    ))}
                </>
              );

              if (useRainbowBorder) {
                return (
                  <LinearGradient
                    key={style}
                    colors={RAINBOW_STRIPE_COLORS as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      padding: 2,
                      marginRight: 12,
                      overflow: "visible",
                    }}
                  >
                    <PressableScale
                      style={[
                        styles.styleCard,
                        { marginRight: 0, borderWidth: 0 },
                      ]}
                      onPress={() => handleStyleChange(style)}
                    >
                      {styleCardContent}
                    </PressableScale>
                  </LinearGradient>
                );
              }

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
                  {styleCardContent}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>
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
              {(["text", "bg"] as const).map((tab) => {
                const isActiveTab = colorModalTab === tab;
                const tabContent = (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 1,
                      color: isActiveTab ? "#000" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {tab === "text" ? "TEXT COLOR" : "BACKGROUND"}
                  </Text>
                );
                return (
                  <Pressable
                    key={tab}
                    onPress={() => {
                      setColorModalTab(tab);
                      setModalWheelKey((k) => k + 1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}
                  >
                    {isActiveTab && isRainbow ? (
                      <LinearGradient
                        colors={RAINBOW_STRIPE_COLORS as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ paddingVertical: 10, alignItems: "center" }}
                      >
                        {tabContent}
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          paddingVertical: 10,
                          alignItems: "center",
                          backgroundColor: isActiveTab
                            ? theme.primaryColor
                            : "transparent",
                        }}
                      >
                        {tabContent}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Revert button — text: shown when changed from opening colour; bg: shown when not black */}
            {(colorModalTab === "text"
              ? pendingTextColor !== openingTextColorRef.current
              : pendingBgColor !== "#000000") && (
              <PressableScale
                onPress={() => {
                  if (colorModalTab === "text") {
                    setPendingTextColor(openingTextColorRef.current);
                    pendingTextColorRef.current = openingTextColorRef.current;
                  } else {
                    setPendingBgColor("#000000");
                    pendingBgColorRef.current = "#000000";
                  }
                  setModalWheelKey((k) => k + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  position: "absolute",
                  top: 60,
                  right: 30,
                  width: 30,
                  height: 30,
                  zIndex: 10000000,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color="rgba(255,255,255,0.6)"
                />
              </PressableScale>
            )}

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
              isRainbow={
                isRainbow &&
                (colorModalTab === "text" ||
                  pendingTextColor === openingTextColorRef.current)
              }
              tab={colorModalTab}
            />

            <Pressable
              onPress={() => {
                setCustomColor(pendingTextColorRef.current);
                setLedPrimaryColor(pendingTextColorRef.current);
                setBgColor(pendingBgColorRef.current);
                setIsRainbowActive(false);
                setShowColorModal(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{ marginTop: 20, borderRadius: 16, overflow: "hidden" }}
            >
              {isRainbow ? (
                <LinearGradient
                  colors={RAINBOW_STRIPE_COLORS as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ paddingHorizontal: 40, paddingVertical: 12 }}
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
                </LinearGradient>
              ) : (
                <View
                  style={{
                    paddingHorizontal: 40,
                    paddingVertical: 12,
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
                </View>
              )}
            </Pressable>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
