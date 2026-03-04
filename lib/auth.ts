import { cookies } from "next/headers";

export function isAuthenticated(): boolean {
  const session  = cookies().get("sp_session")?.value;
  const expected = process.env.STARTPAGE_COOKIE_SECRET;
  return !!(session && expected && session === expected);
}

export function requireAuth(): Response | null {
  if (!isAuthenticated()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
