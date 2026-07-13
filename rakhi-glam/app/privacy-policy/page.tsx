import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = { title: "Privacy Policy - RakhiGlam" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <div className="space-y-6 text-[var(--color-text-light)] text-sm leading-relaxed">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Information We Collect</h2>
          <p>We collect information you provide directly, such as your name, email, phone number, and shipping address when you place an order or contact us.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">How We Use Your Information</h2>
          <p>We use your information to process orders, send order updates, provide customer support, and improve our services.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Contact Us</h2>
          <p>For questions about this Privacy Policy, contact us at thauya9@gmail.com or WhatsApp us at +91 7736272601.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
