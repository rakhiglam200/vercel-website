"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/admin/login", "/admin/register"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) {
          setAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setChecking(false));
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!authenticated && !PUBLIC_PATHS.includes(pathname)) return null;

  return <>{children}</>;
}
