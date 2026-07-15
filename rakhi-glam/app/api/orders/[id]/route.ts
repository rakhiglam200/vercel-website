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
    if (body.status !== undefined) updateData.status = body.status;
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number;
    if (body.shipping_carrier !== undefined) updateData.shipping_carrier = body.shipping_carrier;
    if (body.waybill_number !== undefined) updateData.waybill_number = body.waybill_number;
    if (body.tracking_url !== undefined) updateData.tracking_url = body.tracking_url;
    if (body.shipment_status !== undefined) updateData.shipment_status = body.shipment_status;
    if (body.shipping_label_url !== undefined) updateData.shipping_label_url = body.shipping_label_url;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase: any = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
