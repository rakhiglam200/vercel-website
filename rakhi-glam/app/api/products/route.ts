import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .insert({
        title: body.title,
        slug: body.slug,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice,
        badge: body.badge,
        category: body.category,
        collection_slug: body.collection,
        in_stock: body.inStock ?? true,
        images: body.images || [],
        alt: body.title,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
