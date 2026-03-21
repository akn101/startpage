"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationPayload } from "@/lib/notifications";

const TOAST_DURATION_MS = 5000;
const POLL_INTERVAL_MS = 8_000;

export function useNotifications() {
  const [toasts, setToasts] = useState<NotificationPayload[]>([]);
  const lastSeenRef = useRef<number>(Date.now());
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(
          `/api/notifications/recent?since=${lastSeenRef.current}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const { notifications } = await res.json();
        if (!notifications?.length) return;

        lastSeenRef.current = Date.now();

        for (const n of notifications) {
          if (seenIdsRef.current.has(n.id)) continue;
          seenIdsRef.current.add(n.id);

          const payload: NotificationPayload = {
            id: n.id,
            title: n.title,
            body: n.body,
            source: n.source,
            timestamp: new Date(n.created_at).getTime(),
          };

          setToasts((prev) => [...prev, payload]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== payload.id));
          }, TOAST_DURATION_MS);
        }
      } catch {
        // silently retry next interval
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
