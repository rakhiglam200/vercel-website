"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/app/context/CartContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface ShippingInfo {
  shippingCost: number;
  estimatedDays: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export default function ReviewPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "whatsapp_upi">("razorpay");

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutForm");
    if (!stored) {
      router.push("/checkout");
      return;
    }
    setForm(JSON.parse(stored));
    const shippingStored = sessionStorage.getItem("shippingInfo");
    if (shippingStored) setShipping(JSON.parse(shippingStored));
  }, [router]);

  const handleRazorpayPayment = useCallback(async () => {
    if (!form) return;
    setPlacing(true);
    setError("");

    try {
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total + (shipping?.shippingCost ?? 0) }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Failed to create payment order");
      }

      const { orderId, amount, keyId } = await createRes.json();
      await loadRazorpayScript();

      const options = {
        key: keyId,
        amount,
        currency: "INR",
        name: "RakhiGlam",
        description: `Order ₹${(total + (shipping?.shippingCost ?? 0)).toLocaleString("en-IN")}`,
        order_id: orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payment/verify-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              form,
              items,
              total,
              shippingCost: shipping?.shippingCost ?? 0,
            }),
          });

          const data = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(data.error || "Payment verification failed");

          sessionStorage.removeItem("checkoutForm");
          sessionStorage.removeItem("shippingInfo");
          sessionStorage.setItem("orderResult", JSON.stringify(data));
          clearCart();
          router.push("/checkout/confirmation");
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setError("Payment cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPlacing(false);
    }
  }, [form, items, total, shipping, clearCart, router]);

  const handleWhatsAppOrder = useCallback(async () => {
    if (!form) return;
    setPlacing(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form,
          items,
          total,
          shippingCost: shipping?.shippingCost ?? 0,
          payment_method: "whatsapp_upi",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const data = await res.json();
      sessionStorage.removeItem("checkoutForm");
      sessionStorage.removeItem("shippingInfo");
      sessionStorage.setItem("orderResult", JSON.stringify(data));
      clearCart();
      router.push("/checkout/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPlacing(false);
    }
  }, [form, items, total, shipping, clearCart, router]);

  const handlePlaceOrder = useCallback(() => {
    if (paymentMethod === "razorpay") {
      handleRazorpayPayment();
    } else {
      handleWhatsAppOrder();
    }
  }, [paymentMethod, handleRazorpayPayment, handleWhatsAppOrder]);

  if (!form || count === 0) return null;

  const grandTotal = total + (shipping?.shippingCost ?? 0);
  const grandTotalStr = grandTotal.toLocaleString("en-IN");

  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-12">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-3xl font-bold text-white">Review Your Order</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        <div className="grid grid-cols-5 gap-8 max-lg:grid-cols-1">
          <div className="col-span-3 space-y-6">
            <div className="bg-[var(--color-beige)] rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-4">Contact Information</h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-[var(--color-text-light)]">Name:</span><span className="font-medium">{form.name}</span></p>
                <p className="flex justify-between"><span className="text-[var(--color-text-light)]">Email:</span><span className="font-medium">{form.email}</span></p>
                <p className="flex justify-between"><span className="text-[var(--color-text-light)]">Phone:</span><span className="font-medium">{form.phone}</span></p>
              </div>
            </div>

            <div className="bg-[var(--color-beige)] rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-4">Shipping Address</h2>
              <p className="text-sm">
                {form.address}<br />
                {form.city}, {form.state} — {form.pincode}
              </p>
            </div>

            <div className="bg-[var(--color-beige)] rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-navy)]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing}
              className="w-full bg-[var(--color-navy)] text-white py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none disabled:opacity-50">
              {placing ? "Processing..." : paymentMethod === "razorpay" ? `Pay ₹${grandTotalStr}` : `Place Order — ₹${grandTotalStr}`}
            </button>

            <div className="text-center">
              <button onClick={() => router.push("/checkout")}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-navy)] bg-transparent border-none cursor-pointer">
                ← Back to checkout
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          <div className="col-span-2">
            <div className="bg-[var(--color-beige)] rounded-2xl p-6 sticky top-24 space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-3">Payment Method</h2>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "razorpay" ? "border-[var(--color-navy)] bg-white" : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"}`}>
                    <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-[var(--color-navy)]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pay Online</p>
                      <p className="text-xs text-[var(--color-text-muted)]">UPI • Card • NetBanking • Wallet</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "whatsapp_upi" ? "border-[var(--color-navy)] bg-white" : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"}`}>
                    <input type="radio" name="paymentMethod" value="whatsapp_upi" checked={paymentMethod === "whatsapp_upi"} onChange={() => setPaymentMethod("whatsapp_upi")} className="accent-[var(--color-navy)]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pay via UPI (Offline)</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Pay after ordering via UPI QR</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-[var(--color-beige-dark)] pt-4">
                <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-3">Payment Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-light)]">Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-light)]">Shipping</span>
                    <span>{(shipping?.shippingCost ?? 0) === 0 ? <span className="text-green-600">Free</span> : `₹${(shipping?.shippingCost ?? 0)}`}</span>
                  </div>
                  {shipping?.estimatedDays && (
                    <p className="text-xs text-[var(--color-text-muted)]">Delivery: {shipping.estimatedDays}</p>
                  )}
                </div>
                <div className="border-t border-[var(--color-beige-dark)] mt-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-[var(--color-navy)]">Total</span>
                  <span className="text-xl font-bold text-[var(--color-navy)]">₹{grandTotalStr}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  {paymentMethod === "razorpay" ? "You will be redirected to Razorpay to complete payment." : "You will receive payment instructions after placing the order."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
