"use client";

import { useEffect, useState } from "react";

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

const INTERVAL_MS = 30_000;

export default function PhotoSlideshow() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch("/api/data/photos")
      .then((r) => r.json())
      .then(({ photos: data }) => {
        if (data && data.length > 0) setPhotos(data);
      });
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % photos.length);
        setFade(true);
      }, 400);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  const prev = () => {
    setFade(false);
    setTimeout(() => {
      setIdx((i) => (i - 1 + photos.length) % photos.length);
      setFade(true);
    }, 200);
  };

  const next = () => {
    setFade(false);
    setTimeout(() => {
      setIdx((i) => (i + 1) % photos.length);
      setFade(true);
    }, 200);
  };

  if (photos.length === 0) {
    return (
      <div className="photo-widget glass-sm feed-widget">
        <div className="feed-widget-header">Photos</div>
        <div className="feed-empty">
          Add photos via Supabase → photos table (url, caption, active)
        </div>
      </div>
    );
  }

  const current = photos[idx];

  return (
    <div className="photo-widget feed-widget glass-sm">
      <div className="feed-widget-header">
        <span>Photos</span>
        <span className="photo-count">{idx + 1}/{photos.length}</span>
      </div>
      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.caption ?? ""}
          className={`photo-img${fade ? " visible" : ""}`}
        />
        {photos.length > 1 && (
          <>
            <button type="button" className="photo-nav prev" onClick={prev} aria-label="Previous">‹</button>
            <button type="button" className="photo-nav next" onClick={next} aria-label="Next">›</button>
          </>
        )}
      </div>
      {current.caption && (
        <div className="photo-caption">{current.caption}</div>
      )}
    </div>
  );
}
