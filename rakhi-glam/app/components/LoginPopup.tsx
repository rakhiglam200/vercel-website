"use client";

import { useState, useEffect } from "react";
import EditModeToggle from "./EditModeToggle";

interface CustomerInfo {
  email: string;
  name: string;
  picture?: string;
  isAdmin?: boolean;
}

interface LoginPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginPopup({ open, onClose }: LoginPopupProps) {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/auth/customer/me")
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("not auth");
      })
      .then((data) => setCustomer(data.customer ?? data))
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, [open]);

  const resetForm = () => {
    setName(""); setEmail(""); setPassword(""); setError(""); setInfo("");
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google?returnTo=/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setSubmitting(true);

    try {
      const endpoint = tab === "signin" ? "/api/auth/customer/login" : "/api/auth/customer/register";
      const body = tab === "signin" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (tab === "register" && data.confirmationRequired) {
        setInfo("Account created! Please check your email to confirm before signing in.");
        return;
      }

      setCustomer(data.customer);
      resetForm();
    } catch {
      setSubmitting(false);
      setError("Something went wrong");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/customer/logout", { method: "POST" });
    setCustomer(null);
    setLoggingOut(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-down z-10">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none text-xl leading-none z-10">
          &times;
        </button>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
          </div>
        ) : customer ? (
          /* ── Logged In ── */
          <div className="p-6 text-center">
            {customer.picture && (
              <img src={customer.picture} alt={customer.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[var(--color-gold)]" />
            )}
            <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-0.5">{customer.name}</h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-5">{customer.email}</p>
            <div className="space-y-2.5">
              {customer.isAdmin && (
                <>
                  <button onClick={() => { onClose(); window.location.href = "/admin"; }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-navy)] text-white hover:opacity-85 transition-opacity cursor-pointer border-none">
                    Admin Dashboard
                  </button>
                  <EditModeToggle />
                </>
              )}
              <button onClick={() => { onClose(); window.location.href = "/account"; }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-border)] text-[var(--color-navy)] hover:bg-[var(--color-beige)] transition-colors cursor-pointer bg-white">
                My Account
              </button>
              <button onClick={handleLogout} disabled={loggingOut}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border border-red-200 disabled:opacity-50">
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        ) : (
          /* ── Not Logged In ── */
          <div className="p-5">
            <div className="text-center mb-5">
              <span className="font-heading text-xl font-bold tracking-[0.2em] text-[var(--color-navy)] uppercase">RakhiGlam</span>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Sign in to track orders & get exclusive offers</p>
            </div>

            <button onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--color-border)] rounded-xl py-2.5 text-sm font-semibold text-[var(--color-navy)] hover:bg-gray-50 transition-colors cursor-pointer mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted)]">or</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            <div className="flex border border-[var(--color-border)] rounded-xl overflow-hidden mb-4">
              <button onClick={() => { setTab("signin"); resetForm(); }}
                className={`flex-1 py-2 text-sm font-medium cursor-pointer border-none transition-colors ${tab === "signin" ? "bg-[var(--color-navy)] text-white" : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-beige)]"}`}>
                Sign In
              </button>
              <button onClick={() => { setTab("register"); resetForm(); }}
                className={`flex-1 py-2 text-sm font-medium cursor-pointer border-none transition-colors ${tab === "register" ? "bg-[var(--color-navy)] text-white" : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-beige)]"}`}>
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === "register" && (
                <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors" />
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors" />

              {error && <p className="text-sm text-red-500">{error}</p>}
              {info && <p className="text-sm text-green-600">{info}</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-[var(--color-navy)] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none disabled:opacity-50">
                {submitting ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
