import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

interface AdminUserRow {
  email: string | null;
  phone: string | null;
  name: string;
  provider: "password" | "phone" | "google" | "password+google";
  createdAt: string;
  emailConfirmed: boolean;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin: any = getSupabaseAdmin();
    const users = new Map<string, AdminUserRow>();
    const emailToUserId = new Map<string, string>();

    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) {
        const label = (u.user_metadata?.name as string) || u.email || u.phone || "Unknown";
        users.set(u.id, {
          email: u.email ?? null,
          phone: u.phone ?? null,
          name: label,
          provider: u.email ? "password" : "phone",
          createdAt: u.created_at,
          emailConfirmed: !!(u.email_confirmed_at || u.phone_confirmed_at),
        });
        if (u.email) emailToUserId.set(u.email, u.id);
      }
      if (data.users.length < perPage) break;
      page += 1;
    }

    const { data: customers, error: custError } = await supabaseAdmin
      .from("customers")
      .select("email, name, created_at");
    if (custError) throw custError;

    for (const row of customers ?? []) {
      const existingId = emailToUserId.get(row.email);
      const existing = existingId ? users.get(existingId) : undefined;
      if (existing) {
        existing.provider = "password+google";
      } else {
        users.set(`customer:${row.email}`, {
          email: row.email,
          phone: null,
          name: row.name || row.email,
          provider: "google",
          createdAt: row.created_at,
          emailConfirmed: true,
        });
      }
    }

    const list = Array.from(users.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ users: list });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
