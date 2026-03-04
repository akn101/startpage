"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthCtx {
  authenticated: boolean;
}

const Ctx = createContext<AuthCtx>({ authenticated: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated ?? false))
      .catch(() => setAuthenticated(false));
  }, []);

  return <Ctx.Provider value={{ authenticated }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
