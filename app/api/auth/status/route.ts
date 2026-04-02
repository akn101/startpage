import { isAuthenticated, getAuthSession } from "@/lib/auth";

export async function GET() {
  const [authed, session] = await Promise.all([await isAuthenticated(), getAuthSession()]);
  return Response.json({
    authenticated: authed,
    ...(authed && session ? { uid: session.uid, email: session.email } : {}),
  });
}
