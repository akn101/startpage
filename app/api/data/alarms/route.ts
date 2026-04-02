import { db } from "@/lib/supabase-server";
import { requireUid } from "@/lib/auth";

export async function GET() {
  const result = await requireUid();
  if (result instanceof Response) return result;
  const { uid } = result;
  const { data, error } = await db.from("alarms").select("id, time, label, enabled").eq("user_id", uid).order("time", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alarms: data ?? [] });
}

export async function POST(req: Request) {
  const result = await requireUid();
  if (result instanceof Response) return result;
  const { uid } = result;
  const { time, label } = await req.json();
  const { data, error } = await db.from("alarms").insert({ time, label: label ?? "", user_id: uid }).select("id, time, label, enabled").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alarm: data });
}

export async function PUT(req: Request) {
  const result = await requireUid();
  if (result instanceof Response) return result;
  const { uid } = result;
  const { id, enabled } = await req.json();
  const { error } = await db.from("alarms").update({ enabled }).eq("id", id).eq("user_id", uid);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const result = await requireUid();
  if (result instanceof Response) return result;
  const { uid } = result;
  const { id } = await req.json();
  const { error } = await db.from("alarms").delete().eq("id", id).eq("user_id", uid);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
