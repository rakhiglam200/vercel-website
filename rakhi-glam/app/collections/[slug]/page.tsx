"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { getProductsByCollection, COLLECTIONS } from "@/data/products";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const collection = COLLECTIONS[slug];
  const items = getProductsByCollection(slug);

  if (!collection) {
    return (
      <>
        <Header />
        <div className="max-w-[1440px] mx-auto px-10 py-32 text-center">
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-4">Collection Not Found</h1>
          <p className="text-[var(--color-text-light)] mb-8">This collection does not exist.</p>
          <button
            onClick={() => router.push("/collections")}
            className="bg-[var(--color-navy)] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            Browse All Collections
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Collection Header */}
      <div className="bg-[var(--color-navy)] py-16">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">{collection.label}</h1>
          <p className="text-white/70 text-base">{collection.description}</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] text-lg">No products in this collection yet</p>
            <button
              onClick={() => router.push("/collections")}
              className="mt-4 text-[var(--color-navy)] font-semibold text-sm hover:underline cursor-pointer bg-transparent border-none"
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            {items.map((p) => (
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
      </div>

      <Footer />
    </>
  );
}
