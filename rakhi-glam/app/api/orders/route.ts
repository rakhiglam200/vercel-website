import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RG-${y}${m}${d}-${rand}`;
}

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "RakhiGlam <onboarding@resend.dev>", to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form, items, total, shippingCost, payment_method } = body;

    if (!form || !items || total === undefined) {
      return NextResponse.json({ error: "Missing order fields" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const grandTotal = total + (shippingCost ?? 0);
    const supabase: any = getSupabaseAdmin();

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", form.email)
      .single();

    let customerId = existingCustomer?.id;
    if (!customerId) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({ email: form.email, name: form.name, phone: form.phone, address: { address: form.address, city: form.city, state: form.state, pincode: form.pincode } })
        .select("id")
        .single();
      customerId = newCustomer?.id;
    }

    const { error: dbError } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_email: form.email,
      customer_name: form.name,
      customer_phone: form.phone,
      shipping_address: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
      items,
      subtotal: total,
      shipping_cost: shippingCost ?? 0,
      total: grandTotal,
      payment_status: "pending",
      payment_method: payment_method || "whatsapp_upi",
      status: "pending",
    });

    if (dbError) console.error("DB insert error:", dbError);

    const upiId = "7906759725@ybl";
    const itemsHtml = items.map((i: any) => `<li>${i.title} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`).join("");
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#0D1A3C;">Order Placed!</h2>
        <p>Thank you, ${form.name}!</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ₹${grandTotal.toLocaleString("en-IN")}</p>
        <hr />
        <h3>Complete Payment via UPI</h3>
        <p><strong>UPI ID:</strong> ${upiId}</p>
        <p><strong>Payee:</strong> RakhiGlam</p>
        <p>Send payment to the above UPI ID. Your order will be confirmed after payment verification.</p>
        <hr />
        <p style="color:#666;font-size:12px;">RakhiGlam — Beautiful Jewellery for Every Occasion</p>
      </div>
    `;

    await sendEmailViaResend(form.email, `Order Placed — ${orderNumber} | RakhiGlam`, emailHtml);

    const adminEmails = (process.env.ADMIN_EMAILS || "rakhiglam200@gmail.com").split(",").map((e: string) => e.trim()).filter(Boolean);
    await Promise.allSettled(
      adminEmails.map((adminEmail: string) =>
        sendEmailViaResend(adminEmail, `New UPI Order — ${orderNumber} | ₹${grandTotal.toLocaleString("en-IN")} | ${form.name}`, emailHtml)
      )
    );

    return NextResponse.json({
      orderId: orderNumber,
      orderNumber,
      payment_method: payment_method || "whatsapp_upi",
      emailSent: true,
      dbSaved: !dbError,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase: any = getSupabaseAdmin();
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ orders: data, total: count, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
