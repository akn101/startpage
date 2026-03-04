"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationPayload } from "@/lib/notifications";

const TOAST_DURATION_MS = 5000;
const RECONNECT_DELAY_MS = 1500;

export function useNotifications() {
  const [toasts, setToasts] = useState<NotificationPayload[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const deadRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    deadRef.current = false;

    function connect() {
      if (deadRef.current) return;
      const es = new EventSource("/api/notifications/stream");
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ping" || data.type === "connected") return;
          const payload = data as NotificationPayload;
          setToasts((prev) => [...prev, payload]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== payload.id));
          }, TOAST_DURATION_MS);
        } catch {
          // ignore malformed events
        }
      };

      // Close and reconnect after Vercel's 300s serverless timeout
      es.onerror = () => {
        es.close();
        if (!deadRef.current) {
          timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      deadRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      esRef.current?.close();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
