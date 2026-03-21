export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  source: "android" | "openclaw" | "other";
  timestamp: number;
}
