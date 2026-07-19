"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  price: number;
  original_price?: number;
  badge?: string;
  category: string;
  collection_slug: string;
  in_stock: boolean;
  images?: string[];
  alt?: string;
  material?: string;
  weight?: number;
  features?: string[];
  source?: "db" | "hardcoded";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige)]">
        <p className="text-[var(--color-text-muted)]">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Products</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{products.length} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 no-underline transition-opacity"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-beige)]">
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Product</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Price</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Category</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Stock</th>
              <th className="text-right px-5 py-3 font-medium text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[var(--color-text-muted)]">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-[var(--color-navy)] underline no-underline text-sm">
                    Add your first product
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-beige)]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--color-beige)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images?.[0] || `/images/products/${p.slug}.jpg`}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/placeholder.jpg"; }}
                        />
                      </div>
                      <div>
                        <Link
                          href={`/products/${p.slug}`}
                          className="font-medium text-[var(--color-navy)] no-underline hover:underline"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-[var(--color-text-muted)]">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-navy)]">
                    ₹{p.price?.toLocaleString("en-IN")}
                    {p.original_price && (
                      <span className="text-xs text-[var(--color-text-muted)] line-through ml-1">₹{p.original_price}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-text-light)]">{p.category}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {p.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[var(--color-navy)] hover:opacity-70 text-sm mr-3 no-underline transition-opacity"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="text-red-500 hover:text-red-700 text-sm cursor-pointer bg-transparent border-none"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
