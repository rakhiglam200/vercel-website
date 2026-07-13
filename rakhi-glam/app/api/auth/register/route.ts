import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail, signToken, setSessionCookie, hashPassword } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "This email is not authorized for admin access" }, { status: 403 });
    }

    const supabase: any = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("email", email)
      .single();

    if (existing?.password_hash) {
      return NextResponse.json({ error: "Account already registered. Please login." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    if (existing) {
      await supabase
        .from("admin_users")
        .update({ password_hash: passwordHash })
        .eq("id", existing.id);
    } else {
      await supabase.from("admin_users").insert({
        email,
        name: "Admin",
        role: "super_admin",
        password_hash: passwordHash,
      });
    }

    const token = await signToken({ email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      email,
      message: "Account created successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
