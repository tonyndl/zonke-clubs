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
          return Promise.reject(new Error("No auth token"));
        }

        const wsUrl = getWebSocketUrl();

        // Create socket connection with explicit WebSocket transport for React Native
        this.socket = new Socket(wsUrl, {
          params: { token },
          transport: WebSocket,
          reconnect: true,
          reconnectAfterMs: (tries) => {
            return [1000, 2000, 5000, 10000][tries - 1] || 10000;
          },
        });

        // Add connection state listeners
        this.socket.onOpen(() => {});
        this.socket.onError((error) =>
          console.error("WebSocket error:", error),
        );
        this.socket.onClose(() => {});

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
            this.emit("new_connection_request", payload);
          });

          this.userChannel.on("connection_request_accepted", (payload: any) => {
            this.emit("connection_request_accepted", payload);
          });

          this.userChannel.on("connection_request_declined", (payload: any) => {
            this.emit("connection_request_declined", payload);
          });

          this.userChannel.on("new_message_in_thread", (payload: any) => {
            this.emit("new_message_in_thread", payload);
          });

          this.userChannel.on("messages_marked_as_read", (payload: any) => {
            this.emit("messages_marked_as_read", payload);
          });

          this.userChannel.on("connection_disconnected", (payload: any) => {
            this.emit("connection_disconnected", payload);
          });

          this.userChannel.on("dj_request_approved", (payload: any) => {
            this.emit("dj_request_approved", payload);
          });

          this.userChannel.on("dj_request_denied", (payload: any) => {
            this.emit("dj_request_denied", payload);
          });

          // Join the channel
          return new Promise((resolve, reject) => {
            this.userChannel
              .join()
              .receive("ok", (resp: any) => {
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

    this.presenceChannel = this.socket.channel("presence:lobby", {});

    // Listen for presence_diff events
    this.presenceChannel.on("presence_diff", (diff: any) => {
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
      .receive("ok", (resp: any) => {})
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
      return Promise.resolve();
    }

    const channel = this.socket.channel(`thread:${threadId}`, {});

    // Listen for new messages
    channel.on("new_message", (payload: any) => {
      this.emit(`thread:${threadId}:new_message`, payload);
    });

    // Listen for message status updates (delivered/read)
    channel.on("message_status_updated", (payload: any) => {
      this.emit(`thread:${threadId}:message_status_updated`, payload);
    });

    // Join the channel
    return new Promise((resolve, reject) => {
      channel
        .join()
        .receive("ok", (resp: any) => {
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
      channel.leave();
      this.threadChannels.delete(threadId);
    }
  }

  markMessagesAsRead(threadId: string) {
    // Emit locally immediately so badge counts update regardless of channel state
    this.emit("self_read_thread", { thread_id: threadId });

    const channel = this.threadChannels.get(threadId);
    if (channel) {
      channel
        .push("mark_read", {})
        .receive("ok", () => {})
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
