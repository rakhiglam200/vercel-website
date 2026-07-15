"use client";

import { useState } from "react";
import { useAdminUI } from "@/app/context/AdminUIContext";
import ImagePickerModal from "./ImagePickerModal";

interface AdminImageControlsProps {
  src: string;
  productId: string;
  onUpdate?: (newSrc: string) => void;
  className?: string;
}

export default function AdminImageControls({ src, productId, onUpdate, className = "" }: AdminImageControlsProps) {
  const { editMode } = useAdminUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!editMode) return null;

  const handleSelect = async (fileOrUrl: File | string) => {
    let newUrl: string;

    if (typeof fileOrUrl === "string") {
      newUrl = fileOrUrl;
    } else {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", fileOrUrl);

        const res = await fetch("/api/admin/images/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        newUrl = data.url;
      } catch {
        alert("Failed to upload image");
        setUploading(false);
        return;
      }
    }

    try {
      const patchRes = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [newUrl] }),
      });
      if (!patchRes.ok) console.warn("Failed to update product image in database");
    } catch {
      console.warn("Failed to update product image in database");
    }

    setUploading(false);
    onUpdate?.(newUrl);
    setModalOpen(false);
  };

  return (
    <>
      <div className={`absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 z-10 ${className}`}>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalOpen(true); }}
            disabled={uploading}
            className="bg-white/95 backdrop-blur-sm text-[var(--color-navy)] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer border-none shadow-lg disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Replace"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = () => {
                const file = input.files?.[0];
                if (file) handleSelect(file);
              };
              input.click();
            }}
            disabled={uploading}
            className="bg-white/95 backdrop-blur-sm text-[var(--color-navy)] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer border-none shadow-lg disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>

      <ImagePickerModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />
    </>
  );
}
