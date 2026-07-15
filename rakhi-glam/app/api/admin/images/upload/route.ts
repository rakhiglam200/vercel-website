import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase: any = getSupabaseAdmin();
    const { error } = await supabase.storage.from("products").upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl, filename });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
