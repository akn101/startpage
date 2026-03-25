"use client";

import { useEffect, useState } from "react";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  descendants?: number;
  time: number;
}

function domain(url?: string): string {
  if (!url) return "ycombinator.com";
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

function timeAgo(unix: number): string {
  const h = Math.floor((Date.now() / 1000 - unix) / 3600);
  if (h < 1) return "< 1h";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function HackerNewsWidget() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = async () => {
    try {
      const ids: number[] = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then((r) => r.json());
      const top8 = ids.slice(0, 8);
      const fetched: HNStory[] = await Promise.all(
        top8.map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json()))
      );
      setStories(fetched.filter(Boolean));
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    window.addEventListener("refreshData", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("refreshData", load);
    };
  }, []); // eslint-disable-line

  return (
    <div className="feed-widget glass-sm">
      <div className="feed-widget-header">Hacker News</div>
      {loading && <div className="feed-empty">loading…</div>}
      {!loading && error && <div className="feed-error">could not load</div>}
      {!loading && !error && stories.map((s, i) => (
        <a
          key={s.id}
          href={s.url ?? `https://news.ycombinator.com/item?id=${s.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-item hn-item"
        >
          <span className="hn-rank">{i + 1}</span>
          <span className="hn-body">
            <span className="feed-item-title">{s.title}</span>
            <span className="feed-item-meta">
              {s.score} pts · {s.descendants ?? 0} comments · {domain(s.url)} · {timeAgo(s.time)}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
