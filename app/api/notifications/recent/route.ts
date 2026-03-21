import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const deny = requireAuth();
  if (deny) return deny;

  const since = req.nextUrl.searchParams.get("since");
  let query = db
    .from("notifications")
    .select("id, title, body, source, created_at")
    .order("created_at", { ascending: true })
    .limit(20);

  if (since) {
    query = query.gt("created_at", new Date(Number(since)).toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: data ?? [] });
}
