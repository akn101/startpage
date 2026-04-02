import { db } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  const deny = await requireAuth();
  if (deny) return deny;

  const { imageData, faceLabel } = await req.json();
  if (!imageData) return Response.json({ error: "Missing imageData" }, { status: 400 });

  // Convert base64 to buffer
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const filename = `${Date.now()}.jpg`;

  // Upload to Supabase Storage
  const { error: uploadError } = await db.storage
    .from("visitors")
    .upload(filename, buffer, { contentType: "image/jpeg", upsert: false });

  if (uploadError) {
    // Table insert even if storage fails (bucket may not exist yet)
    await db.from("visitors").insert({ face_label: faceLabel ?? "unknown" });
    return Response.json({ ok: true, warning: uploadError.message });
  }

  await db.from("visitors").insert({ image_path: filename, face_label: faceLabel ?? "unknown" });
  return Response.json({ ok: true });
}
