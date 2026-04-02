import { db } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  const { data, error } = await db.from("alarms").select("id, time, label, enabled").order("time", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alarms: data ?? [] });
}

export async function POST(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { time, label } = await req.json();
  const { data, error } = await db.from("alarms").insert({ time, label: label ?? "" }).select("id, time, label, enabled").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alarm: data });
}

export async function PUT(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { id, enabled } = await req.json();
  const { error } = await db.from("alarms").update({ enabled }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { id } = await req.json();
  const { error } = await db.from("alarms").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
