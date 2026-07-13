"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { products, COLLECTIONS } from "@/data/products";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCollection = searchParams.get("collection") || "";
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCollection) {
      result = result.filter((p) => p.collection === selectedCollection);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, selectedCollection]);

  return (
    <>
      <Header />

      {/* Page Header */}
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
            {selectedCollection ? COLLECTIONS[selectedCollection]?.label || "Collection" : "All Collections"}
          </h1>
          <p className="text-white/70 text-base">
            {searchQuery ? `Results for "${searchQuery}"` : "Explore our curated jewellery collection"}
          </p>
        </div>
      </div>

      {/* Filters + Products */}
      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => { setSelectedCollection(""); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
              !selectedCollection
                ? "bg-[var(--color-navy)] text-white"
                : "bg-[var(--color-beige)] text-[var(--color-text)] hover:bg-[var(--color-navy)] hover:text-white"
            }`}
          >
            All
          </button>
          {Object.entries(COLLECTIONS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedCollection(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
                selectedCollection === key
                  ? "bg-[var(--color-navy)] text-white"
                  : "bg-[var(--color-beige)] text-[var(--color-text)] hover:bg-[var(--color-navy)] hover:text-white"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search jewellery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-5 py-3 border border-[var(--color-border)] rounded-full text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
          />
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] text-lg">No products found</p>
            <button
              onClick={() => { setSelectedCollection(""); setSearchQuery(""); }}
              className="mt-4 text-[var(--color-navy)] font-semibold text-sm hover:underline cursor-pointer bg-transparent border-none"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            {filtered.map((p) => (
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
        )}

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
          Showing {filtered.length} of {products.length} products
        </p>
      </div>

      <Footer />
    </>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="max-w-[1440px] mx-auto px-10 py-32 text-center">
          <p className="text-[var(--color-text-muted)]">Loading collections...</p>
        </div>
        <Footer />
      </>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
