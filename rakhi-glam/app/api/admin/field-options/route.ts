import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  "Newly Launched", "Necklaces", "Rings", "Bracelets", "Earrings",
  "Bangle Bracelets", "Anklets", "Jhumkas", "Watches",
];

async function getFieldOptionsFromDb(): Promise<{ categories: string[] }> {
  const supabase: any = getSupabaseAdmin();
  const { data } = await supabase.from("field_options").select("*").eq("key", "categories").single();
  if (data?.value) {
    return { categories: data.value as string[] };
  }
  return { categories: DEFAULT_CATEGORIES };
}

async function setFieldOptionsInDb(options: { categories: string[] }): Promise<void> {
  const supabase: any = getSupabaseAdmin();
  const { error } = await supabase
    .from("field_options")
    .upsert({ key: "categories", value: options.categories }, { onConflict: "key" });
  if (error) throw error;
}

export async function GET() {
  try {
    await requireAdmin();
    const options = await getFieldOptionsFromDb();
    return NextResponse.json(options, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    if (body.field && body.value) {
      const options = await getFieldOptionsFromDb();
      const set = new Set(options.categories);
      set.add(body.value);
      options.categories = Array.from(set);
      await setFieldOptionsInDb(options);
      return NextResponse.json(options);
    }

    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const value = searchParams.get("value");

    if (field && value) {
      const options = await getFieldOptionsFromDb();
      options.categories = options.categories.filter((v) => v !== value);
      await setFieldOptionsInDb(options);
      return NextResponse.json(options);
    }

    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
