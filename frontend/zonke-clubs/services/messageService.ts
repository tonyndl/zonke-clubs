import { api } from "./api";
import { ChatThread, Message } from "../types/connection";

/**
 * Message Service
 * Handles all API calls related to messaging and chat threads
 */

/**
 * Get all chat threads for the current user
 */
export const getThreads = (): Promise<{ threads: ChatThread[] }> => {
  return api.get<any>("/threads", true).then((response) => {
    // Transform snake_case to camelCase
    const threads = (response as any).threads
      .filter((thread: any) => thread.participant) // Filter out threads without participants
      .map((thread: any) => ({
        id: thread.id,
        participant: {
          id: thread.participant.id,
          username: thread.participant.username,
          avatarUrl: thread.participant.avatar_url,
          bio: thread.participant.bio,
          isOnline: thread.participant.is_online || false,
          lastSeenAt: thread.participant.last_seen_at,
        },
        lastMessage: thread.last_message
          ? {
              id: thread.last_message.id || "",
              text: thread.last_message.content || "",
              sentAt: thread.last_message.sent_at || "",
              insertedAt: thread.last_message.inserted_at || thread.updated_at,
              senderId: thread.last_message.sender_id || "",
              isRead: thread.last_message.is_read || false,
              status: thread.last_message.status || "sent",
            }
          : {
              id: "",
              text: "No messages yet",
              sentAt: "",
              insertedAt: thread.updated_at,
              senderId: "",
              isRead: true,
            },
        unreadCount: thread.unread_count || 0,
        connectionStatus: thread.connection_status,
        updatedAt: thread.updated_at,
      }));

    return { threads };
  });
};

/**
 * Get a specific thread with all messages
 */
export const getThread = (
  threadId: string,
): Promise<{
  thread: {
    id: string;
    messages: Message[];
    participants: any[];
  };
}> => {
  return api.get<any>(`/threads/${threadId}`, true).then((response) => {
    const thread = (response as any).thread;

    return {
      thread: {
        id: thread.id,
        messages: thread.messages.map((msg: any) => ({
          id: msg.id,
          threadId: msg.thread_id,
          text: msg.content,
          senderId: msg.sender_id,
          isRead: msg.is_read,
          status: msg.status || "sent",
          sentAt: msg.sent_at,
          insertedAt: msg.inserted_at,
        })),
        participants: thread.participants.map((p: any) => ({
          id: p.id,
          username: p.username,
          avatarUrl: p.avatar_url,
          bio: p.bio,
          isOnline: p.is_online || false,
          lastSeenAt: p.last_seen_at,
        })),
      },
    };
  });
};

/**
 * Get or create a thread with another user
 */
export const getOrCreateThread = (
  userId: string,
): Promise<{
  thread: {
    id: string;
    messages: Message[];
    participants: any[];
  };
}> => {
  return api
    .post<any>(
      "/threads/with-user",
      {
        user_id: userId,
      },
      true,
    )
    .then((response) => {
      const thread = (response as any).thread;

      return {
        thread: {
          id: thread.id,
          messages: thread.messages.map((msg: any) => ({
            id: msg.id,
            threadId: msg.thread_id,
            text: msg.content,
            senderId: msg.sender_id,
            isRead: msg.is_read,
            status: msg.status || "sent",
            sentAt: msg.sent_at,
            insertedAt: msg.inserted_at,
          })),
          participants: thread.participants.map((p: any) => ({
            id: p.id,
            username: p.username,
            avatarUrl: p.avatar_url,
            bio: p.bio,
            isOnline: p.is_online || false,
            lastSeenAt: p.last_seen_at,
          })),
        },
      };
    });
};

/**
 * Send a message in a thread
 */
export const sendMessage = (
  threadId: string,
  content: string,
): Promise<{ message: Message }> => {
  return api
    .post<any>(
      "/messages",
      {
        thread_id: threadId,
        content: content,
      },
      true,
    )
    .then((response) => {
      const msg = (response as any).message;

      return {
        message: {
          id: msg.id,
          threadId: msg.thread_id,
          text: msg.content,
          senderId: msg.sender_id,
          isRead: msg.is_read,
          status: msg.status || "sent",
          sentAt: msg.sent_at,
          insertedAt: msg.inserted_at,
        },
      };
    });
};

/**
 * Clear all messages in a thread
 */
export const clearThread = (threadId: string): Promise<{ message: string }> => {
  return api
    .delete<any>(`/threads/${threadId}/messages`, true)
    .then((response) => ({
      message: response.message || "Chat cleared successfully",
    }));
};
