"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";

interface FieldOptions {
  categories: string[];
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [options, setOptions] = useState<FieldOptions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/field-options");
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const addOption = async (field: "categories", value: string) => {
    if (!value.trim()) return;
    try {
      const res = await fetch("/api/admin/field-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: value.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const updated = await res.json();
      setOptions(updated);
      showToast("success", `Added "${value.trim()}"`);
    } catch {
      showToast("error", "Failed to add option");
    }
  };

  const removeOption = async (field: "categories", value: string) => {
    if (!confirm(`Remove "${value}"?`)) return;
    try {
      const res = await fetch(`/api/admin/field-options?field=${field}&value=${encodeURIComponent(value)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
      const updated = await res.json();
      setOptions(updated);
      showToast("success", `Removed "${value}"`);
    } catch {
      showToast("error", "Failed to remove option");
    }
  };

  if (loading || !options) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige)]">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Categories & Options</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage product categories for your store
        </p>
      </div>

      <div className="grid gap-6">
        <OptionSection
          title="Categories"
          items={options.categories}
          onAdd={(v) => addOption("categories", v)}
          onRemove={(v) => removeOption("categories", v)}
        />
      </div>
    </div>
  );
}

function OptionSection({
  title,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--color-navy)]">{title}</h2>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(input);
              setInput("");
            }
          }}
          placeholder={`Add new ${title.toLowerCase()}...`}
          className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)]"
        />
        <button
          onClick={() => {
            onAdd(input);
            setInput("");
          }}
          disabled={!input.trim()}
          className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer border-none transition-opacity"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 bg-[var(--color-beige)] rounded-lg px-3 py-1.5 text-sm">
            <span className="text-[var(--color-navy)]">{item}</span>
            <button
              onClick={() => onRemove(item)}
              className="text-red-400 hover:text-red-600 text-xs cursor-pointer bg-transparent border-none"
            >
              &#10005;
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--color-text-muted)] text-sm">No {title.toLowerCase()} yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
