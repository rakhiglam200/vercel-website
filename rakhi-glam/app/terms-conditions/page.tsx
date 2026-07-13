import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = { title: "Terms & Conditions - RakhiGlam" };

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl font-bold text-white">Terms & Conditions</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <div className="space-y-6 text-[var(--color-text-light)] text-sm leading-relaxed">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">General</h2>
          <p>By accessing and using this website, you accept and agree to be bound by these Terms & Conditions.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Products</h2>
          <p>Prices for products are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Orders</h2>
          <p>We reserve the right to refuse or cancel any order you place with us. We may limit the quantities purchased per person, per household, or per order.</p>
          <h2 className="font-heading text-xl font-bold text-[var(--color-navy)]">Contact</h2>
          <p>For questions about these Terms & Conditions, contact us at rakhiglam200@gmail.com.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
