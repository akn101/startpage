import { db } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const authed = isAuthenticated();
  let query = db.from("photos").select("id, url, caption, is_public").eq("active", true).order("created_at", { ascending: false });
  if (!authed) query = query.eq("is_public", true);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const photos = data ?? [];

  // Generate signed URLs for storage paths (private bucket)
  const storagePaths = photos.filter((p) => !p.url.startsWith("http")).map((p) => p.url);
  let signedMap: Record<string, string> = {};
  if (storagePaths.length > 0) {
    const { data: signed } = await db.storage.from("photos").createSignedUrls(storagePaths, 3600);
    if (signed) {
      for (const s of signed) {
        if (s.signedUrl) signedMap[s.path] = s.signedUrl;
      }
    }
  }

  const result = photos.map((p) => ({
    ...p,
    url: signedMap[p.url] ?? p.url,
  }));

  return Response.json({ photos: result });
}
