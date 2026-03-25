"use client";

import { useState, useEffect } from "react";

interface Todo     { id: string; text: string; done: boolean }
interface Assignment { title: string; status: string; due: string; subject?: string }
interface Session  { label: string; duration_s: number; project: string | null; started_at: string }
interface PR       { title: string; url?: string; ci?: string | null }

function weekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function fmtDur(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function bar(filled: number, total: number, width = 6): string {
  const b = total > 0 ? Math.round((filled / total) * width) : 0;
  return "█".repeat(b) + "░".repeat(width - b);
}
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
function fmtDue(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return "today";
  if (d === 1) return "tmrw";
  return `${d}d`;
}

export default function DashboardPanel() {
  const [todos, setTodos]           = useState<Todo[]>([]);
  const [assignments, setAssign]    = useState<Assignment[]>([]);
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [myPRs, setMyPRs]           = useState<PR[]>([]);
  const [updated, setUpdated]       = useState(new Date());

  const load = async () => {
    const [t, a, s, g] = await Promise.allSettled([
      fetch("/api/data/todos").then((r) => r.json()),
      fetch("/api/assignments").then((r) => r.json()),
      fetch("/api/data/sessions").then((r) => r.json()),
      fetch("/api/integrations/github").then((r) => r.json()),
    ]);
    if (t.status === "fulfilled") {
      const list: Todo[] = Array.isArray(t.value) ? t.value : (t.value.todos ?? []);
      setTodos(list.filter((x) => !x.done));
    }
    if (a.status === "fulfilled") {
      const list: Assignment[] = Array.isArray(a.value) ? a.value : (a.value.assignments ?? []);
      setAssign(
        list
          .filter((x) => !["Complete", "Marked", "Archived"].includes(x.status))
          .sort((x, y) => new Date(x.due).getTime() - new Date(y.due).getTime())
          .slice(0, 8)
      );
    }
    if (s.status === "fulfilled") {
      const list: Session[] = Array.isArray(s.value) ? s.value : (s.value.sessions ?? []);
      setSessions(list);
    }
    if (g.status === "fulfilled") {
      setMyPRs(g.value.prs ?? []);
    }
    setUpdated(new Date());
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ws = weekStart();
  const weekSessions = sessions.filter((s) => new Date(s.started_at) >= ws);
  const byProject: Record<string, number> = {};
  for (const s of weekSessions) {
    const k = s.project ?? s.label ?? "Other";
    byProject[k] = (byProject[k] ?? 0) + s.duration_s;
  }
  const barEntries = Object.entries(byProject).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSecs = barEntries[0]?.[1] ?? 1;
  const totalSecs = barEntries.reduce((acc, [, v]) => acc + v, 0);
  const updStr = updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">Dashboard</div>
        <div className="display-title-bar-right">startpage · {updStr}</div>
      </div>

      <div className="display-split">
        {/* LEFT: Tasks */}
        <div className="display-split-col">
          <div className="display-split-header">
            Tasks {todos.length > 0 ? `· ${todos.length}` : ""}
          </div>
          <div className="display-split-list">
            {todos.slice(0, 8).map((t) => (
              <div key={t.id} className="display-split-item">
                <span className="display-split-item-dot">□</span>
                <span className="display-split-item-text">{t.text}</span>
              </div>
            ))}
            {todos.length === 0 && (
              <div className="display-split-item" style={{ color: "#aaa" }}>All clear</div>
            )}
          </div>
          {assignments.length > 0 && (
            <>
              <div className="display-split-header" style={{ marginTop: "0.4rem" }}>
                Assignments
              </div>
              <div className="display-split-list">
                {assignments.slice(0, 6).map((a, i) => (
                  <div key={i} className="display-split-item">
                    <span
                      className="display-split-item-dot"
                      style={{ color: isOverdue(a.due) ? "#c00" : "#888" }}
                    >
                      {isOverdue(a.due) ? "!" : "·"}
                    </span>
                    <span
                      className="display-split-item-text"
                      style={{ color: isOverdue(a.due) ? "#c00" : undefined }}
                    >
                      {a.title}{a.subject ? ` (${a.subject})` : ""}
                    </span>
                    <span
                      className="display-split-item-badge"
                      style={{ color: isOverdue(a.due) ? "#c00" : "#888" }}
                    >
                      {fmtDue(a.due)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Productivity */}
        <div className="display-split-col">
          <div className="display-split-header">
            This week{totalSecs > 0 ? ` · ${fmtDur(totalSecs)}` : ""}
          </div>
          <div className="display-split-list">
            {barEntries.length === 0 && (
              <div className="display-split-item" style={{ color: "#aaa" }}>No sessions yet</div>
            )}
            {barEntries.map(([project, secs]) => (
              <div key={project} className="display-split-item" style={{ fontFamily: "monospace" }}>
                <span className="display-split-item-text" style={{ fontFamily: "inherit" }}>{project}</span>
                <span className="display-split-item-badge" style={{ fontFamily: "monospace" }}>
                  {bar(secs, maxSecs)} {fmtDur(secs)}
                </span>
              </div>
            ))}
          </div>

          {myPRs.length > 0 && (
            <>
              <div className="display-split-header" style={{ marginTop: "0.4rem" }}>
                GitHub · {myPRs.length} PR{myPRs.length !== 1 ? "s" : ""}
              </div>
              <div className="display-split-list">
                {myPRs.slice(0, 4).map((pr, i) => (
                  <div key={i} className="display-split-item">
                    <span
                      className="display-split-item-dot"
                      style={{
                        color: pr.ci === "SUCCESS" ? "#090" : pr.ci === "FAILURE" ? "#c00" : "#aaa",
                      }}
                    >
                      {pr.ci === "SUCCESS" ? "✓" : pr.ci === "FAILURE" ? "✗" : "·"}
                    </span>
                    <span className="display-split-item-text">{pr.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
