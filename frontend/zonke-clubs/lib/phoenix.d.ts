// Type definitions for Phoenix Channels JavaScript client
declare module "@/lib/phoenix.js" {
  export class Socket {
    constructor(
      endPoint: string,
      opts?: {
        params?: any;
        transport?: any;
        encode?: (payload: any, callback: (encoded: any) => void) => void;
        decode?: (payload: any, callback: (decoded: any) => void) => void;
        timeout?: number;
        heartbeatIntervalMs?: number;
        reconnectAfterMs?: (tries: number) => number;
        rejoinAfterMs?: (tries: number) => number;
        logger?: (kind: string, msg: string, data: any) => void;
        longpollerTimeout?: number;
      },
    );

    protocol(): string;
    endPointURL(): string;
    connect(params?: any): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    connectionState(): string;
    isConnected(): boolean;
    channel(topic: string, chanParams?: any): Channel;
    push(data: any): void;
    log(kind: string, msg: string, data: any): void;
    hasLogger(): boolean;
    onOpen(callback: () => void): void;
    onClose(callback: (event: any) => void): void;
    onError(callback: (error: any) => void): void;
    onMessage(callback: (message: any) => void): void;
    makeRef(): string;
  }

  export class Channel {
    constructor(topic: string, params: any, socket: Socket);

    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    onClose(callback: () => void): void;
    onError(callback: (reason: any) => void): void;
    on(event: string, callback: (payload: any) => void): number;
    off(event: string, ref?: number): void;
    push(event: string, payload: any, timeout?: number): Push;
  }

  export class Push {
    constructor(channel: Channel, event: string, payload: any, timeout: number);

    send(): void;
    receive(status: string, callback: (response: any) => void): Push;
  }

  export class Presence {
    constructor(channel: Channel, opts?: any);

    static syncState(
      currentState: any,
      newState: any,
      onJoin?: (key: string, current: any, newPres: any) => void,
      onLeave?: (key: string, current: any, leftPres: any) => void,
    ): any;

    static syncDiff(
      currentState: any,
      diff: { joins: any; leaves: any },
      onJoin?: (key: string, current: any, newPres: any) => void,
      onLeave?: (key: string, current: any, leftPres: any) => void,
    ): any;

    static list(
      presences: any,
      chooser?: (key: string, presence: any) => any,
    ): any[];

    onJoin(callback: (key: string, current: any, newPres: any) => void): void;
    onLeave(callback: (key: string, current: any, leftPres: any) => void): void;
    onSync(callback: () => void): void;
    list(chooser?: (key: string, presence: any) => any): any[];
    inPendingSyncState(): boolean;
  }

  export const SOCKET_STATES: {
    connecting: number;
    open: number;
    closing: number;
    closed: number;
  };

  export const CHANNEL_STATES: {
    closed: string;
    errored: string;
    joined: string;
    joining: string;
    leaving: string;
  };

  export const CHANNEL_EVENTS: {
    close: string;
    error: string;
    join: string;
    reply: string;
    leave: string;
  };

  export const TRANSPORTS: {
    longpoll: string;
    websocket: string;
  };
}
