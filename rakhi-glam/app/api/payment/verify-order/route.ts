import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RG-${y}${m}${d}-${rand}`;
}

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, form, items, total, shippingCost } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
    }
    if (!form || !items || total === undefined) {
      return NextResponse.json({ error: "Missing order fields" }, { status: 400 });
    }

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
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

    const grandTotal = total + (shippingCost ?? 0);

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
      payment_id: razorpay_payment_id,
      payment_status: "captured",
      payment_method: "razorpay",
      status: "confirmed",
    });

    if (dbError) console.error("Supabase insert error:", dbError);

    const itemsHtml = items.map((i: any) => `<li>${i.title} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`).join("");
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#0D1A3C;">Order Confirmed!</h2>
        <p>Thank you, ${form.name}!</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total Paid:</strong> ₹${grandTotal.toLocaleString("en-IN")}</p>
        <p><strong>Shipping to:</strong> ${form.address}, ${form.city}, ${form.state} — ${form.pincode}</p>
        <hr />
        <p style="color:#666;font-size:12px;">RakhiGlam — Beautiful Jewellery for Every Occasion</p>
      </div>
    `;

    const emailSent = await sendEmailViaResend(form.email, `Order Confirmed — ${orderNumber} | RakhiGlam`, emailHtml);

    const adminEmails = (process.env.ADMIN_EMAILS || "rakhiglam200@gmail.com").split(",").map((e: string) => e.trim()).filter(Boolean);
    await Promise.allSettled(
      adminEmails.map((adminEmail: string) =>
        sendEmailViaResend(adminEmail, `New Order — ${orderNumber} | ₹${grandTotal.toLocaleString("en-IN")} | ${form.name}`, emailHtml)
      )
    );

    return NextResponse.json({
      orderId: orderNumber,
      orderNumber,
      payment_method: "razorpay",
      razorpay_payment_id,
      amount: grandTotal,
      emailSent,
    });
  } catch (err) {
    console.error("Verify-order API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
