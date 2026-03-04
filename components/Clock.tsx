"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  const day = DAYS[now.getDay()];
  const date = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div className="clock-root">
      <div className="clock-time">
        <span className="clock-hm">{h}:{m}</span>
        <span className="clock-sec">{s}</span>
      </div>
      <div className="clock-date">
        {day}, {month} {date}, {year}
      </div>
    </div>
  );
}
