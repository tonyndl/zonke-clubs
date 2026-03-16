import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Touchable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ConnectionRequest } from "@/types/connection";
import { formatPlannedDate } from "@/types/meetup";
import {
  connectionService,
  transformRequest,
} from "@/services/connectionService";
import { websocketService } from "@/services/websocketService";
import { LinearGradient } from "expo-linear-gradient";
import { TextStroke } from "../../_screens/Login/utils";
import { Toast } from "@/components/ui/Toast";
import { styles } from "./_styles";

type TabType = "received" | "sent";

export default function RequestsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>(
    [],
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingAction, setProcessingAction] = useState<{
    id: string;
    action: "accept" | "decline" | "cancel";
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );
  const [acceptedUserName, setAcceptedUserName] = useState("");

  const loadRequests = () => {
    return Promise.all([
      connectionService.getReceivedRequests(),
      connectionService.getSentRequests(),
    ])
      .then(([receivedResponse, sentResponse]) => {
        setReceivedRequests(receivedResponse.requests);
        setSentRequests(sentResponse.requests);
      })
      .catch((error) => {
        console.error("Error loading requests:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRequests();

    // Listen for new connection requests (WebSocket is connected globally in tabs layout)
    const handleNewRequest = (payload: any) => {
      try {
        const transformedRequest = transformRequest(payload.request);
        setReceivedRequests((prev) => [transformedRequest, ...prev]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error transforming request:", error);
        // Fallback: reload all requests
        loadRequests();
      }
    };

    // Listen for accepted requests
    const handleRequestAccepted = (payload: any) => {
      // Update the request status in sent requests (don't remove, show Chat Now button)
      setSentRequests((prev) =>
        prev.map((req) =>
          req.id === payload.request.id
            ? {
                ...req,
                status: "accepted" as any,
                threadId: payload.request.threadId,
              }
            : req,
        ),
      );

      setToastMessage("Your connection request was accepted!");
      setToastType("success");
      setToastVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // Listen for declined requests
    const handleRequestDeclined = (payload: any) => {
      // Remove from sent requests
      setSentRequests((prev) =>
        prev.filter((req) => req.id !== payload.request.id),
      );

      setToastMessage("Your connection request was declined");
      setToastType("info");
      setToastVisible(true);
    };

    websocketService.on("new_connection_request", handleNewRequest);
    websocketService.on("connection_request_accepted", handleRequestAccepted);
    websocketService.on("connection_request_declined", handleRequestDeclined);

    // Cleanup
    return () => {
      websocketService.off("new_connection_request", handleNewRequest);
      websocketService.off(
        "connection_request_accepted",
        handleRequestAccepted,
      );
      websocketService.off(
        "connection_request_declined",
        handleRequestDeclined,
      );
    };
  }, []);

  // Reload requests when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests().then(() => {
      setRefreshing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  };

  const handleAccept = (requestId: string) => {
    // Find the request to get user details
    const request = receivedRequests.find((req) => req.id === requestId);
    if (!request) return;

    const userName = request.sender.username;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProcessingAction({ id: requestId, action: "accept" });

    connectionService
      .acceptRequest(requestId)
      .then(() => {
        // DON'T remove from list - keep it visible with updated status
        // Update the request status in the list
        setReceivedRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "accepted" as any } : req,
          ),
        );

        // Show success toast
        setAcceptedUserName(userName);
        setToastMessage(`You can now chat with ${userName}!`);
        setToastType("success");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Error accepting request:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        const errorMessage =
          error?.message ||
          error?.error ||
          "Failed to accept request. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => {
        setProcessingAction(null);
      });
  };

  const handleDecline = (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingAction({ id: requestId, action: "decline" });

    connectionService
      .declineRequest(requestId)
      .then(() => {
        setReceivedRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
        setToastMessage("Request declined");
        setToastType("info");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Error declining request:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        const errorMessage =
          error?.message ||
          error?.error ||
          "Failed to decline request. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => {
        setProcessingAction(null);
      });
  };

  const handleCancel = (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingAction({ id: requestId, action: "cancel" });

    connectionService
      .cancelRequest(requestId)
      .then(() => {
        setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
        setToastMessage("Request cancelled");
        setToastType("info");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Error canceling request:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        const errorMessage =
          error?.message ||
          error?.error ||
          "Failed to cancel request. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => {
        setProcessingAction(null);
      });
  };

  const switchTab = (tab: TabType) => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "";
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates (shouldn't happen, but just in case)
    if (diffInSeconds < 0) return "just now";

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const renderRequest = (
    request: ConnectionRequest,
    index: number,
    isSent: boolean,
  ) => {
    const isAccepting =
      processingAction?.id === request.id &&
      processingAction?.action === "accept";
    const isDeclining =
      processingAction?.id === request.id &&
      processingAction?.action === "decline";
    const isCanceling =
      processingAction?.id === request.id &&
      processingAction?.action === "cancel";
    const isAccepted = request.status === "accepted";
    const user = isSent ? request.receiver : request.sender;
    const displayName = user.username;

    return (
      <Animated.View
        key={request.id}
        entering={FadeInDown.delay(index * 50).springify()}
        layout={Layout.springify()}
        style={styles.requestCard}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Route to profile tab with userId and connection request data
            const requestData = encodeURIComponent(
              JSON.stringify({
                id: request.id,
                status: request.status,
                threadId: request.threadId,
              }),
            );
            router.push(
              `/(tabs)/profile?userId=${user.id}&requestData=${requestData}` as any,
            );
          }}
          style={styles.cardGradient}
        >
          {/* User Info */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {user.isOnline && <View style={styles.onlineBadge} />}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              {request.clubName && (
                <View style={styles.clubRow}>
                  <Ionicons name="location" size={12} color={Colors.gold} />
                  <Text style={styles.clubName}>{request.clubName}</Text>
                </View>
              )}
              {request.plannedDate && (
                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={Colors.gold}
                  />
                  <Text style={styles.dateText}>
                    {formatPlannedDate(request.plannedDate)}
                  </Text>
                </View>
              )}
              <Text style={styles.timeAgo}>
                {formatTimeAgo(request.createdAt)}
              </Text>
            </View>
          </View>

          {/* Message */}
          {request.message && (
            <Text style={styles.message} numberOfLines={3}>
              &ldquo;{request.message}&rdquo;
            </Text>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {!isSent ? (
              isAccepted ? (
                // Show Chat Now button for accepted requests
                <PressableScale
                  style={[styles.button, styles.chatNowButton]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Use threadId if available, otherwise fall back to user.id to create new thread
                    const chatId = request.threadId || user.id;
                    router.push(`/chat/${chatId}`);
                  }}
                >
                  <View style={styles.chatNowGradient}>
                    <Ionicons
                      name="chatbubble"
                      size={20}
                      color={Colors.white}
                    />
                    <Text style={styles.chatNowText}>Chat Now</Text>
                  </View>
                </PressableScale>
              ) : (
                <>
                  <PressableScale
                    style={[styles.button, styles.declineButton]}
                    onPress={() => {
                      handleDecline(request.id);
                    }}
                    disabled={isDeclining || isAccepting}
                  >
                    <Ionicons name="close" size={20} color={Colors.lightGrey} />
                    <Text style={styles.declineText}>
                      {isDeclining ? "Declining..." : "Decline"}
                    </Text>
                  </PressableScale>

                  <PressableScale
                    style={[styles.button, styles.acceptButtonContainer]}
                    onPress={() => {
                      handleAccept(request.id);
                    }}
                    disabled={isAccepting || isDeclining}
                  >
                    <View style={styles.acceptGradient} pointerEvents="none">
                      <Ionicons name="checkmark" size={20} color={Colors.bg} />
                      <Text style={styles.acceptText}>
                        {isAccepting ? "Accepting..." : "Accept"}
                      </Text>
                    </View>
                  </PressableScale>
                </>
              )
            ) : // For sent requests
            isAccepted ? (
              // Show Chat Now button for accepted sent requests
              <PressableScale
                style={[styles.button, styles.chatNowButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Use threadId if available, otherwise fall back to user.id to create new thread
                  const chatId = request.threadId || user.id;
                  router.push(`/chat/${chatId}`);
                }}
              >
                <View style={styles.chatNowGradient}>
                  <Ionicons name="chatbubble" size={20} color={Colors.white} />
                  <Text style={styles.chatNowText}>Chat Now</Text>
                </View>
              </PressableScale>
            ) : (
              // Show Cancel Request button for pending sent requests
              <PressableScale
                style={[styles.button, styles.cancelButton]}
                onPress={() => handleCancel(request.id)}
                disabled={isCanceling}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={Colors.lightGrey}
                />
                <Text style={styles.cancelText}>
                  {isCanceling ? "Canceling..." : "Cancel Request"}
                </Text>
              </PressableScale>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = (isSent: boolean) => (
    <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={isSent ? "paper-plane-outline" : "people-outline"}
          size={64}
          color={Colors.smoke}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {isSent ? "No Sent Requests" : "No Pending Requests"}
      </Text>
      <Text style={styles.emptyText}>
        {isSent
          ? "You haven't sent any connection requests yet. Start connecting with people at clubs!"
          : "When someone sends you a connection request, it will appear here."}
      </Text>
    </Animated.View>
  );

  const requests = activeTab === "received" ? receivedRequests : sentRequests;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
          <Text style={styles.headerTitle}>Requests</Text>
        </TextStroke>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab("received")}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="mail"
              size={18}
              color={activeTab === "received" ? Colors.gold : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "received" && styles.tabTextActive,
              ]}
            >
              Received
            </Text>
            {receivedRequests.length > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "received" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "received" && styles.tabBadgeTextActive,
                  ]}
                >
                  {receivedRequests.length}
                </Text>
              </View>
            )}
          </View>
          {activeTab === "received" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab("sent")}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="paper-plane"
              size={18}
              color={activeTab === "sent" ? Colors.gold : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "sent" && styles.tabTextActive,
              ]}
            >
              Requested
            </Text>
            {sentRequests.length > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === "sent" && styles.tabBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === "sent" && styles.tabBadgeTextActive,
                  ]}
                >
                  {sentRequests.length}
                </Text>
              </View>
            )}
          </View>
          {activeTab === "sent" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : requests.length === 0 ? (
          renderEmptyState(activeTab === "sent")
        ) : (
          requests.map((request, index) =>
            renderRequest(request, index, activeTab === "sent"),
          )
        )}
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
        type={toastType}
      />
    </SafeAreaView>
  );
}
