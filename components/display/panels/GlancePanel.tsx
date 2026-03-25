"use client";

import { useState, useEffect } from "react";

interface WeatherData { temp: number; windspeed: number; code: number; city?: string }
interface CalEvent { uid: string; summary: string; start: string; end: string; allDay: boolean }
interface Alarm { id: string; time: string; label: string; enabled: boolean }

function weatherSymbol(code: number): string {
  if (code === 0)  return "○";
  if (code <= 2)   return "◑";
  if (code === 3)  return "●";
  if (code <= 49)  return "≋";
  if (code <= 57)  return "·";
  if (code <= 67)  return "▽";
  if (code <= 77)  return "❄";
  if (code <= 82)  return "▿";
  if (code <= 99)  return "↯";
  return "—";
}

function weatherLabel(code: number): string {
  if (code === 0)  return "Clear";
  if (code <= 2)   return "Partly cloudy";
  if (code === 3)  return "Overcast";
  if (code <= 49)  return "Fog";
  if (code <= 57)  return "Drizzle";
  if (code <= 67)  return "Rain";
  if (code <= 77)  return "Snow";
  if (code <= 82)  return "Showers";
  if (code <= 99)  return "Thunderstorm";
  return "—";
}

async function loadWeather(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    const byCoords = (lat: number, lon: number, city?: string) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=celsius`)
        .then((r) => r.json())
        .then((d) => resolve({ temp: Math.round(d.current.temperature_2m), windspeed: Math.round(d.current.windspeed_10m), code: d.current.weathercode, city }))
        .catch(reject);
    const byIP = () => fetch("https://ipapi.co/json/").then((r) => r.json()).then((geo) => byCoords(geo.latitude, geo.longitude, geo.city)).catch(reject);
    if (!navigator.geolocation) { byIP(); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => byCoords(coords.latitude, coords.longitude), () => byIP());
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function GlancePanel() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nextEvent, setNextEvent] = useState<CalEvent | null>(null);
  const [nextAlarm, setNextAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    const [w, cal, alarms] = await Promise.allSettled([
      loadWeather(),
      fetch("/api/integrations/calendar").then((r) => r.json()),
      fetch("/api/data/alarms").then((r) => r.json()),
    ]);
    if (w.status === "fulfilled") setWeather(w.value);
    if (cal.status === "fulfilled") {
      const raw = cal.value;
      const events: CalEvent[] = Array.isArray(raw) ? raw : (raw.events ?? []);
      setNextEvent(events[0] ?? null);
    }
    if (alarms.status === "fulfilled") {
      const raw = alarms.value;
      const list: Alarm[] = Array.isArray(raw) ? raw : (raw.alarms ?? []);
      const enabled = list.filter((a) => a.enabled).sort((a, b) => a.time.localeCompare(b.time));
      setNextAlarm(enabled[0] ?? null);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const secStr  = String(now.getSeconds()).padStart(2, "0");
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">Glance</div>
        <div className="display-title-bar-right">startpage</div>
      </div>

      <div className="display-glance-grid">
        {/* Clock */}
        <div className="display-glance-cell display-glance-cell--clock">
          <div className="display-glance-label">Time</div>
          <div className="display-glance-clock">
            {timeStr}
            <span style={{ fontSize: "35%", color: "#aaa", marginLeft: "0.15em" }}>{secStr}</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.15rem" }}>{dateStr}</div>
        </div>

        {/* Weather */}
        <div className="display-glance-cell">
          <div className="display-glance-label">Weather</div>
          {weather ? (
            <>
              <div className="display-glance-value" style={{ fontSize: "1.6rem", fontWeight: 200 }}>
                {weatherSymbol(weather.code)} {weather.temp}°C
              </div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.15rem" }}>
                {weatherLabel(weather.code)}{weather.city ? ` · ${weather.city}` : ""}
              </div>
            </>
          ) : (
            <div className="display-glance-value" style={{ color: "#aaa" }}>—</div>
          )}
        </div>

        {/* Next event */}
        <div className="display-glance-cell">
          <div className="display-glance-label">Next event</div>
          {nextEvent ? (
            <>
              <div className="display-glance-value">{nextEvent.summary}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.15rem" }}>
                {nextEvent.allDay ? "all day" : fmtTime(nextEvent.start)}
              </div>
            </>
          ) : (
            <div className="display-glance-value" style={{ color: "#aaa" }}>Nothing scheduled</div>
          )}
        </div>

        {/* Next alarm */}
        <div className="display-glance-cell">
          <div className="display-glance-label">Next alarm</div>
          {nextAlarm ? (
            <>
              <div className="display-glance-value">{nextAlarm.time}</div>
              {nextAlarm.label && (
                <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.15rem" }}>{nextAlarm.label}</div>
              )}
            </>
          ) : (
            <div className="display-glance-value" style={{ color: "#aaa" }}>No alarm set</div>
          )}
        </div>
      </div>
    </>
  );
}
