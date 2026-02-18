import { Socket } from "@/lib/phoenix.js";
import { authService } from "./authService";
import { Platform } from "react-native";

// React Native WebSocket
declare const WebSocket: any;

// Use same IP as API service for consistency
const LOCAL_IP = "192.168.1.139";

const getWebSocketUrl = () => {
  // For iOS and Android, use local network IP
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return `ws://${LOCAL_IP}:4000/socket`;
  }
  // For web, use localhost
  return "ws://localhost:4000/socket";
};

class WebSocketService {
  private socket: Socket | null = null;
  private userChannel: any = null;
  private presenceChannel: any = null;
  private threadChannels: Map<string, any> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private presenceState: Map<string, any> = new Map();

  connect() {
    return authService
      .getToken()
      .then((token) => {
        if (!token) {
          console.log("No auth token available for WebSocket connection");
          return Promise.reject(new Error("No auth token"));
        }

        const wsUrl = getWebSocketUrl();
        console.log("Connecting to WebSocket:", wsUrl);
        console.log("With token:", token?.substring(0, 20) + "...");

        // Create socket connection with explicit WebSocket transport for React Native
        this.socket = new Socket(wsUrl, {
          params: { token },
          transport: WebSocket,
          reconnect: true,
          reconnectAfterMs: (tries) => {
            console.log(`WebSocket reconnection attempt ${tries}`);
            return [1000, 2000, 5000, 10000][tries - 1] || 10000;
          },
        });

        // Add connection state listeners
        this.socket.onOpen(() => console.log("WebSocket connected!"));
        this.socket.onError((error) =>
          console.error("WebSocket error:", error),
        );
        this.socket.onClose(() => console.log("WebSocket closed"));

        this.socket.connect();

        // Get user from token (for channel topic)
        return authService.getCurrentUser().then((user) => {
          if (!user) {
            throw new Error("No user found");
          }

          // Join user-specific channel
          this.userChannel = this.socket!.channel(`user:${user.id}`, {});

          // Setup channel event listeners
          this.userChannel.on("new_connection_request", (payload: any) => {
            console.log("New connection request received:", payload);
            this.emit("new_connection_request", payload);
          });

          this.userChannel.on("connection_request_accepted", (payload: any) => {
            console.log("Connection request accepted:", payload);
            this.emit("connection_request_accepted", payload);
          });

          this.userChannel.on("connection_request_declined", (payload: any) => {
            console.log("Connection request declined:", payload);
            this.emit("connection_request_declined", payload);
          });

          this.userChannel.on("new_message_in_thread", (payload: any) => {
            console.log("New message in thread:", payload);
            this.emit("new_message_in_thread", payload);
          });

          this.userChannel.on("messages_marked_as_read", (payload: any) => {
            console.log("Messages marked as read:", payload);
            this.emit("messages_marked_as_read", payload);
          });

          this.userChannel.on("connection_disconnected", (payload: any) => {
            console.log("Connection disconnected:", payload);
            this.emit("connection_disconnected", payload);
          });

          // Join the channel
          return new Promise((resolve, reject) => {
            console.log("Attempting to join channel: user:" + user.id);

            this.userChannel
              .join()
              .receive("ok", (resp: any) => {
                console.log("✅ Joined channel successfully!", resp);

                // After joining user channel, also join presence:lobby to track all users
                this.joinPresenceLobby();

                resolve(resp);
              })
              .receive("error", (resp: any) => {
                console.error("❌ Unable to join channel:", resp);
                reject(resp);
              })
              .receive("timeout", () => {
                console.error("⏱️ Channel join timed out");
                reject(new Error("timeout"));
              });
          });
        });
      })
      .catch((error) => {
        console.error("WebSocket connection error:", error);
        throw error;
      });
  }

  disconnect() {
    if (this.userChannel) {
      this.userChannel.leave();
      this.userChannel = null;
    }

    if (this.presenceChannel) {
      this.presenceChannel.leave();
      this.presenceChannel = null;
    }

    // Leave all thread channels
    this.threadChannels.forEach((channel) => {
      channel.leave();
    });
    this.threadChannels.clear();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.listeners.clear();
    this.presenceState.clear();
  }

