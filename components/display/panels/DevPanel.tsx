"use client";

import { useState, useEffect } from "react";

interface NotionProject { id: string; name: string; status: string }
interface NotionTask    { id: string; title: string; status: string; project: string }
interface Session       { project: string | null; duration_s: number; started_at: string }
interface ContribDay    { date: string; contributionCount: number }
interface ContribWeek   { contributionDays: ContribDay[] }

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
function cell(n: number): string {
  if (n === 0) return "·";
  if (n <= 2)  return "░";
  if (n <= 5)  return "▒";
  if (n <= 9)  return "▓";
  return "█";
}
function cellColor(n: number): string {
  if (n === 0) return "#ddd";
  if (n <= 2)  return "#bbb";
  if (n <= 5)  return "#777";
  if (n <= 9)  return "#333";
  return "#000";
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DevPanel() {
  const [projects, setProjects] = useState<NotionProject[]>([]);
  const [tasks, setTasks]       = useState<NotionTask[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weeks, setWeeks]       = useState<ContribWeek[]>([]);
  const [total, setTotal]       = useState(0);
  const [streak, setStreak]     = useState(0);
  const [updated, setUpdated]   = useState(new Date());

  const load = async () => {
    const [t, s, g] = await Promise.allSettled([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/data/sessions").then((r) => r.json()),
      fetch("/api/display/github-grid").then((r) => r.json()),
    ]);
    if (t.status === "fulfilled") {
      setProjects(t.value.projects ?? []);
      setTasks(t.value.tasks ?? []);
    }
    if (s.status === "fulfilled") {
      setSessions(Array.isArray(s.value) ? s.value : (s.value.sessions ?? []));
    }
    if (g.status === "fulfilled") {
      setWeeks(g.value.weeks ?? []);
      setTotal(g.value.totalContributions ?? 0);
      setStreak(g.value.streak ?? 0);
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
  const timeByProject: Record<string, number> = {};
  for (const s of weekSessions) {
    if (s.project) timeByProject[s.project] = (timeByProject[s.project] ?? 0) + s.duration_s;
  }

  const activeProjects = projects
    .filter((p) => !["Archived", "Complete", "Done"].includes(p.status))
    .slice(0, 7);

  const inProgress = tasks.filter((t) => t.status === "In Progress");
  const updStr = updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Transpose weeks → rows by day-of-week
  const rows: (ContribDay | null)[][] = Array.from({ length: 7 }, () => []);
  for (const week of weeks) {
    for (let d = 0; d < 7; d++) {
      rows[d].push(week.contributionDays[d] ?? null);
    }
  }

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">Dev</div>
        <div className="display-title-bar-right">startpage · {updStr}</div>
      </div>

      <div className="display-split">
        {/* LEFT: Projects */}
        <div className="display-split-col">
          <div className="display-split-header">Projects</div>
          <div className="display-split-list">
            {activeProjects.length === 0 && (
              <div className="display-split-item" style={{ color: "#aaa" }}>No active projects</div>
            )}
            {activeProjects.map((p) => {
              const secs = timeByProject[p.name] ?? 0;
              const tasks = inProgress.filter((t) => t.project === p.name);
              return (
                <div key={p.id} style={{ marginBottom: "0.35rem" }}>
                  <div className="display-split-item">
                    <span className="display-split-item-dot" style={{ color: "#000" }}>◆</span>
                    <span className="display-split-item-text" style={{ fontWeight: 600 }}>{p.name}</span>
                    {secs > 0 && (
                      <span className="display-split-item-badge">{fmtDur(secs)}</span>
                    )}
                  </div>
                  {tasks.slice(0, 2).map((t) => (
                    <div key={t.id} className="display-split-item" style={{ paddingLeft: "1.2rem" }}>
                      <span className="display-split-item-dot" style={{ fontSize: "0.6rem" }}>›</span>
                      <span className="display-split-item-text" style={{ fontSize: "0.7rem", color: "#444" }}>{t.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: GitHub contributions grid */}
        <div className="display-split-col">
          <div className="display-split-header">GitHub</div>
          {weeks.length === 0 ? (
            <div className="display-split-item" style={{ color: "#aaa" }}>Not available</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "1.2rem", marginBottom: "0.5rem", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 200, lineHeight: 1, color: "#000" }}>{total}</div>
                  <div style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" }}>contributions</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 200, lineHeight: 1, color: "#000" }}>{streak}</div>
                  <div style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" }}>day streak</div>
                </div>
              </div>
              <div style={{ fontFamily: "monospace", display: "flex", flexDirection: "column", gap: "1px" }}>
                {rows.map((row, di) => (
                  <div key={di} style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                    <span style={{ fontSize: "0.5rem", color: "#bbb", width: "0.7rem", flexShrink: 0, fontFamily: "sans-serif" }}>
                      {DAY_LABELS[di]}
                    </span>
                    {row.map((day, wi) => (
                      <span
                        key={wi}
                        style={{
                          fontSize: "0.6rem",
                          display: "inline-block",
                          width: "0.75em",
                          textAlign: "center",
                          color: day ? cellColor(day.contributionCount) : "#eee",
                        }}
                        title={day ? `${day.date}: ${day.contributionCount}` : ""}
                      >
                        {day ? cell(day.contributionCount) : " "}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "0.5rem", color: "#bbb", marginTop: "0.3rem", fontFamily: "monospace", flexShrink: 0 }}>
                · none &nbsp;░ 1-2 &nbsp;▒ 3-5 &nbsp;▓ 6-9 &nbsp;█ 10+
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
