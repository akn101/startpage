"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  url: string;
  status: string;
}

export default function NotionTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/integrations/notion")
      .then((r) => r.json())
      .then((d) => { setTasks(d.tasks ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="feed-widget glass-sm">
      <div className="feed-widget-header">Notion</div>
      {loading && <div className="feed-empty">loading…</div>}
      {error && <div className="feed-error">could not load tasks</div>}
      {!loading && !error && tasks.length === 0 && (
        <div className="feed-empty">no tasks</div>
      )}
      {tasks.map((t) => (
        <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className="feed-item">
          <span className="feed-item-title">{t.title}</span>
          <span className="feed-item-meta">{t.status}</span>
        </a>
      ))}
    </div>
  );
}
