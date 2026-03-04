import { NextRequest, NextResponse } from "next/server";
import { broadcastNotification, NotificationPayload } from "@/lib/notifications";
import { randomUUID } from "crypto";

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
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 }
    );
  }

  const payload: NotificationPayload = {
    id: randomUUID(),
    title: body.title,
    body: body.body,
    source:
      body.source === "android" || body.source === "openclaw"
        ? body.source
        : "other",
    timestamp: Date.now(),
  };

  broadcastNotification(payload);

  return NextResponse.json({ ok: true, id: payload.id });
}
