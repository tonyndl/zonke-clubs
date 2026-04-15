import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  Pressable,
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
import { TextStroke } from "../../_screens/Login/utils";
import { Toast } from "@/components/ui/Toast";
import { styles } from "./_styles";

type TabType = "received" | "sent";
type StatusFilter = "all" | "pending" | "accepted";
type SortOrder = "newest" | "oldest";

export default function RequestsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

    const handleNewRequest = (payload: any) => {
      try {
        const transformedRequest = transformRequest(payload.request);
        setReceivedRequests((prev) => [transformedRequest, ...prev]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error transforming request:", error);
        loadRequests();
      }
    };

    const handleRequestAccepted = (payload: any) => {
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

    const handleRequestDeclined = (payload: any) => {
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
    const request = receivedRequests.find((req) => req.id === requestId);
    if (!request) return;
    const userName = request.sender.username;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProcessingAction({ id: requestId, action: "accept" });

    connectionService
      .acceptRequest(requestId)
      .then(() => {
        setReceivedRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "accepted" as any } : req,
          ),
        );
        setToastMessage(`You can now chat with ${userName}!`);
        setToastType("success");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Error accepting request:", error);
        const errorMessage =
          error?.message || "Failed to accept request. Please try again.";
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
        const errorMessage =
          error?.message || "Failed to decline request. Please try again.";
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
        const errorMessage =
          error?.message || "Failed to cancel request. Please try again.";
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
      setStatusFilter("all");
      exitSelectionMode();
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) setSelectionMode(false);
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    Alert.alert(
      "Delete Requests",
      `Delete ${count} request${count > 1 ? "s" : ""}? This will remove them for both sides.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            const ids = Array.from(selectedIds);
            connectionService
              .deleteRequests(ids)
              .then(() => {
                const idSet = new Set(ids);
                setReceivedRequests((prev) =>
                  prev.filter((r) => !idSet.has(r.id)),
                );
                setSentRequests((prev) => prev.filter((r) => !idSet.has(r.id)));
                setToastMessage(
                  `Deleted ${count} request${count > 1 ? "s" : ""}`,
                );
                setToastType("info");
                setToastVisible(true);
                exitSelectionMode();
              })
              .catch(() => {
                setToastMessage("Failed to delete requests");
                setToastType("error");
                setToastVisible(true);
              })
              .finally(() => setDeleting(false));
          },
        },
      ],
    );
  };

  const handleDeleteAll = () => {
    setMenuVisible(false);
    const current = filteredRequests;
    if (current.length === 0) return;
    Alert.alert(
      "Delete All",
      `Delete all ${current.length} request${current.length > 1 ? "s" : ""} in this view? This will remove them for both sides.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            const ids = current.map((r) => r.id);
            connectionService
              .deleteRequests(ids)
              .then(() => {
                const idSet = new Set(ids);
                setReceivedRequests((prev) =>
                  prev.filter((r) => !idSet.has(r.id)),
                );
                setSentRequests((prev) => prev.filter((r) => !idSet.has(r.id)));
                setToastMessage(
                  `Deleted ${ids.length} request${ids.length > 1 ? "s" : ""}`,
                );
                setToastType("info");
                setToastVisible(true);
                exitSelectionMode();
              })
              .catch(() => {
                setToastMessage("Failed to delete requests");
                setToastType("error");
                setToastVisible(true);
              })
              .finally(() => setDeleting(false));
          },
        },
      ],
    );
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    if (isNaN(date.getTime())) return "";
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 0) return "just now";
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  // Get filtered & sorted requests
  const rawRequests =
    activeTab === "received" ? receivedRequests : sentRequests;
  const pendingCount = rawRequests.filter((r) => r.status === "pending").length;
  const acceptedCount = rawRequests.filter(
    (r) => r.status === "accepted",
  ).length;

  const filteredRequests = rawRequests
    .filter((r) => {
      if (statusFilter === "all") return true;
      return r.status === statusFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

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

    const isSelected = selectedIds.has(request.id);

    return (
      <Animated.View
        key={request.id}
        entering={FadeInDown.delay(index * 50).springify()}
        layout={Layout.springify()}
        style={[
          styles.requestCard,
          isSelected && {
            borderColor: Colors.gold,
            borderWidth: 2,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (selectionMode) {
              toggleSelect(request.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              return;
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/profile/${user.id}` as any);
          }}
          onLongPress={() => handleLongPress(request.id)}
          style={styles.cardGradient}
        >
          {/* Selection checkbox + Status badge row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={[
                styles.statusBadge,
                isAccepted
                  ? styles.statusBadgeAccepted
                  : styles.statusBadgePending,
              ]}
            >
              <Ionicons
                name={isAccepted ? "checkmark-circle" : "time-outline"}
                size={12}
                color={isAccepted ? "#10B981" : Colors.gold}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isAccepted
                    ? styles.statusBadgeTextAccepted
                    : styles.statusBadgeTextPending,
                ]}
              >
                {isAccepted ? "Approved" : "Pending"}
              </Text>
            </View>
            {selectionMode && (
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={isSelected ? Colors.gold : Colors.smoke}
              />
            )}
          </View>

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

          {/* Actions - hidden in selection mode */}
          {!selectionMode && (
            <View style={styles.actions}>
              {!isSent ? (
                isAccepted ? (
                  <PressableScale
                    style={[styles.button, styles.chatNowButton]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                      onPress={() => handleDecline(request.id)}
                      disabled={isDeclining || isAccepting}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={Colors.lightGrey}
                      />
                      <Text style={styles.declineText}>
                        {isDeclining ? "Declining..." : "Decline"}
                      </Text>
                    </PressableScale>

                    <PressableScale
                      style={[styles.button, styles.acceptButtonContainer]}
                      onPress={() => handleAccept(request.id)}
                      disabled={isAccepting || isDeclining}
                    >
                      <View style={styles.acceptGradient} pointerEvents="none">
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={Colors.bg}
                        />
                        <Text style={styles.acceptText}>
                          {isAccepting ? "Accepting..." : "Accept"}
                        </Text>
                      </View>
                    </PressableScale>
                  </>
                )
              ) : isAccepted ? (
                <PressableScale
                  style={[styles.button, styles.chatNowButton]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          )}
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
        {statusFilter !== "all"
          ? `No ${statusFilter === "accepted" ? "Approved" : "Pending"} Requests`
          : isSent
            ? "No Sent Requests"
            : "No Pending Requests"}
      </Text>
      <Text style={styles.emptyText}>
        {statusFilter !== "all"
          ? "Try a different filter to see more requests."
          : isSent
            ? "You haven't sent any connection requests yet. Start connecting with people at clubs!"
            : "When someone sends you a connection request, it will appear here."}
      </Text>
    </Animated.View>
  );

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
          </View>
          {activeTab === "sent" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      {rawRequests.length > 0 && (
        <View style={styles.filterBar}>
          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
          >
            {(
              [
                { key: "all", label: "All", count: rawRequests.length },
                { key: "pending", label: "Pending", count: pendingCount },
                { key: "accepted", label: "Approved", count: acceptedCount },
              ] as const
            ).map(({ key, label, count }) => {
              if (count === 0 && key === "all") return null;
              const isActive = statusFilter === key;
              return (
                <PressableScale
                  key={key}
                  style={[
                    styles.filterPill,
                    isActive && styles.filterPillActive,
                  ]}
                  onPress={() => {
                    setStatusFilter(key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive && styles.filterPillTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  <View
                    style={[
                      styles.filterPillCount,
                      isActive && styles.filterPillCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillCountText,
                        isActive && styles.filterPillCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>

          {/* 3-dot menu */}
          <View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMenuVisible((v) => !v);
              }}
              hitSlop={8}
              style={{ padding: 4 }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color={Colors.gold}
              />
            </TouchableOpacity>
            {menuVisible && (
              <View
                style={{
                  position: "absolute",
                  top: 32,
                  right: 0,
                  backgroundColor: Colors.bgCard,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(57, 243, 255, 0.2)",
                  paddingVertical: 4,
                  minWidth: 140,
                  zIndex: 100,
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                {/* Sort toggle */}
                <TouchableOpacity
                  onPress={() => {
                    setSortOrder((prev) =>
                      prev === "newest" ? "oldest" : "newest",
                    );
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMenuVisible(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons
                    name={sortOrder === "newest" ? "arrow-down" : "arrow-up"}
                    size={18}
                    color={Colors.gold}
                  />
                  <Text
                    style={{
                      color: Colors.gold,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(57, 243, 255, 0.1)",
                    marginHorizontal: 14,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectionMode(true);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={Colors.platinum}
                  />
                  <Text
                    style={{
                      color: Colors.platinum,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Select
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAll}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text
                    style={{
                      color: "#EF4444",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Delete All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

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
        ) : filteredRequests.length === 0 ? (
          renderEmptyState(activeTab === "sent")
        ) : (
          filteredRequests.map((request, index) =>
            renderRequest(request, index, activeTab === "sent"),
          )
        )}
      </ScrollView>

      {/* Selection mode bottom bar */}
      {selectionMode && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: Colors.bgCard,
            borderTopWidth: 1,
            borderTopColor: "rgba(57, 243, 255, 0.15)",
          }}
        >
          <TouchableOpacity onPress={exitSelectionMode}>
            <Text
              style={{ color: Colors.smoke, fontSize: 15, fontWeight: "600" }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={{ color: Colors.platinum, fontSize: 14, fontWeight: "600" }}
          >
            {selectedIds.size} selected
          </Text>

          <TouchableOpacity
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0 || deleting}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor:
                selectedIds.size > 0 ? "#EF4444" : Colors.bgSecondary,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
              opacity: selectedIds.size === 0 ? 0.5 : 1,
            }}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.white} />
            <Text
              style={{ color: Colors.white, fontSize: 14, fontWeight: "600" }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dismiss menu overlay */}
      {menuVisible && (
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => setMenuVisible(false)}
        />
      )}

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
