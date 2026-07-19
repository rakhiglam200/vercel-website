import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ product: null }, { status: 200 });
    }
    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ product: null });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.long_description !== undefined) updateData.long_description = body.long_description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.original_price !== undefined) updateData.original_price = body.original_price;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.collection !== undefined) updateData.collection_slug = body.collection;
    if (body.in_stock !== undefined) updateData.in_stock = body.in_stock;
    if (body.material !== undefined) updateData.material = body.material;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.alt !== undefined) updateData.alt = body.alt;

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    let result;

    if (existing) {
      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("slug", slug)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const insertData: Record<string, any> = { slug, ...updateData };
      if (!insertData.title) insertData.title = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      if (!insertData.price) insertData.price = 0;
      if (!insertData.category) insertData.category = "Necklaces";
      if (!insertData.collection_slug) insertData.collection_slug = "necklaces";
      if (!insertData.alt) insertData.alt = insertData.title;

      const { data, error } = await supabase
        .from("products")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ product: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
