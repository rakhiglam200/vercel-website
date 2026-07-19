"use client";

import { useState } from "react";
import { useAdminUI } from "@/app/context/AdminUIContext";
import ImagePickerModal from "./ImagePickerModal";

interface AdminImageControlsProps {
  src: string;
  productId: string;
  images?: string[];
  imageIndex?: number;
  onUpdate?: (newImages: string[]) => void;
  className?: string;
}

export default function AdminImageControls({
  src,
  productId,
  images,
  imageIndex = 0,
  onUpdate,
  className = "",
}: AdminImageControlsProps) {
  const { editMode } = useAdminUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  if (!editMode) return null;

  const handleSelect = async (fileOrUrl: File | string) => {
    let newUrl: string;

    if (typeof fileOrUrl === "string") {
      newUrl = fileOrUrl;
    } else {
      setUploading(true);
      setUploadProgress(`Uploading ${fileOrUrl.name}...`);
      try {
        const formData = new FormData();
        formData.append("file", fileOrUrl);

        const res = await fetch("/api/admin/images/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        newUrl = data.url;
      } catch {
        alert("Failed to upload image");
        setUploading(false);
        return;
      }
    }

    try {
      const currentImages = images && images.length > 0 ? [...images] : [src];
      const idx = imageIndex < currentImages.length ? imageIndex : 0;
      currentImages[idx] = newUrl;

      const patchRes = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: currentImages }),
      });
      if (!patchRes.ok) console.warn("Failed to update product image in database");
    } catch {
      console.warn("Failed to update product image in database");
    }

    setUploading(false);
    setUploadProgress("");
    onUpdate?.(images && images.length > 0 ? (() => { const n = [...images]; n[imageIndex < n.length ? imageIndex : 0] = newUrl; return n; })() : [newUrl]);
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
          {images && images.length > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const updatedImages = [...images, ""];
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setUploadProgress(`Uploading ${file.name}...`);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/admin/images/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Upload failed");
                    updatedImages[updatedImages.length - 1] = data.url;

                    const patchRes = await fetch(`/api/products/${productId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ images: updatedImages }),
                    });
                    if (patchRes.ok) {
                      onUpdate?.(updatedImages);
                    }
                  } catch {
                    alert("Failed to upload image");
                  } finally {
                    setUploading(false);
                    setUploadProgress("");
                  }
                };
                input.click();
              }}
              disabled={uploading}
              className="bg-white/95 backdrop-blur-sm text-[var(--color-navy)] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer border-none shadow-lg disabled:opacity-50"
            >
              + Add
            </button>
          )}
        </div>
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm px-3 py-1.5">
            <span className="text-xs text-[var(--color-navy)] font-medium">{uploadProgress}</span>
            <div className="relative h-1 bg-gray-200 overflow-hidden mt-1 rounded">
              <div className="progress-indeterminate bg-[var(--color-navy)] h-full rounded" />
            </div>
          </div>
        )}
      </div>

      <ImagePickerModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />

      <style>{`
        .progress-indeterminate {
          width: 40%;
          height: 100%;
          border-radius: 999px;
          animation: progress-indeterminate 1.4s infinite ease-in-out;
        }
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </>
  );
}
