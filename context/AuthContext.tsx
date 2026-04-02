"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthCtx {
  authenticated: boolean;
  uid: string | null;
  role: string | null;
  projects: string[];
  isAdmin: boolean;
}

const defaultCtx: AuthCtx = { authenticated: false, uid: null, role: null, projects: [], isAdmin: false };
const Ctx = createContext<AuthCtx>(defaultCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthCtx>(defaultCtx);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        const role = d.role ?? null;
        const projects: string[] = d.projects ?? [];
        setState({
          authenticated: d.authenticated ?? false,
          uid: d.uid ?? null,
          role,
          projects,
          isAdmin: role === "admin" || projects.includes("startpage-admin"),
        });
      })
      .catch(() => setState(defaultCtx));
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
