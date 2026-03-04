"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface AlarmEntry {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
}

// Shared AudioContext — created on first user gesture so browsers allow it
let _ctx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { return null; }
  }
  return _ctx;
}

function playBell(ctx: AudioContext, freq: number, startTime: number, vol = 0.28) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const gain2 = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.value = freq;
  osc2.type = "triangle";
  osc2.frequency.value = freq * 2;

  gain2.gain.value = 0.12;
  osc1.connect(gain);
  osc2.connect(gain2);
  gain2.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.6);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + 1.7);
  osc2.stop(startTime + 1.7);
}

function playAlarmSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  const gaps = [0, 0.35, 0.70, 1.05, 1.55, 1.90];
  seq.forEach((freq, i) => playBell(ctx, freq, ctx.currentTime + gaps[i]));
}

export default function Alarm() {
  const [alarms, setAlarms]   = useState<AlarmEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [ringing, setRinging] = useState<string | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const { authenticated } = useAuth();

  // Load alarms from API (auth required — alarms are private)
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/data/alarms")
      .then((r) => r.json())
      .then(({ alarms: data }) => { if (data) setAlarms(data); });
  }, [authenticated]);

  // Prime AudioContext on first user gesture
  useEffect(() => {
    const prime = () => {
      const ctx = getAudioCtx();
      if (ctx?.state === "suspended") ctx.resume();
    };
    document.addEventListener("click", prime, { once: true });
    document.addEventListener("touchstart", prime, { once: true });
    return () => {
      document.removeEventListener("click", prime);
      document.removeEventListener("touchstart", prime);
    };
  }, []);

  // Listen for /alarm command from CommandPalette
  useEffect(() => {
    const handler = (e: Event) => {
      const { time, label } = (e as CustomEvent<{ time: string; label: string }>).detail;
      addAlarmDirect(time, label);
    };
    window.addEventListener("addAlarm", handler);
    return () => window.removeEventListener("addAlarm", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const addAlarmDirect = useCallback((time: string, label = "") => {
    if (!authenticated) return;
    fetch("/api/data/alarms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, label: label.trim() }),
    })
      .then((r) => r.json())
      .then(({ alarm }) => {
        if (alarm) setAlarms((prev) => [...prev, alarm].sort((a, b) => a.time.localeCompare(b.time)));
      });
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [authenticated]);

  // Check alarms every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hm  = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const sec = now.getSeconds();

      alarms.forEach((a) => {
        if (!a.enabled) return;
        const key = `${a.id}-${hm}`;
        if (a.time === hm && sec <= 2 && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          playAlarmSound();
          setRinging(a.label || a.time);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`⏰ ${a.label || a.time}`, { silent: true });
          }
        }
      });

      if (sec === 30) {
        firedRef.current.forEach((k) => {
          const kHm = k.split("-").slice(1).join("-");
          if (kHm !== hm) firedRef.current.delete(k);
        });
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [alarms]);

  const addAlarm = () => {
    if (!newTime) return;
    addAlarmDirect(newTime, newLabel);
    setNewTime("");
    setNewLabel("");
    setShowAdd(false);
  };

  const toggle = (id: string) => {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;
    const next = !alarm.enabled;
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: next } : a)));
    fetch("/api/data/alarms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, enabled: next }) });
  };

  const remove = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    fetch("/api/data/alarms", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const nextAlarm = alarms.find((a) => a.enabled);

  if (!authenticated) {
    return (
      <div className="alarm-widget glass-sm">
        <div className="alarm-header"><span>Alarms</span></div>
        <div className="alarm-empty">Log in to manage alarms</div>
      </div>
    );
  }

  return (
    <div className="alarm-widget glass-sm">
      <div className="alarm-header">
        <span>Alarms</span>
        <button type="button" className="alarm-add-btn" onClick={() => setShowAdd((v) => !v)} aria-label="Add alarm">
          +
        </button>
      </div>

      {ringing && (
        <div className="alarm-ringing" onClick={() => setRinging(null)}>
          ⏰ {ringing} — tap to dismiss
        </div>
      )}

      {showAdd && (
        <div className="alarm-form">
          <label className="sr-only" htmlFor="alarm-time-input">Alarm time</label>
          <input
            id="alarm-time-input"
            type="time"
            className="alarm-time-input"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <input
            type="text"
            className="alarm-label-input"
            placeholder="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAlarm()}
          />
          <button type="button" className="tracker-btn" onClick={addAlarm}>Set</button>
        </div>
      )}

      {alarms.length === 0 && !showAdd ? (
        <div className="alarm-empty">No alarms — tap + or use /alarm HH:MM</div>
      ) : (
        <div className="alarm-list">
          {alarms.map((a) => (
            <div key={a.id} className={`alarm-item${a.enabled ? "" : " disabled"}`}>
              <button type="button" className="alarm-toggle" onClick={() => toggle(a.id)} aria-label="Toggle alarm">
                <span className={`alarm-dot${a.enabled ? " on" : ""}`} />
              </button>
              <span className="alarm-time">{a.time}</span>
              {a.label && <span className="alarm-item-label">{a.label}</span>}
              <button type="button" className="alarm-remove" onClick={() => remove(a.id)} aria-label="Remove alarm">×</button>
            </div>
          ))}
        </div>
      )}

      {nextAlarm && !showAdd && alarms.length > 0 && (
        <div className="alarm-next">
          next · {nextAlarm.time}{nextAlarm.label ? ` · ${nextAlarm.label}` : ""}
        </div>
      )}
    </div>
  );
}
