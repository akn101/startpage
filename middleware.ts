import { NextRequest, NextResponse } from "next/server";

function hasSession(req: NextRequest): boolean {
  const session  = req.cookies.get("sp_session")?.value;
  const expected = process.env.STARTPAGE_COOKIE_SECRET;
  return !!(session && expected && session === expected);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: auth endpoints, access page, notify webhook
  if (
    pathname.startsWith("/access") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/notify") ||
    pathname.startsWith("/api/notifications")
  ) {
    return NextResponse.next();
  }

  // Public GET: home page and data API (routes filter public vs private rows internally)
  if (req.method === "GET") {
    if (
      pathname === "/" ||
      pathname.startsWith("/api/data/")
    ) {
      return NextResponse.next();
    }
  }

  // Everything else requires a valid session
  if (!hasSession(req)) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/access";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox.*).*)" ],
};
