import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from("products").list("", {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) throw error;

    const images = (data ?? [])
      .filter((f: any) => f.name && !f.id.endsWith("/"))
      .map((f: any) => {
        const { data: urlData } = supabase.storage.from("products").getPublicUrl(f.name);
        return { name: f.name, url: urlData.publicUrl };
      });

    return NextResponse.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list images";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
