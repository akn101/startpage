import { db } from "@/lib/supabase-server";
import { isAuthenticated, requireAuth } from "@/lib/auth";

export async function GET() {
  const authed = await isAuthenticated();
  let query = db.from("todos").select("id, text, done, is_public").order("created_at", { ascending: true });
  if (!authed) query = query.eq("is_public", true);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ todos: data ?? [] });
}

export async function POST(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { text } = await req.json();
  const { data, error } = await db.from("todos").insert({ text, done: false }).select("id, text, done, is_public").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ todo: data });
}

export async function PATCH(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { id, done, is_public } = await req.json();
  const updates: Record<string, unknown> = {};
  if (done !== undefined) updates.done = done;
  if (is_public !== undefined) updates.is_public = is_public;
  const { error } = await db.from("todos").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;
  const { ids } = await req.json();
  const { error } = await db.from("todos").delete().in("id", ids);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
