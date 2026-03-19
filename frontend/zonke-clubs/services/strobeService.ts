import { api } from "./api";
import { websocketService } from "./websocketService";

export type StrobeEffect =
  | "pulse"
  | "kick"
  | "half"
  | "bar"
  | "stutter"
  | "wave"
  | "custom";

export type StrobeApproval = {
  id: string;
  dj_user_id: string;
  club_id: string;
  status: "pending" | "approved";
  expires_at: string | null;
  club: { id: string; name: string } | null;
};

export type StrobeSessionInfo = {
  session_id: string;
  dj_user_id?: string;
  bpm: number;
  effect: StrobeEffect;
  server_time: number;
  custom_on_ms?: number | null;
  custom_off_ms?: number | null;
};

// ── REST API calls ────────────────────────────────────────────────────────────

export const strobeService = {
  getMyApprovals(): Promise<StrobeApproval[]> {
    return api.get("/strobe/approvals", true).then((res: any) => res.approvals);
  },

  getActiveSession(clubId: string): Promise<StrobeSessionInfo | null> {
    return api
      .get(`/strobe/clubs/${clubId}/session`, true)
      .then((res: any) => res.session);
  },

  listActiveSessions(): Promise<
    Array<{
      session_id: string;
      club_id: string;
      bpm: number;
      effect: StrobeEffect;
      club_name: string | null;
    }>
  > {
    return api.get("/strobe/active", true).then((res: any) => res.sessions);
  },

  requestApproval(clubId: string): Promise<StrobeApproval> {
    return api
      .post(`/strobe/clubs/${clubId}/request`, {}, true)
      .then((res: any) => res.approval);
  },

  cancelRequest(clubId: string): Promise<void> {
    return api
      .delete(`/strobe/clubs/${clubId}/request`, true)
      .then(() => undefined);
  },

  approveDJ(clubId: string, djUserId: string): Promise<StrobeApproval> {
    return api
      .post(`/strobe/clubs/${clubId}/approve`, { dj_user_id: djUserId }, true)
      .then((res: any) => res.approval);
  },

  revokeApproval(clubId: string, djUserId: string): Promise<void> {
    return api
      .delete(`/strobe/clubs/${clubId}/approve`, true)
      .then(() => undefined);
  },
};

// ── Channel-based strobe controller ──────────────────────────────────────────

class StrobeChannel {
  private channel: any = null;
  private clubId: string | null = null;
  private onStarted: ((info: StrobeSessionInfo) => void) | null = null;
  private onUpdated: ((info: StrobeSessionInfo) => void) | null = null;
  private onStopped: ((sessionId: string) => void) | null = null;
  private onOverrideCb: ((on: boolean, resume: boolean) => void) | null = null;

  join(clubId: string): Promise<void> {
    // Reuse existing channel if already joined to the same club
    if (this.channel && this.clubId === clubId) {
      return Promise.resolve();
    }
    this.clubId = clubId;
    const socket = (websocketService as any).socket;

    if (!socket) {
      return Promise.reject(new Error("WebSocket not connected"));
    }

    this.channel = socket.channel(`strobe:${clubId}`, {});

    this.channel.on("strobe_started", (payload: any) => {
      this.onStarted?.(payload);
    });

    this.channel.on("strobe_updated", (payload: any) => {
      this.onUpdated?.(payload);
    });

    this.channel.on("strobe_stopped", (payload: any) => {
      this.onStopped?.(payload.session_id);
    });

    this.channel.on("strobe_override", (payload: any) => {
      this.onOverrideCb?.(payload.on, payload.resume ?? true);
    });

    return new Promise((resolve, reject) => {
      this.channel
        .join()
        .receive("ok", () => resolve())
        .receive("error", (err: any) => reject(err))
        .receive("timeout", () => reject(new Error("timeout")));
    });
  }

