"use client";

import { useAdminUI } from "@/app/context/AdminUIContext";

export default function EditModeToggle() {
  const { isAdmin, editMode, toggleEditMode } = useAdminUI();

  if (!isAdmin) return null;

  return (
    <button
      onClick={toggleEditMode}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-transparent border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors cursor-pointer w-full"
    >
      <span className="relative inline-flex h-[18px] w-[32px] shrink-0 items-center rounded-full transition-colors duration-200" style={{ backgroundColor: editMode ? "var(--color-navy)" : "#d1d5db" }}>
        <span
          className={`inline-block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            editMode ? "translate-x-[15px]" : "translate-x-[1px]"
          }`}
        />
      </span>
      <span className="text-xs font-medium text-[var(--color-text)] whitespace-nowrap">
        Edit Mode: {editMode ? "ON" : "OFF"}
      </span>
    </button>
  );
}
