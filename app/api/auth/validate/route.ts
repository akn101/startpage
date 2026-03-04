import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || code !== process.env.STARTPAGE_ACCESS_CODE) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const token = process.env.STARTPAGE_COOKIE_SECRET ?? "";
  const res = NextResponse.json({ success: true });
  res.cookies.set("sp_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year — always-on tablet
  });
  return res;
}
