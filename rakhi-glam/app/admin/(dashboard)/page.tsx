"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminUser {
  email: string | null;
  phone: string | null;
  name: string;
  provider: "password" | "phone" | "google" | "password+google";
  createdAt: string;
  emailConfirmed: boolean;
}

const PROVIDER_LABEL: Record<AdminUser["provider"], string> = {
  password: "Email/Password",
  phone: "Phone/OTP",
  google: "Google",
  "password+google": "Email + Google",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Users</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{users.length} registered users</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-[var(--color-text-muted)]">Loading users...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-beige)]">
                <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Name</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Email</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Sign-in method</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Joined</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--color-text-muted)]">
                    No registered users yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.email} className="border-b border-[var(--color-border)] hover:bg-[var(--color-beige)]/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-[var(--color-navy)]">{u.name}</td>
                    <td className="px-5 py-4 text-[var(--color-text-light)]">{u.email}</td>
                    <td className="px-5 py-4 text-[var(--color-text-light)]">{PROVIDER_LABEL[u.provider]}</td>
                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      {u.emailConfirmed ? (
                        <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
