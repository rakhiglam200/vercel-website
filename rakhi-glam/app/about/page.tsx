import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "About Us - RakhiGlam",
  description: "Learn about RakhiGlam, our story, and our commitment to crafting elegant jewellery for the modern woman.",
};

export default function AboutPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <div className="bg-[var(--color-navy)] py-20">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Our Story</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Discover the passion and craftsmanship behind every piece of RakhiGlam jewellery.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <div className="prose prose-lg">
          <h2 className="font-heading text-2xl font-bold text-[var(--color-navy)] mb-6">Crafted with Elegance</h2>
          <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
            RakhiGlam was born from a passion for creating beautiful, accessible jewellery that empowers the modern woman. Based in Calicut, Kerala, we curate and craft pieces that blend timeless elegance with contemporary design.
          </p>
          <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
            Every piece in our collection is thoughtfully designed to complement your style, whether you are dressing up for a special occasion or adding a touch of glamour to your everyday look. We use quality materials and pay attention to every detail.
          </p>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-navy)] mb-6 mt-10">Our Mission</h2>
          <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
            We believe every woman deserves to feel confident and beautiful. Our mission is to provide high-quality, stylish jewellery at affordable prices, with the convenience of doorstep delivery across India and worldwide.
          </p>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-navy)] mb-6 mt-10">Why Choose Us</h2>
          <ul className="space-y-3 text-[var(--color-text-light)]">
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-gold)] mt-1">✦</span>
              <span>Curated collection of gold and silver jewellery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-gold)] mt-1">✦</span>
              <span>Affordable prices without compromising quality</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-gold)] mt-1">✦</span>
              <span>PAN India and worldwide shipping</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-gold)] mt-1">✦</span>
              <span>Easy returns and dedicated customer support</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-gold)] mt-1">✦</span>
              <span>WhatsApp support for custom orders</span>
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </>
  );
}
