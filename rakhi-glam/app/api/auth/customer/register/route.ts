import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      const isDuplicate = error.status === 422 || /already registered/i.test(error.message);
      const message = isDuplicate
        ? "An account with this email already exists. Please sign in instead."
        : error.message;
      return NextResponse.json({ error: message }, { status: isDuplicate ? 409 : error.status || 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    if (data.user.identities && data.user.identities.length === 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    if (isAdminEmail(email)) {
      await setSessionCookie(email);
    }

    return NextResponse.json({
      customer: { email: data.user.email, name: data.user.user_metadata?.name ?? name },
      confirmationRequired: !data.session,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
