"use client";

import { useState } from "react";
import { useTimeTracker, fmtDuration } from "@/context/TimeTrackerContext";

export default function TimeTracker() {
  const { timers, sessions, start, stop, stopAll } = useTimeTracker();
  const [inputLabel, setInputLabel] = useState("");

  return (
    <div className="tracker-widget glass-sm">
      <div className="tracker-header">
        <span>Timer</span>
        {timers.length > 1 && (
          <button type="button" className="tracker-stop-all" onClick={stopAll}>stop all</button>
        )}
      </div>

      {/* Active timers list */}
      {timers.length > 0 && (
        <div className="tracker-active-list">
          {timers.map((t) => (
            <div key={t.id} className="tracker-active-item">
              <span className="tracker-active-label">{t.label}</span>
              <span className="tracker-elapsed">{fmtDuration(t.elapsed)}</span>
              <button type="button" className="tracker-btn running" onClick={() => stop(t.id)}>stop</button>
            </div>
          ))}
        </div>
      )}

      {/* Start new timer */}
      <div className="tracker-row">
        <input
          className="tracker-label-input"
          placeholder={timers.length > 0 ? "+ another task…" : "what are you working on?"}
          value={inputLabel}
          onChange={(e) => setInputLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputLabel.trim()) {
              start(inputLabel.trim());
              setInputLabel("");
            }
          }}
        />
        <button
          type="button"
          className="tracker-btn"
          disabled={!inputLabel.trim()}
          onClick={() => { if (inputLabel.trim()) { start(inputLabel.trim()); setInputLabel(""); } }}
        >
          start
        </button>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="tracker-sessions">
          {sessions.map((s) => (
            <div key={s.id} className="tracker-session">
              <span className="tracker-session-label">{s.label}</span>
              <span className="tracker-session-dur">{fmtDuration(s.duration_s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
