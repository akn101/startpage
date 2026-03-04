export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  source: "android" | "openclaw" | "other";
  timestamp: number;
}

type SSEWriter = (data: string) => void;

// Singleton in-memory registry of active SSE connections
const clients = new Map<string, SSEWriter>();

export function registerClient(id: string, writer: SSEWriter) {
  clients.set(id, writer);
}

export function unregisterClient(id: string) {
  clients.delete(id);
}

export function broadcastNotification(payload: NotificationPayload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const writer of clients.values()) {
    try {
      writer(data);
    } catch {
      // Client disconnected — will be cleaned up via unregisterClient
    }
  }
}

export function broadcastPing() {
  const data = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
  for (const writer of clients.values()) {
    try {
      writer(data);
    } catch {
      // ignore
    }
  }
}
