import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  Image,
  Keyboard,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useLocalSearchParams,
  Stack,
  useFocusEffect,
} from "expo-router";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  getThread,
  getOrCreateThread,
  sendMessage,
  clearThread,
} from "@/services/messageService";
import { Message } from "@/types/connection";
import { authService } from "@/services/authService";
import { websocketService } from "@/services/websocketService";
import { connectionService } from "@/services/connectionService";
import { Toast } from "@/components/ui/Toast";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [disconnectedByMe, setDisconnectedByMe] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const loadThread = useCallback(() => {
    if (!id) return;

    setLoading(true);

    authService
      .getCurrentUser()
      .then((user) => {
        setCurrentUserId(user?.id || null);

        // Try to load as thread ID first
        return getThread(id)
          .then((threadData) => {
            setThreadId(threadData.thread.id);
            setMessages([...threadData.thread.messages].reverse());

            // Find the other participant (not the current user)
            const otherParticipant = threadData.thread.participants.find(
              (p: any) => p.id !== user?.id,
            );
            setOtherUser(otherParticipant);

            // Check connection status for this thread
            connectionService
              .getRequestByThread(threadData.thread.id)
              .then((response) => {
                if (response.request.status === "declined") {
                  setIsDisconnected(true);
                  // We can't determine who disconnected from stored data, but the
                  // real-time event will set disconnectedByMe correctly if needed
                }
              })
              .catch(() => {
                // If no connection request exists, that's fine (direct messages)
              });

            // Mark messages as read now that we have the thread
            websocketService.markMessagesAsRead(threadData.thread.id);
          })
          .catch((error) => {
            // If thread not found (404), try to get or create thread with this user ID
            if (error.message && error.message.includes("404")) {
              return getOrCreateThread(id)
                .then((threadData) => {
                  setThreadId(threadData.thread.id);
                  setMessages([...threadData.thread.messages].reverse());

                  // Find the other participant (not the current user)
                  const otherParticipant = threadData.thread.participants.find(
                    (p: any) => p.id !== user?.id,
                  );
                  setOtherUser(otherParticipant);

                  // Check connection status for this thread
                  connectionService
                    .getRequestByThread(threadData.thread.id)
                    .then((response) => {
                      if (response.request.status === "declined") {
                        setIsDisconnected(true);
                      }
                    })
                    .catch(() => {});

                  // Update the URL to use the thread ID instead of user ID
                  router.replace(`/chat/${threadData.thread.id}`);

                  // Mark messages as read now that we have the thread
                  websocketService.markMessagesAsRead(threadData.thread.id);
                })
                .catch((createError) => {
                  console.error("Failed to create thread:", createError);
                  throw createError;
                });
            }
            throw error;
          });
      })
      .catch((error) => {
        console.error("Error loading thread:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadThread();
    }, [loadThread]),
  );

  // WebSocket integration for real-time messages
  useEffect(() => {
    if (!threadId) return;

    // Function to join thread channel
    const joinThread = () => {
      websocketService
        .joinThreadChannel(threadId)
        .then(() => {})
        .catch((error) => {
          console.error("Failed to join thread channel:", error);

          // If socket not connected, wait and retry
          if (error.message === "Socket not connected") {
            setTimeout(joinThread, 1000);
          }
        });
    };

    // Check if socket is connected before joining
    if (websocketService.isConnected()) {
      joinThread();
    } else {
      // Retry after a short delay to allow connection to establish
      setTimeout(joinThread, 1000);
    }

    // Listen for new messages
    const handleNewMessage = (payload: any) => {
      // Transform the message to match our Message type
      const newMessage: Message = {
        id: payload.id,
        threadId: payload.thread_id,
        text: payload.content,
        senderId: payload.sender_id,
        isRead: payload.is_read,
        status: payload.status || "sent",
        sentAt: payload.sent_at,
        insertedAt: payload.inserted_at,
      };

      // Add the new message to state (check for duplicates)
      setMessages((prevMessages) => {
        // Check if message already exists (by ID or by temp ID)
        const messageExists = prevMessages.some(
          (msg) =>
            msg.id === newMessage.id ||
            (msg.text === newMessage.text &&
              msg.senderId === newMessage.senderId),
        );

        if (messageExists) {
          // Update the message if it was a temp message
          return prevMessages.map((msg) =>
            msg.id.toString().startsWith("temp-") &&
            msg.text === newMessage.text &&
            msg.senderId === newMessage.senderId
              ? newMessage
              : msg,
          );
        }

        // Prepend new message (inverted list — newest at top of array)
        return [newMessage, ...prevMessages];
      });

      // If the message is from someone else and we're viewing the chat, mark it as read immediately
      if (payload.sender_id !== currentUserId) {
        websocketService.markMessagesAsRead(threadId);
      }
    };

    // Listen for status updates (delivered/read)
    const handleStatusUpdate = (payload: any) => {
      const { status, reader_id } = payload;

      // Update all my messages that were read/delivered by the other person
      if (reader_id !== currentUserId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === currentUserId &&
            (msg.status === "sent" ||
              (status === "read" && msg.status === "delivered"))
              ? { ...msg, status, isRead: status === "read" }
              : msg,
          ),
        );
      }
    };

    // Listen for messages marked as read events (sent to user channel)
    const handleMessagesMarkedAsRead = (payload: any) => {
      const { thread_id, reader_id } = payload;

      // Only update if it's for this thread and someone else read my messages
      if (thread_id === threadId && reader_id !== currentUserId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === currentUserId
              ? { ...msg, status: "read", isRead: true }
              : msg,
          ),
        );
      }
    };

    // Listen for disconnection events
    const handleDisconnection = (payload: any) => {
      if (payload.thread_id === threadId) {
        // Check who disconnected
        const wasDisconnectedByMe =
          payload.disconnected_by_user_id === currentUserId;
        setIsDisconnected(true);
        setDisconnectedByMe(wasDisconnectedByMe);
      }
    };

    websocketService.on(`thread:${threadId}:new_message`, handleNewMessage);
    websocketService.on(
      `thread:${threadId}:message_status_updated`,
      handleStatusUpdate,
    );
    websocketService.on("messages_marked_as_read", handleMessagesMarkedAsRead);
    websocketService.on("connection_disconnected", handleDisconnection);

    // Cleanup when component unmounts or threadId changes
    return () => {
      websocketService.off(`thread:${threadId}:new_message`, handleNewMessage);
      websocketService.off(
        `thread:${threadId}:message_status_updated`,
        handleStatusUpdate,
      );
      websocketService.off(
        "messages_marked_as_read",
        handleMessagesMarkedAsRead,
      );
      websocketService.off("connection_disconnected", handleDisconnection);
      websocketService.leaveThreadChannel(threadId);
    };
  }, [threadId, currentUserId]);

  // Listen for presence changes for the other user
  useEffect(() => {
    if (!otherUser) return;

    const handlePresenceChange = (payload: any) => {
      // Only update if it's the user we're chatting with
      if (payload.userId === otherUser.id) {
        setOtherUser((prev: any) => ({
          ...prev,
          isOnline: payload.isOnline,
          lastSeenAt: payload.lastSeenAt || new Date().toISOString(),
        }));
      }
    };

    websocketService.on("user_presence_changed", handlePresenceChange);

    return () => {
      websocketService.off("user_presence_changed", handlePresenceChange);
    };
  }, [otherUser?.id]);

  // Track keyboard visibility and scroll to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleKeyboardToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleSend = () => {
    if (inputText.trim() && threadId && currentUserId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const messageText = inputText.trim();
      setInputText("");

      // Optimistic update - add message immediately to local state
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        threadId: threadId,
        text: messageText,
        senderId: currentUserId,
        isRead: false,
        status: "sent",
        sentAt: `${hh}:${mm}`,
        insertedAt: now.toISOString(),
      };

      setMessages((prevMessages) => [tempMessage, ...prevMessages]);

      sendMessage(threadId, messageText)
        .then((response) => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === tempMessage.id ? response.message : msg,
            ),
          );
        })
        .catch((error) => {
          console.error("Error sending message:", error);

          if (error.message && error.message.includes("no longer connected")) {
            setIsDisconnected(true);
            setDisconnectedByMe(false);
          }

          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== tempMessage.id),
          );
          setInputText(messageText);
          setToastMessage("Failed to send message");
          setToastType("error");
          setToastVisible(true);
        });
    }
  };

  const handleClearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(false);

    setConfirmModal({
      visible: true,
      title: "Clear Chat",
      message:
        "Are you sure you want to clear all messages in this chat? This action cannot be undone.",
      confirmText: "Clear",
      confirmColor: "#EF4444",
      onConfirm: () => {
        if (!threadId) return;
        clearThread(threadId)
          .then(() => {
            setMessages([]);
            setToastMessage("Chat cleared");
            setToastType("info");
            setToastVisible(true);
          })
          .catch((error) => {
            console.error("Error clearing chat:", error);
            setToastMessage("Failed to clear chat");
            setToastType("error");
            setToastVisible(true);
          });
      },
    });
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(false);

    if (!otherUser) return;

    const displayName = otherUser.username;

    setConfirmModal({
      visible: true,
      title: "Disconnect",
      message: `Are you sure you want to disconnect from ${displayName}? You will no longer be able to send messages to each other.`,
      confirmText: "Disconnect",
      confirmColor: "#EF4444",
      onConfirm: () => {
        if (!threadId) return;
        connectionService
          .disconnectByThread(threadId)
          .then(() => {
            setIsDisconnected(true);
            setDisconnectedByMe(true);
            setTimeout(() => router.back(), 1000);
          })
          .catch((error) => {
            console.error("Error disconnecting:", error);
            setToastMessage("Failed to disconnect. Please try again.");
            setToastType("error");
            setToastVisible(true);
          });
      },
    });
  };

  // sentAt is pre-formatted by the backend ("HH:MM" or "D Mon").
  // For optimistic messages we generate the same "HH:MM" format locally.
  const formatTime = (sentAt: string) => sentAt;

  const formatDateHeader = (insertedAt: string) => {
    const normalized = insertedAt.endsWith("Z") ? insertedAt : `${insertedAt}Z`;
    const date = new Date(normalized);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMessagesWithDateHeaders = () => {
    // Messages are in descending order (newest first). For an inverted FlatList
    // the date header for each day group must appear AFTER all messages of that
    // day in the array so it renders visually ABOVE them.
    const result: Array<Message | { type: "date"; date: string; id: string }> =
      [];
    let currentDate: string | null = null;
    let currentDateRaw: string | null = null;

    messages.forEach((message) => {
      const rawTs = message.insertedAt || message.sentAt;
      const normalized = rawTs.endsWith("Z") ? rawTs : `${rawTs}Z`;
      const messageDate = new Date(normalized).toDateString();

      if (messageDate !== currentDate) {
        if (currentDate !== null) {
          result.push({
            type: "date",
            date: currentDateRaw!,
            id: `date-${currentDate}`,
          });
        }
        currentDate = messageDate;
        currentDateRaw = rawTs;
      }

      result.push(message);
    });

    if (currentDate !== null) {
      result.push({
        type: "date",
        date: currentDateRaw!,
        id: `date-${currentDate}`,
      });
    }

    return result;
  };

  const formatLastSeen = (lastSeenAt: string | null | undefined) => {
    if (!lastSeenAt) return "last seen recently";

    const now = new Date();
    // Ensure the datetime string is parsed as UTC by adding 'Z' if not present
    // Backend sends naive datetime without timezone, but it's stored as UTC
    const lastSeenString = lastSeenAt.endsWith("Z")
      ? lastSeenAt
      : `${lastSeenAt}Z`;
    const lastSeen = new Date(lastSeenString);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "last seen just now";
    if (diffMinutes < 60) return `last seen ${diffMinutes}m ago`;
    if (diffHours < 24) return `last seen ${diffHours}h ago`;
    if (diffDays === 1) return "last seen yesterday";
    if (diffDays < 7) return `last seen ${diffDays}d ago`;

    return `last seen ${lastSeen.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    // Render date header
    if (item.type === "date") {
      return (
        <View style={styles.dateHeaderContainer}>
          <View style={styles.dateHeaderBadge}>
            <Text style={styles.dateHeaderText}>
              {formatDateHeader(item.date)}
            </Text>
          </View>
        </View>
      );
    }

    // Render regular message
    const isMe = item.senderId === currentUserId;
    const messagesData = getMessagesWithDateHeaders().filter(
      (m: any) => !m.type,
    ) as Message[];
    const messageIndex = messagesData.findIndex(
      (m: Message) => m.id === item.id,
    );
    const showAvatar =
      !isMe &&
      (messageIndex === 0 ||
        messagesData[messageIndex - 1].senderId !== item.senderId);

    return (
      <Animated.View
        entering={
          isMe ? FadeInRight.delay(index * 50) : FadeInLeft.delay(index * 50)
        }
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          {isMe ? (
            <View style={styles.bubbleGradient}>
              <Text style={styles.myMessageText}>{item.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.myMessageTime}>
                  {formatTime(item.sentAt)}
                </Text>
                <Ionicons
                  name={item.status === "sent" ? "checkmark" : "checkmark-done"}
                  size={14}
                  color={
                    item.status === "read"
                      ? "#53BDEB" // WhatsApp blue for read
                      : "rgba(255,255,255,0.6)" // Grey for sent/delivered
                  }
                />
              </View>
            </View>
          ) : (
            <View style={styles.theirBubbleContent}>
              <Text style={styles.theirMessageText}>{item.text}</Text>
              <Text style={styles.theirMessageTime}>
                {formatTime(item.sentAt)}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </>
    );
  }

  if (!otherUser || !threadId) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Chat not found</Text>
        </View>
      </>
    );
  }

  // Safe to access otherUser properties now
  const displayName = otherUser.lastName
    ? `${otherUser.firstName} ${otherUser.lastName[0]}.`
    : otherUser.firstName;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header - Fixed */}
        <View style={styles.header}>
          <PressableScale
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.platinum} />
          </PressableScale>

          <View style={styles.headerCenter}>
            <View style={styles.avatarContainer}>
              {otherUser.avatarUrl ? (
                <Image
                  source={{ uri: otherUser.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholderCircle]}>
                  <Text style={styles.avatarInitial}>
                    {otherUser.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {otherUser.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View>
              <Text style={styles.headerName}>{displayName}</Text>
              <Text style={styles.headerStatus}>
                {isTyping
                  ? "typing..."
                  : otherUser.isOnline
                    ? "online"
                    : formatLastSeen(otherUser.lastSeenAt)}
              </Text>
            </View>
          </View>

          <PressableScale
            style={styles.headerAction}
            onPress={() => {
              if (!otherUser || !threadId) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowMenu(true);
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={Colors.platinum}
            />
          </PressableScale>
        </View>

        {/* Menu Modal */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <PressableScale
            style={styles.modalOverlay}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <PressableScale style={styles.menuItem} onPress={handleClearChat}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={Colors.platinum}
                />
                <Text style={styles.menuItemText}>Clear Chat</Text>
              </PressableScale>

              {/* <View style={styles.menuDivider} />

              <PressableScale
                style={styles.menuItem}
                onPress={handleDisconnect}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#EF4444"
                />
                <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                  Disconnect
                </Text>
              </PressableScale> */}
            </View>
          </PressableScale>
        </Modal>

        {/* Messages and Input Container with Keyboard Avoiding */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            keyboardShouldPersistTaps="handled"
            data={getMessagesWithDateHeaders()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted={true}
          />

          {/* Input */}
          {isDisconnected ? (
            <View style={styles.disconnectedContainer}>
              <View style={styles.disconnectedInfo}>
                <Ionicons name="ban-outline" size={20} color={Colors.smoke} />
                <Text style={styles.disconnectedText}>
                  {disconnectedByMe
                    ? "You disconnected from this person"
                    : "This person disconnected from you"}
                </Text>
              </View>
              <PressableScale
                style={styles.reconnectButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                  if (!threadId) return;

                  setConfirmModal({
                    visible: true,
                    title: "Send Connection Request",
                    message: `Send a new connection request to ${displayName}?`,
                    confirmText: "Send Request",
                    confirmColor: Colors.gold,
                    onConfirm: () => {
                      connectionService
                        .reconnectByThread(threadId)
                        .then(() => {
                          setToastMessage("Connection request sent!");
                          setToastType("success");
                          setToastVisible(true);
                          setTimeout(() => router.back(), 1500);
                        })
                        .catch((error) => {
                          console.error("Error reconnecting:", error);
                          setToastMessage("Failed to send connection request");
                          setToastType("error");
                          setToastVisible(true);
                        });
                    },
                  });
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={Colors.platinum}
                />
                <Text style={styles.reconnectButtonText}>
                  Send Connection Request
                </Text>
              </PressableScale>
            </View>
          ) : (
            <Animated.View
              entering={FadeInDown}
              style={[
                styles.inputContainer,
                Platform.OS === "android" && { paddingBottom: 30 },
              ]}
            >
              <View style={styles.inputGradient}>
                <PressableScale
                  style={styles.keyboardButton}
                  onPress={handleKeyboardToggle}
                >
                  <Ionicons
                    name={
                      isKeyboardVisible ? "close-outline" : "keypad-outline"
                    }
                    size={24}
                    color={Colors.smoke}
                  />
                </PressableScale>

                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Type a message..."
                  placeholderTextColor={Colors.smoke}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={1000}
                  editable={true}
                  autoCorrect={true}
                  autoCapitalize="sentences"
                />

                <PressableScale
                  style={[
                    styles.sendButton,
                    !inputText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                >
                  <View style={styles.sendButtonGradient}>
                    <Ionicons name="send" size={20} color="white" />
                  </View>
                </PressableScale>
              </View>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>

      {/* Confirm Modal */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmModal((prev) => ({ ...prev, visible: false }))
        }
      >
        <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 32,
            }}
            onPress={() =>
              setConfirmModal((prev) => ({ ...prev, visible: false }))
            }
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: Colors.bgCard,
                borderRadius: 20,
                padding: 24,
                width: "100%",
                borderWidth: 1,
                borderColor: "rgba(57, 243, 255, 0.15)",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.platinum,
                  marginBottom: 10,
                }}
              >
                {confirmModal.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.smoke,
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                {confirmModal.message}
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <PressableScale
                  onPress={() =>
                    setConfirmModal((prev) => ({ ...prev, visible: false }))
                  }
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: Colors.bgSecondary,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: Colors.lightGrey,
                    }}
                  >
                    Cancel
                  </Text>
                </PressableScale>
                <PressableScale
                  onPress={() => {
                    setConfirmModal((prev) => ({ ...prev, visible: false }));
                    confirmModal.onConfirm();
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: confirmModal.confirmColor || Colors.gold,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color:
                        confirmModal.confirmColor === "#EF4444"
                          ? Colors.white
                          : Colors.bg,
                    }}
                  >
                    {confirmModal.confirmText}
                  </Text>
                </PressableScale>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bg,
  },
  errorText: {
    color: Colors.platinum,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(57, 243, 255, 0.1)",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  avatarPlaceholderCircle: {
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: Colors.platinum,
    fontSize: 18,
    fontWeight: "700",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.platinum,
  },
  headerStatus: {
    fontSize: 13,
    color: Colors.smoke,
    fontStyle: "italic",
  },
  headerAction: {
    padding: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  theirMessageContainer: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    overflow: "hidden",
  },
  myBubble: {
    marginLeft: "auto",
  },
  theirBubble: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  bubbleGradient: {
    padding: 12,
    paddingBottom: 8,
    backgroundColor: Colors.bgSecondary,
  },
  theirBubbleContent: {
    padding: 12,
    paddingBottom: 8,
  },
  myMessageText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.white,
    marginBottom: 4,
  },
  theirMessageText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.platinum,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  myMessageTime: {
    fontSize: 11,
    color: Colors.lightGrey,
  },
  theirMessageTime: {
    fontSize: 11,
    color: Colors.smoke,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 243, 255, 0.1)",
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  keyboardButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: Colors.platinum,
    fontSize: 15,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  sendButton: {
    borderRadius: 22,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    minWidth: 200,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.platinum,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
  },
  disconnectedContainer: {
    flexDirection: "column",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 243, 255, 0.1)",
  },
  disconnectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disconnectedText: {
    fontSize: 14,
    color: Colors.smoke,
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
  },
  reconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  reconnectButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.platinum,
  },
  dateHeaderContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateHeaderBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateHeaderText: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  unreadDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  unreadDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
  },
  unreadDividerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  unreadDividerText: {
    fontSize: 11,
    color: Colors.smoke,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
