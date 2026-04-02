import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/session";

// Fallback: local access code for always-on tablet without a Google account
export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || code !== process.env.STARTPAGE_ACCESS_CODE) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const token = await signSession({
    uid: 'local',
    email: null,
    displayName: null,
    role: 'admin',
    projects: ['*'],
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
