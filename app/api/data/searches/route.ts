import { db } from "@/lib/supabase-server";
import { getUid, requireUid } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUid();
  if (!uid) return Response.json({ searches: [] });
  const { data } = await db
    .from("searches")
    .select("query, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(200);
  return Response.json({ searches: data ?? [] });
}

export async function POST(req: Request) {
  const result = await requireUid();
  if (result instanceof Response) return result;
  const { uid } = result;
  const { query } = await req.json();
  if (!query?.trim()) return Response.json({ ok: false });
  await db.from("searches").insert({ query: query.trim(), user_id: uid });
  return Response.json({ ok: true });
}
