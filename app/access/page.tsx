"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
      setCode("");
      inputRef.current?.focus();
    }
    setLoading(false);
  }

  return (
    <div className="access-root">
      <form className="access-card glass" onSubmit={submit}>
        <div className="access-label">access code</div>
        <input
          ref={inputRef}
          className={`access-input${error ? " access-input-error" : ""}`}
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false); }}
          placeholder="••••••••"
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
        />
        {error && <div className="access-error">incorrect code</div>}
      </form>
    </div>
  );
}
