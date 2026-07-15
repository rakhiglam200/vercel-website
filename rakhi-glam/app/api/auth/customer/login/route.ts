import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail, setSessionCookie, setCustomerSessionCookie, comparePassword } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (isAdminEmail(email)) {
        const adminClient: any = getSupabaseAdmin();
        const { data: admin } = await adminClient
          .from("admin_users")
          .select("password_hash, name")
          .eq("email", email)
          .single();

        if (admin?.password_hash) {
          const valid = await comparePassword(password, admin.password_hash);
          if (valid) {
            await setSessionCookie(email);
            await setCustomerSessionCookie({ email, name: admin.name ?? email });
            return NextResponse.json({
              customer: { email, name: admin.name ?? email, isAdmin: true },
            });
          }
        }
      }

      if (error.code === "email_not_confirmed") {
        return NextResponse.json(
          { error: "Please confirm your email before signing in. Check your inbox.", code: "email_not_confirmed" },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (isAdminEmail(email)) {
      await setSessionCookie(email);
    }

    return NextResponse.json({
      customer: {
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email,
        picture: data.user.user_metadata?.picture,
        isAdmin: isAdminEmail(email),
      },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
