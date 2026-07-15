"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface AdminUIContextValue {
  isAdmin: boolean;
  adminEmail: string | null;
  checkingAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
}

const AdminUIContext = createContext<AdminUIContextValue | null>(null);

const EDIT_MODE_STORAGE_KEY = "rakhiglam_edit_mode";

function readStoredEditMode(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(EDIT_MODE_STORAGE_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const pathname = usePathname();

  const checkAdmin = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/auth/me", { signal });
      const data = res.ok ? await res.json() : null;
      const adminNow = !!data?.email;
      setIsAdmin(adminNow);
      setAdminEmail(data?.email ?? null);
      if (adminNow) {
        const stored = readStoredEditMode();
        setEditMode(stored === null ? true : stored);
      } else {
        setEditMode(false);
      }
    } catch {
      if (signal?.aborted) return;
      setIsAdmin(false);
      setAdminEmail(null);
      setEditMode(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    checkAdmin(controller.signal).finally(() => setCheckingAdmin(false));
    return () => controller.abort();
  }, [checkAdmin, pathname]);

  useEffect(() => {
    const onFocus = () => checkAdmin();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkAdmin]);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(EDIT_MODE_STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  return (
    <AdminUIContext.Provider
      value={{
        isAdmin,
        adminEmail,
        checkingAdmin,
        editMode: isAdmin && editMode,
        toggleEditMode,
      }}
    >
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error("useAdminUI must be used within an AdminUIProvider");
  return ctx;
}
