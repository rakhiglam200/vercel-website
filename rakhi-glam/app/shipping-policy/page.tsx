import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = { title: "Shipping Policy - RakhiGlam" };

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl font-bold text-white">Shipping Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <div className="space-y-6 text-[var(--color-text-light)] text-sm leading-relaxed">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Shipping Methods</h2>
          <p>We ship via India Post and DTDC Courier across India. International shipping is also available.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Delivery Time</h2>
          <p>Orders are usually delivered within 3 to 10 business days depending on your location.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Shipping Charges</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>India Post: ₹49 flat rate across India</li>
            <li>DTDC: Charges vary based on location and distance</li>
            <li>Free shipping on orders above ₹999</li>
          </ul>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Order Tracking</h2>
          <p>You will receive a tracking number via email/WhatsApp once your order is shipped.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Contact Us</h2>
          <p>For shipping inquiries, WhatsApp us at +91 7906759725 or email rakhiglam200@gmail.com.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
