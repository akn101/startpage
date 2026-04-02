import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deny = await requireAuth();
  if (deny) return deny;

  const since = req.nextUrl.searchParams.get("since");
  let query = db
    .from("notifications")
    .select("id, title, body, source, created_at")
    .order("created_at", { ascending: true })
    .limit(20);

  if (since) {
    const ts = Number(since);
    if (!Number.isFinite(ts) || ts < 0 || ts > Date.now() + 60_000) {
      return NextResponse.json({ error: "Invalid since parameter" }, { status: 400 });
    }
    query = query.gt("created_at", new Date(ts).toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: data ?? [] });
}
