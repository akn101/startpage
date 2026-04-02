import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  fetch('https://api.akn.me.uk/auth/logout', {
    method: 'POST',
    headers: { cookie: req.headers.get('cookie') ?? '' },
  }).catch(() => {});

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
