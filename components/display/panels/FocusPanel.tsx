"use client";

import { useState, useEffect } from "react";

const QUOTES: { text: string; attr: string }[] = [
  { text: "Do the hard thing first.", attr: "" },
  { text: "Ship it, then improve it.", attr: "" },
  { text: "What gets measured gets managed.", attr: "— Peter Drucker" },
  { text: "Make something people want.", attr: "— Paul Graham" },
  { text: "The obstacle is the way.", attr: "— Marcus Aurelius" },
  { text: "Done is better than perfect.", attr: "" },
  { text: "Stay hungry. Stay foolish.", attr: "— Steve Jobs" },
  { text: "Simplicity is the ultimate sophistication.", attr: "— Leonardo da Vinci" },
  { text: "Ideas are worthless without execution.", attr: "" },
  { text: "You don't have to see the whole staircase. Just take the first step.", attr: "— Martin Luther King Jr." },
  { text: "First, solve the problem. Then, write the code.", attr: "— John Johnson" },
  { text: "The secret of getting ahead is getting started.", attr: "— Mark Twain" },
  { text: "Focus is saying no to 1,000 things.", attr: "— Steve Jobs" },
  { text: "Perfection is the enemy of good.", attr: "— Voltaire" },
  { text: "A ship in harbour is safe, but that is not what ships are for.", attr: "— John Shedd" },
  { text: "If you're not embarrassed by the first version, you launched too late.", attr: "— Reid Hoffman" },
  { text: "Work expands to fill the time allotted.", attr: "— Parkinson's Law" },
  { text: "One day or day one. You decide.", attr: "" },
  { text: "Everything is hard before it is easy.", attr: "— Goethe" },
  { text: "The man who moves a mountain begins by carrying small stones.", attr: "— Confucius" },
  { text: "Consistency beats intensity.", attr: "" },
  { text: "An hour of planning saves three of execution.", attr: "" },
  { text: "Clear eyes, full heart.", attr: "" },
  { text: "Write code nobody has to maintain. Including you.", attr: "" },
  { text: "You are always one decision away from a different life.", attr: "" },
  { text: "The best investment you can make is in yourself.", attr: "— Warren Buffett" },
  { text: "Do it with all your heart or not at all.", attr: "" },
  { text: "Momentum is everything. Start.", attr: "" },
  { text: "Build something you'd be proud to show your grandkids.", attr: "" },
  { text: "Make today the day you started.", attr: "" },
  { text: "Seek discomfort.", attr: "" },
];

function todaysSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function FocusPanel() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const idx = todaysSeed() % QUOTES.length;
  const quote = QUOTES[idx];

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const secStr  = String(now.getSeconds()).padStart(2, "0");
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="display-title-bar">
        <div className="display-title-bar-left">Focus</div>
        <div className="display-title-bar-right">startpage</div>
      </div>

      <div className="display-content display-focus-root">
        <div className="display-focus-time">
          {timeStr}
          <span style={{ fontSize: "35%", color: "rgba(0,0,0,0.3)", marginLeft: "0.15em" }}>{secStr}</span>
        </div>
        <div className="display-focus-date">{dateStr}</div>

        <div className="display-focus-divider" />

        <blockquote className="display-focus-quote">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        {quote.attr && (
          <div className="display-focus-attr">{quote.attr}</div>
        )}
      </div>
    </>
  );
}
