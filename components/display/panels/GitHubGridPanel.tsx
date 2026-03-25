"use client";

import { useState, useEffect } from "react";

interface ContribDay { date: string; contributionCount: number }
interface ContribWeek { contributionDays: ContribDay[] }

function cell(count: number): string {
  if (count === 0) return "·";
  if (count <= 2)  return "░";
  if (count <= 5)  return "▒";
  if (count <= 9)  return "▓";
  return "█";
}

function cellClass(count: number): string {
  if (count === 0) return "gh-cell-0";
  if (count <= 2)  return "gh-cell-1";
  if (count <= 5)  return "gh-cell-2";
  if (count <= 9)  return "gh-cell-3";
  return "gh-cell-4";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function GitHubGridPanel() {
  const [weeks, setWeeks] = useState<ContribWeek[]>([]);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [updated, setUpdated] = useState(new Date());
  const [empty, setEmpty] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/display/github-grid");
      const data = await res.json();
      if (!data.weeks || data.weeks.length === 0) { setEmpty(true); return; }
      setWeeks(data.weeks);
      setTotal(data.totalContributions);
      setStreak(data.streak);
    } catch {
      setEmpty(true);
    }
    setUpdated(new Date());
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updStr = updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Transpose: rows = day-of-week (0-6), cols = weeks
  const rows: (ContribDay | null)[][] = Array.from({ length: 7 }, () => []);
  for (const week of weeks) {
    for (let d = 0; d < 7; d++) {
      rows[d].push(week.contributionDays[d] ?? null);
    }
  }

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">GitHub</div>
        <div className="display-title-bar-right">startpage · {updStr}</div>
      </div>

      <div className="display-content">
        {empty ? (
          <div className="display-label">Not available (sign in required)</div>
        ) : (
          <>
            <div className="display-row" style={{ gap: "1.5rem" }}>
              <div>
                <div className="display-label">Contributions (8 wks)</div>
                <div className="display-value" style={{ fontSize: "1.6rem", fontWeight: 200 }}>{total}</div>
              </div>
              <div>
                <div className="display-label">Current streak</div>
                <div className="display-value" style={{ fontSize: "1.6rem", fontWeight: 200 }}>
                  {streak}<span style={{ fontSize: "50%", color: "#666", marginLeft: "0.2em" }}>days</span>
                </div>
              </div>
            </div>

            <div className="display-gh-grid">
              {rows.map((row, dayIdx) => (
                <div key={dayIdx} className="display-gh-row">
                  <span className="display-gh-day-label">{DAY_LABELS[dayIdx]}</span>
                  {row.map((day, wi) =>
                    day ? (
                      <span key={wi} className={`display-gh-cell ${cellClass(day.contributionCount)}`} title={`${day.date}: ${day.contributionCount}`}>
                        {cell(day.contributionCount)}
                      </span>
                    ) : (
                      <span key={wi} className="display-gh-cell gh-cell-0"> </span>
                    )
                  )}
                </div>
              ))}
            </div>

            <div className="display-label" style={{ marginTop: "0.2rem" }}>
              · &nbsp;░ 1-2 &nbsp;▒ 3-5 &nbsp;▓ 6-9 &nbsp;█ 10+
            </div>
          </>
        )}
      </div>
    </>
  );
}
