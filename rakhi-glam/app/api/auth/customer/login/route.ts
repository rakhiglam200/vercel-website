import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
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
      },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
