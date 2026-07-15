import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail, signToken, setSessionCookie, comparePassword } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isLockedOut, recordFailedLogin, clearLoginAttempts } from "@/lib/loginThrottle";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Unauthorized email" }, { status: 403 });
    }

    if (isLockedOut(email)) {
      return NextResponse.json({ error: "Too many failed attempts. Please try again later." }, { status: 429 });
    }

    const supabase: any = getSupabaseAdmin();
    const { data: admin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Account not found. Please register first." }, { status: 404 });
    }

    if (admin.password_hash) {
      const valid = await comparePassword(password, admin.password_hash);
      if (!valid) {
        recordFailedLogin(email);
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    } else {
      const envPassword = process.env.ADMIN_PASSWORD || "Rrakhi@0099";
      if (password !== envPassword) {
        recordFailedLogin(email);
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    }

    clearLoginAttempts(email);
    const token = await signToken({ email });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
