import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase: any = getSupabaseAdmin();

    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
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

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
