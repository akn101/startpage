"use client";

import { useState, useEffect } from "react";

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
  if (!url) return "news.ycombinator.com";
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

function timeAgo(unixSec: number): string {
  const h = Math.floor((Date.now() / 1000 - unixSec) / 3600);
  if (h < 1) return "< 1h";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function HackerNewsPanel() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(new Date());

  const load = async () => {
    try {
      const ids: number[] = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then((r) => r.json());
      const top = ids.slice(0, 7);
      const fetched = await Promise.all(
        top.map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json()))
      );
      setStories(fetched.filter(Boolean));
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
      setUpdated(new Date());
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updStr = updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">Hacker News</div>
        <div className="display-title-bar-right">startpage · {updStr}</div>
      </div>

      <div className="display-content">
        {loading && <div className="display-label">Loading…</div>}
        {!loading && stories.length === 0 && <div className="display-label">Could not load stories</div>}
        {stories.map((s, i) => (
          <div key={s.id} className="display-hn-item">
            <span className="display-hn-rank">{i + 1}</span>
            <div className="display-hn-body">
              <div className="display-hn-title">{s.title}</div>
              <div className="display-hn-meta">
                {s.score} pts · {s.descendants ?? 0} comments · {domain(s.url)} · {timeAgo(s.time)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
