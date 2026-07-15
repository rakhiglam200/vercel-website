import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .insert({
        title: body.title,
        slug: body.slug,
        description: body.description,
        long_description: body.long_description,
        price: body.price,
        original_price: body.original_price,
        badge: body.badge,
        category: body.category,
        collection_slug: body.collection,
        in_stock: body.in_stock ?? true,
        images: body.images || [],
        alt: body.alt || body.title,
        material: body.material,
        weight: body.weight,
        features: body.features || [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
