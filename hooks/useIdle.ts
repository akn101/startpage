"use client";

import { useEffect, useRef, useCallback } from "react";

const EVENTS: (keyof DocumentEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
];

export function useIdle(timeout: number, onIdle: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    reset();
    EVENTS.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [reset]);
}
