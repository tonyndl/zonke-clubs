import { StatusBar, ActivityIndicator, View, AppState } from "react-native";
import { useEffect, useRef } from "react";
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
import { Foldit_400Regular } from "@expo-google-fonts/foldit";
import { Akronim_400Regular } from "@expo-google-fonts/akronim";
import { RubikMonoOne_400Regular } from "@expo-google-fonts/rubik-mono-one";
import { RubikStorm_400Regular } from "@expo-google-fonts/rubik-storm";
import { MooLahLah_400Regular } from "@expo-google-fonts/moo-lah-lah";
import { RubikMicrobe_400Regular } from "@expo-google-fonts/rubik-microbe";
import { ProtestGuerrilla_400Regular } from "@expo-google-fonts/protest-guerrilla";
import { RubikBeastly_400Regular } from "@expo-google-fonts/rubik-beastly";
import { RubikDistressed_400Regular } from "@expo-google-fonts/rubik-distressed";
import { DiplomataSC_400Regular } from "@expo-google-fonts/diplomata-sc";
import { RubikGemstones_400Regular } from "@expo-google-fonts/rubik-gemstones";
import { Ewert_400Regular } from "@expo-google-fonts/ewert";
import { BungeeOutline_400Regular } from "@expo-google-fonts/bungee-outline";
import { Stack, useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { UserRoleProvider } from "../contexts/UserRoleContext";
import { LedColorProvider } from "../contexts/LedColorContext";
import { AuthScreen } from "./_screens/Login";
import {
  setupStrobeNotificationCategory,
  updateDeviceLocation,
} from "../services/pushNotificationService";

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Set up notification category and response handler
  useEffect(() => {
    setupStrobeNotificationCategory();

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.type === "strobe_invite") {
          const shouldJoin =
            response.actionIdentifier === "join" ||
            response.actionIdentifier ===
              Notifications.DEFAULT_ACTION_IDENTIFIER;
          if (shouldJoin && data.club_id) {
            router.push({
              pathname: "/strobe/join" as any,
              params: { clubId: data.club_id, clubName: data.club_name ?? "" },
            });
          }
        }
      },
    );

    return () => sub.remove();
  }, []);

  // Keep device location fresh while authenticated so strobe proximity works
  useEffect(() => {
    if (!isAuthenticated) {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      return;
    }

    const syncLocation = () => {
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status !== "granted") return;
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
          .then(({ coords }) =>
            updateDeviceLocation(coords.latitude, coords.longitude),
          )
          .catch(() => {});
      });
    };

    syncLocation();
    locationIntervalRef.current = setInterval(syncLocation, 5 * 60 * 1000); // every 5 min

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") syncLocation();
    });

    return () => {
      if (locationIntervalRef.current)
        clearInterval(locationIntervalRef.current);
      appStateSub.remove();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("light");
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b0f1a",
        }}
      >
        <ActivityIndicator size="large" color="#39F3FF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // User is authenticated - show main app based on their role
  const isClubOwner = user?.role === "club_owner";

  return (
    <Stack>
      {isClubOwner ? (
        <>
          <Stack.Screen name="manage" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </>
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="club/[id]/comments"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="club/[id]/day" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ headerShown: false }} />
      <Stack.Screen
        name="led-fullscreen"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen name="strobe" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="people-browse" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
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
    Foldit_400Regular,
    Akronim_400Regular,
    RubikMonoOne_400Regular,
    RubikStorm_400Regular,
    MooLahLah_400Regular,
    RubikMicrobe_400Regular,
    ProtestGuerrilla_400Regular,
    RubikBeastly_400Regular,
    RubikDistressed_400Regular,
    DiplomataSC_400Regular,
    RubikGemstones_400Regular,
    Ewert_400Regular,
    BungeeOutline_400Regular,
  });

  return (
    <PaperProvider>
      <AuthProvider>
        <UserRoleProvider>
          <LedColorProvider>
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            <RootNavigator />
          </LedColorProvider>
        </UserRoleProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
