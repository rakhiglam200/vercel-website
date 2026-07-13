"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  category: string;
  collection: string;
  inStock: boolean;
}

const CATEGORY_OPTIONS = [
  "Newly Launched", "Necklaces", "Rings", "Bracelets", "Earrings",
  "Bangle Bracelets", "Anklets", "Jhumkas", "Watches",
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    badge: "",
    category: "Necklaces",
    collection: "necklaces",
    inStock: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      alert("Title and price are required");
      return;
    }

    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const body = {
      ...form,
      slug: editingProduct?.slug || slug,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      badge: product.badge || "",
      category: product.category,
      collection: product.collection,
      inStock: product.inStock,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const resetForm = () => {
    setForm({
      title: "", description: "", price: "", originalPrice: "",
      badge: "", category: "Necklaces", collection: "necklaces", inStock: true,
    });
  };

  return (
    <>
      <Header />

      <div className="bg-[var(--color-navy)] py-12">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/60 hover:text-white no-underline transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
            <h1 className="font-heading text-3xl font-bold text-white">Manage Products</h1>
          </div>
          <button
            onClick={() => { setEditingProduct(null); resetForm(); setShowForm(true); }}
            className="bg-[var(--color-gold)] text-[var(--color-navy)] px-5 py-2 rounded-full text-sm font-semibold cursor-pointer border-none hover:opacity-90 transition-opacity"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-heading text-xl font-bold text-[var(--color-navy)] mb-6">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors resize-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Original Price (₹)"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                  />
                </div>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors bg-white"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Badge (e.g. Best Seller, New)"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--color-text-light)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="accent-[var(--color-navy)]"
                  />
                  In Stock
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[var(--color-navy)] text-white py-3 rounded-full text-sm font-semibold cursor-pointer border-none hover:opacity-85 transition-opacity"
                >
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}
                  className="px-6 py-3 rounded-full text-sm font-semibold border border-[var(--color-border)] cursor-pointer bg-transparent hover:bg-[var(--color-beige)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-[var(--color-text-muted)]">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] mb-4">No products found. Add your first product!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[var(--color-navy)] text-white px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer border-none"
            >
              + Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-beige)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-beige)] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/products/${product.slug}.jpg`}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/placeholder.jpg"; }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-navy)]">{product.title}</p>
                          {product.badge && (
                            <span className="text-xs bg-[var(--color-gold)]/20 text-[var(--color-navy)] px-2 py-0.5 rounded-full">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-light)]">{product.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-[var(--color-text-muted)] line-through ml-1">₹{product.originalPrice}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-[var(--color-navy)] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none p-1"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none p-1"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
