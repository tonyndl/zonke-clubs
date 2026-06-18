import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, ScrollView, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useScrollToTop } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ChatThread } from "@/types/connection";
import { getThreads } from "@/services/messageService";
import { TextStroke } from "../../screens/Login/utils";
import { websocketService } from "@/services/websocketService";
import { styles } from "./styles";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ChatsScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const [_unreadCount, setUnreadCount] = useState(0);

  const loadThreads = useCallback(() => {
    setLoading(true);

    getThreads()
      .then((data) => {
        setThreads(data.threads);

        // Calculate unread count from threads
        const count = data.threads.reduce(
          (sum, thread) => sum + (thread.unreadCount || 0),
          0,
        );
        setUnreadCount(count);
      })
      .catch((error) => {
        console.error("Error loading threads:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [loadThreads]),
  );

  // Listen for new messages in threads (real-time updates)
  useEffect(() => {
    const handleNewMessageInThread = (payload: any) => {
      const { thread_id, message } = payload;

      // Update the thread with new last message
      setThreads((prevThreads) => {
        const threadIndex = prevThreads.findIndex((t) => t.id === thread_id);

        if (threadIndex === -1) {
          // Thread not in list, reload to get it
          loadThreads();
          return prevThreads;
        }

        const thread = prevThreads[threadIndex];
        const updatedThread = {
          ...thread,
          lastMessage: {
            id: message.id,
            text: message.content,
            sentAt: message.sent_at,
            insertedAt: message.inserted_at,
            senderId: message.sender_id,
            isRead: false,
            status: message.status || "sent",
          },
          unreadCount: thread.unreadCount + 1,
          updatedAt: message.inserted_at || message.sent_at,
        };

        // Move thread to top of list
        const updatedThreads = [
          updatedThread,
          ...prevThreads.filter((_, i) => i !== threadIndex),
        ];

        return updatedThreads;
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleMessagesMarkedAsRead = (payload: any) => {
      const { thread_id } = payload;

      // Update the thread to mark last message as read
      setThreads((prevThreads) => {
        return prevThreads.map((thread) => {
          if (thread.id === thread_id) {
            return {
              ...thread,
              lastMessage: {
                ...thread.lastMessage,
                isRead: true,
                status: "read",
              },
            };
          }
          return thread;
        });
      });
    };

    const handleConnectionDisconnected = (payload: any) => {
      const { thread_id } = payload;

      // Update the thread to mark as disconnected
      setThreads((prevThreads) => {
        return prevThreads.map((thread) => {
          if (thread.id === thread_id) {
            return {
              ...thread,
              connectionStatus: "declined" as const,
            };
          }
          return thread;
        });
      });

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    // Listen for presence changes to update online status
    const handlePresenceChange = (payload: any) => {
      const { userId, isOnline } = payload;

      // Update the participant's online status in threads
      setThreads((prevThreads) => {
        return prevThreads.map((thread) => {
          if (thread.participant.id === userId) {
            return {
              ...thread,
              participant: {
                ...thread.participant,
                isOnline: isOnline,
              },
            };
          }
          return thread;
        });
      });
    };

    websocketService.on("new_message_in_thread", handleNewMessageInThread);
    websocketService.on("messages_marked_as_read", handleMessagesMarkedAsRead);
    websocketService.on(
      "connection_disconnected",
      handleConnectionDisconnected,
    );
    websocketService.on("user_presence_changed", handlePresenceChange);

    return () => {
      websocketService.off("new_message_in_thread", handleNewMessageInThread);
      websocketService.off(
        "messages_marked_as_read",
        handleMessagesMarkedAsRead,
      );
      websocketService.off(
        "connection_disconnected",
        handleConnectionDisconnected,
      );
      websocketService.off("user_presence_changed", handlePresenceChange);
    };
  }, [loadThreads]);

  const handleRefresh = () => {
    setRefreshing(true);

    getThreads()
      .then((data) => {
        setThreads(data.threads);
        const count = data.threads.reduce(
          (sum, thread) => sum + (thread.unreadCount || 0),
          0,
        );
        setUnreadCount(count);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      })
      .catch((error) => {
        console.error("Error loading threads:", error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleThreadPress = (thread: ChatThread) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistically mark as read in the UI
    if (thread.unreadCount > 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? {
                ...t,
                unreadCount: 0,
                lastMessage: { ...t.lastMessage, isRead: true },
              }
            : t,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - thread.unreadCount));
    }

    // Navigate to chat conversation screen (backend marks as read when viewing)
    router.push(`/chat/${thread.id}`);
  };

  const renderThread = (thread: ChatThread, index: number) => {
    const { participant, lastMessage, unreadCount, connectionStatus } = thread;
    const displayName = participant.username;

    const isUnread = unreadCount > 0;
    const isSentByMe = lastMessage.senderId !== participant.id;
    const isDisconnected = connectionStatus === "declined";

    return (
      <Animated.View
        key={thread.id}
        entering={FadeInDown.delay(index * 50).springify()}
      >
        <PressableScale
          style={styles.threadCard}
          onPress={() => handleThreadPress(thread)}
        >
          <View
            style={[
              styles.threadGradient,
              isDisconnected && styles.threadDisconnected,
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {participant.avatarUrl ? (
                <Image
                  source={{ uri: participant.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {participant.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {participant.isOnline && !isDisconnected && (
                <View style={styles.onlineBadge} />
              )}
              {isUnread && !isDisconnected && (
                <View style={styles.unreadIndicator}>
                  <Text style={styles.unreadCount}>{unreadCount}</Text>
                </View>
              )}
              {isDisconnected && (
                <View style={styles.disconnectedBadge}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.threadContent}>
              <View style={styles.threadHeader}>
                <Text
                  style={[
                    styles.participantName,
                    isUnread && styles.unreadText,
                    isDisconnected && styles.disconnectedText,
                  ]}
                >
                  {displayName}
                </Text>
                <Text style={styles.timeText}>{lastMessage.sentAt}</Text>
              </View>

              {isDisconnected ? (
                <View style={styles.disconnectedRow}>
                  <Ionicons name="ban-outline" size={14} color={Colors.smoke} />
                  <Text style={styles.disconnectedMessage}>
                    Connection ended
                  </Text>
                </View>
              ) : (
                <View style={styles.messageRow}>
                  {isSentByMe && lastMessage.text !== "No messages yet" && (
                    <Ionicons
                      name={
                        lastMessage.status === "sent"
                          ? "checkmark"
                          : "checkmark-done"
                      }
                      size={16}
                      color={
                        lastMessage.status === "read"
                          ? Colors.gold
                          : Colors.smoke
                      }
                      style={styles.checkIcon}
                    />
                  )}
                  <Text
                    style={[styles.lastMessage, isUnread && styles.unreadText]}
                    numberOfLines={2}
                  >
                    {isSentByMe &&
                      lastMessage.text !== "No messages yet" &&
                      "You: "}
                    {lastMessage.text}
                  </Text>
                </View>
              )}
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={20} color={Colors.smoke} />
          </View>
        </PressableScale>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="chatbubbles-outline"
      title="No Conversations Yet"
      subtitle="Connect with people looking to meet at clubs and start chatting!"
      action={
        <PressableScale
          style={styles.exploreButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/(tabs)");
          }}
        >
          <Ionicons name="people" size={20} color={Colors.bg} />
          <Text style={styles.exploreText}>Discover People at Clubs</Text>
        </PressableScale>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
          <Text style={styles.headerTitle}>Messages</Text>
        </TextStroke>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          threads.length === 0 && styles.emptyContentContainer,
        ]}
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
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : threads.length === 0 ? (
          renderEmptyState()
        ) : (
          threads.map((thread, index) => renderThread(thread, index))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
