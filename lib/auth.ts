import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./session";

export async function getAuthSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!(
    session &&
    (session.role === 'admin' ||
      session.projects.includes('*') ||
      session.projects.includes('startpage'))
  );
}

export async function requireAuth(): Promise<Response | null> {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
