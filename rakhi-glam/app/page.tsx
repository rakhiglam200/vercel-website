"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CategoryCard from "@/app/components/CategoryCard";
import ProductCard from "@/app/components/ProductCard";
import { products, CATEGORIES } from "@/data/products";

const FAQ_ITEMS = [
  {
    q: "What is the return policy?",
    a: "We offer easy returns within 7 days of delivery. Please refer to our Refund Policy page for complete details.",
  },
  {
    q: "When will I get my order?",
    a: "Orders are usually delivered within 3 to 10 business days. For more information, please visit our Shipping Policy page.",
  },
  {
    q: "How much does shipping cost?",
    a: "Shipping charges depend on the courier service selected. India Post costs ₹49 across India, while DTDC charges vary based on location. Exact shipping cost is displayed during checkout.",
  },
  {
    q: "Any questions?",
    a: "You can contact us through our contact page or WhatsApp us at +91 7736272601. We will be happy to assist you!",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bestSellers = products.filter((p) => p.badge === "Best Seller" || p.badge === "Popular").slice(0, 8);

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-[var(--color-navy)] overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-10 py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
            Jewellery for the<br />
            <span className="text-[var(--color-gold)]">Modern Woman</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mb-8">
            Discover our curated collection of gold and silver jewellery. Timeless pieces crafted for every occasion.
          </p>
          <div className="flex gap-4">
            <a
              href="/collections"
              className="bg-[var(--color-gold)] text-[var(--color-navy)] px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
            >
              Shop Now
            </a>
            <a
              href="/about"
              className="border border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors no-underline"
            >
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-10 py-16 max-md:px-5">
        <h2 className="font-heading text-3xl text-[var(--color-navy)] mb-2 text-center">Our Categories</h2>
        <p className="text-[var(--color-text-light)] text-sm mb-10 text-center">Explore our curated collections</p>
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              src={cat.image}
              alt={cat.label}
              title={cat.label}
              href={`/collections/${cat.slug}`}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-[var(--color-beige)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5">
          <h2 className="font-heading text-3xl text-[var(--color-navy)] mb-2 text-center">Best Sellers</h2>
          <p className="text-[var(--color-text-light)] text-sm mb-10 text-center">Our most loved pieces</p>
          <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                src={p.images[0]}
                alt={p.alt}
                title={p.title}
                desc={p.description}
                price={p.price}
                originalPrice={p.originalPrice}
                badge={p.badge}
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="/collections"
              className="inline-block bg-[var(--color-navy)] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity no-underline"
            >
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-[1440px] mx-auto px-10 py-16 max-md:px-5">
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-beige)] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-[var(--color-navy)] mb-2">Free Shipping</h3>
            <p className="text-sm text-[var(--color-text-light)]">On orders above ₹999. India Post & DTDC delivery available.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-beige)] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-[var(--color-navy)] mb-2">WhatsApp Support</h3>
            <p className="text-sm text-[var(--color-text-light)]">Chat with us on WhatsApp for quick assistance.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-beige)] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-[var(--color-navy)] mb-2">Secure Payment</h3>
            <p className="text-sm text-[var(--color-text-light)]">All payments are processed securely. Cash on Delivery available.</p>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee */}
      <section className="bg-[var(--color-navy)] py-5 overflow-hidden">
        <div className="announcement-track whitespace-nowrap inline-flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-6">
              <span className="text-white/80 text-sm tracking-[0.15em] uppercase">Crafted with elegance</span>
              <span className="text-[var(--color-gold)] text-xs">✦</span>
              <span className="text-white/80 text-sm tracking-[0.15em] uppercase">Delivered with trust</span>
              <span className="text-[var(--color-gold)] text-xs">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-10 py-16 max-md:px-5">
        <h2 className="font-heading text-3xl text-[var(--color-navy)] mb-10 text-center">FAQ</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white cursor-pointer border-none"
              >
                <span className="font-heading text-base font-semibold text-[var(--color-navy)]">{item.q}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className={`text-[var(--color-text-muted)] transition-transform duration-300 shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-[var(--color-text-light)] leading-relaxed animate-slide-down">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
