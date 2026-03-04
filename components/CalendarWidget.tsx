"use client";

import { useEffect, useState } from "react";

interface CalEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

function formatEventTime(start: string, allDay: boolean): string {
  const d = new Date(start);
  if (allDay) {
    return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
  }
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" }) + ` ${time}`;
}

function dayLabel(start: string): string {
  const d = new Date(start);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "today";
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 1) return "tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/integrations/calendar")
      .then((r) => r.json())
      .then(({ events: ev }) => {
        setEvents(ev ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Group by day label
  const grouped: { day: string; items: CalEvent[] }[] = [];
  for (const ev of events) {
    const day = dayLabel(ev.start);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) {
      last.items.push(ev);
    } else {
      grouped.push({ day, items: [ev] });
    }
  }

  return (
    <div className="feed-widget glass-sm">
      <div className="feed-widget-header">📅 Calendar</div>

      {loading && <div className="feed-empty">Loading…</div>}
      {error && <div className="feed-error">Couldn&apos;t load calendar</div>}

      {!loading && !error && events.length === 0 && (
        <div className="feed-empty">
          No upcoming events — set CALDAV_ICS_URL in Vercel
        </div>
      )}

      {grouped.map((g) => (
        <div key={g.day} className="cal-group">
          <div className="cal-day-label">{g.day}</div>
          {g.items.map((ev) => (
            <div key={ev.uid} className="cal-event">
              <div className="cal-event-time">{formatEventTime(ev.start, ev.allDay)}</div>
              <div className="cal-event-title">{ev.summary}</div>
              {ev.location && <div className="cal-event-location">{ev.location}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
