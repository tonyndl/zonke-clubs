export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface ConnectionRequest {
  id: string;
  sender: User;
  receiver: User;
  status: ConnectionStatus;
  message?: string;
  clubId?: string;
  clubName?: string;
  intentionId?: string;
  plannedDate?: string;
  threadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: {
    id: string;
    text: string;
    sentAt: string; // pre-formatted display string
    insertedAt?: string; // raw UTC ISO for time-ago calculations
    senderId: string;
    isRead: boolean;
    status: MessageStatus;
  };
  unreadCount: number;
  connectionStatus?: ConnectionStatus;
  updatedAt: string;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  threadId: string;
  text: string;
  senderId: string;
  isRead: boolean;
  status: MessageStatus;
  sentAt: string; // pre-formatted display string: "HH:MM" or "D Mon"
  insertedAt?: string; // raw UTC ISO string for date grouping
}