  private joinPresenceLobby() {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    console.log("Joining presence:lobby channel");
    this.presenceChannel = this.socket.channel("presence:lobby", {});

    // Listen for presence_diff events
    this.presenceChannel.on("presence_diff", (diff: any) => {
      console.log("Presence diff received:", diff);

      // Update local presence state
      if (diff.joins) {
        Object.entries(diff.joins).forEach(([userId, meta]: [string, any]) => {
          this.presenceState.set(userId, { ...meta, isOnline: true });
          // Emit event for anyone listening
          this.emit("user_presence_changed", {
            userId,
            isOnline: true,
            ...meta,
          });
        });
      }

      if (diff.leaves) {
        Object.entries(diff.leaves).forEach(([userId, meta]: [string, any]) => {
          const existingMeta = this.presenceState.get(userId) || {};
          this.presenceState.set(userId, {
            ...existingMeta,
            isOnline: false,
            lastSeenAt: meta.last_seen_at,
          });
          // Emit event for anyone listening
          this.emit("user_presence_changed", {
            userId,
            isOnline: false,
            lastSeenAt: meta.last_seen_at,
          });
        });
      }
    });

    // Join the channel
    this.presenceChannel
      .join()
      .receive("ok", (resp: any) => {
        console.log("✅ Joined presence:lobby channel");
      })
      .receive("error", (resp: any) => {
        console.error("❌ Unable to join presence:lobby:", resp);
      })
      .receive("timeout", () => {
        console.error("⏱️ Presence lobby join timed out");
      });
  }

  getUserPresence(userId: string) {
    const presence = this.presenceState.get(userId);
    return presence?.isOnline || false;
  }

  joinThreadChannel(threadId: string) {
    if (!this.socket) {
      console.error("Socket not connected. Call connect() first.");
      return Promise.reject(new Error("Socket not connected"));
    }

    // Check if already joined
    if (this.threadChannels.has(threadId)) {
      console.log("Already joined thread:", threadId);
      return Promise.resolve();
    }

    console.log("Joining thread channel:", threadId);
    const channel = this.socket.channel(`thread:${threadId}`, {});

    // Listen for new messages
    channel.on("new_message", (payload: any) => {
      console.log("New message received in thread:", threadId, payload);
      this.emit(`thread:${threadId}:new_message`, payload);
    });

    // Listen for message status updates (delivered/read)
    channel.on("message_status_updated", (payload: any) => {
      console.log("Message status updated in thread:", threadId, payload);
      this.emit(`thread:${threadId}:message_status_updated`, payload);
    });

    // Join the channel
    return new Promise((resolve, reject) => {
      channel
        .join()
        .receive("ok", (resp: any) => {
          console.log("✅ Joined thread channel:", threadId);
          this.threadChannels.set(threadId, channel);
          resolve(resp);
        })
        .receive("error", (resp: any) => {
          console.error("❌ Unable to join thread channel:", threadId, resp);
          reject(resp);
        })
        .receive("timeout", () => {
          console.error("⏱️ Thread channel join timed out:", threadId);
          reject(new Error("timeout"));
        });
    });
  }

  leaveThreadChannel(threadId: string) {
    const channel = this.threadChannels.get(threadId);
    if (channel) {
      console.log("Leaving thread channel:", threadId);
      channel.leave();
      this.threadChannels.delete(threadId);
    }
  }

  markMessagesAsRead(threadId: string) {
    const channel = this.threadChannels.get(threadId);
    if (channel) {
      console.log("Marking messages as read in thread:", threadId);
      channel
        .push("mark_read", {})
        .receive("ok", () => console.log("✅ Messages marked as read"))
        .receive("error", (err: any) =>
          console.error("❌ Error marking as read:", err),
        );
    } else {
      console.warn("Cannot mark as read - not joined to thread:", threadId);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.isConnected();
  }
}

export const websocketService = new WebSocketService();
