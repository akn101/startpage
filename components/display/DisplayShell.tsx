"use client";

import React, { useState, useEffect, useCallback } from "react";
import GlancePanel      from "./panels/GlancePanel";
import MorningPanel     from "./panels/MorningPanel";
import DashboardPanel   from "./panels/DashboardPanel";
import DevPanel         from "./panels/DevPanel";
import HackerNewsPanel  from "./panels/HackerNewsPanel";
import FocusPanel       from "./panels/FocusPanel";

interface PanelConfig { name: string; component: React.ComponentType; defaultMs: number }

// 6 panels — Dashboard combines Tasks+Productivity, Dev combines Projects+GitHub
const PANELS: PanelConfig[] = [
  { name: "Glance",      component: GlancePanel,     defaultMs: 25_000 },
  { name: "Morning",     component: MorningPanel,    defaultMs: 28_000 },
  { name: "Dashboard",   component: DashboardPanel,  defaultMs: 22_000 },
  { name: "Dev",         component: DevPanel,        defaultMs: 22_000 },
  { name: "HackerNews",  component: HackerNewsPanel, defaultMs: 25_000 },
  { name: "Focus",       component: FocusPanel,      defaultMs: 15_000 },
];

interface Props {
  inline?: boolean;
}

export default function DisplayShell({ inline = false }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const globalOverride =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("sp_display_interval") || 0)
      : 0;

  const durationForPanel = useCallback(
    (idx: number) => (globalOverride > 0 ? globalOverride : PANELS[idx].defaultMs),
    [globalOverride]
  );

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % PANELS.length);
  }, []);

  // Per-panel timeout — restarts whenever current or paused changes
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(advance, durationForPanel(current));
    return () => clearTimeout(id);
  }, [current, paused, advance, durationForPanel]);

  // Arrow key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % PANELS.length);
      if (e.key === "ArrowLeft")  setCurrent((c) => (c - 1 + PANELS.length) % PANELS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={inline ? "display-root-inline" : "display-root"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* All panels mounted simultaneously so data pre-loads; inactive ones are hidden */}
      <div className="display-panel">
        {PANELS.map((p, i) => {
          const PanelComponent = p.component;
          return (
            <div
              key={p.name}
              className="display-panel-slot"
              style={{ display: i === current ? "flex" : "none" }}
            >
              <PanelComponent />
            </div>
          );
        })}
      </div>

      <div className="display-dots">
        {PANELS.map((p, i) => (
          <button
            key={p.name}
            className={`display-dot${i === current ? " display-dot--active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to ${p.name} panel`}
          />
        ))}
      </div>
    </div>
  );
}
