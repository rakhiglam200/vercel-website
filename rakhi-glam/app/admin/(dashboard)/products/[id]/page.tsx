"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = [
  "Newly Launched", "Necklaces", "Rings", "Bracelets", "Earrings",
  "Bangle Bracelets", "Anklets", "Jhumkas", "Watches",
];

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
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    long_description: "",
    price: "",
    original_price: "",
    badge: "",
    category: "Necklaces",
    collection: "necklaces",
    in_stock: true,
    material: "",
    weight: "",
    features: "",
    images: "",
  });

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product || data;
        setForm({
          title: p.title || "",
          description: p.description || "",
          long_description: p.long_description || "",
          price: String(p.price || ""),
          original_price: p.original_price ? String(p.original_price) : "",
          badge: p.badge || "",
          category: p.category || "Necklaces",
          collection: p.collection_slug || "necklaces",
          in_stock: p.in_stock ?? true,
          material: p.material || "",
          weight: p.weight ? String(p.weight) : "",
          features: Array.isArray(p.features) ? p.features.join("\n") : "",
          images: Array.isArray(p.images) ? p.images.join("\n") : "",
        });
      })
      .catch(() => alert("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      alert("Title and price are required");
      return;
    }

    setSaving(true);
    const body = {
      title: form.title,
      description: form.description,
      long_description: form.long_description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      badge: form.badge || null,
      category: form.category,
      collection: form.collection,
      in_stock: form.in_stock,
      material: form.material || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      features: form.features ? form.features.split("\n").filter(Boolean) : [],
      images: form.images ? form.images.split("\n").filter(Boolean) : [],
      alt: form.title,
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert("Failed to update product");
      }
    } catch {
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige)]">
        <p className="text-[var(--color-text-muted)]">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Edit Product</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Update product details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Short Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Long Description</label>
          <textarea
            value={form.long_description}
            onChange={(e) => setForm({ ...form, long_description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Price (₹) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Original Price (₹)</label>
            <input
              type="number"
              value={form.original_price}
              onChange={(e) => setForm({ ...form, original_price: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] bg-white"
            >
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Badge</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Material</label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Weight (grams)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Features (one per line)</label>
          <textarea
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] resize-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Image URLs (one per line)</label>
          <textarea
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] resize-none font-mono"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-light)] cursor-pointer">
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
            className="accent-[var(--color-navy)]"
          />
          In Stock
        </label>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-[var(--color-navy)] text-white py-3 rounded-lg text-sm font-semibold cursor-pointer border-none hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => router.push("/admin/products")}
            className="px-6 py-3 rounded-lg text-sm font-semibold border border-[var(--color-border)] cursor-pointer bg-transparent hover:bg-[var(--color-beige)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
