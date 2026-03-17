import { Socket, Channel } from "phoenix";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:4000/socket";

type EventCallback = () => void;

class AdminSocketService {
  private socket: Socket | null = null;
  private userChannel: Channel | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  connect(token: string, adminId: string) {
    if (this.socket) return;

    this.socket = new Socket(WS_URL, { params: { token } });
    this.socket.connect();

    this.userChannel = this.socket.channel(`user:${adminId}`, {});
    this.userChannel
      .join()
      .receive("ok", () => {})
      .receive("error", () => {});

    this.userChannel.on("post_submitted", () => {
      this.emit("post_submitted");
    });

    this.userChannel.on("post_moderated", () => {
      this.emit("post_moderated");
    });
  }

  disconnect() {
    if (this.userChannel) {
      this.userChannel.leave();
      this.userChannel = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string) {
    this.listeners.get(event)?.forEach((cb) => cb());
  }
}

export const adminSocketService = new AdminSocketService();
