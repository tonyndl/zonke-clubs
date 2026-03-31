import { Socket, Channel } from "phoenix";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:4000/socket";

type EventCallback = (payload?: any) => void;

class AdminSocketService {
  private socket: Socket | null = null;
  private userChannel: Channel | null = null;
  private strobeChannel: Channel | null = null;
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

  joinStrobeChannel(clubId: string) {
    if (!this.socket) return;
    if (this.strobeChannel) {
      this.strobeChannel.leave();
    }

    this.strobeChannel = this.socket.channel(`strobe:${clubId}`, {});
    this.strobeChannel
      .join()
      .receive("ok", () => {
        console.log("[AdminSocket] Joined strobe channel for club", clubId);
      })
      .receive("error", (err: any) => {
        console.error("[AdminSocket] Failed to join strobe channel", err);
      });

    this.strobeChannel.on("new_dj_request", (payload: any) => {
      this.emit("new_dj_request", payload);
    });

    this.strobeChannel.on("dj_request_cancelled", (payload: any) => {
      this.emit("dj_request_cancelled", payload);
    });
  }

  leaveStrobeChannel() {
    if (this.strobeChannel) {
      this.strobeChannel.leave();
      this.strobeChannel = null;
    }
  }

  disconnect() {
    this.leaveStrobeChannel();
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

  private emit(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

export const adminSocketService = new AdminSocketService();
