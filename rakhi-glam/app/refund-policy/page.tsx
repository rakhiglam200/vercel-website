import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = { title: "Refund Policy - RakhiGlam" };

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl font-bold text-white">Refund Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <div className="space-y-6 text-[var(--color-text-light)] text-sm leading-relaxed">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Return Policy</h2>
          <p>We offer easy returns within 7 days of delivery. To be eligible for a return, the item must be unused and in its original packaging.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Refund Process</h2>
          <p>Once we receive and inspect the returned item, we will process your refund within 5-7 business days. The refund will be credited to your original payment method.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Non-Returnable Items</h2>
          <p>Items that have been used, damaged by the customer, or are not in their original packaging are not eligible for returns.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Contact Us</h2>
          <p>For return and refund inquiries, WhatsApp us at +91 7736272601 or email thauya9@gmail.com.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
