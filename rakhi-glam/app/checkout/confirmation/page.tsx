"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface OrderResult {
  orderId: string;
  orderNumber?: string;
  payment_method?: string;
  payment_status?: string;
  razorpay_payment_id?: string;
  emailSent?: boolean;
  dbSaved?: boolean;
  amount?: number;
  shippingCost?: number;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [data, setData] = useState<OrderResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderResult");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored) as OrderResult;
    setData(parsed);
    sessionStorage.removeItem("orderResult");
  }, [router]);

  const isRazorpay = data?.payment_method === "razorpay";

  if (!data) return null;

  const upiId = "7906759725@ybl";
  const payee = "RakhiGlam";
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payee)}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {isRazorpay ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-navy)] mb-1">Payment Successful!</h1>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Your order has been confirmed</p>

              <div className="bg-[var(--color-beige)] rounded-xl p-4 mb-6">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Order Number</p>
                <p className="text-lg font-mono font-bold text-[var(--color-navy)]">{data.orderNumber || data.orderId}</p>
                {data.razorpay_payment_id && (
                  <>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 mb-1">Payment ID</p>
                    <p className="text-xs font-mono text-[var(--color-text-light)]">{data.razorpay_payment_id}</p>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-navy)] mb-2">Order Placed!</h1>

              <div className="bg-[var(--color-beige)] rounded-xl p-4 mb-6">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Order Number</p>
                <p className="text-lg font-mono font-bold text-[var(--color-navy)]">{data.orderNumber || data.orderId}</p>
              </div>

              <div className="border-t border-[var(--color-border)] pt-6">
                <h2 className="font-heading text-lg font-semibold text-[var(--color-navy)] mb-4">Complete Your Payment</h2>

                <div className="mb-4">
                  <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto rounded-lg" />
                </div>

                <div className="bg-[var(--color-beige)] rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-light)]">UPI ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-[var(--color-navy)]">{upiId}</code>
                      <button onClick={handleCopy}
                        className="text-xs text-[var(--color-navy)] hover:underline bg-transparent border-none cursor-pointer">
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-light)]">Payee</span>
                    <span className="text-sm font-medium">{payee}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] mt-4">
                  You will receive a confirmation once payment is verified.
                </p>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => router.push("/collections")}
              className="bg-[var(--color-navy)] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
