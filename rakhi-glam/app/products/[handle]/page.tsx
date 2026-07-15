"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import AdminImageControls from "@/app/components/AdminImageControls";
import { useCart } from "@/app/context/CartContext";
import { useAdminUI } from "@/app/context/AdminUIContext";
import { getProductBySlug, products } from "@/data/products";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { editMode } = useAdminUI();
  const product = getProductBySlug(params.handle as string);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const images = productImages.length > 0 ? productImages : (product?.images ?? []);

  if (!product) {
    return (
      <>
        <Header />
        <div className="max-w-[1440px] mx-auto px-10 py-32 text-center">
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-4">Product Not Found</h1>
          <p className="text-[var(--color-text-light)] mb-8">The product you are looking for does not exist.</p>
          <button
            onClick={() => router.push("/collections")}
            className="bg-[var(--color-navy)] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            Browse Collections
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const related = products
    .filter((p) => p.collection === product.collection && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-10 py-4 max-md:px-5">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <button onClick={() => router.push("/")} className="hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none text-[var(--color-text-muted)]">Home</button>
          <span>/</span>
          <button onClick={() => router.push(`/collections/${product.collection}`)} className="hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none text-[var(--color-text-muted)]">{product.category}</button>
          <span>/</span>
          <span className="text-[var(--color-navy)]">{product.title}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-[1440px] mx-auto px-10 pb-16 max-md:px-5">
        <div className="grid grid-cols-2 gap-12 max-md:grid-cols-1">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-beige)] mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImage]}
                alt={product.alt}
                className="w-full h-full object-cover"
              />
              <AdminImageControls src={images[selectedImage]} productId={product.id} onUpdate={(url) => setProductImages((prev) => { const next = [...(prev.length ? prev : product.images)]; next[selectedImage] = url; return next; })} />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[var(--color-navy)] text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      selectedImage === i ? "border-[var(--color-navy)]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {editingTitle ? (
              <div className="mb-3 flex gap-2">
                <input autoFocus value={titleValue} onChange={(e) => setTitleValue(e.target.value)}
                  className="flex-1 text-3xl md:text-4xl font-bold font-heading text-[var(--color-navy)] border-b-2 border-[var(--color-navy)] outline-none bg-transparent px-1" />
                <button onClick={() => { setEditingTitle(false); }} className="text-xs bg-[var(--color-navy)] text-white px-3 py-1 rounded-lg cursor-pointer border-none">Save</button>
                <button onClick={() => setEditingTitle(false)} className="text-xs text-[var(--color-text-muted)] px-2 py-1 cursor-pointer bg-transparent border-none">Cancel</button>
              </div>
            ) : (
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-navy)] mb-3">
                {product.title}
                {editMode && (
                  <button onClick={() => { setTitleValue(product.title); setEditingTitle(true); }}
                    className="ml-2 text-xs text-[var(--color-gold)] font-normal align-middle cursor-pointer bg-transparent border-none hover:underline">Edit</button>
                )}
              </h1>
            )}

            {editingDesc ? (
              <div className="mb-6 flex gap-2">
                <textarea autoFocus value={descValue} onChange={(e) => setDescValue(e.target.value)} rows={3}
                  className="flex-1 text-[var(--color-text-light)] text-base border border-[var(--color-border)] rounded-lg outline-none bg-transparent px-2 py-1 resize-y focus:border-[var(--color-navy)]" />
                <div className="flex flex-col gap-1">
                  <button onClick={() => setEditingDesc(false)} className="text-xs bg-[var(--color-navy)] text-white px-3 py-1 rounded-lg cursor-pointer border-none">Save</button>
                  <button onClick={() => setEditingDesc(false)} className="text-xs text-[var(--color-text-muted)] px-2 py-1 cursor-pointer bg-transparent border-none">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-[var(--color-text-light)] text-base mb-6">
                {product.description}
                {editMode && (
                  <button onClick={() => { setDescValue(product.description); setEditingDesc(true); }}
                    className="ml-2 text-xs text-[var(--color-gold)] font-normal cursor-pointer bg-transparent border-none hover:underline">Edit</button>
                )}
              </p>
            )}

            <div className="flex items-baseline gap-4 mb-6">
              {editingPrice ? (
                <div className="flex gap-2 items-center">
                  <span className="text-lg">₹</span>
                  <input autoFocus value={priceValue} onChange={(e) => setPriceValue(e.target.value)} type="number"
                    className="w-28 text-3xl font-bold font-heading text-[var(--color-navy)] border-b-2 border-[var(--color-navy)] outline-none bg-transparent px-1" />
                  <button onClick={() => setEditingPrice(false)} className="text-xs bg-[var(--color-navy)] text-white px-3 py-1 rounded-lg cursor-pointer border-none">Save</button>
                  <button onClick={() => setEditingPrice(false)} className="text-xs text-[var(--color-text-muted)] px-2 py-1 cursor-pointer bg-transparent border-none">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="font-heading text-3xl font-bold text-[var(--color-navy)]">₹{product.price.toLocaleString("en-IN")}</span>
                  {editMode && (
                    <button onClick={() => { setPriceValue(String(product.price)); setEditingPrice(true); }}
                      className="text-xs text-[var(--color-gold)] cursor-pointer bg-transparent border-none hover:underline">Edit</button>
                  )}
                </>
              )}
              {product.originalPrice && (
                <del className="text-lg text-[var(--color-text-muted)]">₹{product.originalPrice.toLocaleString("en-IN")}</del>
              )}
              {product.originalPrice && (
                <span className="text-sm font-semibold text-green-600">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            {product.material && (
              <div className="mb-4">
                <span className="text-sm font-semibold text-[var(--color-navy)]">Material: </span>
                <span className="text-sm text-[var(--color-text-light)]">{product.material}</span>
              </div>
            )}

            {product.weight && (
              <div className="mb-6">
                <span className="text-sm font-semibold text-[var(--color-navy)]">Weight: </span>
                <span className="text-sm text-[var(--color-text-light)]">{product.weight}g</span>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-[var(--color-navy)]">Quantity</span>
              <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-lg cursor-pointer bg-transparent border-none hover:bg-[var(--color-beige)] transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-lg cursor-pointer bg-transparent border-none hover:bg-[var(--color-beige)] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addItem({ id: product.id, title: product.title, price: product.price, src: images[0] });
                  }
                }}
                className="flex-1 bg-[var(--color-navy)] text-white py-4 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="border-t border-[var(--color-border)] pt-6">
                <h3 className="font-heading text-base font-semibold text-[var(--color-navy)] mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="mt-6 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-[var(--color-beige)] py-16">
          <div className="max-w-[1440px] mx-auto px-10 max-md:px-5">
            <h2 className="font-heading text-3xl text-[var(--color-navy)] mb-10 text-center">You May Also Like</h2>
            <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
              {related.map((p) => (
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
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
