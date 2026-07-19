"use client";

import { useState } from "react";
import ImagePickerModal from "./ImagePickerModal";
import { useToast } from "@/app/context/ToastContext";

interface ImageListEditorProps {
  images: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ImageListEditor({ images, onChange, label = "Images" }: ImageListEditorProps) {
  const { showToast } = useToast();
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const list = images
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const addImage = (path: string) => {
    if (!list.includes(path)) {
      onChange([...list, path].join("\n"));
    }
  };

  const removeImage = (index: number) => {
    onChange(list.filter((_, i) => i !== index).join("\n"));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.join("\n"));
  };

  const handleImagePick = async (fileOrUrl: File | string) => {
    setShowImagePicker(false);

    if (typeof fileOrUrl === "string") {
      addImage(fileOrUrl);
      return;
    }

    const file = fileOrUrl;
    setUploadLabel(`Uploading ${file.name}...`);
    setUploadBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/images/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      addImage(data.url);
      showToast("success", `"${file.name}" uploaded`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</h3>
        <button
          type="button"
          onClick={() => setShowImagePicker(true)}
          disabled={uploadBusy}
          className="text-sm text-[var(--color-navy)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 hover:bg-[var(--color-beige)] cursor-pointer bg-transparent disabled:opacity-50 transition-colors"
        >
          + Upload Image
        </button>
      </div>

      {uploadBusy && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <div className="relative h-1 w-40 bg-gray-200 rounded overflow-hidden">
            <div className="progress-indeterminate bg-[var(--color-navy)] h-full rounded" />
          </div>
          <span>{uploadLabel}</span>
        </div>
      )}

      {list.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {list.map((src, i) => (
            <div key={i} className="relative group border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-beige)]">
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23f3f4f6' width='100' height='100'/><text x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='10'>No preview</text></svg>";
                  }}
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center cursor-pointer border-none hover:bg-white text-[var(--color-navy)] text-xs"
                    title="Move left"
                  >
                    &#8592;
                  </button>
                )}
                {i < list.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center cursor-pointer border-none hover:bg-white text-[var(--color-navy)] text-xs"
                    title="Move right"
                  >
                    &#8594;
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center cursor-pointer border-none hover:bg-red-500 text-white text-xs"
                  title="Remove"
                >
                  &#10005;
                </button>
              </div>
              <div className="px-1.5 py-1">
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{src.split("/").pop()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={images}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-[var(--color-navy)] resize-none font-mono text-[var(--color-text-muted)]"
        placeholder="Image paths (one per line)"
      />

      {showImagePicker && (
        <ImagePickerModal
          open={showImagePicker}
          onSelect={handleImagePick}
          onClose={() => setShowImagePicker(false)}
        />
      )}

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
    </div>
  );
}
