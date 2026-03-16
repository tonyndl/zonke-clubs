import { StatusBar, ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { UserRoleProvider } from "../contexts/UserRoleContext";
import { AuthScreen } from "./_screens/Login";

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <UserRoleProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <RootNavigator />
        </UserRoleProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
