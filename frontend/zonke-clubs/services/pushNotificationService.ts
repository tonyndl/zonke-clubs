import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const IS_EXPO_GO = Constants.executionEnvironment === "storeClient";
const PUSH_TOKEN_KEY = "@zonke/push_token";

if (!IS_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!token) {
        return {
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}

/**
 * Request notification permissions and return the Expo push token.
 * Returns null if permission is denied, on web, or in Expo Go.
 */
export function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web" || IS_EXPO_GO) return Promise.resolve(null);

  const setupAndroid = (): Promise<void> => {
    if (Platform.OS === "android") {
      return Notifications.setNotificationChannelAsync("zonkeclubs", {
        name: "Zonke Clubs Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#76CBED",
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        bypassDnd: true,
      }).then(() => {});
    }
    return Promise.resolve();
  };

  return setupAndroid()
    .then(() => Notifications.getPermissionsAsync())
    .then(({ status: existingStatus }) => {
      if (existingStatus !== "granted") {
        return Notifications.requestPermissionsAsync().then(
          ({ status }) => status,
        );
      }
      return existingStatus;
    })
    .then((finalStatus) => {
      if (finalStatus !== "granted") {
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        return null;
      }

      return Notifications.getExpoPushTokenAsync({ projectId }).then(
        (result) => {
          console.log("[PushToken]", result.data);
          return result.data;
        },
      );
    })
    .catch(() => {
      return null;
    });
}

/**
 * Register the Expo push token with the backend, linking it to the current user.
 */
export function registerTokenWithBackend(expoPushToken: string): Promise<void> {
  const platform = Platform.OS;
  const deviceId = Device.modelId || "unknown";

  return api
    .post(
      "/push_tokens",
      { expo_push_token: expoPushToken, platform, device_id: deviceId },
      true,
    )
    .then(() => {})
    .catch((err) => {});
}

/**
 * Unregister the Expo push token from the backend (call on logout).
 */
export function unregisterToken(expoPushToken: string): Promise<void> {
  return api
    .delete(
      `/push_tokens?expo_push_token=${encodeURIComponent(expoPushToken)}`,
      true,
    )
    .then(() => {})
    .catch(() => {});
}

export interface PushNotificationData {
  type: "connection_request" | "message" | "strobe_invite";
  request_id?: string;
  thread_id?: string;
  deep_link?: string;
  // Strobe invite fields
  club_id?: string;
  club_name?: string;
  session_id?: string;
}

/**
 * Register the strobe_invite notification category with Join / Dismiss action buttons.
 * Must be called once on app startup (before notifications arrive).
 */
export function setupStrobeNotificationCategory(): Promise<void> {
  if (Platform.OS === "web" || IS_EXPO_GO) return Promise.resolve();

  return Notifications.setNotificationCategoryAsync("strobe_invite", [
    {
      identifier: "join",
      buttonTitle: "Join",
      options: { opensAppToForeground: true },
    },
    {
      identifier: "dismiss",
      buttonTitle: "Dismiss",
      options: { opensAppToForeground: false, isDestructive: false },
    },
  ]).then(() => {});
}

/**
 * Send the user's current GPS position to the backend so the server can
 * detect when they are near a club and send strobe invites.
 */
export function updateDeviceLocation(
  latitude: number,
  longitude: number,
): Promise<void> {
  return api
    .put("/location/device", { latitude, longitude }, true)
    .then(() => {})
    .catch(() => {});
}

/**
 * Send a push notification to a specific user by fetching their stored tokens
 * from the backend and calling the Expo Push API directly from the frontend.
 */
export function sendPushToUser(
  recipientUserId: string,
  title: string,
  body: string,
  data: PushNotificationData,
): void {
  api
    .get<{ tokens: string[] }>(`/push_tokens?user_id=${recipientUserId}`, true)
    .then((response) => {
      const tokens: string[] = response?.tokens ?? [];

      if (tokens.length === 0) {
        return;
      }

      const messages = tokens.map((token) => ({
        to: token,
        sound: "default",
        title,
        body,
        data,
        priority: "high",
        channelId: "zonkeclubs",
      }));

      return fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(messages),
      }).then(() => {});
    })
    .catch((err) => {});
}

export function handleNotificationReceived(
  _notification: Notifications.Notification,
): void {
  // Foreground notification received — no-op; UI is visible
}

export function handleNotificationResponse(
  _response: Notifications.NotificationResponse,
): void {
  // Navigation is handled in the root layout listener
}
