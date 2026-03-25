"use client";

import React, { useState, useEffect, useCallback } from "react";
import GlancePanel      from "./panels/GlancePanel";
import MorningPanel     from "./panels/MorningPanel";
import TasksPanel       from "./panels/TasksPanel";
import FocusPanel       from "./panels/FocusPanel";
import ProductivityPanel from "./panels/ProductivityPanel";
import ProjectsPanel    from "./panels/ProjectsPanel";
import GitHubGridPanel  from "./panels/GitHubGridPanel";
import HackerNewsPanel  from "./panels/HackerNewsPanel";

interface PanelConfig { name: string; component: React.ComponentType; defaultMs: number }

const PANELS: PanelConfig[] = [
  { name: "Glance",       component: GlancePanel,       defaultMs: 25_000 },
  { name: "Morning",      component: MorningPanel,      defaultMs: 25_000 },
  { name: "Tasks",        component: TasksPanel,        defaultMs: 20_000 },
  { name: "Focus",        component: FocusPanel,        defaultMs: 15_000 },
  { name: "Productivity", component: ProductivityPanel, defaultMs: 20_000 },
  { name: "Projects",     component: ProjectsPanel,     defaultMs: 20_000 },
  { name: "GitHub",       component: GitHubGridPanel,   defaultMs: 20_000 },
  { name: "HackerNews",   component: HackerNewsPanel,   defaultMs: 25_000 },
];

interface Props {
  inline?: boolean;
}

export default function DisplayShell({ inline = false }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  // Global interval override from localStorage (in ms); per-panel defaults used otherwise
  const globalOverride =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("sp_display_interval") || 0)
      : 0;

  const durationForPanel = useCallback((idx: number) => {
    return globalOverride > 0 ? globalOverride : PANELS[idx].defaultMs;
  }, [globalOverride]);

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

  const PanelComponent = PANELS[current].component;

  return (
    <div
      className={inline ? "display-root-inline" : "display-root"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="display-panel">
        <PanelComponent />
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