  leave() {
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
    }
    this.clubId = null;
  }

  // DJ: start a strobe session
  startStrobe(
    bpm: number,
    effect: StrobeEffect,
    customOnMs?: number,
    customOffMs?: number,
  ): Promise<StrobeSessionInfo> {
    return new Promise((resolve, reject) => {
      this.channel
        .push("start_strobe", {
          bpm,
          effect,
          custom_on_ms: customOnMs,
          custom_off_ms: customOffMs,
        })
        .receive("ok", (resp: any) => resolve(resp))
        .receive("error", (err: any) => reject(err));
    });
  }

  // DJ: update running session
  updateStrobe(
    sessionId: string,
    bpm: number,
    effect: StrobeEffect,
    customOnMs?: number,
    customOffMs?: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.channel
        .push("update_strobe", {
          session_id: sessionId,
          bpm,
          effect,
          custom_on_ms: customOnMs,
          custom_off_ms: customOffMs,
        })
        .receive("ok", () => resolve())
        .receive("error", (err: any) => reject(err));
    });
  }

  // DJ: stop strobe
  stopStrobe(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.channel
        .push("stop_strobe", { session_id: sessionId })
        .receive("ok", () => resolve())
        .receive("error", (err: any) => reject(err));
    });
  }

  // Audience: fetch current session on join
  getCurrentSession(): Promise<StrobeSessionInfo | null> {
    return new Promise((resolve, reject) => {
      this.channel
        .push("get_current_session", {})
        .receive("ok", (resp: any) => resolve(resp.session))
        .receive("error", (err: any) => reject(err));
    });
  }

  overrideOn() {
    this.channel?.push("override_on", {});
  }

  overrideOff(resume = true) {
    this.channel?.push("override_off", { resume });
  }

  onStrobeStarted(cb: (info: StrobeSessionInfo) => void) {
    this.onStarted = cb;
  }

  onStrobeUpdated(cb: (info: StrobeSessionInfo) => void) {
    this.onUpdated = cb;
  }

  onStrobeStopped(cb: (sessionId: string) => void) {
    this.onStopped = cb;
  }

  onStrobeOverride(cb: (on: boolean, resume: boolean) => void) {
    this.onOverrideCb = cb;
  }
}

export const strobeChannel = new StrobeChannel();

// ── Beat scheduling helpers ───────────────────────────────────────────────────

/**
 * Returns ms until the next beat boundary relative to the server anchor.
 * Returns 0 if already on a boundary (prevents double-waiting).
 */
export function getNextBeatDelay(serverTimeMs: number, bpm: number): number {
  const beat = 60000 / bpm;
  const elapsed = Date.now() - serverTimeMs;
  const phase = ((elapsed % beat) + beat) % beat;
  return (beat - phase) % beat; // % beat makes exact boundaries return 0
}

/**
 * Returns flash pattern as [on_ms, off_ms] pairs.
 *
 * KEY RULE: on_ms + off_ms across ALL steps must sum to a multiple of `beat`.
 * This ensures after the last step + offMs wait, we land exactly on a beat
 * boundary so getNextBeatDelay returns 0 and the cycle restarts immediately.
 */
export function getEffectPattern(
  effect: StrobeEffect,
  bpm: number,
  customOnMs?: number | null,
  customOffMs?: number | null,
): Array<[number, number]> {
  if (effect === "custom") {
    return [[customOnMs ?? 50, customOffMs ?? 100]];
  }

  const b = Math.round(60000 / bpm); // ms per beat

  switch (effect) {
    case "pulse":
      // Long warm flash every beat — feels like a heartbeat, not a strobe
      return [[Math.round(b * 0.45), Math.round(b * 0.55)]];

    case "kick":
      // Short, punchy flash dead on every beat — like a speaker thump
      return [[50, b - 50]];

    case "half":
      // One flash every 2 beats — cycle total = 2*b via off_ms
      return [[Math.round(b * 0.4), Math.round(b * 1.6)]];

    case "bar":
      // One flash every 4 beats — dramatic, for builds and drops
      return [[Math.round(b * 0.5), Math.round(b * 3.5)]];

    case "stutter":
      // Double thump on every beat: two hits with a gap, then silence until next beat
      // Total: 40 + 80 + 40 + (b-160) = b ✓
      return [
        [40, 80],
        [40, b - 160],
      ];

    case "wave":
      // One long pulse (beat 1) then two short hits (beat 2) — 2-beat pattern
      // Total: round(b*0.35) + round(b*0.65) + 30 + 50 + 30 + (b-80) = 2*b ✓
      return [
        [Math.round(b * 0.35), Math.round(b * 0.65)],
        [30, 50],
        [30, b - 80],
      ];

    default:
      return [[50, b - 50]];
  }
}
