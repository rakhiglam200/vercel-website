"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ImagePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: File | string) => void;
}

interface StorageImage {
  name: string;
  url: string;
}

export default function ImagePickerModal({ open, onClose, onSelect }: ImagePickerModalProps) {
  const [tab, setTab] = useState<"upload" | "storage">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [storageImages, setStorageImages] = useState<StorageImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStorageImages = useCallback(async () => {
    setLoadingImages(true);
    try {
      const res = await fetch("/api/admin/images");
      if (res.ok) {
        const data = await res.json();
        setStorageImages(data.images ?? []);
      }
    } catch {
    } finally {
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "storage") {
      fetchStorageImages();
    }
  }, [open, tab, fetchStorageImages]);

  useEffect(() => {
    if (open) {
      setTab("upload");
      setSelectedUrl(null);
      setDragOver(false);
    }
  }, [open]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    onSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleConfirmSelection = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-down z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-heading text-lg font-bold text-[var(--color-navy)]">Choose Image</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 py-2.5 text-sm font-medium cursor-pointer border-none transition-colors ${
              tab === "upload" ? "bg-[var(--color-navy)] text-white" : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-beige)]"
            }`}
          >
            Upload from Computer
          </button>
          <button
            onClick={() => setTab("storage")}
            className={`flex-1 py-2.5 text-sm font-medium cursor-pointer border-none transition-colors ${
              tab === "storage" ? "bg-[var(--color-navy)] text-white" : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-beige)]"
            }`}
          >
            Choose from Storage
          </button>
        </div>

        <div className="p-5 min-h-[280px]">
          {tab === "upload" ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragOver ? "border-[var(--color-navy)] bg-[var(--color-beige)]" : "border-[var(--color-border)] hover:border-[var(--color-gold)]"
              }`}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm text-[var(--color-text-light)]">
                {dragOver ? "Drop image here" : "Drag & drop or click to browse"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG, WEBP up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="h-[240px] overflow-y-auto">
              {loadingImages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-[var(--color-text-muted)]">Loading images...</p>
                </div>
              ) : storageImages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-[var(--color-text-muted)]">No images in storage yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {storageImages.map((img) => (
                    <button
                      key={img.name}
                      onClick={() => setSelectedUrl(selectedUrl === img.url ? null : img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer bg-[var(--color-beige)] p-0 transition-all ${
                        selectedUrl === img.url ? "border-[var(--color-navy)] ring-2 ring-[var(--color-navy)]/20" : "border-transparent hover:border-[var(--color-gold)]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {tab === "storage" && selectedUrl && (
          <div className="px-5 pb-4">
            <button
              onClick={handleConfirmSelection}
              className="w-full bg-[var(--color-navy)] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
            >
              Use Selected Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
