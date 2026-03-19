import { StatusBar, ActivityIndicator, View, AppState } from "react-native";
import { useEffect, useRef } from "react";
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
