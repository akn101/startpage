import { db } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const authed = isAuthenticated();
  let query = db.from("photos").select("id, url, caption, is_public").eq("active", true).order("created_at", { ascending: false });
  if (!authed) query = query.eq("is_public", true);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ photos: data ?? [] });
}
