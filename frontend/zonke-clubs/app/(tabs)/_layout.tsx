import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { useConnectionBadges } from "@/hooks/useConnectionBadges";
import { websocketService } from "@/services/websocketService";

export default function TabLayout() {
  const { requestsCount, unreadCount } = useConnectionBadges();
  const insets = useSafeAreaInsets();

  // Connect to WebSocket when tabs layout mounts (after login)
  useEffect(() => {
    console.log("Tabs layout mounted - connecting to WebSocket");

    websocketService
      .connect()
      .then(() => {
        console.log("✅ WebSocket connected successfully in tabs layout");
      })
      .catch((error) => {
        console.error("❌ Failed to connect WebSocket in tabs layout:", error);
      });

    // Cleanup on unmount
    return () => {
      console.log("Tabs layout unmounting - disconnecting WebSocket");
      websocketService.disconnect();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.white,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                size={24}
                name={focused ? "compass" : "compass-outline"}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                size={24}
                name={focused ? "people" : "people-outline"}
                color={color}
              />
              {requestsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {requestsCount > 9 ? "9+" : requestsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.scanButtonContainer}>
              <View
                style={[styles.scanButton, focused && styles.scanButtonActive]}
              >
                <Ionicons size={32} name="add" color={Colors.bgCard} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                size={24}
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                size={24}
                name={focused ? "person" : "person-outline"}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  scanButtonContainer: {
    marginTop: -35,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonActive: {
    shadowOpacity: 0.8,
    shadowRadius: 16,
    transform: [{ scale: 1.05 }],
  },
});
