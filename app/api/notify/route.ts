import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.NOTIFY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; body?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title || !body.body) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const source =
    body.source === "android" || body.source === "openclaw" ? body.source : "other";

  const { data, error } = await db
    .from("notifications")
    .insert({ title: body.title, body: body.body, source })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: data.id });
}
