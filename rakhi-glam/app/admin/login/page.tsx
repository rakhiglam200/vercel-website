"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (r.ok) router.push("/admin"); })
      .finally(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center"><p className="text-[var(--color-text-muted)]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[var(--color-beige)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-2xl font-bold text-[var(--color-navy)] no-underline">
            RakhiGlam
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] shadow-sm">
          <h1 className="font-heading text-xl font-bold text-[var(--color-navy)] mb-6">Sign In</h1>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-navy)] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
            <Link href="/admin/register" className="text-[var(--color-navy)] hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
